export type RoundRobinRule = {
  id: string;
  type: "round_robin";
  defaultN: number;
  overrides: Record<string, number>; // playlistId → songs per cycle (overrides defaultN)
};

export type SpacingRule = {
  id: string;
  type: "spacing";
  n: number; // minimum tracks between same artist/album
  applyToArtist: boolean;
  applyToAlbum: boolean;
};

export type AudioFeatureRule = {
  id: string;
  type: "audio_feature";
  feature: "tempo" | "danceability" | "acousticness";
  direction: "asc" | "desc";
  missingPlacement: "first" | "last" | "alternate" | "disperse";
};

export type Rule = RoundRobinRule | SpacingRule | AudioFeatureRule;

export type GroupedPlaylist = {
  id: string;
  name: string;
  groupId: string;
  rules: Rule[];
  createdAt: string;
};

const GP_KEY = "road-trip-mix:grouped-playlists";

export function loadGroupedPlaylists(): GroupedPlaylist[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GP_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveGroupedPlaylists(items: GroupedPlaylist[]): void {
  localStorage.setItem(GP_KEY, JSON.stringify(items));
}
