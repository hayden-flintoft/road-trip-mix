import type { ScoredTrack } from "./library-track";
import { trackMatchKey } from "./library-track";

export type AccountFavorites = {
  accountId: string;
  label: string;
  tracks: ScoredTrack[];
};

export type MergedTrack = {
  id: string; // matchKey — stable, unique per merged song across providers
  name: string;
  artists: string[];
  albumName: string;
  imageUrl?: string;
  durationMs: number;
  score: number;
  fromAccounts: string[];
  spotifyId?: string;
  spotifyUri?: string;
  appleId?: string;
};

// Round-robins each account's top favorites so every contributor is
// represented fairly, rather than letting one prolific account dominate.
// A track favorited by multiple accounts — or present on both Spotify and
// Apple Music — is deduped by a normalized name+artist key and its score
// boosted, while retaining whichever provider ids were seen so the mix can
// later be created on either platform.
export function mergeFavorites(
  accountFavorites: AccountFavorites[],
  perAccount = 15
): MergedTrack[] {
  const merged = new Map<string, MergedTrack>();

  const trimmed = accountFavorites.map((a) => ({
    ...a,
    tracks: a.tracks.slice(0, perAccount),
  }));

  const maxLen = Math.max(0, ...trimmed.map((a) => a.tracks.length));
  const order: MergedTrack[] = [];

  for (let i = 0; i < maxLen; i++) {
    for (const account of trimmed) {
      const track = account.tracks[i];
      if (!track) continue;

      const key = trackMatchKey(track.name, track.artists);
      const existing = merged.get(key);
      if (existing) {
        existing.score += track.score * 0.5; // shared favorite bonus
        existing.fromAccounts.push(account.label);
        if (track.provider === "spotify") {
          existing.spotifyId = existing.spotifyId ?? track.id;
          existing.spotifyUri = existing.spotifyUri ?? track.spotifyUri;
        }
        if (track.provider === "apple") existing.appleId = existing.appleId ?? track.id;
        continue;
      }

      const entry: MergedTrack = {
        id: key,
        name: track.name,
        artists: track.artists,
        albumName: track.albumName,
        imageUrl: track.imageUrl,
        durationMs: track.durationMs,
        score: track.score,
        fromAccounts: [account.label],
        spotifyId: track.provider === "spotify" ? track.id : undefined,
        spotifyUri: track.provider === "spotify" ? track.spotifyUri : undefined,
        appleId: track.provider === "apple" ? track.id : undefined,
      };
      merged.set(key, entry);
      order.push(entry);
    }
  }

  return order.sort((a, b) => b.score - a.score);
}
