import type { AudioFeatures, EnrichedTrack, PlaylistMeta, TrackItem } from "./types";
import { getCachedArtistGenres, getCachedSongBpm } from "./cache";

export async function getPlaylistMeta(
  accessToken: string,
  id: string
): Promise<PlaylistMeta | null> {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${id}?fields=id,name,description,images,owner,tracks.total`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

async function getPlaylistTracks(
  accessToken: string,
  id: string
): Promise<TrackItem[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const limit = 50;

  const first = await fetch(
    `https://api.spotify.com/v1/playlists/${id}/items?limit=${limit}&offset=0`,
    { headers, cache: "no-store" }
  );
  if (!first.ok) {
    const err = await first.json().catch(() => ({}));
    console.error(`[tracks] ${first.status}`, err);
    return [];
  }
  const firstData = await first.json();
  const total: number = firstData.total ?? 0;
  const items: TrackItem[] = firstData.items ?? [];

  if (total > limit) {
    const offsets = Array.from(
      { length: Math.ceil((total - limit) / limit) },
      (_, i) => (i + 1) * limit
    );
    const rest = await Promise.all(
      offsets.map((offset) =>
        fetch(
          `https://api.spotify.com/v1/playlists/${id}/items?limit=${limit}&offset=${offset}`,
          { headers, cache: "no-store" }
        )
          .then((r) => r.json())
          .then((d) => (d.items ?? []) as TrackItem[])
      )
    );
    items.push(...rest.flat());
  }

  return items;
}

export async function getEnrichedTracks(
  accessToken: string,
  playlistId: string
): Promise<EnrichedTrack[]> {
  const rawItems = await getPlaylistTracks(accessToken, playlistId);
  const tracks = rawItems.filter((i) => i.item).map((i) => i.item!);

  if (tracks.length === 0) return [];

  const artistIds = Array.from(
    new Set(tracks.flatMap((t) => t.artists.map((a) => a.id)))
  ).sort();

  const [artistGenresMap, audioFeaturesEntries] = await Promise.all([
    getCachedArtistGenres(artistIds),
    Promise.all(
      tracks.map(async (track): Promise<[string, AudioFeatures | null]> => {
        const features = await getCachedSongBpm(
          track.name,
          track.artists[0]?.name ?? ""
        );
        return [track.id, features];
      })
    ),
  ]);
  const audioFeaturesMap = Object.fromEntries(audioFeaturesEntries);

  return tracks.map((track) => ({
    id: track.id,
    name: track.name,
    duration_ms: track.duration_ms,
    artists: track.artists,
    album: track.album,
    genres: Array.from(new Set([
      ...track.artists.flatMap((a) => artistGenresMap[a.id] ?? []),
      ...(audioFeaturesMap[track.id]?.genres ?? []),
    ])),
    audioFeatures: audioFeaturesMap[track.id] ?? null,
  }));
}
