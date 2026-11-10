import React from 'react';
import { Layer, Pine, PineRow, Stars, Fireflies } from './util';
import { rnd } from '../lib/color';

function ForestSky({ id, warm = 0.5 }) {
  return (
    <Layer d={0}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081827" /><stop offset=".55" stopColor="#124a52" /><stop offset="1" stopColor={`rgba(246,196,106,${warm})`} />
        </linearGradient>
        <radialGradient id={`${id}-moon`}><stop offset="0" stopColor="#fff8dd" /><stop offset=".5" stopColor="#fff2b8" stopOpacity=".5" /><stop offset="1" stopColor="#fff2b8" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-shaft`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2b8" stopOpacity=".28" /><stop offset="1" stopColor="#fff2b8" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      <Stars seed={5} n={70} h={380} />
      <circle cx="1230" cy="170" r="190" fill={`url(#${id}-moon)`} />
      <circle cx="1230" cy="170" r="54" fill="#fff8dd" />
      <circle cx="1214" cy="158" r="9" fill="#ecdca0" opacity=".6" /><circle cx="1248" cy="186" r="6" fill="#ecdca0" opacity=".6" />
      <g className="shafts"><polygon points="900,0 980,0 760,900 560,900" fill={`url(#${id}-shaft)`} /><polygon points="1100,0 1150,0 1010,900 870,900" fill={`url(#${id}-shaft)`} /></g>
    </Layer>
  );
}

function ForestExplore() {
  const r = rnd(21);
  return (
    <>
      <ForestSky id="fe" />
      <Layer d={5}>
        <path d="M0 560 Q200 470 420 540 T820 520 T1240 540 T1600 500 V900 H0Z" fill="#0f3a40" />
        <PineRow seed={4} n={22} y={560} hmin={150} hmax={240} fill="#0e353b" />
      </Layer>
      <Layer d={10}>
        <PineRow seed={8} n={15} y={650} hmin={260} hmax={420} fill="#0a2a30" jitter={60} />
        <g fill="#f6c453">{[[210, 520], [640, 560], [1150, 500], [1420, 570]].map(([x, y], i) => <rect key={i} className="lamp" style={{ animationDelay: `${i * 0.7}s` }} x={x} y={y} width="8" height="12" rx="3" />)}</g>
      </Layer>
      <Layer d={16}>
        <path d="M0 900 V700 Q260 660 520 700 T1000 690 T1600 650 V900Z" fill="#0c3a35" />
        <path d="M560 900 Q640 780 760 740 T1000 690 T1180 650 L1260 650 Q1120 700 1020 760 T820 900Z" fill="#6b5a3a" opacity=".85" />
        <path d="M600 900 Q680 800 790 760 T1000 710" stroke="#a88f5a" strokeWidth="4" fill="none" opacity=".6" strokeDasharray="14 18" />
        {/* signpost */}
        <g transform="translate(1180 640)"><rect x="-5" y="-110" width="10" height="120" fill="#5a3f26" /><path d="M5 -104 h72 l14 14 l-14 14 h-72z" fill="#a8723a" /><path d="M-5 -78 h-62 l-14 14 l14 14 h62z" fill="#8a5a2b" /></g>
        {/* glowing mushrooms */}
        {[[220, 790], [310, 830], [1420, 800], [1500, 770]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + (i % 2) * 0.5})`} className="mushroom">
            <rect x="-4" y="-4" width="8" height="26" rx="4" fill="#f3e6c7" /><path d="M-26 0 Q0 -44 26 0Z" fill="#7be0a4" /><circle cx="-8" cy="-12" r="4" fill="#d8ffe8" /><circle cx="9" cy="-8" r="3" fill="#d8ffe8" />
          </g>
        ))}
        {/* footprints */}
        {Array.from({ length: 7 }).map((_, i) => <ellipse key={i} cx={780 + i * 52 + (i % 2) * 10} cy={850 - i * 18 + (i % 2) * 14} rx="9" ry="12" fill="#3f351f" opacity=".6" />)}
      </Layer>
      <Layer d={26}>
        <path d="M0 900 V840 Q120 800 240 850 T520 840 V900Z M1100 900 V850 Q1260 800 1400 850 T1600 830 V900Z" fill="#06201f" />
        {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${r() * 520} 900 q${r() * 20 - 10} -${70 + r() * 70} ${r() * 40 - 20} -${100 + r() * 80}`} stroke="#06201f" strokeWidth="9" fill="none" strokeLinecap="round" />)}
        {Array.from({ length: 14 }).map((_, i) => <path key={'r' + i} d={`M${1120 + r() * 480} 900 q${r() * 20 - 10} -${70 + r() * 70} ${r() * 40 - 20} -${100 + r() * 80}`} stroke="#06201f" strokeWidth="9" fill="none" strokeLinecap="round" />)}
      </Layer>
      <div className="fog" /><Fireflies n={26} />
    </>
  );
}

function ForestStation() {
  return (
    <>
      <ForestSky id="fs" warm={0.35} />
      <Layer d={5}><PineRow seed={11} n={20} y={600} hmin={180} hmax={300} fill="#0e353b" /></Layer>
      <Layer d={10}><PineRow seed={14} n={12} y={700} hmin={300} hmax={460} fill="#0a2a30" jitter={80} /></Layer>
      <Layer d={16}>
        <path d="M0 900 V720 Q400 690 800 720 T1600 700 V900Z" fill="#0c3a35" />
        {/* research station on stilts */}
        <g transform="translate(540 700)">
          {[40, 150, 330, 440].map((x) => <rect key={x} x={x} y="-30" width="14" height="180" fill="#4b3320" />)}
          <path d="M20 150 L470 150" stroke="#4b3320" strokeWidth="8" />
          <rect x="10" y="-170" width="470" height="150" rx="10" fill="#7a5530" />
          <rect x="10" y="-170" width="470" height="24" fill="#5c4024" />
          <path d="M-20 -170 L245 -280 L510 -170Z" fill="#2f5a46" /><path d="M-20 -170 L245 -280 L510 -170" fill="none" stroke="#7be0a4" strokeWidth="3" opacity=".6" />
          {[40, 190, 340].map((x, i) => <g key={x}><rect x={x} y="-125" width="110" height="78" rx="6" fill="#06231f" stroke="#7be0a4" strokeWidth="3" /><path className="scanline-move" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x + 12} -105 h60 M${x + 12} -90 h86 M${x + 12} -75 h44`} stroke="#7be0a4" strokeWidth="4" strokeLinecap="round" opacity=".9" /></g>)}
          <path d="M440 -280 V-380" stroke="#9fb2d8" strokeWidth="5" /><circle cx="440" cy="-386" r="9" fill="#ff6b6b" className="blink-light" />
          <path d="M420 -350 q20 -22 40 0 M408 -334 q32 -34 64 0" stroke="#7be0a4" strokeWidth="3" fill="none" opacity=".7" />
          <path d="M470 150 L540 270" stroke="#4b3320" strokeWidth="10" />
          <g fill="#f6c453">{[80, 410].map((x) => <circle key={x} cx={x} cy="-10" r="9" className="lamp" />)}</g>
        </g>
        {/* machine pipe */}
        <g fill="#5b6f6c" stroke="#2e403d" strokeWidth="3"><rect x="1260" y="560" width="120" height="180" rx="14" /><rect x="1290" y="500" width="60" height="70" rx="8" /><circle cx="1320" cy="640" r="34" fill="#2e403d" /><circle cx="1320" cy="640" r="18" fill="#7be0a4" opacity=".5" className="lamp" /></g>
      </Layer>
      <Layer d={26}><path d="M0 900 V830 Q200 800 360 850 T700 840 V900Z M1000 900 V850 Q1250 800 1600 840 V900Z" fill="#06201f" /></Layer>
      <div className="fog" /><Fireflies n={18} seed={4} />
    </>
  );
}

function MemoryTree() {
  const r = rnd(33);
  const leaves = Array.from({ length: 40 }).map(() => [560 + r() * 480, 120 + r() * 380, 18 + r() * 36]);
  return (
    <>
      <ForestSky id="mt" warm={0.6} />
      <Layer d={5}><PineRow seed={2} n={18} y={620} hmin={200} hmax={320} fill="#0e353b" /></Layer>
      <Layer d={10}><PineRow seed={6} n={10} y={720} hmin={320} hmax={480} fill="#0a2a30" jitter={80} /></Layer>
      <Layer d={16}>
        <defs>
          <radialGradient id="mt-can"><stop offset="0" stopColor="#7be0a4" /><stop offset=".6" stopColor="#2a8f7a" /><stop offset="1" stopColor="#14504f" /></radialGradient>
          <radialGradient id="mt-glow"><stop offset="0" stopColor="#7be0a4" stopOpacity=".5" /><stop offset="1" stopColor="#7be0a4" stopOpacity="0" /></radialGradient>
        </defs>
        <path d="M0 900 V740 Q400 700 800 730 T1600 710 V900Z" fill="#0c3a35" />
        <circle cx="800" cy="330" r="420" fill="url(#mt-glow)" className="pulse-soft" />
        {/* trunk + roots */}
        <path d="M720 760 Q770 600 748 420 L852 420 Q830 600 880 760 Q820 740 800 780 Q780 740 720 760Z" fill="#4a3322" />
        <path d="M700 780 Q640 790 560 830 M900 780 Q960 790 1040 830 M800 780 V850" stroke="#4a3322" strokeWidth="26" strokeLinecap="round" fill="none" />
        {/* circuit lines on trunk */}
        <g stroke="#5ee7ff" strokeWidth="3" fill="none" strokeLinecap="round" className="circuit"><path d="M770 740 V600 H800 V500" /><path d="M830 740 V640 H810" /><path d="M790 560 H760 V470" /><path d="M810 700 H850 V560" /></g>
        <g fill="#5ee7ff">{[[800, 500], [760, 470], [850, 560], [810, 640]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className="lamp" style={{ animationDelay: `${i * 0.4}s` }} />)}</g>
        {/* canopy */}
        {[[800, 300, 190], [660, 350, 140], [940, 350, 140], [720, 220, 130], [880, 220, 130], [800, 180, 120], [590, 420, 90], [1010, 420, 90]].map(([x, y, rr], i) => <circle key={i} cx={x} cy={y} r={rr} fill="url(#mt-can)" />)}
        {/* data leaves */}
        {leaves.map(([x, y, s], i) => <rect key={i} className="dataleaf" style={{ animationDelay: `${(i % 9) * 0.5}s` }} x={x} y={y} width={s * 0.5} height={s * 0.3} rx="3" fill={i % 3 ? '#d8ffe8' : '#5ee7ff'} opacity=".75" />)}
        <ellipse cx="800" cy="800" rx="260" ry="34" fill="none" stroke="#7be0a4" strokeWidth="3" strokeDasharray="10 14" opacity=".6" className="ring-spin-flat" />
      </Layer>
      <Layer d={26}><path d="M0 900 V850 Q200 810 380 860 T640 850 V900Z M1000 900 V860 Q1260 810 1600 850 V900Z" fill="#06201f" /></Layer>
      <div className="fog" /><Fireflies n={34} seed={7} />
    </>
  );
}

export { ForestExplore, ForestStation, MemoryTree };
