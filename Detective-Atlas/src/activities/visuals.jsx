import React from 'react';
import Glyph from '../components/Glyph';

export function PrintVisual({ toes = 4, claws, long, bird, size = 74 }) {
  const ang = toes === 3 ? [-38, 0, 38] : [-48, -16, 16, 48];
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden>
      {bird ? <g stroke="#e6d4a8" strokeWidth="5" strokeLinecap="round" fill="none"><path d="M40 62 V32" /><path d="M40 62 L14 38" /><path d="M40 62 L66 38" /></g>
        : <g fill="#e6d4a8">
          <ellipse cx="40" cy="56" rx={long ? 12 : 18} ry={long ? 18 : 13} />
          {ang.map((a, i) => <g key={i} transform={`rotate(${a} 40 52)`}><ellipse cx="40" cy="26" rx="6" ry={long ? 9 : 7} />{claws && <path d="M40 14 l0 -7" stroke="#e6d4a8" strokeWidth="3" strokeLinecap="round" />}</g>)}
        </g>}
    </svg>
  );
}

export function PlanetVisual({ c1, c2, rings, stripes, size = 74 }) {
  const id = `pv-${c1.slice(1)}${c2.slice(1)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden>
      <defs><radialGradient id={id} cx=".35" cy=".3" r=".9"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></radialGradient><clipPath id={`${id}c`}><circle cx="40" cy="40" r="24" /></clipPath></defs>
      {rings && <ellipse cx="40" cy="40" rx="38" ry="9" fill="none" stroke={c1} strokeWidth="3" opacity=".6" transform="rotate(-18 40 40)" />}
      <circle cx="40" cy="40" r="24" fill={`url(#${id})`} />
      {stripes && <g clipPath={`url(#${id}c)`} opacity=".35"><rect x="14" y="26" width="52" height="5" fill="#fff" /><rect x="14" y="40" width="52" height="5" fill="#fff" /><rect x="14" y="54" width="52" height="4" fill="#fff" /></g>}
    </svg>
  );
}

export function SpecimenVisual({ visual, size }) {
  if (!visual) return null;
  if (visual.kind === 'print') return <PrintVisual {...visual} size={size} />;
  if (visual.kind === 'planet') return <PlanetVisual {...visual} size={size} />;
  return <Glyph name={visual.glyph} size={size || 40} />;
}

// Signal symbols for pattern activities.
export function Sym({ kind, color = '#5ee7ff', size = 46, glitchy }) {
  const s = { fill: color, stroke: '#fff', strokeOpacity: 0.35, strokeWidth: 2 };
  let shape;
  switch (kind) {
    case 'triangle': shape = <polygon points="25,6 45,42 5,42" {...s} />; break;
    case 'square': shape = <rect x="7" y="7" width="36" height="36" rx="4" {...s} />; break;
    case 'diamond': shape = <polygon points="25,4 46,25 25,46 4,25" {...s} />; break;
    case 'ring': shape = <circle cx="25" cy="25" r="17" fill="none" stroke={color} strokeWidth="7" />; break;
    case 'wave': shape = <path d="M4 25 q7 -18 14 0 t14 0 t14 0" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />; break;
    default: shape = <circle cx="25" cy="25" r="19" {...s} />;
  }
  return <svg className={glitchy ? 'sym glitchy' : 'sym'} width={size} height={size} viewBox="0 0 50 50" aria-hidden>{shape}</svg>;
}
