"use client";

import { useEffect, useState } from "react";
import "./style.css";

type PublicAppleAccount = {
  id: string;
  label: string;
  connectedAt: string;
};

const MUSICKIT_SRC = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";

// Minimal shape of the global MusicKit JS v3 API surface this component uses.
// See https://js-cdn.music.apple.com/musickit/v3/docs/
type MusicKitGlobal = {
  configure: (config: { developerToken: string; app: { name: string; build: string } }) => Promise<unknown>;
  getInstance: () => { authorize: () => Promise<string> };
};

function getMusicKit(): MusicKitGlobal | undefined {
  return (window as unknown as { MusicKit?: MusicKitGlobal }).MusicKit;
}

function loadMusicKit(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (getMusicKit()) return resolve();
    const existing = document.querySelector(`script[src="${MUSICKIT_SRC}"]`);
    if (existing) {
      document.addEventListener("musickitloaded", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = MUSICKIT_SRC;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Apple MusicKit JS"));
    document.addEventListener("musickitloaded", () => resolve(), { once: true });
    document.head.appendChild(script);
  });
}

export default function AppleMusicConnection() {
  const [accounts, setAccounts] = useState<PublicAppleAccount[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/apple-accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data.accounts ?? []);
        setConfigured(data.configured !== false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const connect = async () => {
    setError(null);
    setConnecting(true);
    try {
      await loadMusicKit();

      const tokenRes = await fetch("/api/apple-music/developer-token");
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error ?? "Could not get a developer token");

      const MusicKit = getMusicKit();
      if (!MusicKit) throw new Error("MusicKit failed to load");
      await MusicKit.configure({
        developerToken: tokenData.token,
        app: { name: "Road Trip Mix", build: "1.0.0" },
      });

      const instance = MusicKit.getInstance();
      const musicUserToken: string = await instance.authorize();

      const saveRes = await fetch("/api/apple-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicUserToken, label: label.trim() || undefined }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error ?? "Failed to save Apple Music account");

      setAccounts(saveData.accounts ?? []);
      setLabel("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect Apple Music");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (id: string) => {
    await fetch("/api/apple-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="apple-music-connection">
      <h3>Apple Music</h3>
      <p className="apple-music-connection__hint">
        Connect an Apple Music account so its recently played, heavy rotation, and library songs
        can feed into collaborative mixes alongside connected Spotify accounts.
      </p>

      {!configured ? (
        <p className="apple-music-connection__muted">
          Apple Music isn&rsquo;t configured on this server yet — set{" "}
          <code>APPLE_MUSIC_TEAM_ID</code>, <code>APPLE_MUSIC_KEY_ID</code>, and{" "}
          <code>APPLE_MUSIC_PRIVATE_KEY</code>.
        </p>
      ) : (
        <>
          {loading ? (
            <p className="apple-music-connection__muted">Loading…</p>
          ) : (
            accounts.length > 0 && (
              <ul className="apple-music-connection__list">
                {accounts.map((a) => (
                  <li key={a.id} className="apple-music-connection__item">
                    <span>{a.label}</span>
                    <button onClick={() => disconnect(a.id)}>Disconnect</button>
                  </li>
                ))}
              </ul>
            )
          )}

          {error && <p className="apple-music-connection__error">{error}</p>}

          <div className="apple-music-connection__connect-row">
            <input
              type="text"
              placeholder="Label (e.g. Sam's account)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <button className="apple-music-connection__connect-btn" disabled={connecting} onClick={connect}>
              {connecting ? "Connecting…" : "+ Connect Apple Music account"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
