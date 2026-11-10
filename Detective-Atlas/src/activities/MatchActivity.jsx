import React, { useState } from 'react';
import Glyph from '../components/Glyph';

const COLORS = ['#f6c453', '#7be0a4', '#ff7b9c', '#5ee7ff', '#b693ff', '#ff9a4a'];

// value: { pairs: { [leftId]: rightId } }
export default function MatchActivity({ config, value, onChange, disabled }) {
  const pairs = value?.pairs || {};
  const [sel, setSel] = useState(null);
  const color = (leftId) => COLORS[config.left.findIndex((l) => l.id === leftId) % COLORS.length];
  const owner = (rightId) => Object.keys(pairs).find((k) => pairs[k] === rightId);
  const pickRight = (rid) => {
    if (!sel || disabled) return;
    const next = { ...pairs };
    Object.keys(next).forEach((k) => { if (next[k] === rid) delete next[k]; });
    next[sel] = rid; onChange({ pairs: next }); setSel(null);
  };
  const clearLeft = (lid) => { if (disabled) return; const n = { ...pairs }; delete n[lid]; onChange({ pairs: n }); };
  return (
    <div className="act act-match" data-component="MatchActivity">
      <div className="match-col">
        {config.left.map((l) => (
          <button key={l.id} data-item-id={l.id} className={`match-chip ${sel === l.id ? 'sel' : ''} ${pairs[l.id] ? 'paired' : ''}`} style={{ '--c': color(l.id) }}
            onClick={() => (disabled ? null : pairs[l.id] ? clearLeft(l.id) : setSel(sel === l.id ? null : l.id))} disabled={disabled}>
            <Glyph name={l.glyph} size={20} /> {l.label}<i className="dot" />
          </button>
        ))}
      </div>
      <div className="match-mid" aria-hidden>{config.left.map((l) => <span key={l.id} style={{ '--c': color(l.id) }} className={pairs[l.id] ? 'on' : ''} />)}</div>
      <div className="match-col">
        {config.right.map((r) => {
          const o = owner(r.id);
          return <button key={r.id} data-target-id={r.id} className={`match-chip target ${o ? 'paired' : ''} ${sel ? 'armed' : ''}`} style={{ '--c': o ? color(o) : '#6c7c9a' }} onClick={() => pickRight(r.id)} disabled={disabled}>{r.label}<i className="dot" /></button>;
        })}
      </div>
    </div>
  );
}
