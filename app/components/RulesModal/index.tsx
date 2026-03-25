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

const SORT_METHOD_LABELS: Record<SortRule["method"], string> = {
  "random":        "Shuffle (Random)",
  "random-seeded": "Shuffle (Seeded)",
  "random-soft":   "Soft Shuffle",
  "name-asc":      "Track Name A → Z",
  "name-desc":     "Track Name Z → A",
  "album-asc":     "Album A → Z",
  "album-desc":    "Album Z → A",
  "artist-asc":    "Artist A → Z",
  "artist-desc":   "Artist Z → A",
  "bpm-asc":       "BPM Low → High",
  "bpm-desc":      "BPM High → Low",
  "duration-asc":  "Duration Short → Long",
  "duration-desc": "Duration Long → Short",
};

const SORT_METHOD_DESCRIPTIONS: Record<SortRule["method"], (rule: SortRule) => string> = {
  "random":        () => "Shuffles all tracks randomly. Each generate produces a different order.",
  "random-seeded": (r) => `Reproducible shuffle — seed ${r.seed ?? 1} always produces the same order.`,
  "random-soft":   (r) => `Shuffles tracks with limited displacement. Each track moves at most ${r.window ?? 5} positions from where it started.`,
  "name-asc":      () => "Sorts tracks alphabetically by title (A → Z).",
  "name-desc":     () => "Sorts tracks by title in reverse alphabetical order (Z → A).",
  "album-asc":     () => "Sorts tracks alphabetically by album name (A → Z).",
  "album-desc":    () => "Sorts tracks by album name in reverse alphabetical order (Z → A).",
  "artist-asc":    () => "Sorts tracks alphabetically by artist name (A → Z).",
  "artist-desc":   () => "Sorts tracks by artist name in reverse alphabetical order (Z → A).",
  "bpm-asc":       () => "Sorts from lowest to highest BPM. Audio data is fetched on generate.",
  "bpm-desc":      () => "Sorts from highest to lowest BPM. Audio data is fetched on generate.",
  "duration-asc":  () => "Sorts from shortest to longest track duration.",
  "duration-desc": () => "Sorts from longest to shortest track duration.",
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
  return (
    <div className={`rule-item ${isDragging ? "rule-item--dragging" : ""} ${isDragOver ? "rule-item--drag-over" : ""}`}>
      <div className="rule-item__handle" {...dragHandleProps}>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
      </div>

      <div className="rule-item__body">
        <div className="rule-item__header">
          <p className="rule-item__title">Sort: {SORT_METHOD_LABELS[rule.method]}</p>
          <button className="rule-item__delete" onClick={onDelete} title="Remove rule">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="rule-item__config">
          <label className="rule-item__label">
            Method
            <select
              className="rule-item__select"
              value={rule.method}
              onChange={(e) => onChange({ ...rule, method: e.target.value as SortRule["method"] })}
            >
              <optgroup label="Random">
                <option value="random">Shuffle (Random)</option>
                <option value="random-seeded">Shuffle (Seeded)</option>
                <option value="random-soft">Soft Shuffle</option>
              </optgroup>
              <optgroup label="Track Name">
                <option value="name-asc">A → Z</option>
                <option value="name-desc">Z → A</option>
              </optgroup>
              <optgroup label="Album">
                <option value="album-asc">A → Z</option>
                <option value="album-desc">Z → A</option>
              </optgroup>
              <optgroup label="Artist">
                <option value="artist-asc">A → Z</option>
                <option value="artist-desc">Z → A</option>
              </optgroup>
              <optgroup label="BPM">
                <option value="bpm-asc">Low → High</option>
                <option value="bpm-desc">High → Low</option>
              </optgroup>
              <optgroup label="Duration">
                <option value="duration-asc">Short → Long</option>
                <option value="duration-desc">Long → Short</option>
              </optgroup>
            </select>
          </label>

          {rule.method === "random-seeded" && (
            <label className="rule-item__label">
              Seed
              <input
                type="number"
                min={1}
                className="rule-item__input"
                value={rule.seed ?? 1}
                onChange={(e) => onChange({ ...rule, seed: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </label>
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
        </div>

        <p className="rule-item__desc">{SORT_METHOD_DESCRIPTIONS[rule.method](rule)}</p>
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

function normalizeRules(rules: Rule[]): Rule[] {
  return [
    ...rules.filter((r) => r.type === "sort"),
    ...rules.filter((r) => r.type !== "sort"),
  ];
}

export default function RulesModal({ playlist, groupPlaylists, onSave, onClose }: Props) {
  const [rules, setRules] = useState<Rule[]>(normalizeRules(playlist.rules));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addSort = () => {
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "sort", method: "random" },
    ]);
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

  const addAudioFeature = () => {
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
          {rules.length === 0 ? (
            <p className="rules-modal__empty">No rules yet. Add one below.</p>
          ) : (
            <div className="rules-modal__list">
              {rules.map((rule, i) => {
                const isSort = rule.type === "sort";
                const prevIsSort = i > 0 && rules[i - 1].type === "sort";
                const hasSorts = rules.some((r) => r.type === "sort");
                const hasTransforms = rules.some((r) => r.type !== "sort");
                const sameSection = dragIndex !== null && (rules[dragIndex].type === "sort") === isSort;

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

          <div className="rules-modal__add">
            <p className="rules-modal__add-label">Add rule</p>
            <button className="rules-modal__add-btn" onClick={addSort}>
              + Sort tracks (shuffle, A–Z, BPM, duration…)
            </button>
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
