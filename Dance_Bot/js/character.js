/* Character rig: a customisable SVG dancer. Same pose model as the moves (arms, legs, lift, tilt, flip),
   so any character can perform any move. Head can be a built-in shape, an emoji, or a student's photo/drawing. */
(function () {
  'use strict';
  const DL = (window.DL = window.DL || {});
  const DK = '#1b1540';

  const OPTIONS = {
    head: [['robot', 'Robot'], ['round', 'Round'], ['cat', 'Cat'], ['bunny', 'Bunny'], ['alien', 'Alien'], ['emoji', 'Emoji'], ['photo', 'Photo']],
    body: [['robot', 'Boxy'], ['blob', 'Blob'], ['pill', 'Pill'], ['cone', 'Cone']],
    limbs: [['rod', 'Rods'], ['noodle', 'Noodles'], ['stick', 'Sticks']],
    face: [['dots', 'Dots'], ['happy', 'Happy'], ['big', 'Big eyes'], ['visor', 'Visor'], ['wink', 'Wink']],
    mouth: [['smile', 'Smile'], ['open', 'Open'], ['grin', 'Grin'], ['flat', 'Flat']],
    hat: [['none', 'None'], ['tophat', 'Top hat'], ['party', 'Party'], ['crown', 'Crown'], ['beanie', 'Beanie'], ['bow', 'Bow']],
    belly: [['screen', 'Screen'], ['buttons', 'Buttons'], ['star', 'Star'], ['heart', 'Heart'], ['none', 'Plain']]
  };
  const PALETTE = ['#cdc6ff', '#8e85e6', '#ff58a8', '#ffd23f', '#35d6f0', '#6df29a', '#ff8a3d', '#ffffff', '#ffb066', '#a58bff', '#5b8cff', '#2b2b3d'];
  const HEAD_EMOJI = ['🦖', '🐙', '🐧', '🦊', '🐼', '🐸', '🦄', '👻', '🎃', '🤡', '🧙', '🧛', '🐝', '🦁', '🐵', '🍕', '🌵', '⭐', '🌞', '🥑'];

  const PRESETS = [
    { name: 'Robo', head: 'robot', body: 'robot', limbs: 'rod', face: 'visor', mouth: 'smile', hat: 'none', belly: 'screen', glasses: false, headphones: false, cape: false, main: '#cdc6ff', limb: '#8e85e6', accent: '#ff58a8' },
    { name: 'Blobby', head: 'round', body: 'blob', limbs: 'noodle', face: 'big', mouth: 'open', hat: 'none', belly: 'buttons', glasses: false, headphones: false, cape: false, main: '#6df29a', limb: '#35c47a', accent: '#ffd23f' },
    { name: 'Cat DJ', head: 'cat', body: 'pill', limbs: 'noodle', face: 'happy', mouth: 'smile', hat: 'none', belly: 'star', glasses: false, headphones: true, cape: false, main: '#ffb066', limb: '#e0833a', accent: '#5b8cff' },
    { name: 'Zorp', head: 'alien', body: 'cone', limbs: 'stick', face: 'big', mouth: 'grin', hat: 'none', belly: 'none', glasses: false, headphones: false, cape: false, main: '#a58bff', limb: '#6a52d9', accent: '#6df29a' },
    { name: 'Bunny Pop', head: 'bunny', body: 'pill', limbs: 'rod', face: 'dots', mouth: 'smile', hat: 'bow', belly: 'heart', glasses: false, headphones: false, cape: false, main: '#ffffff', limb: '#ff7ab6', accent: '#ff5aa5' },
    { name: 'Captain Bot', head: 'robot', body: 'robot', limbs: 'rod', face: 'dots', mouth: 'grin', hat: 'crown', belly: 'star', glasses: true, headphones: false, cape: true, main: '#35d6f0', limb: '#5b8cff', accent: '#ff5aa5' },
    { name: 'Rexy', head: 'emoji', emoji: '🦖', body: 'blob', limbs: 'noodle', face: 'dots', mouth: 'smile', hat: 'party', belly: 'none', glasses: false, headphones: false, cape: false, main: '#6df29a', limb: '#35c47a', accent: '#ff8a3d' }
  ];

  const colour = (c, d) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : d);
  const pick = (v, key, d) => (OPTIONS[key].some(o => o[0] === v) ? v : d);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function normalise(c) {
    c = c || {};
    const d = PRESETS[0];
    return {
      name: String(c.name || d.name).slice(0, 18),
      head: pick(c.head, 'head', d.head), body: pick(c.body, 'body', d.body), limbs: pick(c.limbs, 'limbs', d.limbs),
      face: pick(c.face, 'face', d.face), mouth: pick(c.mouth, 'mouth', d.mouth), hat: pick(c.hat, 'hat', d.hat), belly: pick(c.belly, 'belly', d.belly),
      glasses: !!c.glasses, headphones: !!c.headphones, cape: !!c.cape,
      main: colour(c.main, d.main), limb: colour(c.limb, d.limb), accent: colour(c.accent, d.accent),
      emoji: Array.from(String(c.emoji || '🦖')).slice(0, 2).join(''),
      photo: typeof c.photo === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(c.photo) ? c.photo : ''
    };
  }

  const HEAD_TOP = { robot: 34, round: 27, cat: 29, bunny: 31, alien: 26, emoji: 27, photo: 26 };

  function headSvg(c, p) {
    const m = c.main, ac = c.accent;
    let s = '';
    switch (c.head) {
      case 'robot':
        s += `<rect fill="${m}" x="68" y="34" width="64" height="52" rx="15"/>`;
        if (c.hat === 'none') s += `<rect fill="${DK}" x="97" y="20" width="6" height="16" rx="3"/><circle class="rb-screen" cx="100" cy="17" r="7"/>`;
        break;
      case 'round': s += `<circle fill="${m}" cx="100" cy="60" r="33"/>`; break;
      case 'cat':
        s += `<polygon fill="${m}" points="70,46 72,16 96,33"/><polygon fill="${m}" points="130,46 128,16 104,33"/>` +
          `<polygon fill="${ac}" points="76,40 77,26 89,34"/><polygon fill="${ac}" points="124,40 123,26 111,34"/>` +
          `<circle fill="${m}" cx="100" cy="60" r="31"/>`;
        break;
      case 'bunny':
        s += `<ellipse fill="${m}" cx="84" cy="20" rx="9" ry="25"/><ellipse fill="${m}" cx="116" cy="20" rx="9" ry="25"/>` +
          `<ellipse fill="${ac}" cx="84" cy="22" rx="4" ry="16" opacity=".7"/><ellipse fill="${ac}" cx="116" cy="22" rx="4" ry="16" opacity=".7"/>` +
          `<circle fill="${m}" cx="100" cy="62" r="31"/>`;
        break;
      case 'alien':
        s += `<path d="M88 32 L80 12 M112 32 L120 12" stroke="${DK}" stroke-width="3" stroke-linecap="round" fill="none"/>` +
          `<circle fill="${ac}" cx="80" cy="12" r="5"/><circle fill="${ac}" cx="120" cy="12" r="5"/>` +
          `<ellipse fill="${m}" cx="100" cy="60" rx="29" ry="34"/>`;
        break;
      case 'emoji':
        s += `<circle fill="${m}" cx="100" cy="60" r="33"/>` +
          `<text x="100" y="62" font-size="54" text-anchor="middle" dominant-baseline="central" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${esc(c.emoji)}</text>`;
        return s;
      case 'photo':
        s += `<circle fill="${m}" cx="100" cy="60" r="35"/>`;
        if (c.photo) s += `<clipPath id="${p}clip"><circle cx="100" cy="60" r="32"/></clipPath><image href="${c.photo}" x="66" y="26" width="68" height="68" preserveAspectRatio="xMidYMid slice" clip-path="url(#${p}clip)"/>`;
        else s += `<text x="100" y="62" font-size="30" text-anchor="middle" dominant-baseline="central">📷</text>`;
        return s;
    }
    /* face */
    if (c.head !== 'robot') s += `<ellipse cx="75" cy="70" rx="6" ry="4" fill="#ff7ab6" opacity=".35"/><ellipse cx="125" cy="70" rx="6" ry="4" fill="#ff7ab6" opacity=".35"/>`;
    const dot = x => `<ellipse class="eye" fill="${DK}" cx="${x}" cy="58" rx="6" ry="7"/>`;
    const arc = x => `<path d="M${x - 7} 61 Q${x} 51 ${x + 7} 61" stroke="${DK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    switch (c.face) {
      case 'dots': s += dot(85) + dot(115); break;
      case 'happy': s += arc(85) + arc(115); break;
      case 'big':
        s += [85, 115].map(x => `<circle cx="${x}" cy="58" r="10" fill="#fff" stroke="${DK}" stroke-width="2"/><circle class="eye" cx="${x + (x < 100 ? 1 : -1)}" cy="59" r="5" fill="${DK}"/><circle cx="${x + (x < 100 ? 3 : 1)}" cy="56" r="1.8" fill="#fff"/>`).join('');
        break;
      case 'visor': s += `<rect x="72" y="49" width="56" height="18" rx="9" fill="${DK}"/><rect class="rb-screen" x="76" y="53" width="48" height="10" rx="5"/>`; break;
      case 'wink': s += dot(85) + arc(115); break;
    }
    switch (c.mouth) {
      case 'smile': s += `<path d="M90 73 Q100 82 110 73" stroke="${DK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`; break;
      case 'open': s += `<ellipse cx="100" cy="76" rx="7" ry="5.5" fill="${DK}"/><ellipse cx="100" cy="78.5" rx="4" ry="2.2" fill="#ff7ab6"/>`; break;
      case 'grin': s += `<path d="M87 71 Q100 88 113 71 Z" fill="${DK}"/><path d="M91 73.5 H109" stroke="#fff" stroke-width="2.5"/>`; break;
      case 'flat': s += `<rect x="90" y="74" width="20" height="4.5" rx="2.25" fill="${DK}"/>`; break;
    }
    return s;
  }

  function hatSvg(c) {
    const t = HEAD_TOP[c.head], a = c.accent;
    switch (c.hat) {
      case 'tophat': return `<rect fill="${DK}" x="78" y="${t - 4}" width="44" height="7" rx="3"/><rect fill="${DK}" x="85" y="${t - 28}" width="30" height="26" rx="3"/><rect fill="${a}" x="85" y="${t - 10}" width="30" height="6"/>`;
      case 'party': return `<polygon fill="${a}" points="84,${t + 3} 116,${t + 3} 100,${t - 36}"/><path d="M90 ${t - 8} H110 M94 ${t - 20} H106" stroke="#fff" stroke-width="3" opacity=".7"/><circle fill="#fff" cx="100" cy="${t - 37}" r="5"/>`;
      case 'crown': return `<path d="M79 ${t + 3} L79 ${t - 15} L90 ${t - 5} L100 ${t - 20} L110 ${t - 5} L121 ${t - 15} L121 ${t + 3} Z" fill="#ffd23f" stroke="#c99a00" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="${t - 8}" r="3" fill="${a}"/>`;
      case 'beanie': return `<path d="M75 ${t + 7} Q75 ${t - 20} 100 ${t - 20} Q125 ${t - 20} 125 ${t + 7} Z" fill="${a}"/><rect x="73" y="${t + 1}" width="54" height="9" rx="4" fill="#fff" opacity=".85"/><circle cx="100" cy="${t - 22}" r="6" fill="#fff"/>`;
      case 'bow': return `<path d="M120 ${t + 6} L137 ${t - 5} L137 ${t + 17} Z M120 ${t + 6} L103 ${t - 5} L103 ${t + 17} Z" fill="${a}"/><circle cx="120" cy="${t + 6}" r="4.5" fill="#fff" opacity=".9"/>`;
    }
    return '';
  }

  function limbs(c) {
    const l = c.limb, a = c.accent;
    const arm = cx => c.limbs === 'noodle'
      ? `<rect fill="${l}" x="${cx - 9}" y="98" width="18" height="60" rx="9"/><circle fill="${a}" cx="${cx}" cy="162" r="11"/>`
      : c.limbs === 'stick'
        ? `<line x1="${cx}" y1="104" x2="${cx}" y2="162" stroke="${l}" stroke-width="6" stroke-linecap="round"/><circle fill="${a}" cx="${cx}" cy="167" r="7"/>`
        : `<rect fill="${l}" x="${cx - 7}" y="100" width="14" height="62" rx="7"/><circle fill="${DK}" cx="${cx}" cy="164" r="9"/>`;
    const leg = cx => c.limbs === 'noodle'
      ? `<rect fill="${l}" x="${cx - 10}" y="170" width="20" height="56" rx="10"/><ellipse fill="${a}" cx="${cx}" cy="230" rx="16" ry="8"/>`
      : c.limbs === 'stick'
        ? `<line x1="${cx}" y1="172" x2="${cx}" y2="228" stroke="${l}" stroke-width="6" stroke-linecap="round"/><ellipse fill="${a}" cx="${cx}" cy="232" rx="12" ry="6"/>`
        : `<rect fill="${l}" x="${cx - 8}" y="172" width="16" height="54" rx="6"/><rect fill="${DK}" x="${cx - 14}" y="222" width="28" height="13" rx="6"/>`;
    return { arm, leg };
  }

  function bodySvg(c) {
    const m = c.main;
    switch (c.body) {
      case 'blob': return `<ellipse fill="${m}" cx="100" cy="136" rx="46" ry="47"/><ellipse cx="100" cy="142" rx="26" ry="28" fill="#fff" opacity=".22"/>`;
      case 'pill': return `<rect fill="${m}" x="64" y="90" width="72" height="94" rx="36"/><ellipse cx="100" cy="142" rx="22" ry="30" fill="#fff" opacity=".22"/>`;
      case 'cone': return `<path d="M74 96 H126 L144 178 H56 Z" fill="${m}" stroke="${m}" stroke-width="14" stroke-linejoin="round"/>`;
      default: return `<rect fill="${m}" x="60" y="92" width="80" height="84" rx="18"/>`;
    }
  }
  function bellySvg(c) {
    switch (c.belly) {
      case 'screen': return `<rect fill="${DK}" x="74" y="106" width="52" height="34" rx="9"/><rect class="rb-screen" x="79" y="111" width="42" height="24" rx="6"/><circle fill="${DK}" cx="84" cy="156" r="5"/><circle fill="${DK}" cx="100" cy="156" r="5"/><circle fill="${DK}" cx="116" cy="156" r="5"/>`;
      case 'buttons': return [112, 130, 148].map(y => `<circle fill="${DK}" cx="100" cy="${y}" r="5.5"/>`).join('');
      case 'star': return `<path class="rb-screen" d="M100 108 L106 122 L121 123 L109.5 133 L113 148 L100 140 L87 148 L90.5 133 L79 123 L94 122 Z" stroke="${DK}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'heart': return `<path class="rb-screen" d="M100 148 C78 133 82 112 94 112 C99 112 100 117 100 117 C100 117 101 112 106 112 C118 112 122 133 100 148 Z" stroke="${DK}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    return '';
  }

  /* Returns the inside of an <svg viewBox="0 0 200 250">. `p` prefixes element ids (so two rigs can coexist). */
  function svg(cfg, p) {
    const c = normalise(cfg); p = p || '';
    const L = limbs(c);
    const keep = c.head === 'emoji' || c.head === 'photo' ? '1' : '0';
    const cape = c.cape ? `<path d="M62 96 L138 96 L158 200 Q100 218 42 200 Z" fill="${c.accent}" opacity=".92"/><path d="M62 96 L138 96 L146 130 Q100 142 54 130 Z" fill="#000" opacity=".12"/>` : '';
    const glasses = c.glasses && c.head !== 'emoji' && c.head !== 'photo'
      ? `<circle cx="85" cy="58" r="11" fill="#fff" fill-opacity=".25" stroke="${DK}" stroke-width="3"/><circle cx="115" cy="58" r="11" fill="#fff" fill-opacity=".25" stroke="${DK}" stroke-width="3"/><path d="M96 58 H104" stroke="${DK}" stroke-width="3"/>` : '';
    const phones = c.headphones
      ? `<path d="M68 58 Q68 24 100 24 Q132 24 132 58" stroke="${c.accent}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="62" y="50" width="11" height="22" rx="5.5" fill="${c.accent}"/><rect x="127" y="50" width="11" height="22" rx="5.5" fill="${c.accent}"/>` : '';
    return `<ellipse cx="100" cy="238" rx="52" ry="7" fill="#000" opacity=".3"/>` +
      `<g class="idle"><g id="${p}bot" style="transform-origin:100px 238px">${cape}` +
      `<g id="${p}legL" style="transform-origin:82px 172px">${L.leg(82)}</g>` +
      `<g id="${p}legR" style="transform-origin:118px 172px">${L.leg(118)}</g>` +
      `<g id="${p}armL" style="transform-origin:56px 106px">${L.arm(56)}</g>` +
      `<g id="${p}armR" style="transform-origin:144px 106px">${L.arm(144)}</g>` +
      bodySvg(c) + bellySvg(c) +
      `<g id="${p}head" data-keep="${keep}" style="transform-origin:100px 60px">${headSvg(c, p)}${glasses}${hatSvg(c)}${phones}</g>` +
      `</g></g>`;
  }

  function setPose(p, f) {
    const [la, ra, ll, rl, y, r, sx] = f, s = sx == null ? 1 : sx;
    const g = id => document.getElementById(p + id), set = (e, t) => { if (e) e.style.transform = t; };
    set(g('armL'), `rotate(${la}deg)`); set(g('armR'), `rotate(${-ra}deg)`);
    set(g('legL'), `rotate(${ll}deg)`); set(g('legR'), `rotate(${-rl}deg)`);
    set(g('bot'), `translateY(${y}px) rotate(${r}deg) scaleX(${s})`);
    const h = g('head');
    if (h) set(h, h.dataset.keep === '1' ? `scaleX(${1 / s})` : 'none');
  }

  function random() {
    const r = a => a[Math.floor(Math.random() * a.length)], o = k => r(OPTIONS[k])[0];
    const hat = Math.random() < 0.5 ? 'none' : o('hat'), head = o('head') === 'photo' ? 'round' : o('head');
    return normalise({
      name: 'Mystery', head, emoji: r(HEAD_EMOJI), body: o('body'), limbs: o('limbs'), face: o('face'), mouth: o('mouth'), hat, belly: o('belly'),
      glasses: Math.random() < 0.25, headphones: Math.random() < 0.25, cape: Math.random() < 0.25,
      main: r(PALETTE), limb: r(PALETTE), accent: r(PALETTE)
    });
  }

  /* centre-crop a student's picture to a small square JPEG that fits comfortably in localStorage */
  function photoFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('not an image'));
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('read failed'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('decode failed'));
        img.onload = () => {
          const n = 160, cv = document.createElement('canvas'); cv.width = cv.height = n;
          const s = Math.min(img.width, img.height), ctx = cv.getContext('2d');
          ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, n, n);
          resolve(cv.toDataURL('image/jpeg', 0.82));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  DL.Char = { OPTIONS, PALETTE, HEAD_EMOJI, PRESETS, normalise, svg, setPose, random, photoFromFile };
})();
