// Pulls each connected account's Spotify library signals — recently played,
// top tracks, and recently saved — and turns them into a ranked list of
// "current favorites" per account, which the collab-mix builder merges.

import type { LibraryTrack, ScoredTrack } from "./library-track";

async function spotifyGet(accessToken: string, path: string) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function simplify(track: Record<string, unknown>): LibraryTrack | null {
  if (!track?.id) return null;
  const album = track.album as { name?: string; images?: { url: string }[] } | undefined;
  return {
    provider: "spotify",
    id: track.id as string,
    spotifyUri: track.uri as string,
    name: track.name as string,
    artists: ((track.artists as { name: string }[]) ?? []).map((a) => a.name),
    albumName: album?.name ?? "",
    imageUrl: album?.images?.[0]?.url,
    durationMs: (track.duration_ms as number) ?? 0,
  };
}

async function getRecentlyPlayed(accessToken: string): Promise<{ track: LibraryTrack; playedAt: string }[]> {
  const data = await spotifyGet(accessToken, "/me/player/recently-played?limit=50");
  const items: { track: Record<string, unknown>; played_at: string }[] = data?.items ?? [];
  return items
    .map((i) => ({ track: simplify(i.track), playedAt: i.played_at }))
    .filter((i): i is { track: LibraryTrack; playedAt: string } => i.track !== null);
}

async function getTopTracks(accessToken: string): Promise<LibraryTrack[]> {
  const data = await spotifyGet(accessToken, "/me/top/tracks?limit=50&time_range=short_term");
  const items: Record<string, unknown>[] = data?.items ?? [];
  return items.map(simplify).filter((t): t is LibraryTrack => t !== null);
}

async function getRecentlySaved(accessToken: string): Promise<{ track: LibraryTrack; addedAt: string }[]> {
  const data = await spotifyGet(accessToken, "/me/tracks?limit=50");
  const items: { track: Record<string, unknown>; added_at: string }[] = data?.items ?? [];
  return items
    .map((i) => ({ track: simplify(i.track), addedAt: i.added_at }))
    .filter((i): i is { track: LibraryTrack; addedAt: string } => i.track !== null);
}

function recencyWeight(isoDate: string): number {
  const ageDays = (Date.now() - new Date(isoDate).getTime()) / 86_400_000;
  // Recent items score close to 1; decays to ~0 after ~60 days.
  return Math.max(0, 1 - ageDays / 60);
}

// Ranks a single account's "current favorites" by combining top-tracks rank,
// recently-played recency, and recently-saved recency into one score.
export async function getAccountFavorites(accessToken: string): Promise<ScoredTrack[]> {
  const [recentlyPlayed, topTracks, recentlySaved] = await Promise.all([
    getRecentlyPlayed(accessToken),
    getTopTracks(accessToken),
    getRecentlySaved(accessToken),
  ]);

  const scored = new Map<string, ScoredTrack>();
  const bump = (track: LibraryTrack, amount: number) => {
    const existing = scored.get(track.id);
    if (existing) existing.score += amount;
    else scored.set(track.id, { ...track, score: amount });
  };

  topTracks.forEach((track, rank) => bump(track, 3 * (1 - rank / topTracks.length)));
  recentlyPlayed.forEach(({ track, playedAt }) => bump(track, 2 * recencyWeight(playedAt)));
  recentlySaved.forEach(({ track, addedAt }) => bump(track, 2.5 * recencyWeight(addedAt)));

  return Array.from(scored.values()).sort((a, b) => b.score - a.score);
}

// Resolves a best-effort Spotify track URI for a track sourced from another
// provider, so a collaborative mix can be created on Spotify even when some
// favorites came in from Apple Music.
export async function searchSpotifyTrack(
  accessToken: string,
  name: string,
  artist: string
): Promise<string | null> {
  const q = encodeURIComponent(`track:${name} artist:${artist}`);
  const data = await spotifyGet(accessToken, `/search?q=${q}&type=track&limit=1`);
  return data?.tracks?.items?.[0]?.uri ?? null;
}
