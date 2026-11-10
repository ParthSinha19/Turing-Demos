import React from 'react';
import { Layer, Stars, Fireflies } from './util';
import { rnd } from '../lib/color';

function SpaceSky({ id }) {
  return (
    <Layer d={0}>
      <defs>
        <radialGradient id={`${id}-n1`} cx=".25" cy=".3" r=".6"><stop offset="0" stopColor="#7d4fd1" stopOpacity=".55" /><stop offset="1" stopColor="#7d4fd1" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-n2`} cx=".8" cy=".7" r=".5"><stop offset="0" stopColor="#1fb8d6" stopOpacity=".4" /><stop offset="1" stopColor="#1fb8d6" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1600" height="900" fill="#05061c" />
      <rect width="1600" height="900" fill={`url(#${id}-n1)`} /><rect width="1600" height="900" fill={`url(#${id}-n2)`} />
      <Stars seed={17} n={190} />
    </Layer>
  );
}

function Planet({ cx, cy, r, c1, c2, rings, stripes, id }) {
  return (
    <g>
      <defs>
        <radialGradient id={id} cx=".35" cy=".3" r=".9"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></radialGradient>
        <clipPath id={`${id}-c`}><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      {rings && <ellipse cx={cx} cy={cy} rx={r * 1.8} ry={r * 0.36} fill="none" stroke={c1} strokeWidth={r * 0.1} opacity=".55" transform={`rotate(-18 ${cx} ${cy})`} />}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
      {stripes && <g clipPath={`url(#${id}-c)`} opacity=".3">{[-0.5, -0.2, 0.1, 0.45].map((k, i) => <rect key={i} x={cx - r} y={cy + r * k} width={r * 2} height={r * 0.14} fill="#fff" />)}</g>}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
      {rings && <path d={`M${cx - r * 1.8} ${cy + r * 0.3} Q${cx} ${cy + r * 0.9} ${cx + r * 1.8} ${cy - r * 0.3}`} fill="none" stroke={c1} strokeWidth={r * 0.1} opacity=".55" clipPath="none" transform={`rotate(0 ${cx} ${cy})`} display="none" />}
    </g>
  );
}

function SpaceExplore() {
  const r = rnd(5);
  return (
    <>
      <SpaceSky id="se" />
      <Layer d={6}>
        <Planet id="p1" cx={1180} cy={250} r={190} c1="#e9b36a" c2="#6b3b2b" rings stripes />
        <Planet id="p2" cx={260} cy={640} r={110} c1="#8fd0c4" c2="#17495a" stripes />
        <Planet id="p3" cx={640} cy={170} r={42} c1="#d7f3ff" c2="#4a7fa0" />
      </Layer>
      <Layer d={14}>
        {Array.from({ length: 26 }).map((_, i) => {
          const x = r() * 1600, y = 540 + r() * 300, s = 8 + r() * 26;
          return <polygon key={i} className="drift" style={{ animationDelay: `${(r() * 6).toFixed(1)}s` }} points={`${x},${y - s} ${x + s},${y - s * 0.2} ${x + s * 0.5},${y + s} ${x - s * 0.8},${y + s * 0.5}`} fill="#3a3358" stroke="#6d63a0" strokeWidth="1.5" />;
        })}
        {/* distant station */}
        <g transform="translate(900 560)" opacity=".85"><rect x="-60" y="-8" width="120" height="16" fill="#5d6aa8" /><rect x="-12" y="-36" width="24" height="72" rx="6" fill="#7886c8" /><rect x="-120" y="-20" width="50" height="40" fill="#2a3a7a" stroke="#6d8bff" /><rect x="70" y="-20" width="50" height="40" fill="#2a3a7a" stroke="#6d8bff" /><circle cx="0" cy="-42" r="5" fill="#ff6b6b" className="blink-light" /></g>
      </Layer>
      <Layer d={24}>
        <path d="M1400 700 q40 -70 120 -60 M1360 740 q60 -90 160 -90" stroke="#5ee7ff" strokeWidth="3" fill="none" opacity=".55" strokeLinecap="round" className="comet" />
        <g transform="translate(300 330)"><rect x="-16" y="-8" width="32" height="16" fill="#9fb2d8" /><rect x="-50" y="-12" width="30" height="24" fill="#2a3a7a" stroke="#6d8bff" /><rect x="20" y="-12" width="30" height="24" fill="#2a3a7a" stroke="#6d8bff" /><circle cx="0" cy="-14" r="4" fill="#5ee7ff" className="blink-light" /></g>
      </Layer>
      <Fireflies n={0} />
    </>
  );
}

function SpaceStation() {
  return (
    <>
      <SpaceSky id="ss" />
      <Layer d={6}><Planet id="ps" cx={800} cy={300} r={230} c1="#7ad0ff" c2="#14305e" stripes /></Layer>
      <Layer d={12}>
        <defs>
          <linearGradient id="ss-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#151b45" /><stop offset=".5" stopColor="#242d6b" /><stop offset="1" stopColor="#151b45" /></linearGradient>
          <linearGradient id="ss-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2155" /><stop offset="1" stopColor="#0a0d28" /></linearGradient>
        </defs>
        {/* corridor frame with window cut-out */}
        <path d="M0 0 H1600 V900 H0Z M470 150 H1130 Q1170 150 1170 190 V560 H430 V190 Q430 150 470 150Z" fill="url(#ss-wall)" fillRule="evenodd" />
        <path d="M430 190 Q430 150 470 150 H1130 Q1170 150 1170 190 V560 H430Z" fill="none" stroke="#6d8bff" strokeWidth="8" />
        <path d="M0 0 L430 150 V560 L0 900Z M1600 0 L1170 150 V560 L1600 900Z" fill="#0f1440" opacity=".7" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${60 + i * 80} ${120 + i * 70} L${60 + i * 80} ${700 - i * 70}`} stroke="#3b4aa8" strokeWidth="3" />)}
        {[0, 1, 2, 3, 4].map((i) => <path key={'r' + i} d={`M${1540 - i * 80} ${120 + i * 70} L${1540 - i * 80} ${700 - i * 70}`} stroke="#3b4aa8" strokeWidth="3" />)}
        <path d="M0 900 L430 560 H1170 L1600 900Z" fill="url(#ss-floor)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${800 + (i - 2.5) * 40} 560 L${800 + (i - 2.5) * 300} 900`} stroke="#2b3a8c" strokeWidth="2" />)}
        {[600, 650, 720, 810].map((y) => <path key={y} d={`M${(900 - y) * 0.45} ${y} H${1600 - (900 - y) * 0.45}`} stroke="#2b3a8c" strokeWidth="2" />)}
        {/* warning lights */}
        <rect x="190" y="320" width="26" height="26" rx="6" fill="#ff6b6b" className="warn-light" /><rect x="1384" y="320" width="26" height="26" rx="6" fill="#ff6b6b" className="warn-light" style={{ animationDelay: '.5s' }} />
        {/* door */}
        <rect x="690" y="400" width="220" height="160" fill="#0a0f33" stroke="#ffb347" strokeWidth="4" /><path d="M800 400 V560" stroke="#ffb347" strokeWidth="3" /><path d="M700 420 l30 0 M870 420 l30 0" stroke="#ffb347" strokeWidth="4" />
      </Layer>
      <Layer d={22}>
        {[[220, 700], [1330, 650], [800, 780], [520, 620]].map(([x, y], i) => <rect key={i} className="drift" style={{ animationDelay: `${i}s` }} x={x} y={y} width={16 + i * 6} height={8 + i * 3} fill="#9fb2d8" opacity=".7" transform={`rotate(${i * 30} ${x} ${y})`} />)}
      </Layer>
    </>
  );
}

function SatelliteControl() {
  return (
    <>
      <SpaceSky id="sc" />
      <Layer d={6}><Planet id="pc" cx={1250} cy={220} r={160} c1="#8fd0c4" c2="#17495a" stripes /></Layer>
      <Layer d={12}>
        <defs><linearGradient id="sc-con" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#252f77" /><stop offset="1" stopColor="#0c1038" /></linearGradient></defs>
        {/* big dish outside */}
        <g transform="translate(360 300)"><path d="M-170 40 Q0 -140 170 40 Q0 -20 -170 40Z" fill="#9fb2d8" stroke="#6d8bff" strokeWidth="4" /><path d="M0 -20 V-110" stroke="#6d8bff" strokeWidth="6" /><circle cx="0" cy="-116" r="10" fill="#5ee7ff" className="blink-light" /><path d="M0 0 V190" stroke="#4a5aa8" strokeWidth="14" /></g>
        <g stroke="#5ee7ff" fill="none" strokeWidth="3" opacity=".6">{[0, 1, 2].map((i) => <path key={i} className="wave" style={{ animationDelay: `${i * 0.6}s` }} d={`M${430 + i * 40} ${180 - i * 30} q50 -50 100 0`} />)}</g>
        {/* window frame */}
        <path d="M0 0 H1600 V420 L0 520Z" fill="#0b0f36" opacity=".55" />
        <path d="M0 520 L1600 420 V900 H0Z" fill="url(#sc-con)" />
        <path d="M0 520 L1600 420" stroke="#6d8bff" strokeWidth="6" />
        {/* console screens */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${150 + i * 280} ${560 - i * 10 + (i > 2 ? -(i - 2) * 6 : 0)})`}>
            <rect width="220" height="130" rx="10" fill="#050826" stroke="#5ee7ff" strokeWidth="3" />
            <path className="scanline-move" style={{ animationDelay: `${i * 0.35}s` }} d="M16 30 h110 M16 52 h160 M16 74 h80 M16 96 h140" stroke="#5ee7ff" strokeWidth="5" strokeLinecap="round" opacity=".85" />
            {i === 2 && <rect x="150" y="14" width="56" height="30" fill="#ff4fd8" opacity=".5" className="warn-light" />}
          </g>
        ))}
        {/* holo globe */}
        <g transform="translate(800 330)">
          <ellipse cx="0" cy="170" rx="90" ry="16" fill="none" stroke="#5ee7ff" strokeWidth="3" />
          <polygon points="-70,170 70,170 40,10 -40,10" fill="rgba(94,231,255,.12)" />
          <circle cx="0" cy="70" r="62" fill="rgba(94,231,255,.1)" stroke="#5ee7ff" strokeWidth="2" />
          <ellipse cx="0" cy="70" rx="62" ry="22" fill="none" stroke="#5ee7ff" strokeWidth="1.5" className="ring-spin-flat" />
          <ellipse cx="0" cy="70" rx="24" ry="62" fill="none" stroke="#5ee7ff" strokeWidth="1.5" />
          <circle cx="30" cy="40" r="6" fill="#ff4fd8" className="blink-light" />
        </g>
      </Layer>
    </>
  );
}

export { SpaceExplore, SpaceStation, SatelliteControl };
