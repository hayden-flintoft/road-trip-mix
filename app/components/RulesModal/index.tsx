"use client";

import { useState } from "react";
import type { GroupedPlaylist, Rule, RoundRobinRule, SpacingRule, AudioFeatureRule } from "@/lib/grouped-playlists";
import "./style.css";

type Props = {
  playlist: GroupedPlaylist;
  groupPlaylists: { id: string; name: string }[];
  onSave: (rules: Rule[]) => void;
  onClose: () => void;
};

function RoundRobinRuleItem({
  rule,
  groupPlaylists,
  onChange,
  onDelete,
  dragHandleProps,
  isDragging,
  isDragOver,
}: {
  rule: RoundRobinRule;
  groupPlaylists: { id: string; name: string }[];
  onChange: (updated: RoundRobinRule) => void;
  onDelete: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  const [showOverrides, setShowOverrides] = useState(false);

  return (
    <div className={`rule-item ${isDragging ? "rule-item--dragging" : ""} ${isDragOver ? "rule-item--drag-over" : ""}`}>
      <div className="rule-item__handle" {...dragHandleProps}>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
      </div>

      <div className="rule-item__body">
        <div className="rule-item__header">
          <p className="rule-item__title">Add songs from group in rotation</p>
          <button className="rule-item__delete" onClick={onDelete} title="Remove rule">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="rule-item__config">
          <label className="rule-item__label">
            Default songs per playlist per cycle
            <input
              type="number"
              min={1}
              className="rule-item__input"
              value={rule.defaultN}
              onChange={(e) => onChange({ ...rule, defaultN: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </label>
          <p className="rule-item__desc">
            Each cycle takes {rule.defaultN} song{rule.defaultN !== 1 ? "s" : ""} from each playlist in order,
            repeating until all songs are added.
          </p>
        </div>

        {groupPlaylists.length > 0 && (
          <button className="rule-item__toggle" onClick={() => setShowOverrides((v) => !v)}>
            {showOverrides ? "▾" : "▸"} Per-playlist overrides
          </button>
        )}

        {showOverrides && (
          <div className="rule-item__overrides">
            {groupPlaylists.map((p) => (
              <label key={p.id} className="rule-item__override-row">
                <span className="rule-item__override-name">{p.name}</span>
                <input
                  type="number"
                  min={1}
                  className="rule-item__input rule-item__input--sm"
                  value={rule.overrides[p.id] ?? rule.defaultN}
                  onChange={(e) =>
                    onChange({
                      ...rule,
                      overrides: {
                        ...rule.overrides,
                        [p.id]: Math.max(1, parseInt(e.target.value) || 1),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpacingRuleItem({
  rule,
  onChange,
  onDelete,
  isDragging,
  isDragOver,
}: {
  rule: SpacingRule;
  onChange: (updated: SpacingRule) => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  return (
    <div className={`rule-item ${isDragging ? "rule-item--dragging" : ""} ${isDragOver ? "rule-item--drag-over" : ""}`}>
      <div className="rule-item__handle">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
      </div>

      <div className="rule-item__body">
        <div className="rule-item__header">
          <p className="rule-item__title">Avoid repeating artist / album</p>
          <button className="rule-item__delete" onClick={onDelete} title="Remove rule">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="rule-item__config">
          <label className="rule-item__label">
            Minimum tracks between repeats
            <input
              type="number"
              min={1}
              className="rule-item__input"
              value={rule.n}
              onChange={(e) => onChange({ ...rule, n: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </label>
        </div>

        <div className="rule-item__checkboxes">
          <label className="rule-item__checkbox-row">
            <input
              type="checkbox"
              checked={rule.applyToArtist}
              onChange={(e) => onChange({ ...rule, applyToArtist: e.target.checked })}
            />
            Apply to artist
          </label>
          <label className="rule-item__checkbox-row">
            <input
              type="checkbox"
              checked={rule.applyToAlbum}
              onChange={(e) => onChange({ ...rule, applyToAlbum: e.target.checked })}
            />
            Apply to album
          </label>
        </div>

        <p className="rule-item__desc">
          Moves tracks so the same {[rule.applyToArtist && "artist", rule.applyToAlbum && "album"].filter(Boolean).join(" or ") || "artist or album"} does not appear within {rule.n} track{rule.n !== 1 ? "s" : ""} of itself.
          If no valid position exists, the track is placed anyway.
        </p>
      </div>
    </div>
  );
}

const FEATURE_LABELS: Record<AudioFeatureRule["feature"], string> = {
  tempo: "BPM (tempo)",
  danceability: "Danceability",
  acousticness: "Acousticness",
};

const MISSING_LABELS: Record<AudioFeatureRule["missingPlacement"], string> = {
  first: "Place first",
  last: "Place last",
  alternate: "Alternate with sorted",
  disperse: "Disperse evenly",
  "disperse-start": "Disperse toward start",
  "disperse-end": "Disperse toward end",
};

function AudioFeatureRuleItem({
  rule,
  onChange,
  onDelete,
  isDragging,
  isDragOver,
}: {
  rule: AudioFeatureRule;
  onChange: (updated: AudioFeatureRule) => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  const featureLabel = FEATURE_LABELS[rule.feature];
  const dirLabel = rule.direction === "asc" ? "low → high" : rule.direction === "desc" ? "high → low" : "low → high → low";
  const missingLabel = MISSING_LABELS[rule.missingPlacement].toLowerCase();

  return (
    <div className={`rule-item ${isDragging ? "rule-item--dragging" : ""} ${isDragOver ? "rule-item--drag-over" : ""}`}>
      <div className="rule-item__handle">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
      </div>

      <div className="rule-item__body">
        <div className="rule-item__header">
          <p className="rule-item__title">Sort by audio feature</p>
          <button className="rule-item__delete" onClick={onDelete} title="Remove rule">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="rule-item__config">
          <label className="rule-item__label">
            Feature
            <select
              className="rule-item__select"
              value={rule.feature}
              onChange={(e) => onChange({ ...rule, feature: e.target.value as AudioFeatureRule["feature"] })}
            >
              <option value="tempo">BPM (tempo)</option>
              <option value="danceability">Danceability</option>
              <option value="acousticness">Acousticness</option>
            </select>
          </label>
          <label className="rule-item__label">
            Direction
            <select
              className="rule-item__select"
              value={rule.direction}
              onChange={(e) => onChange({ ...rule, direction: e.target.value as "asc" | "desc" })}
            >
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
              <option value="asc-desc">Low → High → Low</option>
            </select>
          </label>
          <label className="rule-item__label">
            Tracks without data
            <select
              className="rule-item__select"
              value={rule.missingPlacement}
              onChange={(e) => onChange({ ...rule, missingPlacement: e.target.value as AudioFeatureRule["missingPlacement"] })}
            >
              <option value="first">Place first</option>
              <option value="last">Place last</option>
              <option value="alternate">Alternate with sorted</option>
              <option value="disperse">Disperse evenly</option>
              <option value="disperse-start">Disperse toward start</option>
              <option value="disperse-end">Disperse toward end</option>
            </select>
          </label>
        </div>

        <p className="rule-item__desc">
          Sorts tracks by {featureLabel} from {dirLabel}.
          Tracks without {featureLabel} data are {missingLabel}.
        </p>
      </div>
    </div>
  );
}

export default function RulesModal({ playlist, groupPlaylists, onSave, onClose }: Props) {
  const [rules, setRules] = useState<Rule[]>(playlist.rules);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addRoundRobin = () => {
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "round_robin", defaultN: 1, overrides: {} },
    ]);
  };

  const addSpacing = () => {
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "spacing", n: 3, applyToArtist: true, applyToAlbum: false },
    ]);
  };

  const addAudioFeature = () => {
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "audio_feature", feature: "tempo", direction: "asc", missingPlacement: "disperse" },
    ]);
  };

  const updateRule = (index: number, updated: Rule) => {
    setRules((prev) => prev.map((r, i) => (i === index ? updated : r)));
  };

  const deleteRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const reorder = (from: number, to: number) => {
    setRules((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const save = () => {
    onSave(rules);
    onClose();
  };

  return (
    <div className="rules-modal-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rules-modal__header">
          <h2 className="rules-modal__title">Rules — {playlist.name}</h2>
          <button className="rules-modal__close" onClick={onClose}>
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="rules-modal__body">
          {rules.length === 0 ? (
            <p className="rules-modal__empty">No rules yet. Add one below.</p>
          ) : (
            <div className="rules-modal__list">
              {rules.map((rule, i) => (
                <div
                  key={rule.id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                  onDrop={() => { if (dragIndex !== null && dragIndex !== i) reorder(dragIndex, i); setDragIndex(null); setDragOverIndex(null); }}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                >
                  {rule.type === "round_robin" && (
                    <RoundRobinRuleItem
                      rule={rule}
                      groupPlaylists={groupPlaylists}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      dragHandleProps={{}}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i}
                    />
                  )}
                  {rule.type === "spacing" && (
                    <SpacingRuleItem
                      rule={rule}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i}
                    />
                  )}
                  {rule.type === "audio_feature" && (
                    <AudioFeatureRuleItem
                      rule={rule}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rules-modal__add">
            <p className="rules-modal__add-label">Add rule</p>
            <button className="rules-modal__add-btn" onClick={addRoundRobin}>
              + Add songs from group in rotation
            </button>
            <button className="rules-modal__add-btn" onClick={addSpacing}>
              + Avoid repeating artist / album within n tracks
            </button>
            <button className="rules-modal__add-btn" onClick={addAudioFeature}>
              + Sort by audio feature (BPM, danceability, acousticness)
            </button>
          </div>
        </div>

        <div className="rules-modal__footer">
          <button className="rules-modal__cancel" onClick={onClose}>Cancel</button>
          <button className="rules-modal__save" onClick={save}>Save Rules</button>
        </div>
      </div>
    </div>
  );
}
