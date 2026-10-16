import type { CSSProperties } from 'react'

export function Nova({ size = 72, face = 'curious', className = '' }: { size?: number; face?: 'curious' | 'happy' | 'thinking' | 'oops'; className?: string }) {
  const eyes = face === 'happy' ? <><path d="M26 35q4 6 8 0" /><path d="M48 35q4 6 8 0" /></> : face === 'oops' ? <><circle cx="30" cy="34" r="3" fill="currentColor" /><circle cx="52" cy="34" r="3" fill="currentColor" /></> : <><circle cx="30" cy="34" r="3.5" fill="currentColor" /><circle cx="52" cy="34" r="3.5" fill="currentColor" /></>
  return <svg className={`nova ${className}`} style={{ width: size, height: size } as CSSProperties} viewBox="0 0 82 92" role="img" aria-label={`NOVA robot, ${face}`}>
    <path d="M41 5v9M36 5h10" stroke="#e0aa57" strokeWidth="3" strokeLinecap="round" />
    <circle cx="41" cy="4" r="3" fill="#e0aa57" />
    <rect x="16" y="17" width="50" height="43" rx="14" fill="#e9f1e7" stroke="#173f42" strokeWidth="3" />
    <rect x="22" y="23" width="38" height="29" rx="9" fill="#8cc4b8" />
    <g stroke="#173f42" strokeWidth="2.6" strokeLinecap="round" fill="none">{eyes}{face === 'happy' ? <path d="M31 43q10 10 20 0" /> : face === 'oops' ? <path d="M35 46q6 -4 12 0" /> : face === 'thinking' ? <path d="M34 45h11" /> : <path d="M34 45q7 4 14 0" />}</g>
    <rect x="7" y="31" width="8" height="15" rx="4" fill="#e0aa57" stroke="#173f42" strokeWidth="2" />
    <rect x="67" y="31" width="8" height="15" rx="4" fill="#e0aa57" stroke="#173f42" strokeWidth="2" />
    <rect x="27" y="62" width="28" height="10" rx="4" fill="#d1dfd3" stroke="#173f42" strokeWidth="2.5" />
    <path d="M30 72v8M52 72v8" stroke="#173f42" strokeWidth="4" strokeLinecap="round" />
    <rect x="22" y="79" width="16" height="7" rx="3" fill="#173f42" />
    <rect x="44" y="79" width="16" height="7" rx="3" fill="#173f42" />
    <circle cx="41" cy="66.5" r="2.3" fill="#e0aa57" />
  </svg>
}

export function IslandIllustration({ compact = false }: { compact?: boolean }) {
  return <svg className={`island-illustration ${compact ? 'compact' : ''}`} viewBox="0 0 760 420" role="img" aria-label="An illustrated island with a research station, forest trail, battery factory and communications tower">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8d6d0"/><stop offset="1" stopColor="#e4e9c9"/></linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3d9292"/><stop offset="1" stopColor="#22626a"/></linearGradient>
    </defs>
    <rect width="760" height="420" rx="26" fill="url(#sky)" />
    <circle cx="626" cy="77" r="35" fill="#f3d48c" />
    <path d="M0 245q100 -50 198 -10t181 -4t181 8t200 -4v185H0Z" fill="url(#sea)" />
    <path d="M0 286q100 -25 182 5t173 0t203 -3t202 8" fill="none" stroke="#78b9ac" strokeWidth="3" opacity=".65" />
    <path d="M89 286Q50 220 102 170Q125 134 188 141Q213 94 278 108Q337 75 383 118Q455 88 488 141Q560 134 588 178Q655 207 621 264Q594 301 509 297Q432 333 352 302Q273 337 204 303Q132 324 89 286Z" fill="#739b73" stroke="#2e6761" strokeWidth="4" />
    <path d="M140 272Q184 248 213 216T296 191Q348 193 372 221T459 228Q501 220 535 258" fill="none" stroke="#e7d49d" strokeWidth="12" strokeLinecap="round" />
    <path d="M140 272Q184 248 213 216T296 191Q348 193 372 221T459 228Q501 220 535 258" fill="none" stroke="#bd9f66" strokeWidth="2" strokeDasharray="5 9" />
    <g transform="translate(125 169)"><path d="M0 24 28 0 56 24Z" fill="#355d4f"/><path d="M5 20 28 -8 51 20Z" fill="#4f7d61"/><rect x="24" y="21" width="8" height="25" fill="#795d43"/></g>
    <g transform="translate(174 148) scale(.8)"><path d="M0 24 28 0 56 24Z" fill="#355d4f"/><path d="M5 20 28 -8 51 20Z" fill="#4f7d61"/><rect x="24" y="21" width="8" height="25" fill="#795d43"/></g>
    <g transform="translate(220 179) scale(.68)"><path d="M0 24 28 0 56 24Z" fill="#355d4f"/><path d="M5 20 28 -8 51 20Z" fill="#4f7d61"/><rect x="24" y="21" width="8" height="25" fill="#795d43"/></g>
    <g transform="translate(458 151)"><rect x="0" y="20" width="82" height="57" rx="5" fill="#f1ead8" stroke="#274e4b" strokeWidth="3"/><path d="M-6 24 41 -8 88 24Z" fill="#c87553" stroke="#274e4b" strokeWidth="3"/><rect x="12" y="34" width="18" height="22" rx="2" fill="#8ec3bd" stroke="#274e4b" strokeWidth="2"/><rect x="48" y="37" width="20" height="40" rx="2" fill="#8caa9a" stroke="#274e4b" strokeWidth="2"/><rect x="56" y="4" width="8" height="15" fill="#c87553"/></g>
    <g transform="translate(525 106)"><path d="M19 22 4 120M19 22 34 120M8 95h22M11 73h16M14 52h10M5 120h29" stroke="#315552" strokeWidth="4" strokeLinecap="round"/><circle cx="19" cy="20" r="6" fill="#e0aa57" stroke="#315552" strokeWidth="3"/><path d="M2 7q-15 10 0 20M36 7q15 10 0 20" fill="none" stroke="#e0aa57" strokeWidth="3" strokeLinecap="round"/></g>
    <g transform="translate(355 242) scale(.72)"><rect x="0" y="20" width="90" height="45" rx="4" fill="#d9e0ce" stroke="#315552" strokeWidth="3"/><path d="M-5 20 45 -3 95 20Z" fill="#d7a766" stroke="#315552" strokeWidth="3"/><rect x="11" y="31" width="16" height="15" fill="#70aaa4"/><rect x="35" y="31" width="16" height="15" fill="#70aaa4"/><rect x="59" y="31" width="16" height="34" fill="#6b8c77"/></g>
    <g transform="translate(281 245) scale(.66)"><path d="M0 18h68l-8 32H8Z" fill="#dfd4b5" stroke="#315552" strokeWidth="3"/><rect x="9" y="0" width="50" height="22" rx="3" fill="#6b9e8c" stroke="#315552" strokeWidth="3"/><rect x="19" y="5" width="30" height="12" rx="2" fill="#b7ddd0"/></g>
    <g transform="translate(250 242)"><path d="M0 29q0 -21 17 -21t17 21v21H0Z" fill="#e0aa57" stroke="#315552" strokeWidth="2.5"/><rect x="4" y="6" width="25" height="23" rx="9" fill="#f1ead8" stroke="#315552" strokeWidth="2.5"/><circle cx="12" cy="17" r="2" fill="#315552"/><circle cx="22" cy="17" r="2" fill="#315552"/><path d="M12 23h10" stroke="#315552" strokeWidth="2" strokeLinecap="round"/></g>
    <g fill="#f0ddb1" opacity=".8"><circle cx="90" cy="72" r="3"/><circle cx="116" cy="98" r="2"/><circle cx="691" cy="138" r="3"/><circle cx="665" cy="190" r="2"/></g>
    {!compact && <g fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="12" fill="#244e4b"><text x="94" y="320">OVERGROWN TRAIL</text><text x="355" y="320">RESEARCH STATION</text><text x="520" y="251">COMMS TOWER</text></g>}
  </svg>
}

export function SignalIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 18v3M8 21h8M12 17a5 5 0 0 0 0-10M12 13a1 1 0 0 0 0-2"/><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8M2.8 2.8a13 13 0 0 0 0 18.4M21.2 2.8a13 13 0 0 1 0 18.4"/></svg>
}
