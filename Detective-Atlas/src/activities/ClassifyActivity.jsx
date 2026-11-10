import React, { useState } from 'react';
import Glyph from '../components/Glyph';
import { SpecimenVisual } from './visuals';

// value: { placements: { [itemId]: binId } }  ·  onChange(value)
export default function ClassifyActivity({ config, value, onChange, disabled }) {
  const placements = value?.placements || {};
  const [sel, setSel] = useState(null);
  const [look, setLook] = useState(config.items[0].id);
  const place = (itemId, binId) => {
    const next = { ...placements };
    if (binId) next[itemId] = binId; else delete next[itemId];
    onChange({ placements: next }); setSel(null);
  };
  const inspected = config.items.find((i) => i.id === look);
  const card = (it) => (
    <button key={it.id} draggable={!disabled} disabled={disabled} className={`specimen ${sel === it.id ? 'sel' : ''}`} data-item-id={it.id}
      onDragStart={(e) => { if (disabled) { e.preventDefault(); return; } e.dataTransfer.setData('text/plain', it.id); setLook(it.id); }}
      onClick={() => { if (disabled) return; setLook(it.id); setSel(sel === it.id ? null : it.id); }}>
      <SpecimenVisual visual={it.visual} size={58} /><span>{it.name}</span>
    </button>
  );
  const drop = (binId) => ({ onDragOver: (e) => { if (!disabled) e.preventDefault(); }, onDrop: (e) => { e.preventDefault(); if (!disabled) place(e.dataTransfer.getData('text/plain'), binId); } });
  return (
    <div className="act act-classify" data-component="ClassifyActivity">
      <div className="inspector">
        <div className="insp-vis"><SpecimenVisual visual={inspected.visual} size={92} /></div>
        <div><b>{inspected.name}</b><ul>{inspected.features.map((f) => <li key={f}>{f}</li>)}</ul></div>
      </div>
      <div className="tray" {...drop(null)} data-drop="tray">
        {config.items.filter((i) => !placements[i.id]).map(card)}
        {Object.keys(placements).length === config.items.length && <em className="tray-empty">All sorted!</em>}
      </div>
      <div className="bins" style={{ gridTemplateColumns: `repeat(${config.bins.length}, 1fr)` }}>
        {config.bins.map((b) => (
          <div key={b.id} className={`bin ${sel ? 'armed' : ''}`} data-bin-id={b.id} {...drop(b.id)} onClick={() => !disabled && sel && place(sel, b.id)}>
            <header><Glyph name={b.glyph} size={18} /> {b.label}</header>
            <div className="bin-items">{config.items.filter((i) => placements[i.id] === b.id).map((it) => <button key={it.id} className="specimen mini" onClick={(e) => { e.stopPropagation(); if (!disabled) place(it.id, null); }} disabled={disabled} title="Tap to take out"><SpecimenVisual visual={it.visual} size={34} /><span>{it.name}</span></button>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
