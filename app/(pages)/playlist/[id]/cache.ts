import { unstable_cache } from "next/cache";
import type { AudioFeatures } from "./types";

const RECCOBEATS_BASE = "https://api.reccobeats.com";

async function getClientToken(): Promise<string> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 3500 },
  });
  const data = await res.json();
  return data.access_token as string;
}

async function batchFetchArtistGenres(
  token: string,
  ids: string[]
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

  await Promise.all(
    chunks.map(async (chunk) => {
      const res = await fetch(
        `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;
      const data = await res.json();
      for (const artist of data.artists ?? []) {
        if (artist) result[artist.id] = artist.genres ?? [];
      }
    })
  );
  return result;
}

// Artist genres rarely change — cache for 7 days, keyed by sorted artist IDs
export const getCachedArtistGenres = unstable_cache(
  async (sortedIds: string[]) => {
    const token = await getClientToken();
    return batchFetchArtistGenres(token, sortedIds);
  },
  ["spotify-artist-genres"],
  { revalidate: 60 * 60 * 24 * 7 }
);

// Resolves Spotify track IDs → ReccoBeats UUIDs in batches of 100
async function resolveReccoBeatsIds(
  spotifyIds: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < spotifyIds.length; i += 100)
    chunks.push(spotifyIds.slice(i, i + 100));

  await Promise.all(
    chunks.map(async (chunk) => {
      const res = await fetch(
        `${RECCOBEATS_BASE}/v1/track?ids=${chunk.join(",")}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      for (const track of data.content ?? []) {
        if (!track?.id || !track?.href) continue;
        // href is a Spotify URL: https://open.spotify.com/track/SPOTIFY_ID
        const spotifyId = track.href.split("/").pop()?.split("?")[0];
        if (spotifyId) result[spotifyId] = track.id;
      }
    })
  );
  return result;
}

// Spotify ID → ReccoBeats UUID is an immutable mapping — 30-day cache
export const getCachedReccoBeatsIds = unstable_cache(
  async (sortedSpotifyIds: string[]) => resolveReccoBeatsIds(sortedSpotifyIds),
  ["reccobeats-track-ids"],
  { revalidate: 60 * 60 * 24 * 30 }
);

async function fetchAudioFeatures(
  reccoBeatsId: string
): Promise<AudioFeatures | null> {
  const res = await fetch(
    `${RECCOBEATS_BASE}/v1/track/${reccoBeatsId}/audio-features`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    acousticness: data.acousticness,
    danceability: data.danceability,
    energy: data.energy,
    instrumentalness: data.instrumentalness,
    key: data.key,
    liveness: data.liveness,
    loudness: data.loudness,
    mode: data.mode,
    speechiness: data.speechiness,
    tempo: data.tempo,
    valence: data.valence,
  };
}

// Audio features are immutable per track — 30-day cache per ReccoBeats UUID
export const getCachedAudioFeatures = unstable_cache(
  async (reccoBeatsId: string) => fetchAudioFeatures(reccoBeatsId),
  ["reccobeats-audio-features"],
  { revalidate: 60 * 60 * 24 * 30 }
);
