/* Self-Driving Lab — chapters (worlds). Groups missions into themed windows and sets the play order. */
(function (g) {
  'use strict';
  const SDL = (g.SDL = g.SDL || {});

  const wins = (x, y, cols, rows, dx, dy) => {
    let s = '';
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) s += `<rect x="${x + i * (dx || 11)}" y="${y + j * (dy || 14)}" width="6" height="8" rx="1"/>`;
    return s;
  };
  const zebra = (x0, n) => { let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${x0 + i * 14}" y="100" width="8" height="30"/>`; return s; };
  const SV = (inner) => `<svg viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
  const road = '<rect y="102" width="320" height="28" fill="#454c5a"/><path d="M0 116H320" stroke="#ffe9a8" stroke-width="2.5" stroke-dasharray="10 9"/>';
  const cloud = (x, y, s) => `<g fill="#fff" opacity=".85" transform="translate(${x} ${y}) scale(${s || 1})"><ellipse cx="0" cy="0" rx="26" ry="9"/><ellipse cx="18" cy="-6" rx="18" ry="9"/></g>`;
  const miniCar = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-16" y="-12" width="32" height="13" rx="6" fill="#ff6a3d"/><rect x="-7" y="-18" width="15" height="8" rx="3" fill="#cfeeff"/><circle cx="-9" cy="2" r="4.5" fill="#1a2036"/><circle cx="9" cy="2" r="4.5" fill="#1a2036"/></g>`;

  const ART = {
    c1: SV(
      '<circle cx="268" cy="30" r="25" fill="#ffd96a" opacity=".3"/><circle cx="268" cy="30" r="17" fill="#ffd96a"/>' + cloud(60, 28) + cloud(170, 40, 0.8) +
      '<path d="M0 98Q70 58 140 88T280 80T320 92V130H0Z" fill="#7bd88a"/><path d="M0 114Q90 86 170 108T320 104V130H0Z" fill="#4fbf6b"/>' +
      '<path d="M-10 112C50 92 100 124 160 108S260 84 335 104" fill="none" stroke="#454c5a" stroke-width="18"/>' +
      '<path d="M-10 112C50 92 100 124 160 108S260 84 335 104" fill="none" stroke="#ffe9a8" stroke-width="2.5" stroke-dasharray="9 8"/>' +
      '<rect x="286" y="62" width="3" height="34" fill="#e8ecf5"/><path d="M289 62h24v16h-24z" fill="#101626"/><path d="M289 62h12v8h-12zM301 70h12v8h-12z" fill="#fff"/>' + miniCar(74, 98)),
    c2: SV(
      cloud(250, 24, 0.7) + '<g fill="#6b7bd0"><rect x="14" y="52" width="38" height="52"/><rect x="58" y="28" width="34" height="76"/><rect x="98" y="62" width="40" height="42"/></g>' +
      '<g fill="#4a58a8"><rect x="236" y="44" width="40" height="60"/><rect x="282" y="68" width="38" height="36"/></g>' +
      '<g fill="#ffe28a">' + wins(22, 60, 3, 3) + wins(65, 36, 2, 5) + wins(106, 70, 3, 2) + wins(244, 52, 3, 3) + wins(290, 76, 3, 2) + '</g>' + road + miniCar(150, 104) +
      '<g fill="none" stroke="#4ff0c0" stroke-width="3" stroke-linecap="round"><path d="M176 94a16 16 0 0 1 0 20"/><path d="M186 88a28 28 0 0 1 0 32"/><path d="M196 82a40 40 0 0 1 0 44"/></g>'),
    c3: SV(
      cloud(230, 26, 0.8) + '<path d="M0 100Q80 80 160 98T320 94V130H0Z" fill="#7bd88a"/>' + road + '<g fill="#fff" opacity=".92">' + zebra(138, 6) + '</g>' +
      '<rect x="52" y="34" width="5" height="72" fill="#2a3042"/><rect x="42" y="10" width="25" height="54" rx="9" fill="#161c2b"/>' +
      '<circle cx="54.5" cy="24" r="6" fill="#ff4d5e"/><circle cx="54.5" cy="38" r="6" fill="#5a4620"/><circle cx="54.5" cy="52" r="6" fill="#1f4034"/>' +
      '<g transform="translate(262 86)"><rect x="-6" y="-2" width="12" height="22" rx="6" fill="#ffb703"/><circle cx="0" cy="-10" r="8" fill="#f1c9a5"/><path d="M-8 -12a8 8 0 0 1 16 0z" fill="#3b2a20"/></g>'),
    c4: SV(
      '<path d="M0 100Q80 80 160 98T320 94V130H0Z" fill="#7bd88a"/>' + road +
      '<g transform="translate(60 106)"><path d="M-13 0L0 -36L13 0Z" fill="#ff7a1a"/><rect x="-6" y="-22" width="12" height="7" fill="#fff"/><rect x="-17" y="-2" width="34" height="5" rx="2" fill="#e5640c"/></g>' +
      '<g transform="translate(150 106)"><rect x="-18" y="-36" width="36" height="36" fill="#c58a4b" stroke="#8d5b2a" stroke-width="3"/><path d="M-18 -36L18 0M18 -36L-18 0" stroke="#8d5b2a" stroke-width="3"/></g>' +
      '<g transform="translate(240 106)"><rect x="-18" y="-32" width="36" height="26" rx="3" fill="none" stroke="#e8ecf5" stroke-width="3"/><path d="M-9 -32V-6M0 -32V-6M9 -32V-6" stroke="#e8ecf5" stroke-width="2"/><circle cx="-12" cy="-1" r="4" fill="#222a3c"/><circle cx="12" cy="-1" r="4" fill="#222a3c"/></g>' +
      '<g transform="translate(290 44)"><path d="M0 -24L22 14H-22Z" fill="#ffd24a" stroke="#2a2a2a" stroke-width="3" stroke-linejoin="round"/><rect x="-2" y="-8" width="4" height="12" fill="#2a2a2a"/><circle cx="0" cy="8" r="2.4" fill="#2a2a2a"/></g>'),
    ws: SV(
      '<rect width="320" height="130" fill="#7bd88a" opacity=".55"/><g fill="#454c5a" stroke="#fff" stroke-opacity=".3"><rect x="20" y="88" width="30" height="30"/><rect x="50" y="88" width="30" height="30"/><rect x="80" y="88" width="30" height="30"/><rect x="80" y="58" width="30" height="30"/><rect x="110" y="58" width="30" height="30"/><rect x="140" y="58" width="30" height="30"/><rect x="140" y="28" width="30" height="30"/><rect x="170" y="28" width="30" height="30"/></g>' +
      '<circle cx="35" cy="103" r="7" fill="#34e39b"/><rect x="194" y="30" width="3" height="22" fill="#fff"/><path d="M197 30h14v9h-14z" fill="#101626"/>' +
      '<g transform="rotate(35 262 66)"><rect x="252" y="30" width="18" height="64" fill="#ffcf4a"/><path d="M252 94h18l-9 17z" fill="#f1c9a5"/><path d="M257 105h8l-4 6z" fill="#333"/><rect x="252" y="20" width="18" height="11" fill="#ff7a8a"/></g>'),
  };

  SDL.CHAPTERS = [
    { id: 'c1', title: 'Rookie Road', blurb: 'Give your car step-by-step instructions and drive round your first corners.', colour: '#2fc77a', sky: ['#bfe8ff', '#eaf8ff'], missions: ['m1', 'm5'], art: ART.c1 },
    { id: 'c2', title: 'Sensor City', blurb: 'Teach your car to look around, sense the road and choose which way to go.', colour: '#3a8dff', sky: ['#c9dcff', '#f0f5ff'], missions: ['m6', 'm7'], art: ART.c2 },
    { id: 'c3', title: 'Rules of the Road', blurb: 'Traffic lights and zebra crossings: a good driver always follows the rules!', colour: '#f2a100', sky: ['#ffe9b8', '#fff7e0'], missions: ['m2', 'm3'], art: ART.c3 },
    { id: 'c4', title: 'Danger Zone', blurb: 'Cones, crates and runaway trolleys. Stay calm, test, and drive safely.', colour: '#f0505f', sky: ['#ffd2d6', '#fff0f1'], missions: ['m4', 'm8'], art: ART.c4 },
  ];
  SDL.WORKSHOP = { title: 'Workshop', blurb: 'Design your own roads and junctions, add hazards, then test your program on them.', colour: '#8a63f2', sky: ['#dccfff', '#f4efff'], art: ART.ws };

  // Put the missions into chapter order (in place, so every file keeps the same SDL.MISSIONS array).
  const MS = SDL.MISSIONS, byId = {}, order = [], last = SDL.CHAPTERS.length - 1;
  MS.forEach((m) => { byId[m.id] = m; });
  SDL.CHAPTERS.forEach((c, ci) => c.missions.forEach((id, li) => { const m = byId[id]; if (m) { m.ch = ci; m.lv = li; order.push(m); } }));
  MS.forEach((m) => { if (order.indexOf(m) < 0) { m.ch = last; m.lv = order.filter((x) => x.ch === last).length; order.push(m); } });
  MS.splice(0, MS.length, ...order);
})(globalThis);