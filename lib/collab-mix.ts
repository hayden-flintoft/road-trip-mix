import type { ScoredTrack } from "./spotify-library";

export type AccountFavorites = {
  accountId: string;
  label: string;
  tracks: ScoredTrack[];
};

export type MergedTrack = ScoredTrack & { fromAccounts: string[] };

// Round-robins each account's top favorites so every contributor is
// represented fairly, rather than letting one prolific account dominate.
// A track favorited by multiple accounts is deduped and its score boosted.
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

      const existing = merged.get(track.id);
      if (existing) {
        existing.score += track.score * 0.5; // shared favorite bonus
        existing.fromAccounts.push(account.label);
        continue;
      }

      const entry: MergedTrack = { ...track, fromAccounts: [account.label] };
      merged.set(track.id, entry);
      order.push(entry);
    }
  }

  return order.sort((a, b) => b.score - a.score);
}
