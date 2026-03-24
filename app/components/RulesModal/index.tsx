"use client";

import { useState } from "react";
import type { GroupedPlaylist, Rule, RoundRobinRule } from "@/lib/grouped-playlists";
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
                </div>
              ))}
            </div>
          )}

          <div className="rules-modal__add">
            <p className="rules-modal__add-label">Add rule</p>
            <button className="rules-modal__add-btn" onClick={addRoundRobin}>
              + Add songs from group in rotation
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
