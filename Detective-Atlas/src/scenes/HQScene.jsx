import React from 'react';
import { Layer, Stars, Fireflies } from './util';
import { rnd } from '../lib/color';

// Detective Headquarters. `level` expands the room: 1 forest office, 2 workshop + radar, 3 orbital observatory.
export default function HQScene({ level = 1 }) {
  const r = rnd(12);
  return (
    <>
      <Layer d={0}>
        <defs>
          <linearGradient id="hq-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3d2a1b" /><stop offset="1" stopColor="#24170f" /></linearGradient>
          <linearGradient id="hq-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a2230" /><stop offset="1" stopColor="#1c5a52" /></linearGradient>
          <radialGradient id="hq-lamp"><stop offset="0" stopColor="#ffd98a" stopOpacity=".6" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
          <pattern id="hq-wood" width="120" height="900" patternUnits="userSpaceOnUse"><rect width="120" height="900" fill="none" /><path d="M0 0 V900 M60 0 V900" stroke="#00000033" strokeWidth="3" /></pattern>
        </defs>
        <rect width="1600" height="900" fill="url(#hq-wall)" />
        <rect width="1600" height="900" fill="url(#hq-wood)" />
        {/* round window */}
        <g transform="translate(800 330)">
          <circle r="238" fill="#1a110a" />
          <clipPath id="hq-win"><circle r="214" /></clipPath>
          <g clipPath="url(#hq-win)">
            <rect x="-220" y="-220" width="440" height="440" fill="url(#hq-night)" />
            <g transform="translate(-220 -220) scale(.28)"><Stars seed={8} n={60} h={900} /></g>
            <circle cx="90" cy="-90" r="34" fill="#fff8dd" /><circle cx="90" cy="-90" r="70" fill="#fff2b8" opacity=".12" />
            <path d="M-220 80 Q-120 20 -20 70 T220 50 V220 H-220Z" fill="#0c3a35" />
            {Array.from({ length: 9 }).map((_, i) => <polygon key={i} points={`${-210 + i * 52},${110 + r() * 20} ${-190 + i * 52},${20 + r() * 20} ${-170 + i * 52},${110 + r() * 20}`} fill="#08282a" />)}
            {level >= 2 && <g transform="translate(-110 20)"><path d="M0 60 V0" stroke="#9fb2d8" strokeWidth="5" /><path d="M-34 -4 Q0 -46 34 -4Q0 -16 -34 -4Z" fill="#9fb2d8" /><circle cx="0" cy="-34" r="4" fill="#ff6b6b" className="blink-light" /></g>}
            {level >= 3 && <g transform="translate(110 10)"><path d="M-40 70 Q-40 0 0 0 Q40 0 40 70Z" fill="#6d8bff" opacity=".9" /><path d="M0 0 V70" stroke="#1d2a5a" strokeWidth="6" /><circle cx="0" cy="-8" r="3" fill="#5ee7ff" className="blink-light" /></g>}
          </g>
          <circle r="224" fill="none" stroke="#6b4521" strokeWidth="24" />
          <path d="M-224 0 H224 M0 -224 V224" stroke="#6b4521" strokeWidth="10" />
          <g className="fireflies-inner">{[[-60, 120], [40, 140], [120, 90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#f6c453" className="lamp" style={{ animationDelay: `${i * 0.6}s` }} />)}</g>
        </g>
        {/* floor */}
        <rect y="760" width="1600" height="140" fill="#2a1a10" /><rect y="756" width="1600" height="10" fill="#6b4521" />
        {/* world map on wall (left) */}
        <g transform="translate(200 270)"><rect x="-120" y="-100" width="240" height="190" fill="#e9d6a6" stroke="#6b4521" strokeWidth="8" />
          <path d="M-96 -40 q40 -50 80 -10 t70 -20 M-90 20 q50 30 90 0 t90 20" stroke="#8a6a3b" strokeWidth="4" fill="none" />
          <circle cx="-40" cy="-20" r="8" fill="#c0463a" /><circle cx="50" cy="10" r="8" fill="#5ee7ff" className={level >= 3 ? 'lamp' : ''} opacity={level >= 3 ? 1 : 0.25} />
          <path d="M-40 -20 Q0 -40 50 10" stroke="#c0463a" strokeWidth="3" strokeDasharray="6 6" fill="none" /></g>
        {/* investigation board (right) */}
        <g transform="translate(1390 270)"><rect x="-140" y="-120" width="280" height="220" fill="#122733" stroke="#6b4521" strokeWidth="10" />
          {[[-90, -60], [10, -70], [80, -20], [-60, 20], [30, 40]].map(([x, y], i) => <g key={i}><rect x={x - 22} y={y - 18} width="44" height="36" fill="#f3e6c7" transform={`rotate(${i * 7 - 12} ${x} ${y})`} /><circle cx={x} cy={y - 14} r="4" fill="#c0463a" /></g>)}
          <path d="M-90 -74 L10 -84 L80 -34 L30 26 L-60 6 L-90 -74" stroke="#ff7b7b" strokeWidth="2.4" fill="none" /></g>
        {/* desk */}
        <g transform="translate(800 790)"><rect x="-380" y="-70" width="760" height="40" rx="6" fill="#6b4521" /><rect x="-340" y="-30" width="30" height="130" fill="#4b3320" /><rect x="310" y="-30" width="30" height="130" fill="#4b3320" />
          <circle cx="-200" cy="-150" r="140" fill="url(#hq-lamp)" /><path d="M-200 -70 V-140 L-170 -170" stroke="#9fb2d8" strokeWidth="8" fill="none" /><path d="M-190 -172 L-140 -160 L-160 -130Z" fill="#f6c453" />
          <rect x="-70" y="-82" width="110" height="14" fill="#f3e6c7" stroke="#8a6a3b" strokeWidth="3" /><rect x="-60" y="-96" width="90" height="14" fill="#c0463a" />
          <circle cx="170" cy="-92" r="22" fill="rgba(120,230,255,.22)" stroke="#f6c453" strokeWidth="5" /></g>
        {level >= 2 && <g transform="translate(1440 760)"><rect x="-130" y="-190" width="260" height="190" fill="#3b2818" stroke="#6b4521" strokeWidth="6" /><rect x="-120" y="-60" width="240" height="14" fill="#6b4521" /><rect x="-110" y="-110" width="46" height="46" fill="#5b6f6c" /><circle cx="-6" cy="-92" r="20" fill="#f6c453" /><rect x="40" y="-120" width="60" height="58" fill="#2a3552" stroke="#5ee7ff" strokeWidth="3" /></g>}
        {level >= 2 && <g transform="translate(120 760)"><rect x="-90" y="-250" width="180" height="250" fill="#3b2818" stroke="#6b4521" strokeWidth="6" />{[-190, -130, -70].map((y) => <g key={y}><rect x="-80" y={y} width="160" height="8" fill="#6b4521" />{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-76 + k * 32} y={y - 40} width="24" height="40" fill={['#c0463a', '#2f8f6b', '#d99a2b', '#3d6fb6', '#8a56c9'][k]} />)}</g>)}</g>}
        {level >= 3 && <g className="holo-map" transform="translate(800 560)"><ellipse rx="140" ry="26" fill="none" stroke="#5ee7ff" strokeWidth="2.5" className="ring-spin-flat" /><ellipse rx="90" ry="16" fill="none" stroke="#b693ff" strokeWidth="2" /><circle cy="-8" r="16" fill="#5ee7ff" opacity=".6" /><circle cx="70" cy="-14" r="6" fill="#ff4fd8" className="blink-light" /></g>}
        <path d="M0 0 H1600 M0 8 H1600" stroke="#00000055" strokeWidth="16" />
      </Layer>
      <div className="vignette" /><Fireflies n={12} seed={6} />
    </>
  );
}
