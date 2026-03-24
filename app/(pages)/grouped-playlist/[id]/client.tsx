"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  loadGroupedPlaylists,
  saveGroupedPlaylists,
  type GroupedPlaylist,
  type Rule,
} from "@/lib/grouped-playlists";
import { getPlaylistTracksClient, getPlaylistNames, type SimplifiedTrack } from "@/lib/spotify";
import RulesModal from "@/app/components/RulesModal";
import "../../playlist/[id]/style.css";

type Group = { id: string; name: string; playlistIds: string[] };

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function applyRoundRobin(
  tracksByPlaylist: { playlistId: string; tracks: SimplifiedTrack[] }[],
  rules: Rule[]
): SimplifiedTrack[] {
  if (rules.length === 0 || tracksByPlaylist.length === 0) return [];

  const rule = rules.find((r) => r.type === "round_robin");
  if (!rule || rule.type !== "round_robin") return tracksByPlaylist.flatMap((p) => p.tracks);

  const queues = tracksByPlaylist.map((p) => ({ playlistId: p.playlistId, tracks: [...p.tracks] }));
  const result: SimplifiedTrack[] = [];

  let anyLeft = true;
  while (anyLeft) {
    anyLeft = false;
    for (const queue of queues) {
      const n = rule.overrides[queue.playlistId] ?? rule.defaultN;
      for (let j = 0; j < n; j++) {
        const track = queue.tracks.shift();
        if (track) { result.push(track); anyLeft = true; }
      }
    }
  }
  return result;
}

export default function GroupedPlaylistClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const [playlist, setPlaylist] = useState<GroupedPlaylist | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [groupPlaylists, setGroupPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [generated, setGenerated] = useState<SimplifiedTrack[] | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const gps = loadGroupedPlaylists();
    const found = gps.find((p) => p.id === id) ?? null;
    setPlaylist(found);

    if (found) {
      try {
        const groups: Group[] = JSON.parse(localStorage.getItem("road-trip-mix:groups") ?? "[]");
        const g = groups.find((gr) => gr.id === found.groupId) ?? null;
        setGroup(g);
        if (g) {
          // Set IDs as placeholder names until Spotify lookup resolves
          setGroupPlaylists(g.playlistIds.map((pid) => ({ id: pid, name: pid })));
        }
      } catch {}
    }
  }, [id]);

  // Resolve human-readable playlist names once session is available
  useEffect(() => {
    if (!session?.accessToken || !group) return;
    getPlaylistNames(session.accessToken, group.playlistIds).then((nameMap) => {
      setGroupPlaylists(group.playlistIds.map((pid) => ({ id: pid, name: nameMap[pid] ?? pid })));
    });
  }, [session, group]);

  const saveRules = (rules: Rule[]) => {
    const all = loadGroupedPlaylists();
    const updated = all.map((p) => (p.id === id ? { ...p, rules } : p));
    saveGroupedPlaylists(updated);
    setPlaylist((prev) => prev ? { ...prev, rules } : prev);
  };

  const generate = async () => {
    if (!playlist || !group || !session?.accessToken) return;
    setGenerating(true);
    try {
      const tracksByPlaylist = await Promise.all(
        group.playlistIds.map(async (pid) => ({
          playlistId: pid,
          tracks: await getPlaylistTracksClient(session.accessToken!, pid),
        }))
      );
      setGenerated(applyRoundRobin(tracksByPlaylist, playlist.rules));
    } finally {
      setGenerating(false);
    }
  };

  if (!playlist) {
    return (
      <div className="px-6 py-6">
        <p style={{ color: "var(--text-subdued)" }}>Playlist not found.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {showRules && (
        <RulesModal
          playlist={playlist}
          groupPlaylists={groupPlaylists}
          onSave={saveRules}
          onClose={() => setShowRules(false)}
        />
      )}

      <div className="playlist-content">
        {/* Header */}
        <div className="playlist-header px-8 pt-8 pb-6">
          <Link href="/" className="back-link text-sm mb-6 inline-block transition-colors hover:text-white">
            ← Back
          </Link>
          <div className="flex gap-6 items-end mt-4">
            <div
              className="flex-shrink-0 rounded flex items-center justify-center"
              style={{ width: 232, height: 232, background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }}
            >
              <svg viewBox="0 0 24 24" width="80" height="80" fill="rgba(255,255,255,0.2)">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
              </svg>
            </div>
            <div className="pb-2">
              <p className="playlist-label text-xs font-bold uppercase tracking-widest mb-2">
                Grouped Playlist
              </p>
              <h1 className="playlist-title font-black mb-4">{playlist.name}</h1>
              {group && (
                <p className="playlist-description text-sm mb-2">
                  Sourced from group &ldquo;{group.name}&rdquo;
                </p>
              )}
              <p className="playlist-owner text-sm font-semibold">
                {playlist.rules.length} rule{playlist.rules.length !== 1 ? "s" : ""}
                {generated && (
                  <span className="playlist-owner-sub font-normal">
                    {" "}· {generated.length} tracks generated
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-8 pb-6">
          <button
            onClick={() => setShowRules(true)}
            className="px-5 py-2 rounded-full text-sm font-semibold border transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "var(--text-base)" }}
          >
            Manage Rules
          </button>
          {playlist.rules.length > 0 && (
            <button
              onClick={generate}
              disabled={generating}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity"
              style={{ backgroundColor: "var(--text-bright-accent)", color: "#000", opacity: generating ? 0.6 : 1 }}
            >
              {generating ? "Generating…" : "Generate"}
            </button>
          )}
        </div>

        {/* Track list */}
        <div className="px-6 pb-6">
          {generated === null ? (
            <div className="py-12 text-center" style={{ color: "var(--text-subdued)" }}>
              {playlist.rules.length === 0
                ? "Add rules to generate a track list."
                : "Click Generate to build the track list."}
            </div>
          ) : generated.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--text-subdued)" }}>
              No tracks found in the source playlists.
            </div>
          ) : (
            <div>
              {generated.map((track, i) => (
                <div
                  key={track.id + i}
                  className="flex items-center gap-4 px-4 py-2 rounded text-sm hover:bg-white/5 transition-colors"
                >
                  <span className="w-4 text-center flex-shrink-0" style={{ color: "var(--text-subdued)" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: "var(--text-base)" }}>{track.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-subdued)" }}>
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                  <p className="text-xs truncate hidden sm:block w-40" style={{ color: "var(--text-subdued)" }}>
                    {track.album.name}
                  </p>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-subdued)", fontVariantNumeric: "tabular-nums" }}>
                    {formatDuration(track.duration_ms)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
