import jwt from "jsonwebtoken";
import type { LibraryTrack, ScoredTrack } from "./library-track";

// Apple Music integration. Unlike Spotify, authorization happens client-side
// via MusicKit JS: the browser loads MusicKit, is configured with a
// server-issued "developer token" (a JWT signed with an Apple Music
// private key), and MusicKit's authorize() call returns a per-user "music
// user token" which is sent back here and stored (see lib/apple-accounts.ts).
// Every Apple Music API request needs both tokens.

let cachedDeveloperToken: { token: string; expiresAt: number } | null = null;

export function isAppleMusicConfigured(): boolean {
  return !!(
    process.env.APPLE_MUSIC_TEAM_ID &&
    process.env.APPLE_MUSIC_KEY_ID &&
    process.env.APPLE_MUSIC_PRIVATE_KEY
  );
}

// Signs a developer token good for ~6 months, per Apple's guidance
// (https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens).
export function generateDeveloperToken(): string {
  const now = Math.floor(Date.now() / 1000);
  if (cachedDeveloperToken && cachedDeveloperToken.expiresAt - now > 3600) {
    return cachedDeveloperToken.token;
  }

  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  // Support the private key being stored with literal `\n` escapes in env vars.
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!teamId || !keyId || !privateKey) {
    throw new Error("Apple Music is not configured (APPLE_MUSIC_TEAM_ID/KEY_ID/PRIVATE_KEY).");
  }

  const expiresIn = 60 * 60 * 24 * 180; // 180 days
  const token = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    issuer: teamId,
    header: { alg: "ES256", kid: keyId },
    expiresIn,
  });

  cachedDeveloperToken = { token, expiresAt: now + expiresIn };
  return token;
}

const STOREFRONT = process.env.APPLE_MUSIC_STOREFRONT || "us";

async function appleGet(developerToken: string, musicUserToken: string | null, path: string) {
  const res = await fetch(`https://api.music.apple.com${path}`, {
    headers: {
      Authorization: `Bearer ${developerToken}`,
      ...(musicUserToken ? { "Music-User-Token": musicUserToken } : {}),
    },
  });
  if (!res.ok) return null;
  return res.json();
}

function simplify(song: Record<string, unknown>): LibraryTrack | null {
  if (!song?.id) return null;
  const attrs = song.attributes as Record<string, unknown> | undefined;
  if (!attrs) return null;
  const artwork = attrs.artwork as { url?: string } | undefined;
  return {
    provider: "apple",
    id: song.id as string,
    name: attrs.name as string,
    artists: [(attrs.artistName as string) ?? ""].filter(Boolean),
    albumName: (attrs.albumName as string) ?? "",
    imageUrl: artwork?.url?.replace("{w}", "300").replace("{h}", "300"),
    durationMs: (attrs.durationInMillis as number) ?? 0,
  };
}

function recencyWeight(isoDate: string): number {
  const ageDays = (Date.now() - new Date(isoDate).getTime()) / 86_400_000;
  return Math.max(0, 1 - ageDays / 60);
}

export async function getAppleAccountFavorites(musicUserToken: string): Promise<ScoredTrack[]> {
  const developerToken = generateDeveloperToken();

  const [recentlyPlayed, heavyRotation, librarySongs] = await Promise.all([
    appleGet(developerToken, musicUserToken, "/v1/me/recent/played/tracks?limit=30"),
    appleGet(developerToken, musicUserToken, "/v1/me/history/heavy-rotation?limit=20"),
    appleGet(developerToken, musicUserToken, "/v1/me/library/songs?limit=50&sort=-dateAdded"),
  ]);

  const scored = new Map<string, ScoredTrack>();
  const bump = (track: LibraryTrack | null, amount: number) => {
    if (!track) return;
    const existing = scored.get(track.id);
    if (existing) existing.score += amount;
    else scored.set(track.id, { ...track, score: amount });
  };

  const heavyItems: Record<string, unknown>[] = (heavyRotation?.data ?? []).filter(
    (d: Record<string, unknown>) => d.type === "songs"
  );
  heavyItems.forEach((song, rank) => bump(simplify(song), 3 * (1 - rank / Math.max(heavyItems.length, 1))));

  const recentItems: Record<string, unknown>[] = (recentlyPlayed?.data ?? []).filter(
    (d: Record<string, unknown>) => d.type === "songs"
  );
  // Apple's recently-played-tracks endpoint doesn't return a per-item
  // timestamp, so weight by recency of position instead.
  recentItems.forEach((song, rank) => bump(simplify(song), 2 * (1 - rank / Math.max(recentItems.length, 1))));

  const libraryItems: { attributes?: { dateAdded?: string } }[] = librarySongs?.data ?? [];
  libraryItems.forEach((song) => {
    const addedAt = song.attributes?.dateAdded;
    bump(simplify(song as Record<string, unknown>), addedAt ? 2.5 * recencyWeight(addedAt) : 1);
  });

  return Array.from(scored.values()).sort((a, b) => b.score - a.score);
}

// Best-effort catalog lookup so a track sourced from Spotify can still be
// added to a playlist created on Apple Music.
export async function searchAppleCatalogTrack(name: string, artist: string): Promise<string | null> {
  const developerToken = generateDeveloperToken();
  const term = encodeURIComponent(`${name} ${artist}`);
  const data = await appleGet(
    developerToken,
    null,
    `/v1/catalog/${STOREFRONT}/search?term=${term}&types=songs&limit=1`
  );
  return data?.results?.songs?.data?.[0]?.id ?? null;
}

export async function createApplePlaylist(
  musicUserToken: string,
  name: string,
  description: string,
  catalogSongIds: string[]
): Promise<{ id: string }> {
  const developerToken = generateDeveloperToken();

  const createRes = await fetch("https://api.music.apple.com/v1/me/library/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${developerToken}`,
      "Music-User-Token": musicUserToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attributes: { name, description },
      relationships: {
        tracks: {
          data: catalogSongIds.map((id) => ({ id, type: "songs" })),
        },
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Apple Music playlist (${createRes.status})`);
  }
  const created = await createRes.json();
  return { id: created.data?.[0]?.id };
}
