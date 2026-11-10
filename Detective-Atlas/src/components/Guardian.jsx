import React from 'react';
import { useGame } from '../state/GameContext';

// G.U.A.R.D.I.A.N. — a shield-shaped helper. Damaged: cracked, flickering pink and cyan.
// Repaired: calm gold glow. It is healthy when expression is 'happy' or 'thinking', or once the finale is solved.
export default function Guardian({ expression = 'neutral', bust, size }) {
  const { state } = useGame();
  const repaired = state.completed.includes('space-7');
  const healthy = repaired ? expression !== 'damaged' : expression === 'happy' || expression === 'thinking';
  const col = healthy ? '#ffcf5a' : '#ff4fd8';
  const body = 'M100 24 L158 48 V112 Q158 164 100 196 Q42 164 42 112 V48 Z';
  return (
    <svg className={`char guardian ${healthy ? 'healthy' : 'damaged'}`} viewBox={bust ? '30 14 140 150' : '0 0 200 250'} width={bust ? size : size * 0.8} height={size} role="img" aria-label="G.U.A.R.D.I.A.N.">
      {!healthy && <g className="gl-a" opacity=".7"><path d={body} fill="#ff4fd8" /></g>}
      {!healthy && <g className="gl-b" opacity=".7"><path d={body} fill="#38e8ff" /></g>}
      <path d="M100 6 V24 M60 214 H140" stroke={col} strokeWidth="3" strokeLinecap="round" opacity=".6" />
      <path d={body} fill="#141c40" stroke={col} strokeWidth="4" />
      <path d="M100 40 L146 58 V110 Q146 152 100 178 Q54 152 54 110 V58 Z" fill="#0b1030" stroke={col} strokeWidth="2" strokeDasharray={healthy ? '0' : '6 5'} />
      <circle cx="100" cy="104" r="30" fill="#07091f" stroke={col} strokeWidth="3" />
      <circle cx="100" cy="104" r="21" fill="none" stroke={col} strokeWidth="2" strokeDasharray="6 5" className="ring-spin" />
      {healthy
        ? <><path d="M84 102 q6 -9 12 0 M104 102 q6 -9 12 0" stroke="#fff3cf" strokeWidth="4" fill="none" strokeLinecap="round" /><path d="M88 116 q12 10 24 0" stroke="#fff3cf" strokeWidth="3.4" fill="none" strokeLinecap="round" /></>
        : <><circle cx="90" cy="102" r="6" fill="#ffd6f6" /><circle cx="110" cy="102" r="6" fill="#ffd6f6" /><path d="M88 120 q12 -8 24 0" stroke="#ffd6f6" strokeWidth="3.4" fill="none" strokeLinecap="round" /></>}
      {!healthy && <path d="M104 40 L94 70 L108 84 L96 112 L110 128 L100 178" stroke="#ff4fd8" strokeWidth="3.4" fill="none" strokeLinejoin="round" className="gl-edge" />}
      <circle cx="30" cy="80" r="3" fill={col} className="orb-a" /><circle cx="172" cy="120" r="3" fill={col} className="orb-b" />
    </svg>
  );
}