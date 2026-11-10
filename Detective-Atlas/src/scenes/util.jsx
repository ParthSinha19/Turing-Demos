import React from 'react';
import { rnd } from '../lib/color';

// Parallax layer. CSS reads --mx/--my (set by <Environment>) and --d (depth).
export const Layer = ({ d = 0, children, className = '' }) => (
  <svg className={`layer ${className}`} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ '--d': d }} aria-hidden>{children}</svg>
);

export function Pine({ x, y, h, w }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w * 0.05} y={-h * 0.14} width={w * 0.1} height={h * 0.14} />
      <polygon points={`0,${-h} ${w * 0.32},${-h * 0.56} ${-w * 0.32},${-h * 0.56}`} />
      <polygon points={`0,${-h * 0.8} ${w * 0.41},${-h * 0.32} ${-w * 0.41},${-h * 0.32}`} />
      <polygon points={`0,${-h * 0.56} ${w * 0.5},${-h * 0.1} ${-w * 0.5},${-h * 0.1}`} />
    </g>
  );
}

export function PineRow({ seed, n, y, hmin, hmax, fill, jitter = 0 }) {
  const r = rnd(seed);
  return (
    <g fill={fill}>
      {Array.from({ length: n }).map((_, i) => {
        const h = hmin + r() * (hmax - hmin);
        return <Pine key={i} x={(i + 0.5) * (1700 / n) - 50 + (r() - 0.5) * jitter} y={y + r() * 14} h={h} w={h * 0.52} />;
      })}
    </g>
  );
}

export function Stars({ seed = 3, n = 120, h = 900, tint = '#fff' }) {
  const r = rnd(seed);
  return (
    <g fill={tint}>
      {Array.from({ length: n }).map((_, i) => {
        const big = r() > 0.92;
        return <circle key={i} className={big ? 'twinkle' : ''} style={{ animationDelay: `${(r() * 4).toFixed(2)}s` }} cx={r() * 1600} cy={r() * h} r={big ? 2.2 : 0.6 + r() * 1.1} opacity={0.35 + r() * 0.65} />;
      })}
    </g>
  );
}

export function Fireflies({ n = 22, seed = 9, color }) {
  const r = rnd(seed);
  return (
    <div className="fireflies" aria-hidden style={color ? { '--ff': color } : undefined}>
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} style={{ left: `${r() * 100}%`, top: `${40 + r() * 55}%`, animationDelay: `${(r() * 8).toFixed(2)}s`, animationDuration: `${(6 + r() * 7).toFixed(1)}s`, '--dx': `${(r() * 80 - 40).toFixed(0)}px` }} />
      ))}
    </div>
  );
}
