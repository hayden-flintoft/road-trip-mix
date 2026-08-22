// Shared track shape used to merge library data pulled from different music
// services (Spotify, Apple Music) into one collaborative mix pipeline.

export type Provider = "spotify" | "apple";

export type LibraryTrack = {
  provider: Provider;
  id: string; // provider-native id (Spotify track id, or Apple Music catalog song id)
  name: string;
  artists: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
  spotifyUri?: string; // set when provider === "spotify"
};

export type ScoredTrack = LibraryTrack & { score: number };

// Normalized "same song" key used to dedupe/merge a track across accounts
// and across providers (an Apple Music copy and a Spotify copy of the same
// song should collapse into one collaborative-mix entry).
export function trackMatchKey(name: string, artists: string[]): string {
  const norm = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ").trim();
  return `${norm(name)}|${norm(artists[0] ?? "")}`;
}
