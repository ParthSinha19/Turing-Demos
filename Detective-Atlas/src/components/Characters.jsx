import React from 'react';
import { shade } from '../lib/color';
import Guardian from './Guardian';
// ─────────────────────────────────────────────────────────────────────────────
// <Character id="fern" expression="happy" size={240} bust flip />
// id: detective | fern | pip | forest | orbit | glitch
// Detective also takes player={...} (see DEFAULT_PLAYER).
// Expressions: neutral | happy | surprised | worried | thinking
// ─────────────────────────────────────────────────────────────────────────────
const INK = '#1b1f33';

export function Face({ cx, cy, expr = 'neutral', gap = 14, r = 4.2, mouthDy = 18, mouth = true, brows = true }) {
  const lx = cx - gap, rx = cx + gap;
  const my = cy + mouthDy;
  let eyes;
  if (expr === 'happy') eyes = <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round"><path d={`M${lx - 5} ${cy + 2} q5 -8 10 0`} /><path d={`M${rx - 5} ${cy + 2} q5 -8 10 0`} /></g>;
  else if (expr === 'surprised') eyes = <g><circle cx={lx} cy={cy} r={r * 1.7} fill="#fff" stroke={INK} strokeWidth="2" /><circle cx={rx} cy={cy} r={r * 1.7} fill="#fff" stroke={INK} strokeWidth="2" /><circle cx={lx} cy={cy} r={r * 0.8} fill={INK} /><circle cx={rx} cy={cy} r={r * 0.8} fill={INK} /></g>;
  else eyes = <g className="blink" fill={INK}><circle cx={lx} cy={cy} r={r} /><circle cx={rx} cy={cy} r={r} /><circle cx={lx + 1.4} cy={cy - 1.6} r={r * 0.32} fill="#fff" /><circle cx={rx + 1.4} cy={cy - 1.6} r={r * 0.32} fill="#fff" /></g>;
  const b = { stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round', fill: 'none' };
  let bw = null;
  if (brows) {
    if (expr === 'worried') bw = <g {...b}><path d={`M${lx - 7} ${cy - 10} L${lx + 5} ${cy - 16}`} /><path d={`M${rx + 7} ${cy - 10} L${rx - 5} ${cy - 16}`} /></g>;
    if (expr === 'thinking') bw = <g {...b}><path d={`M${lx - 6} ${cy - 11} h11`} /><path d={`M${rx - 6} ${cy - 17} q6 -4 12 0`} /></g>;
    if (expr === 'surprised') bw = <g {...b}><path d={`M${lx - 7} ${cy - 16} q7 -6 14 0`} /><path d={`M${rx - 7} ${cy - 16} q7 -6 14 0`} /></g>;
  }
  let m = null;
  if (mouth) {
    if (expr === 'happy') m = <path d={`M${cx - 9} ${my} q9 13 18 0 z`} fill="#7a2638" stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
    else if (expr === 'surprised') m = <ellipse cx={cx} cy={my + 3} rx="5" ry="6.5" fill="#7a2638" stroke={INK} strokeWidth="2" />;
    else if (expr === 'worried') m = <path d={`M${cx - 7} ${my + 4} q7 -7 14 0`} {...b} />;
    else if (expr === 'thinking') m = <path d={`M${cx - 5} ${my + 1} q7 3 12 -3`} {...b} />;
    else m = <path d={`M${cx - 6} ${my} q6 5 12 0`} {...b} />;
  }
  return <g>{eyes}{bw}{m}</g>;
}

/* ───────────────────────────── DETECTIVE ───────────────────────────── */
const VIEWS = { full: '0 0 200 320', bust: '38 18 124 124', torso: '28 96 144 160' };

export function Detective({ player, expression = 'neutral', view = 'full', size = 240, className = '' }) {
  const { skin, hair, hairColor, outfit, outfitColor, accessory, gadget } = player;
  const skinD = shade(skin, -0.14), oc = outfitColor, od = shade(oc, -0.28), ol = shade(oc, 0.22), hd = shade(hairColor, -0.3);
  const hat = ['fedora', 'beanie', 'cap'].includes(hair);
  const w = view === 'full' ? size * 0.625 : size;
  return (
    <svg className={`char detective ${className}`} viewBox={VIEWS[view]} width={w} height={size} role="img" aria-label="Detective">
      <ellipse cx="100" cy="304" rx="52" ry="8" fill="#000" opacity=".28" />
      {/* hair behind */}
      {hair === 'ponytail' && <g><path d="M132 66 q36 -4 30 28 q-4 22 -22 26 q14 -20 -2 -38z" fill={hairColor} /><circle cx="134" cy="68" r="5" fill="#e0533d" /></g>}
      {hair === 'bob' && <path d="M58 82 q-4 48 14 44 l56 0 q18 4 14 -44z" fill={hd} />}
      {/* legs */}
      <g fill="#27304d"><rect x="78" y="214" width="19" height="76" rx="8" /><rect x="103" y="214" width="19" height="76" rx="8" /></g>
      <g fill="#14182b"><ellipse cx="85" cy="293" rx="16" ry="8" /><ellipse cx="116" cy="293" rx="16" ry="8" /></g>
      {/* left arm */}
      <path d="M64 134 Q42 170 46 204" stroke={oc} strokeWidth="19" strokeLinecap="round" fill="none" />
      <path d="M64 134 Q42 170 46 204" stroke={od} strokeWidth="19" strokeLinecap="round" fill="none" opacity=".25" strokeDasharray="1 60" />
      <circle cx="46" cy="208" r="8.5" fill={skin} />
      {/* torso by outfit */}
      {outfit === 'trench' && <g><path d="M60 126 Q100 108 140 126 L150 250 Q100 262 50 250 Z" fill={oc} /><path d="M100 120 L100 255" stroke={od} strokeWidth="2.4" /><rect x="52" y="186" width="96" height="11" fill={od} /><rect x="96" y="184" width="8" height="15" rx="2" fill="#e8c36a" /><circle cx="108" cy="150" r="2.8" fill={od} /><circle cx="108" cy="222" r="2.8" fill={od} /><path d="M76 118 L100 146 L88 112Z M124 118 L100 146 L112 112Z" fill={ol} /></g>}
      {outfit === 'explorer' && <g><path d="M62 126 Q100 110 138 126 L146 238 Q100 248 54 238 Z" fill="#efe4c8" /><path d="M64 128 L86 130 L90 238 L56 236Z M136 128 L114 130 L110 238 L144 236Z" fill={oc} /><rect x="62" y="186" width="20" height="22" rx="3" fill={od} /><rect x="118" y="186" width="20" height="22" rx="3" fill={od} /><circle cx="72" cy="150" r="2.5" fill="#e8c36a" /><circle cx="128" cy="150" r="2.5" fill="#e8c36a" /></g>}
      {outfit === 'hoodie' && <g><ellipse cx="100" cy="126" rx="34" ry="13" fill={od} /><path d="M60 128 Q100 112 140 128 L148 236 Q100 246 52 236 Z" fill={oc} /><path d="M70 196 L130 196 L136 226 L64 226Z" fill={od} opacity=".55" /><path d="M92 128 v32 M108 128 v32" stroke="#f2f2f2" strokeWidth="2.4" strokeLinecap="round" /></g>}
      {outfit === 'flight' && <g><path d="M60 126 Q100 110 140 126 L148 234 Q100 242 52 234 Z" fill={oc} /><rect x="52" y="226" width="96" height="14" rx="5" fill={od} /><path d="M100 124 V230" stroke={od} strokeWidth="2.4" /><rect x="66" y="156" width="26" height="9" rx="3" fill="#f6a24a" /><path d="M72 120 Q100 142 128 120 L120 112 Q100 128 80 112Z" fill={ol} /></g>}
      {/* neck + head */}
      <rect x="91" y="114" width="18" height="16" fill={skinD} />
      <circle cx="63" cy="90" r="7.5" fill={skin} /><circle cx="137" cy="90" r="7.5" fill={skin} />
      <circle cx="100" cy="88" r="38" fill={skin} />
      <ellipse cx="78" cy="102" rx="6" ry="3.4" fill="#ff8a8a" opacity=".3" /><ellipse cx="122" cy="102" rx="6" ry="3.4" fill="#ff8a8a" opacity=".3" />
      <Face cx={100} cy={90} expr={expression} gap={15} r={4.4} mouthDy={19} />
      {/* hair front */}
      {(hair === 'short' || hat) && <path d="M62 86 Q58 46 100 44 Q142 46 138 86 Q130 66 112 62 Q96 70 74 66 Q66 72 62 86Z" fill={hairColor} />}
      {hair === 'curly' && <g fill={hairColor}>{[[66, 70], [80, 54], [100, 48], [120, 54], [134, 70], [72, 84], [128, 84]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="14" />)}</g>}
      {hair === 'ponytail' && <path d="M62 86 Q58 46 100 44 Q142 46 138 86 Q128 62 100 60 Q76 62 62 86Z" fill={hairColor} />}
      {hair === 'bob' && <path d="M60 92 Q54 44 100 42 Q146 44 140 92 Q134 64 100 62 Q66 64 60 92Z" fill={hairColor} />}
      {hair === 'fedora' && <g><ellipse cx="100" cy="62" rx="58" ry="12" fill="#5a4636" /><path d="M68 62 Q68 26 100 26 Q132 26 132 62Z" fill="#6b5442" /><rect x="68" y="52" width="64" height="9" fill="#2b2118" /></g>}
      {hair === 'beanie' && <g><path d="M62 70 Q62 28 100 28 Q138 28 138 70Z" fill="#c0463a" /><rect x="60" y="62" width="80" height="13" rx="6" fill="#8e2f27" /><circle cx="100" cy="24" r="7" fill="#f2d7a1" /></g>}
      {hair === 'cap' && <g><path d="M62 68 Q62 30 100 30 Q138 30 138 68Z" fill="#2f8f6b" /><path d="M58 68 Q30 70 22 78 Q60 80 100 68Z" fill="#23704f" /><circle cx="100" cy="30" r="3.5" fill="#f6c453" /></g>}
      {/* accessories */}
      {accessory === 'glasses' && <g fill="rgba(120,220,255,.18)" stroke="#2a2a2a" strokeWidth="3"><circle cx="85" cy="90" r="12" /><circle cx="115" cy="90" r="12" /><path d="M97 90 h6" /></g>}
      {accessory === 'scarf' && <g><path d="M72 120 Q100 138 128 120 L130 134 Q100 152 70 134Z" fill="#e0533d" /><path d="M112 136 l10 40 l-16 -2 l-4 -34z" fill="#b9382a" /></g>}
      {accessory === 'headset' && <g fill="none" stroke="#2a2f45" strokeWidth="5" strokeLinecap="round"><path d="M60 86 Q60 40 100 40 Q140 40 140 86" /><path d="M140 90 q0 22 -22 26" strokeWidth="3" /><rect x="52" y="82" width="12" height="22" rx="5" fill="#3b4666" stroke="none" /><rect x="136" y="82" width="12" height="22" rx="5" fill="#3b4666" stroke="none" /><circle cx="118" cy="117" r="4" fill="#5ee7ff" stroke="none" /></g>}
      {accessory === 'badge' && <polygon points="82,162 86,172 97,173 89,180 92,191 82,185 72,191 75,180 67,173 78,172" fill="#f6c453" stroke="#b98a1e" strokeWidth="1.5" />}
      {/* right arm + gadget */}
      <path d="M136 134 Q162 160 158 190" stroke={oc} strokeWidth="19" strokeLinecap="round" fill="none" />
      <circle cx="158" cy="193" r="8.5" fill={skin} />
      {gadget === 'magnifier' && <g><path d="M160 190 L176 160" stroke="#8a6a3b" strokeWidth="6" strokeLinecap="round" /><circle cx="180" cy="148" r="17" fill="rgba(120,230,255,.28)" stroke="#f6c453" strokeWidth="5" /><path d="M170 142 q4 -8 12 -8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8" /></g>}
      {gadget === 'scanner' && <g><rect x="152" y="152" width="26" height="42" rx="6" fill="#2a3552" stroke="#5ee7ff" strokeWidth="2" /><rect x="156" y="158" width="18" height="16" rx="3" fill="#5ee7ff" opacity=".85" /><path d="M165 152 V138" stroke="#9fb2d8" strokeWidth="3" /><circle cx="165" cy="136" r="4" fill="#ff4fd8" className="blink-light" /></g>}
      {gadget === 'tablet' && <g transform="rotate(-12 168 170)"><rect x="150" y="146" width="40" height="52" rx="5" fill="#2a3552" stroke="#9fb2d8" strokeWidth="2" /><rect x="154" y="150" width="32" height="40" rx="2" fill="#0e2630" /><path d="M158 180 l6 -8 l6 4 l8 -12 l6 6" stroke="#7be0a4" strokeWidth="2.5" fill="none" strokeLinecap="round" /></g>}
      {gadget === 'torch' && <g><polygon points="166,166 215,138 215,194" fill="rgba(255,236,150,.22)" /><rect x="152" y="158" width="26" height="14" rx="4" fill="#3a3f55" transform="rotate(-20 165 165)" /><rect x="168" y="150" width="12" height="20" rx="3" fill="#f6c453" transform="rotate(-20 165 165)" /></g>}
    </svg>
  );
}

/* ───────────────────────────── FERN ───────────────────────────── */
function Fern({ expression, bust, size }) {
  return (
    <svg className="char fern" viewBox={bust ? '40 28 130 120' : '0 0 240 270'} width={bust ? size : size * 0.89} height={size} role="img" aria-label="Fern the Fox">
      <ellipse cx="112" cy="262" rx="62" ry="8" fill="#000" opacity=".28" />
      <g className="tail"><path d="M158 220 Q236 214 226 140 Q214 176 176 176 Z" fill="#f2812e" /><path d="M226 140 Q232 168 214 186 Q226 170 212 156Z" fill="#fff4e0" /></g>
      <ellipse cx="108" cy="196" rx="52" ry="62" fill="#f2812e" />
      <ellipse cx="108" cy="212" rx="30" ry="44" fill="#fff4e0" />
      <g fill="#3a2418"><rect x="76" y="238" width="22" height="20" rx="9" /><rect x="118" y="238" width="22" height="20" rx="9" /></g>
      <path d="M64 168 Q108 196 152 168 L152 182 Q108 212 64 182Z" fill="#4fae6f" />
      <path d="M70 160 L130 232" stroke="#8a5a2b" strokeWidth="6" /><rect x="116" y="200" width="30" height="26" rx="6" fill="#a8723a" stroke="#6b4521" strokeWidth="2" />
      <path d="M66 62 L58 22 L98 50Z" fill="#f2812e" /><path d="M70 56 L66 36 L88 50Z" fill="#3a2418" />
      <path d="M144 62 L152 22 L112 50Z" fill="#f2812e" /><path d="M140 56 L144 36 L122 50Z" fill="#3a2418" />
      <ellipse cx="105" cy="98" rx="50" ry="42" fill="#f2812e" />
      <path d="M55 106 L38 116 L60 126Z M155 106 L172 116 L150 126Z" fill="#fff4e0" />
      <path d="M62 112 Q105 96 148 112 Q130 144 105 146 Q80 144 62 112Z" fill="#fff4e0" />
      <ellipse cx="105" cy="112" rx="8" ry="6" fill="#3a2418" />
      <Face cx={105} cy={92} expr={expression} gap={21} r={5} mouthDy={30} brows />
    </svg>
  );
}

/* ───────────────────────────── PIP ───────────────────────────── */
function Pip({ expression, bust, size }) {
  const pupilR = expression === 'surprised' ? 5.5 : 4;
  return (
    <svg className="char pip" viewBox={bust ? '60 22 110 100' : '0 0 190 210'} width={bust ? size : size * 0.9} height={size} role="img" aria-label="Pip the Magpie">
      <defs>
        <linearGradient id="pip-wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4d7bff" /><stop offset=".6" stopColor="#2fb7a3" /><stop offset="1" stopColor="#7d4fd1" /></linearGradient>
      </defs>
      <ellipse cx="92" cy="202" rx="44" ry="6" fill="#000" opacity=".25" />
      <path d="M40 120 Q-6 176 10 204 Q58 180 74 150Z" fill="#1b2b4a" /><path d="M30 150 Q8 182 14 196 Q36 170 44 150Z" fill="url(#pip-wing)" opacity=".8" />
      <ellipse cx="92" cy="122" rx="46" ry="52" fill="#1b2340" />
      <ellipse cx="102" cy="136" rx="26" ry="38" fill="#f5f6fb" />
      <path d="M52 110 Q84 94 108 122 Q96 176 52 168 Q34 140 52 110Z" fill="url(#pip-wing)" />
      <g stroke="#e8b04a" strokeWidth="4" strokeLinecap="round"><path d="M80 170 v24 m-8 0 h16" /><path d="M108 172 v22 m-8 0 h16" /></g>
      <circle cx="110" cy="64" r="30" fill="#1b2340" />
      <path d="M134 56 L170 66 L134 76Z" fill="#9aa3b8" /><path d="M134 66 L170 66" stroke="#6b7387" strokeWidth="2" />
      <circle cx="120" cy="58" r="9" fill="#fff" /><circle cx="122" cy="58" r={pupilR} fill={INK} /><circle cx="124" cy="55.5" r="1.6" fill="#fff" />
      {expression === 'worried' && <path d="M110 46 L128 50" stroke="#fff" strokeWidth="3" strokeLinecap="round" />}
      {expression === 'happy' && <path d="M112 46 q8 -6 16 0" stroke="#f5f6fb" strokeWidth="3" fill="none" strokeLinecap="round" />}
      <g className="sparkle-pip"><path d="M168 24 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#fff6c9" /></g>
    </svg>
  );
}

/* ───────────────────────────── F.O.R.E.S.T. ───────────────────────────── */
function ForestAI({ expression, bust, size, glitchy }) {
  const happy = expression === 'happy', sad = expression === 'worried';
  return (
    <svg className={`char forest-ai ${glitchy ? 'glitchy' : ''}`} viewBox={bust ? '30 20 140 130' : '0 0 200 250'} width={bust ? size : size * 0.8} height={size} role="img" aria-label="F.O.R.E.S.T.">
      <defs>
        <linearGradient id="fa-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#7be0a4" stopOpacity=".5" /><stop offset="1" stopColor="#7be0a4" stopOpacity="0" /></linearGradient>
        <pattern id="fa-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4" fill="#7be0a4" opacity=".25" /></pattern>
      </defs>
      <ellipse cx="100" cy="226" rx="52" ry="12" fill="#12372f" stroke="#7be0a4" strokeWidth="2" />
      <ellipse cx="100" cy="224" rx="32" ry="7" fill="none" stroke="#7be0a4" strokeWidth="1.5" className="ring-spin" />
      <polygon points="66,222 134,222 150,90 50,90" fill="url(#fa-beam)" />
      <g className="holo">
        <path d="M100 18 Q168 40 156 100 Q148 150 100 160 Q52 150 44 100 Q32 40 100 18Z" fill="rgba(123,224,164,.18)" stroke="#7be0a4" strokeWidth="3" />
        <path d="M100 18 Q168 40 156 100 Q148 150 100 160 Q52 150 44 100 Q32 40 100 18Z" fill="url(#fa-scan)" />
        <path d="M100 160 V132 M100 132 q-16 -8 -30 -2 M100 132 q16 -8 30 -2" stroke="#7be0a4" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".7" />
        <rect x="70" y={happy ? 76 : 70} width="18" height={happy ? 8 : 20} rx="6" fill="#d8ffe8" />
        <rect x="112" y={happy ? 76 : 70} width="18" height={happy ? 8 : 20} rx="6" fill="#d8ffe8" />
        {sad && <g stroke="#d8ffe8" strokeWidth="3" strokeLinecap="round"><path d="M66 62 l22 -6" /><path d="M134 62 l-22 -6" /></g>}
        {expression === 'surprised' ? <ellipse cx="100" cy="116" rx="8" ry="10" fill="none" stroke="#d8ffe8" strokeWidth="3" />
          : <path d={happy ? 'M80 112 q20 22 40 0' : sad ? 'M82 124 q18 -14 36 0' : 'M82 118 h36'} stroke="#d8ffe8" strokeWidth="4" fill="none" strokeLinecap="round" />}
      </g>
      <circle cx="30" cy="70" r="3" fill="#7be0a4" className="orb-a" /><circle cx="172" cy="100" r="3" fill="#7be0a4" className="orb-b" />
    </svg>
  );
}

/* ───────────────────────────── O.R.B.I.T. ───────────────────────────── */
function Orbit({ expression, bust, size }) {
  const warn = expression === 'worried';
  const col = warn ? '#ffb347' : '#5ee7ff';
  return (
    <svg className="char orbit-ai" viewBox={bust ? '40 40 120 130' : '0 0 200 250'} width={bust ? size : size * 0.8} height={size} role="img" aria-label="O.R.B.I.T.">
      <rect x="6" y="94" width="48" height="56" rx="4" fill="#1d2a5a" stroke="#6d8bff" strokeWidth="2" /><path d="M6 108 H54 M6 122 H54 M6 136 H54 M22 94 V150 M38 94 V150" stroke="#6d8bff" strokeWidth="1" opacity=".6" />
      <rect x="146" y="94" width="48" height="56" rx="4" fill="#1d2a5a" stroke="#6d8bff" strokeWidth="2" /><path d="M146 108 H194 M146 122 H194 M146 136 H194 M162 94 V150 M178 94 V150" stroke="#6d8bff" strokeWidth="1" opacity=".6" />
      <path d="M54 122 H146" stroke="#8d9bd8" strokeWidth="6" />
      <path d="M100 52 V28" stroke="#9fb2d8" strokeWidth="3" /><circle cx="100" cy="24" r="5" fill={col} className="blink-light" />
      <polygon points="100,50 142,74 142,170 100,194 58,170 58,74" fill="#26346b" stroke="#8aa0ff" strokeWidth="3" />
      <polygon points="100,62 132,80 132,164 100,182 68,164 68,80" fill="#141c40" />
      <circle cx="100" cy="122" r="30" fill="#07091f" stroke={col} strokeWidth="3" />
      <circle cx="100" cy="122" r="20" fill="none" stroke={col} strokeWidth="2" strokeDasharray="6 5" className="ring-spin" />
      <circle cx="100" cy="122" r={expression === 'surprised' ? 14 : 10} fill={col} className="iris" />
      <circle cx="105" cy="117" r="3" fill="#fff" />
      <g className="orbit-ring"><ellipse cx="100" cy="122" rx="94" ry="20" fill="none" stroke={col} strokeWidth="1.6" strokeDasharray="3 7" opacity=".65" /></g>
      <rect x="82" y="206" width="36" height="6" rx="3" fill={col} opacity=".6" />
    </svg>
  );
}

/* ───────────────────────────── THE GLITCH ───────────────────────────── */
function GlitchEntity({ bust, size }) {
  const D = 'M100 22 L168 100 L100 178 L32 100 Z';
  const slices = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg className="char glitch-entity" viewBox={bust ? '20 10 160 180' : '0 0 200 250'} width={bust ? size : size * 0.8} height={size} role="img" aria-label="Unknown signal">
      <defs><clipPath id="gl-c"><path d={D} /></clipPath></defs>
      <g className="gl-a" opacity=".85"><path d={D} fill="#ff4fd8" /></g>
      <g className="gl-b" opacity=".85"><path d={D} fill="#38e8ff" /></g>
      <g clipPath="url(#gl-c)">
        <rect x="20" y="20" width="160" height="160" fill="#0a0a1c" />
        {slices.map((i) => <rect key={i} className={`gl-slice s${i}`} x="20" y={22 + i * 22} width="160" height="10" fill={i % 2 ? '#ff4fd8' : '#38e8ff'} opacity=".55" />)}
      </g>
      <path d={D} fill="none" stroke="#fff" strokeWidth="2.5" className="gl-edge" />
      <text x="100" y="124" textAnchor="middle" fontSize="70" fontWeight="700" fill="#fff" className="gl-q" fontFamily="Chakra Petch, sans-serif">?</text>
      {[[20, 40], [176, 60], [150, 188], [40, 170], [96, 204]].map(([x, y], i) => <rect key={i} className={`gl-bit b${i}`} x={x} y={y} width={8 + i * 2} height={6 + (i % 2) * 4} fill={i % 2 ? '#ff4fd8' : '#38e8ff'} />)}
    </svg>
  );
}

export default function Character({ id, expression = 'neutral', size = 240, bust = false, flip = false, player, glitchy = false, className = '', idle = true }) {
  let el;
  switch (id) {
    case 'detective': el = <Detective player={player} expression={expression} size={size} view={bust ? 'bust' : 'full'} />; break;
    case 'fern': el = <Fern expression={expression} bust={bust} size={size} />; break;
    case 'pip': el = <Pip expression={expression} bust={bust} size={size} />; break;
    case 'forest': el = <ForestAI expression={expression} bust={bust} size={size} glitchy={glitchy} />; break;
    case 'orbit': el = <Orbit expression={expression} bust={bust} size={size} />; break;
    case 'guardian': el = <Guardian expression={expression} bust={bust} size={size} />; break;
    case 'glitch': el = <GlitchEntity bust={bust} size={size} />; break;
    default: el = null;
  }
  return <div className={`character c-${id} ${idle && !bust ? 'idle' : ''} ${flip ? 'flip' : ''} ${className}`} data-character={id} data-expression={expression}>{el}</div>;
}
