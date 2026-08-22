"use client";

import { useEffect, useState } from "react";
import "./style.css";

type PublicAccount = {
  id: string;
  spotifyUserId: string;
  displayName: string;
  image?: string;
  connectedAt: string;
  isPrimary?: boolean;
};

type PublicAppleAccount = {
  id: string;
  label: string;
  connectedAt: string;
};

// A unified row for the account-selection checklist, tagging where a
// selection id (as sent to /api/collab-mix) came from.
type AccountRow = {
  selectId: string; // "primary" | spotify account id | `apple:<id>`
  displayName: string;
  image?: string;
  provider: "spotify" | "apple";
  isPrimary?: boolean;
};

type MergedTrack = {
  id: string;
  name: string;
  artists: string[];
  albumName: string;
  imageUrl?: string;
  score: number;
  fromAccounts: string[];
  spotifyUri?: string;
  appleId?: string;
};

type MixResponse = {
  tracks: MergedTrack[];
  suggestedName?: string;
  aiNote?: string;
  playlist?: { id: string; url?: string; name: string };
  unresolvedCount?: number;
  error?: string;
};

export default function CollabMixBuilder() {
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [perAccount, setPerAccount] = useState(15);
  const [targetCount, setTargetCount] = useState(20);
  const [useAi, setUseAi] = useState(false);
  const [vibe, setVibe] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [destination, setDestination] = useState<"spotify" | "apple">("spotify");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MixResponse | null>(null);
  const [aiConnected, setAiConnected] = useState<boolean | null>(null);

  const loadAccounts = () => {
    setLoadingAccounts(true);
    Promise.all([
      fetch("/api/spotify-accounts").then((r) => r.json()),
      fetch("/api/apple-accounts").then((r) => r.json()),
    ])
      .then(([spotifyData, appleData]) => {
        const spotifyAccounts: PublicAccount[] = spotifyData.accounts ?? [];
        const appleAccounts: PublicAppleAccount[] = appleData.accounts ?? [];

        const list: AccountRow[] = [
          ...spotifyAccounts.map((a) => ({
            selectId: a.id,
            displayName: a.displayName,
            image: a.image,
            provider: "spotify" as const,
            isPrimary: a.isPrimary,
          })),
          ...appleAccounts.map((a) => ({
            selectId: `apple:${a.id}`,
            displayName: `${a.label} (Apple Music)`,
            provider: "apple" as const,
          })),
        ];

        setRows(list);
        setSelected(new Set(list.map((a) => a.selectId)));
      })
      .finally(() => setLoadingAccounts(false));
  };

  useEffect(() => {
    loadAccounts();
    fetch("/api/settings/openrouter")
      .then((r) => r.json())
      .then((data) => setAiConnected(!!data.connected))
      .catch(() => setAiConnected(false));
  }, []);

  const hasApple = rows.some((r) => r.provider === "apple");

  const toggleAccount = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildMix = async (createPlaylist: boolean) => {
    setBusy(true);
    setError(null);
    if (!createPlaylist) setResult(null);
    try {
      const res = await fetch("/api/collab-mix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountIds: Array.from(selected),
          perAccount,
          targetCount,
          useAi,
          vibe,
          createPlaylist,
          playlistName,
          destination,
        }),
      });
      const data: MixResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="collab-mix">
      <h2 className="collab-mix__title">Collaborative Mix</h2>
      <p className="collab-mix__subtitle">
        Connect everyone&rsquo;s Spotify and Apple Music accounts and automatically pull each
        person&rsquo;s current favorites — recently played, top tracks/heavy rotation, and recently
        added — into one shared road-trip playlist.
      </p>

      {/* Connected accounts */}
      <div className="collab-mix__section">
        <div className="collab-mix__section-header">
          <h3>Connected Accounts</h3>
          <a href="/settings" className="collab-mix__connect-btn">
            Manage connections
          </a>
        </div>

        {loadingAccounts ? (
          <p className="collab-mix__muted">Loading accounts…</p>
        ) : rows.length <= 1 ? (
          <p className="collab-mix__muted">
            Just you so far — connect at least one more Spotify or Apple Music account to make this
            collaborative.
          </p>
        ) : null}
        {!loadingAccounts && rows.length > 0 && (
          <ul className="collab-mix__accounts">
            {rows.map((a) => (
              <li key={a.selectId} className="collab-mix__account">
                <label className="collab-mix__account-label">
                  <input
                    type="checkbox"
                    checked={selected.has(a.selectId)}
                    onChange={() => toggleAccount(a.selectId)}
                  />
                  {a.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image} alt="" className="collab-mix__account-avatar" />
                  ) : (
                    <span className="collab-mix__account-avatar collab-mix__account-avatar--placeholder" />
                  )}
                  <span>{a.displayName}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mix options */}
      <div className="collab-mix__section">
        <h3>Mix Options</h3>
        <div className="collab-mix__grid">
          <label className="collab-mix__field">
            Favorites per account
            <input
              type="number"
              min={5}
              max={50}
              value={perAccount}
              onChange={(e) => setPerAccount(Number(e.target.value))}
            />
          </label>
          <label className="collab-mix__field">
            Target track count
            <input
              type="number"
              min={5}
              max={100}
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
            />
          </label>
          <label className="collab-mix__field collab-mix__field--wide">
            Playlist name (optional)
            <input
              type="text"
              placeholder="Road Trip Mix"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </label>
        </div>

        {hasApple && (
          <label className="collab-mix__field" style={{ marginBottom: 12 }}>
            Create playlist on
            <select value={destination} onChange={(e) => setDestination(e.target.value as "spotify" | "apple")}>
              <option value="spotify">Spotify</option>
              <option value="apple">Apple Music</option>
            </select>
          </label>
        )}

        <label className="collab-mix__checkbox-row">
          <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
          Use AI (OpenRouter) to curate &amp; order the mix
        </label>

        {useAi && aiConnected === false && (
          <p className="collab-mix__muted">
            No OpenRouter connection yet —{" "}
            <a href="/settings" style={{ textDecoration: "underline" }}>
              connect one in Settings
            </a>{" "}
            first.
          </p>
        )}

        {useAi && (
          <label className="collab-mix__field collab-mix__field--wide">
            Vibe / occasion
            <input
              type="text"
              placeholder="e.g. energetic desert road trip, singalongs, sunset drive"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="collab-mix__actions">
        <button
          className="collab-mix__btn"
          disabled={busy || selected.size === 0}
          onClick={() => buildMix(false)}
        >
          {busy ? "Building…" : "Preview mix"}
        </button>
        <button
          className="collab-mix__btn collab-mix__btn--primary"
          disabled={busy || selected.size === 0 || !result}
          onClick={() => buildMix(true)}
        >
          Create on {destination === "apple" ? "Apple Music" : "Spotify"}
        </button>
      </div>

      {error && <p className="collab-mix__error">{error}</p>}

      {result?.playlist && (
        <p className="collab-mix__success">
          Created &ldquo;{result.playlist.name}&rdquo;
          {result.playlist.url && (
            <>
              {" — "}
              <a href={result.playlist.url} target="_blank" rel="noreferrer">
                open in Spotify
              </a>
            </>
          )}
          {!!result.unresolvedCount && (
            <span className="collab-mix__muted">
              {" "}
              ({result.unresolvedCount} track{result.unresolvedCount === 1 ? "" : "s"} couldn&rsquo;t be
              matched on this platform)
            </span>
          )}
        </p>
      )}

      {result?.aiNote && <p className="collab-mix__ai-note">{result.aiNote}</p>}

      {result?.tracks && result.tracks.length > 0 && (
        <ol className="collab-mix__tracklist">
          {result.tracks.map((t) => (
            <li key={t.id} className="collab-mix__track">
              {t.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.imageUrl} alt="" />
              )}
              <div className="collab-mix__track-info">
                <span className="collab-mix__track-name">{t.name}</span>
                <span className="collab-mix__track-artists">{t.artists.join(", ")}</span>
              </div>
              <span className="collab-mix__track-from">{t.fromAccounts.join(", ")}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
