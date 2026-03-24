export type AudioFeatures = {
  tempo: number;
  key_of: string;
  open_key: string;
  time_sig: string;
  danceability: number; // 0-100
  acousticness: number; // 0-100
};

export type EnrichedTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists: { id: string; name: string }[];
  album: { name: string; images: { url: string }[] };
  genres: string[];
  audioFeatures: AudioFeatures | null;
};

export type TrackItem = {
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { id: string; name: string }[];
    album: { name: string; images: { url: string }[] };
  } | null;
};

export type PlaylistMeta = {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  owner: { display_name: string };
  tracks: { total: number } | null;
};
