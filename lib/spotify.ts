import type { Playlist } from "@/app/components/PlaylistBox";

export async function getAllPlaylists(accessToken: string): Promise<Playlist[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const limit = 50;

  const first = await fetch(
    `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=0`,
    { headers, next: { revalidate: 60 } }
  );
  if (!first.ok) return [];
  const firstData = await first.json();
  const total: number = firstData.total ?? 0;
  const items: Playlist[] = firstData.items ?? [];

  if (total > limit) {
    const offsets = Array.from(
      { length: Math.ceil((total - limit) / limit) },
      (_, i) => (i + 1) * limit
    );
    const rest = await Promise.all(
      offsets.map((offset) =>
        fetch(
          `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
          { headers, next: { revalidate: 60 } }
        )
          .then((r) => r.json())
          .then((d) => (d.items ?? []) as Playlist[])
      )
    );
    items.push(...rest.flat());
  }

  return items;
}

export async function getPlaylistNames(
  accessToken: string,
  ids: string[]
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${id}?fields=name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) return [id, id] as [string, string];
      const data = await res.json();
      return [id, data.name ?? id] as [string, string];
    })
  );
  return Object.fromEntries(entries);
}

export type SimplifiedTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
};

// In-memory cache: keyed by `${accessToken}:${playlistId}` so it's scoped per
// session and invalidated automatically when the token rotates.
const trackCache = new Map<string, SimplifiedTrack[]>();

export async function getPlaylistTracksClient(
  accessToken: string,
  playlistId: string
): Promise<SimplifiedTrack[]> {
  const cacheKey = `${accessToken}:${playlistId}`;
  const cached = trackCache.get(cacheKey);
  if (cached) return cached;

  const headers = { Authorization: `Bearer ${accessToken}` };
  const limit = 50;

  const first = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=${limit}&offset=0`,
    { headers }
  );
  if (!first.ok) return [];
  const firstData = await first.json();
  const total: number = firstData.total ?? 0;
  const items: { item: SimplifiedTrack | null }[] = firstData.items ?? [];

  if (total > limit) {
    const offsets = Array.from(
      { length: Math.ceil((total - limit) / limit) },
      (_, i) => (i + 1) * limit
    );
    const rest = await Promise.all(
      offsets.map((offset) =>
        fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=${limit}&offset=${offset}`,
          { headers }
        )
          .then((r) => r.json())
          .then((d) => (d.items ?? []) as { item: SimplifiedTrack | null }[])
      )
    );
    items.push(...rest.flat());
  }

  const result = items.filter((i) => i.item != null).map((i) => i.item!);
  trackCache.set(cacheKey, result);
  return result;
}
