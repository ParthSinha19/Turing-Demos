import React from 'react';
import { Lock } from 'lucide-react';
import Glyph from './Glyph';

// <Hotspot id x y label icon onClick locked badge /> — x/y are % of the scene.
export default function Hotspot({ id, x, y, label, icon = 'star', onClick, locked, badge, className = '' }) {
  return (
    <button id={id} data-component="Hotspot" className={`hotspot ${locked ? 'locked' : ''} ${className}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={locked ? undefined : onClick} aria-label={label} aria-disabled={locked}>
      <span className="hs-ring" /><span className="hs-dot">{locked ? <Lock size={16} /> : <Glyph name={icon} size={18} />}</span>
      <span className="hs-label">{label}</span>{badge ? <span className="hs-badge">{badge}</span> : null}
    </button>
  );
}
