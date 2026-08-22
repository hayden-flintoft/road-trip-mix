"use client";

import { useEffect, useState } from "react";
import "./style.css";

export type PublicAccount = {
  id: string;
  spotifyUserId: string;
  displayName: string;
  image?: string;
  connectedAt: string;
  isPrimary?: boolean;
};

// Full connection management: list, connect, disconnect. Used on the
// Settings page. The Collaborative Mix builder fetches the same endpoint
// but only needs the read + select UI, so it renders its own list.
export default function SpotifyConnections() {
  const [accounts, setAccounts] = useState<PublicAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/spotify-accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.accounts ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const removeAccount = async (id: string) => {
    setRemovingId(id);
    try {
      await fetch("/api/spotify-accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      load();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="spotify-connections">
      <div className="spotify-connections__header">
        <h3>Spotify Accounts</h3>
        <a href="/api/spotify-accounts/connect" className="spotify-connections__connect-btn">
          + Connect account
        </a>
      </div>
      <p className="spotify-connections__hint">
        Connect everyone going on the trip so their favorites can feed into a collaborative mix.
      </p>

      {loading ? (
        <p className="spotify-connections__muted">Loading…</p>
      ) : (
        <ul className="spotify-connections__list">
          {accounts.map((a) => (
            <li key={a.id} className="spotify-connections__item">
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt="" className="spotify-connections__avatar" />
              ) : (
                <span className="spotify-connections__avatar spotify-connections__avatar--placeholder" />
              )}
              <div className="spotify-connections__info">
                <span className="spotify-connections__name">{a.displayName}</span>
                {a.isPrimary ? (
                  <span className="spotify-connections__badge">Primary login</span>
                ) : (
                  <span className="spotify-connections__badge spotify-connections__badge--muted">
                    Connected {new Date(a.connectedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {!a.isPrimary && (
                <button
                  className="spotify-connections__remove-btn"
                  disabled={removingId === a.id}
                  onClick={() => removeAccount(a.id)}
                >
                  Disconnect
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
