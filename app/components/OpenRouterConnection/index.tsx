"use client";

import { useEffect, useState } from "react";
import "./style.css";

type Status = {
  connected: boolean;
  source: "oauth" | "manual" | "env" | null;
};

const SOURCE_LABEL: Record<NonNullable<Status["source"]>, string> = {
  oauth: "Connected via OpenRouter OAuth",
  manual: "Connected with a saved API key",
  env: "Connected via server configuration",
};

export default function OpenRouterConnection() {
  const [status, setStatus] = useState<Status | null>(null);
  const [manualKey, setManualKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch("/api/settings/openrouter")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, source: null }));
  };

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("openrouter_error")) {
      setError(`Connection failed: ${params.get("openrouter_error")}`);
    }
  }, []);

  const saveManualKey = async () => {
    if (!manualKey.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: manualKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save key");
      setStatus(data);
      setManualKey("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save key");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/settings/openrouter", { method: "DELETE" });
      setStatus(await res.json());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="openrouter-connection">
      <h3>OpenRouter (AI mix curation)</h3>
      <p className="openrouter-connection__hint">
        Connect an OpenRouter account to let an LLM pick and order tracks for your collaborative
        mixes based on a described vibe.
      </p>

      {status && (
        <div className="openrouter-connection__status">
          <span
            className={`openrouter-connection__dot ${
              status.connected ? "openrouter-connection__dot--on" : ""
            }`}
          />
          {status.connected && status.source
            ? SOURCE_LABEL[status.source]
            : "Not connected — AI curation is unavailable"}
        </div>
      )}

      {error && <p className="openrouter-connection__error">{error}</p>}

      <div className="openrouter-connection__actions">
        <a href="/api/openrouter/connect" className="openrouter-connection__oauth-btn">
          {status?.source === "oauth" ? "Reconnect with OpenRouter" : "Connect with OpenRouter"}
        </a>
        {status?.connected && (
          <button className="openrouter-connection__disconnect-btn" disabled={busy} onClick={disconnect}>
            Disconnect
          </button>
        )}
      </div>

      <details className="openrouter-connection__manual">
        <summary>Or paste an API key manually</summary>
        <div className="openrouter-connection__manual-form">
          <input
            type="password"
            placeholder="sk-or-..."
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
          />
          <button disabled={busy || !manualKey.trim()} onClick={saveManualKey}>
            Save key
          </button>
        </div>
      </details>
    </div>
  );
}
