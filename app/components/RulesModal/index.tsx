"use client";

import { useState } from "react";
import type { GroupedPlaylist, Rule, RoundRobinRule, SpacingRule, AudioFeatureRule, SortRule } from "@/lib/grouped-playlists";
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

type SortCategory = "shuffle" | "track" | "album" | "artist" | "bpm" | "duration";

function getSortCategory(method: SortRule["method"]): SortCategory {
  if (method === "random" || method === "random-seeded" || method === "random-soft") return "shuffle";
  if (method === "name-asc" || method === "name-desc") return "track";
  if (method === "album-asc" || method === "album-desc") return "album";
  if (method === "artist-asc" || method === "artist-desc") return "artist";
  if (method === "bpm-asc" || method === "bpm-desc") return "bpm";
  return "duration";
}

const SORT_CATEGORY_TITLES: Record<SortCategory, string> = {
  shuffle:  "Shuffle",
  track:    "Sort by Track",
  album:    "Sort by Album",
  artist:   "Sort by Artist",
  bpm:      "Sort by BPM",
  duration: "Sort by Duration",
};

function SortRuleItem({
  rule,
  onChange,
  onDelete,
  dragHandleProps,
  isDragging,
  isDragOver,
}: {
  rule: SortRule;
  onChange: (updated: SortRule) => void;
  onDelete: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  const category = getSortCategory(rule.method);

  return (
    <div className={`rule-item ${isDragging ? "rule-item--dragging" : ""} ${isDragOver ? "rule-item--drag-over" : ""}`}>
      <div className="rule-item__handle" {...dragHandleProps}>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
      </div>

      <div className="rule-item__body">
        <div className="rule-item__header">
          <p className="rule-item__title">{SORT_CATEGORY_TITLES[category]}</p>
          <button className="rule-item__delete" onClick={onDelete} title="Remove rule">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="rule-item__config">
          {category === "shuffle" && (
            <>
              <label className="rule-item__label">
                Method
                <select
                  className="rule-item__select"
                  value={rule.method}
                  onChange={(e) => onChange({ ...rule, method: e.target.value as SortRule["method"] })}
                >
                  <option value="random">Random</option>
                  <option value="random-seeded">Seeded</option>
                  <option value="random-soft">Soft shuffle</option>
                </select>
              </label>

              {rule.method === "random-seeded" && (
                <div className="rule-item__label">
                  Seed
                  <div className="rule-item__seed-row">
                    <input
                      type="number"
                      min={1}
                      className="rule-item__input rule-item__input--seed"
                      value={rule.seed ?? 1}
                      onChange={(e) => onChange({ ...rule, seed: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                    <button
                      className="rule-item__seed-now"
                      title="Use current timestamp as seed"
                      onClick={() => {
                        const d = new Date();
                        const ts = [
                          d.getFullYear(),
                          String(d.getMonth() + 1).padStart(2, "0"),
                          String(d.getDate()).padStart(2, "0"),
                          String(d.getHours()).padStart(2, "0"),
                          String(d.getMinutes()).padStart(2, "0"),
                          String(d.getSeconds()).padStart(2, "0"),
                          String(d.getMilliseconds()).padStart(3, "0"),
                        ].join("");
                        onChange({ ...rule, seed: parseInt(ts) });
                      }}
                    >
                      Now
                    </button>
                  </div>
                </div>
              )}

              {rule.method === "random-soft" && (
                <label className="rule-item__label">
                  Max displacement
                  <input
                    type="number"
                    min={2}
                    className="rule-item__input"
                    value={rule.window ?? 5}
                    onChange={(e) => onChange({ ...rule, window: Math.max(2, parseInt(e.target.value) || 5) })}
                  />
                </label>
              )}
            </>
          )}

          {(category === "track" || category === "album" || category === "artist") && (
            <label className="rule-item__label">
              Direction
              <select
                className="rule-item__select"
                value={rule.method}
                onChange={(e) => onChange({ ...rule, method: e.target.value as SortRule["method"] })}
              >
                <option value={`${category === "track" ? "name" : category}-asc`}>A → Z</option>
                <option value={`${category === "track" ? "name" : category}-desc`}>Z → A</option>
              </select>
            </label>
          )}

          {category === "bpm" && (
            <label className="rule-item__label">
              Direction
              <select
                className="rule-item__select"
                value={rule.method}
                onChange={(e) => onChange({ ...rule, method: e.target.value as SortRule["method"] })}
              >
                <option value="bpm-asc">Low → High</option>
                <option value="bpm-desc">High → Low</option>
              </select>
            </label>
          )}

          {category === "duration" && (
            <label className="rule-item__label">
              Direction
              <select
                className="rule-item__select"
                value={rule.method}
                onChange={(e) => onChange({ ...rule, method: e.target.value as SortRule["method"] })}
              >
                <option value="duration-asc">Short → Long</option>
                <option value="duration-desc">Long → Short</option>
              </select>
            </label>
          )}
        </div>

        <p className="rule-item__desc">
          {category === "shuffle" && rule.method === "random" && "Shuffles all tracks randomly. Each generate produces a different order."}
          {category === "shuffle" && rule.method === "random-seeded" && `Reproducible shuffle — seed ${rule.seed ?? 1} always produces the same order.`}
          {category === "shuffle" && rule.method === "random-soft" && `Shuffles tracks with limited displacement. Each track moves at most ${rule.window ?? 5} positions from where it started.`}
          {category === "track" && (rule.method === "name-asc" ? "Sorts tracks alphabetically by title (A → Z)." : "Sorts tracks by title in reverse alphabetical order (Z → A).")}
          {category === "album" && (rule.method === "album-asc" ? "Sorts tracks alphabetically by album name (A → Z)." : "Sorts tracks by album name in reverse alphabetical order (Z → A).")}
          {category === "artist" && (rule.method === "artist-asc" ? "Sorts tracks alphabetically by artist name (A → Z)." : "Sorts tracks by artist name in reverse alphabetical order (Z → A).")}
          {category === "bpm" && (rule.method === "bpm-asc" ? "Sorts from lowest to highest BPM. Audio data is fetched on generate." : "Sorts from highest to lowest BPM. Audio data is fetched on generate.")}
          {category === "duration" && (rule.method === "duration-asc" ? "Sorts from shortest to longest track duration." : "Sorts from longest to shortest track duration.")}
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
          <p className="rule-item__title">Sort by Feature</p>
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

function isSortSection(r: Rule) {
  return r.type === "sort" || r.type === "audio_feature";
}

function normalizeRules(rules: Rule[]): Rule[] {
  return [
    ...rules.filter(isSortSection),
    ...rules.filter((r) => !isSortSection(r)),
  ];
}

export default function RulesModal({ playlist, groupPlaylists, onSave, onClose }: Props) {
  const [rules, setRules] = useState<Rule[]>(normalizeRules(playlist.rules));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addSortRule = (method: SortRule["method"]) => {
    setRules((prev) => normalizeRules([
      ...prev,
      { id: crypto.randomUUID(), type: "sort", method },
    ]));
  };

  const addRoundRobin = () => {
    setRules((prev) => normalizeRules([
      ...prev,
      { id: crypto.randomUUID(), type: "round_robin", defaultN: 1, overrides: {} },
    ]));
  };

  const addSpacing = () => {
    setRules((prev) => normalizeRules([
      ...prev,
      { id: crypto.randomUUID(), type: "spacing", n: 3, applyToArtist: true, applyToAlbum: false },
    ]));
  };

  const addSortByFeature = () => {
    setRules((prev) => normalizeRules([
      ...prev,
      { id: crypto.randomUUID(), type: "audio_feature", feature: "tempo", direction: "asc", missingPlacement: "disperse" },
    ]));
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
          {/* Toolbox pane */}
          <div className="rules-modal__toolbox">
            <p className="rules-modal__toolbox-label">Sort</p>
            <button className="rules-modal__add-btn" onClick={() => addSortRule("random")}>+ Shuffle</button>
            <button className="rules-modal__add-btn" onClick={() => addSortRule("name-asc")}>+ Sort by Track</button>
            <button className="rules-modal__add-btn" onClick={() => addSortRule("album-asc")}>+ Sort by Album</button>
            <button className="rules-modal__add-btn" onClick={() => addSortRule("artist-asc")}>+ Sort by Artist</button>
            <button className="rules-modal__add-btn" onClick={() => addSortRule("bpm-asc")}>+ Sort by BPM</button>
            <button className="rules-modal__add-btn" onClick={() => addSortRule("duration-asc")}>+ Sort by Duration</button>
            <button className="rules-modal__add-btn" onClick={addSortByFeature}>+ Sort by Feature</button>

            <p className="rules-modal__toolbox-label" style={{ marginTop: 16 }}>Transform</p>
            <button className="rules-modal__add-btn" onClick={addRoundRobin}>+ Rotation</button>
            <button className="rules-modal__add-btn" onClick={addSpacing}>+ Avoid repeat artist / album</button>
          </div>

          {/* Rules pane */}
          <div className="rules-modal__rules">
          {rules.length === 0 ? (
            <p className="rules-modal__empty">No rules yet. Add one from the toolbox.</p>
          ) : (
            <div className="rules-modal__list">
              {rules.map((rule, i) => {
                const isSort = isSortSection(rule);
                const prevIsSort = i > 0 && isSortSection(rules[i - 1]);
                const hasSorts = rules.some(isSortSection);
                const hasTransforms = rules.some((r) => !isSortSection(r));
                const sameSection = dragIndex !== null && isSortSection(rules[dragIndex]) === isSort;

                return (
                <div key={rule.id}>
                  {i === 0 && hasSorts && (
                    <p className="rules-modal__section-label">Sort</p>
                  )}
                  {i > 0 && !isSort && prevIsSort && hasTransforms && (
                    <p className="rules-modal__section-label">Transform</p>
                  )}
                  {i === 0 && !hasSorts && hasTransforms && (
                    <p className="rules-modal__section-label">Transform</p>
                  )}
                  <div
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => { e.preventDefault(); if (sameSection) setDragOverIndex(i); }}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== i && sameSection) reorder(dragIndex, i);
                      setDragIndex(null); setDragOverIndex(null);
                    }}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  >
                  {rule.type === "sort" && (
                    <SortRuleItem
                      rule={rule}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      dragHandleProps={{}}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i && sameSection}
                    />
                  )}
                  {rule.type === "round_robin" && (
                    <RoundRobinRuleItem
                      rule={rule}
                      groupPlaylists={groupPlaylists}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      dragHandleProps={{}}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i && sameSection}
                    />
                  )}
                  {rule.type === "spacing" && (
                    <SpacingRuleItem
                      rule={rule}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i && sameSection}
                    />
                  )}
                  {rule.type === "audio_feature" && (
                    <AudioFeatureRuleItem
                      rule={rule}
                      onChange={(updated) => updateRule(i, updated)}
                      onDelete={() => deleteRule(i)}
                      isDragging={dragIndex === i}
                      isDragOver={dragOverIndex === i && dragIndex !== i && sameSection}
                    />
                  )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
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
