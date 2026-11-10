import React from 'react';
import { Layer, Stars } from './util';
import { rnd } from '../lib/color';

// ── Starship Atlas: the detective's headquarters for the second half of the adventure ──
// Same hotspot layout as the forest HQ: star map (left), evidence board (right), console (bottom), hologram (centre).
export function ShuttleHQ() {
  return (
    <>
      <Layer d={2}>
        <defs>
          <linearGradient id="sh-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2150" /><stop offset="1" stopColor="#0b0f33" /></linearGradient>
          <radialGradient id="sh-earth" cx=".4" cy=".3" r=".9"><stop offset="0" stopColor="#7ad0ff" /><stop offset=".6" stopColor="#1f6fb0" /><stop offset="1" stopColor="#0c2a5e" /></radialGradient>
          <clipPath id="sh-win"><rect x="420" y="90" width="760" height="440" rx="60" /></clipPath>
        </defs>
        <rect width="1600" height="900" fill="url(#sh-wall)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${i * 270 - 40} 0 L${i * 270 + 120} 900`} stroke="#27337a" strokeWidth="2" opacity=".5" />)}
        {/* panoramic window */}
        <g clipPath="url(#sh-win)">
          <rect x="420" y="90" width="760" height="440" fill="#03041a" />
          <g transform="translate(420 90) scale(.5)"><Stars seed={21} n={150} h={880} /></g>
          <circle cx="800" cy="860" r="460" fill="url(#sh-earth)" />
          <circle cx="800" cy="860" r="476" fill="none" stroke="#7ad0ff" strokeWidth="10" opacity=".35" />
          <path d="M520 420 q40 -30 80 -6 t90 -4" stroke="#8fe3b0" strokeWidth="14" fill="none" opacity=".35" strokeLinecap="round" />
          <circle cx="1040" cy="190" r="26" fill="#fff8dd" /><circle cx="1040" cy="190" r="56" fill="#fff2b8" opacity=".12" />
          <g transform="translate(640 250)" opacity=".9"><rect x="-40" y="-5" width="80" height="10" fill="#7886c8" /><rect x="-8" y="-24" width="16" height="48" rx="4" fill="#9fb2d8" /><rect x="-84" y="-12" width="34" height="24" fill="#2a3a7a" stroke="#6d8bff" /><rect x="50" y="-12" width="34" height="24" fill="#2a3a7a" stroke="#6d8bff" /><circle cx="0" cy="-30" r="3" fill="#ff4fd8" className="blink-light" /></g>
        </g>
        <rect x="420" y="90" width="760" height="440" rx="60" fill="none" stroke="#6d8bff" strokeWidth="10" />
        <path d="M800 90 V530 M420 310 H1180" stroke="#6d8bff" strokeWidth="5" opacity=".6" />
        {/* star map screen (left) */}
        <g transform="translate(200 270)"><rect x="-120" y="-100" width="240" height="190" rx="10" fill="#050826" stroke="#5ee7ff" strokeWidth="5" />
          {[[-70, -40], [-20, 20], [30, -30], [70, 30], [10, -66]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={i === 3 ? '#ff4fd8' : '#5ee7ff'} className={i === 3 ? 'blink-light' : ''} />)}
          <path d="M-70 -40 L-20 20 L30 -30 L70 30" stroke="#5ee7ff" strokeWidth="3" strokeDasharray="6 6" fill="none" /></g>
        {/* evidence board screen (right) */}
        <g transform="translate(1390 270)"><rect x="-140" y="-120" width="280" height="220" rx="10" fill="#0a1233" stroke="#b693ff" strokeWidth="5" />
          {[[-90, -60], [10, -70], [80, -20], [-60, 20], [30, 40]].map(([x, y], i) => <g key={i}><rect x={x - 22} y={y - 18} width="44" height="36" fill="#f3e6c7" transform={`rotate(${i * 7 - 12} ${x} ${y})`} /><circle cx={x} cy={y - 14} r="4" fill="#ff4fd8" /></g>)}
          <path d="M-90 -74 L10 -84 L80 -34 L30 26 L-60 6 Z" stroke="#ff7b7b" strokeWidth="2.4" fill="none" /></g>
        {/* floor + console */}
        <path d="M0 760 H1600 V900 H0Z" fill="#0a0d28" /><path d="M0 760 H1600" stroke="#6d8bff" strokeWidth="6" />
        <g transform="translate(800 800)"><path d="M-520 0 L-420 -90 H420 L520 0 V120 H-520Z" fill="#1a2155" stroke="#6d8bff" strokeWidth="5" />
          {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-380 + i * 54} y={-62} width="30" height="16" rx="4" fill={['#5ee7ff', '#f6c453', '#7be0a4', '#ff4fd8'][i % 4]} opacity=".85" className={i % 3 === 0 ? 'blink-light' : ''} />)}
          <rect x="-110" y="-30" width="220" height="40" rx="6" fill="#050826" stroke="#5ee7ff" strokeWidth="3" /></g>
        {/* seats */}
        {[300, 1300].map((x) => <g key={x} transform={`translate(${x} 780)`}><rect x="-60" y="-120" width="120" height="150" rx="30" fill="#2a3a7a" stroke="#6d8bff" strokeWidth="4" /><rect x="-60" y="-10" width="120" height="40" rx="14" fill="#3b4aa8" /></g>)}
        {/* hologram */}
        <g transform="translate(800 560)"><ellipse rx="140" ry="26" fill="none" stroke="#5ee7ff" strokeWidth="2.5" className="ring-spin-flat" /><ellipse rx="90" ry="16" fill="none" stroke="#b693ff" strokeWidth="2" /><circle cy="-8" r="16" fill="#5ee7ff" opacity=".6" /><circle cx="70" cy="-14" r="6" fill="#ff4fd8" opacity=".8" className="blink-light" /></g>
        <rect x="0" y="0" width="1600" height="26" fill="#0b0f33" />{[200, 500, 800, 1100, 1400].map((x) => <rect key={x} x={x - 60} y="8" width="120" height="8" rx="4" fill="#5ee7ff" opacity=".6" />)}
      </Layer>
      <div className="vignette" />
    </>
  );
}

// ── The Guardian Core: a vault with a huge, cracked shield at its heart ──
export function GuardianCore() {
  const r = rnd(33);
  return (
    <>
      <Layer d={0}>
        <defs>
          <radialGradient id="gc-bg" cx=".5" cy=".42" r=".75"><stop offset="0" stopColor="#2a1f6b" /><stop offset=".6" stopColor="#0e0f3a" /><stop offset="1" stopColor="#04051a" /></radialGradient>
          <radialGradient id="gc-glow"><stop offset="0" stopColor="#ffcf5a" stopOpacity=".4" /><stop offset="1" stopColor="#ffcf5a" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#gc-bg)" />
        <g transform="scale(1 1)"><Stars seed={44} n={70} h={900} /></g>
      </Layer>
      <Layer d={8}>
        <circle cx="800" cy="400" r="380" fill="url(#gc-glow)" />
        {[330, 270, 210].map((rad, i) => <circle key={rad} cx="800" cy="400" r={rad} fill="none" stroke={i === 1 ? '#ff4fd8' : '#5ee7ff'} strokeWidth="2.5" strokeDasharray={`${10 + i * 6} ${14 + i * 6}`} opacity=".5" className={i % 2 ? 'ring-spin' : 'ring-spin-flat'} style={{ transformOrigin: '800px 400px' }} />)}
        <path d="M800 130 L1010 215 V430 Q1010 600 800 700 Q590 600 590 430 V215 Z" fill="#141c40" stroke="#ffcf5a" strokeWidth="10" />
        <path d="M800 170 L975 240 V425 Q975 570 800 655 Q625 570 625 425 V240 Z" fill="#0b1030" stroke="#ffcf5a" strokeWidth="3" opacity=".8" />
        <path d="M812 150 L770 300 L830 360 L780 470 L840 540 L800 690" stroke="#ff4fd8" strokeWidth="9" fill="none" strokeLinejoin="round" className="warn-light" />
        <circle cx="800" cy="410" r="62" fill="#07091f" stroke="#5ee7ff" strokeWidth="5" />
        <circle cx="800" cy="410" r="30" fill="#5ee7ff" opacity=".8" className="blink-light" />
      </Layer>
      <Layer d={16}>
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 120 + r() * 1360, y = 90 + r() * 640, bad = i % 3 === 0;
          return <g key={i} className="drift" style={{ animationDelay: `${(r() * 5).toFixed(1)}s` }} transform={`translate(${x} ${y})`}><rect width="76" height="50" rx="6" fill="#0a1233" stroke={bad ? '#ff4fd8' : '#5ee7ff'} strokeWidth="3" /><path d="M10 16 h40 M10 30 h56" stroke={bad ? '#ff4fd8' : '#5ee7ff'} strokeWidth="3" opacity=".7" />{bad && <path d="M52 8 l16 16 M68 8 l-16 16" stroke="#ff4fd8" strokeWidth="3" />}</g>;
        })}
        <path d="M0 900 L360 700 H1240 L1600 900Z" fill="#0b1030" opacity=".9" /><path d="M0 900 L360 700 H1240 L1600 900" fill="none" stroke="#6d8bff" strokeWidth="4" />
      </Layer>
      <div className="vignette" />
    </>
  );
}