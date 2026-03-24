import { unstable_cache } from "next/cache";
import type { AudioFeatures } from "./types";

const GETSONGBPM_BASE = "https://api.getsong.co";

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

async function fetchSongBpm(
  trackName: string,
  artistName: string
): Promise<AudioFeatures | null> {
  const lookup = `song:${encodeURIComponent(trackName)}+artist:${encodeURIComponent(artistName)}`;
  const url = `${GETSONGBPM_BASE}/search/?api_key=${process.env.GETSONGBPM_API_KEY}&type=both&lookup=${lookup}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const song = data.search?.[0];
  if (!song) return null;
  return {
    tempo: parseInt(song.tempo, 10),
    key_of: song.key_of ?? "—",
    open_key: song.open_key ?? "—",
    time_sig: song.time_sig ?? "—",
    danceability: song.danceability ?? 0,
    acousticness: song.acousticness ?? 0,
  };
}

// Song BPM/key data is immutable — 30-day cache per track name + artist
export const getCachedSongBpm = unstable_cache(
  async (trackName: string, artistName: string) =>
    fetchSongBpm(trackName, artistName),
  ["getsongbpm-features"],
  { revalidate: 60 * 60 * 24 * 30 }
);
