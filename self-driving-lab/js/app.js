/* Self-Driving Lab — interface: home, chapter map, game screen, themes, sound, level editor, game loop, saving. */
(function () {
  'use strict';
  const SDL = window.SDL, $ = (s) => document.querySelector(s), MS = SDL.MISSIONS, CH = SDL.CHAPTERS;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = {
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none"/>', pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" stroke="none"/>',
    reset: '<path d="M6 5v14M19 5l-10 7 10 7z"/>', retry: '<path d="M20 12a8 8 0 1 1-2.7-6M20 4v5h-5"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>', star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.2 1.1 2.2h5c0-1 .5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
    book: '<path d="M5 4h13v15H7a2 2 0 0 0-2 2zM5 19a2 2 0 0 1 2-2h11"/>', grid: '<path d="M4 4h16v16H4zM4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"/>', next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    radar: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19a10 10 0 0 1 0-14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0-5 5L3 18l3 3 6.5-6.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
  document.querySelectorAll('[data-ic]').forEach((e) => e.insertAdjacentHTML('afterbegin', icon(e.dataset.ic)));

  // ---------- artwork ----------
  const MASCOT = '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="60" rx="22" ry="3" fill="rgba(0,0,0,.22)"/><rect x="6" y="16" width="52" height="38" rx="16" fill="#ff6a3d"/><rect x="6" y="38" width="52" height="4" fill="#fff" opacity=".85"/><rect x="13" y="19" width="38" height="20" rx="9" fill="#cfeeff"/><circle cx="25" cy="29" r="6.5" fill="#fff"/><circle cx="39" cy="29" r="6.5" fill="#fff"/><circle cx="26.5" cy="30" r="3.2" fill="#16203a"/><circle cx="40.5" cy="30" r="3.2" fill="#16203a"/><circle cx="27.5" cy="28.5" r="1.1" fill="#fff"/><circle cx="41.5" cy="28.5" r="1.1" fill="#fff"/><path d="M25 46q7 6 14 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="47" r="3" fill="#fff3a8"/><circle cx="50" cy="47" r="3" fill="#fff3a8"/><rect x="9" y="50" width="12" height="9" rx="4" fill="#1a2036"/><rect x="43" y="50" width="12" height="9" rx="4" fill="#1a2036"/><rect x="28" y="6" width="8" height="8" rx="3" fill="#16203a"/><circle cx="32" cy="10" r="2" fill="#4ff0c0"/></svg>';
  const wheel = (cx) => `<g class="wheel"><circle cx="${cx}" cy="56" r="11" fill="#1a2036"/><circle cx="${cx}" cy="56" r="5" fill="#9fb0d6"/><path d="M${cx} 47v18M${cx - 9} 56h18" stroke="#9fb0d6" stroke-width="2"/></g>`;
  const CAR = '<svg class="hero-car" viewBox="0 0 160 70" aria-hidden="true"><ellipse cx="80" cy="66" rx="62" ry="4" fill="rgba(0,0,0,.25)"/>'
    + '<path d="M12 46Q12 34 26 32L50 30Q60 14 80 14L108 14Q124 16 132 30L146 34Q152 36 152 46V52Q152 56 148 56H16Q12 56 12 52Z" fill="#ff6a3d"/>'
    + '<path d="M56 30Q64 20 80 20H106Q118 22 124 30Z" fill="#cfeeff"/><path d="M90 20V30" stroke="#ff6a3d" stroke-width="4"/><rect x="12" y="42" width="140" height="4" fill="#fff" opacity=".9"/>'
    + '<circle cx="148" cy="40" r="4" fill="#fff3a8"/><rect x="10" y="38" width="5" height="8" rx="2" fill="#ff4d5e"/><rect x="88" y="6" width="9" height="8" rx="3" fill="#16203a"/><circle cx="92.5" cy="10" r="2" fill="#4ff0c0"/>'
    + wheel(42) + wheel(118) + '</svg>';

  // ---------- storage + state ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sdl.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('sdl.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const S = {
    screen: 'home', ready: false, theme: 'dark', lastCh: 0, wsKeyLoaded: null,
    mode: 'mission', idx: 0, sim: null, runner: null, ws: null, ren: null, bt: null, grid: true, fan: true, mult: 1, acc: 0, last: 0, loading: false, hover: null, hintI: 0, runInfo: null,
    tool: 'road', painting: false, lastTile: '', dirty: false,
    progress: store.get('progress', {}), seen: store.get('seen', {}), sb: Object.assign({}, SDL.sandboxDefaults, store.get('sb', {})),
  };
  S.sb.custom = SDL.padGrid(Array.isArray(S.sb.custom) ? S.sb.custom : SDL.TEMPLATES['Straight road']);
  const cur = () => (S.mode === 'mission' ? MS[S.idx] : null);
  const SB_HINTS = [
    'Pick “Design your own”, drag with the Road tool to draw roads, then add a Start car and a Finish.',
    'Click the Start car tile again to turn the car. Use Export code to share a level.',
    'A good program works in every layout. Change the road, then Retry.',
  ];
  const doneOf = (m) => !!(S.progress[m.id] || {}).done;

  // ---------- sound ----------
  const sfx = {
    on: store.get('sound', true), ctx: null,
    ac() {
      if (!this.on) return null;
      try {
        const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
        this.ctx = this.ctx || new A(); if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
      } catch (e) { return null; }
    },
    tone(f, t, d, type, vol, f2) {
      const c = this.ac(); if (!c) return;
      const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + t;
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + 0.05);
    },
    play(k) {
      if (!this.on) return;
      if (k === 'click') this.tone(620, 0, 0.07, 'triangle', 0.07);
      else if (k === 'go') { this.tone(330, 0, 0.09, 'triangle', 0.11); this.tone(495, 0.09, 0.13, 'triangle', 0.11); }
      else if (k === 'win') [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.11, 0.2, 'triangle', 0.13));
      else if (k === 'star') { this.tone(1175, 0, 0.25, 'sine', 0.11); this.tone(1568, 0.12, 0.35, 'sine', 0.11); }
      else if (k === 'crash') this.tone(220, 0, 0.5, 'sawtooth', 0.11, 55);
    },
  };

  // ---------- themes ----------
  const mkTheme = (mode) => Blockly.Theme.defineTheme('lab-' + mode, {
    base: Blockly.Themes.Zelos, name: 'lab-' + mode,
    blockStyles: {
      start_blocks: { colourPrimary: '#f2c14e', hat: 'cap' },
      logic_blocks: { colourPrimary: '#8b6cf0' }, loop_blocks: { colourPrimary: '#22b98a' }, math_blocks: { colourPrimary: '#5f6f95' },
    },
    componentStyles: mode === 'dark' ? {
      workspaceBackgroundColour: '#10172a', toolboxBackgroundColour: '#0c1222', toolboxForegroundColour: '#d8e0f0',
      flyoutBackgroundColour: '#172036', flyoutForegroundColour: '#ccd6ea', flyoutOpacity: 1,
      scrollbarColour: '#5c6b92', scrollbarOpacity: 0.5, insertionMarkerColour: '#ffffff', insertionMarkerOpacity: 0.3, cursorColour: '#ffd24a',
    } : {
      workspaceBackgroundColour: '#f3f7ff', toolboxBackgroundColour: '#e4ebfb', toolboxForegroundColour: '#2a3556',
      flyoutBackgroundColour: '#dce5fa', flyoutForegroundColour: '#2a3556', flyoutOpacity: 1,
      scrollbarColour: '#8a97bd', scrollbarOpacity: 0.5, insertionMarkerColour: '#000000', insertionMarkerOpacity: 0.25, cursorColour: '#ff6a2e',
    },
    fontStyle: { family: 'Manrope, system-ui, sans-serif', weight: '700', size: 11 },
  });
  function applyTheme(t) {
    S.theme = t; document.documentElement.dataset.theme = t; store.set('theme', t);
    if (S.ws && S.bt) S.ws.setTheme(S.bt[t]);
    if (S.ren) S.ren.setTheme(t);
    document.querySelectorAll('.js-theme').forEach((b) => {
      b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
      b.title = b.ariaLabel = t === 'dark' ? 'Switch to day mode' : 'Switch to night mode';
    });
  }
  function renderSound() {
    document.querySelectorAll('.js-sound').forEach((b) => { b.innerHTML = icon(sfx.on ? 'sound' : 'mute'); b.title = b.ariaLabel = sfx.on ? 'Sound on' : 'Sound off'; });
  }

  // ---------- screens ----------
  function go(name) {
    S.screen = name; document.body.dataset.screen = name;
    if (name === 'map') renderMap();
    if (name === 'home') renderHome();
  }
  function renderHome() {
    const next = MS.findIndex((m) => !doneOf(m)), any = MS.some(doneOf);
    $('#btnContinue').hidden = !(any && next >= 0);
  }
  function starTotals() {
    let got = 0;
    MS.forEach((m) => { const p = S.progress[m.id] || {}; if (p.done) got++; if (p.ext) got++; });
    return [got, MS.length * 2];
  }
  function renderStars() {
    const [a, b] = starTotals(), h = `${icon('star')}<b>${a}</b>/${b}`;
    $('#mapStars').innerHTML = h; $('#gameStars').innerHTML = h;
  }
  function renderMap() {
    const next = MS.findIndex((m) => !doneOf(m));
    const cards = CH.map((c, ci) => {
      const ms = MS.map((m, i) => [m, i]).filter(([m]) => m.ch === ci), done = ms.filter(([m]) => doneOf(m)).length;
      const nodes = ms.map(([m, i]) => {
        const p = S.progress[m.id] || {};
        return `<button type="button" class="node ${p.done ? 'done' : ''} ${i === next ? 'next' : ''}" data-go="${i}"><span class="n">${p.done ? icon('check') : m.lv + 1}</span><b>${esc(m.title)}</b><small>${esc(m.tag)}</small><span class="stars"><span class="${p.done ? 'on' : ''}">${icon('star')}</span><span class="${p.ext ? 'on' : ''}">${icon('star')}</span></span></button>`;
      }).join('');
      return `<article class="win" style="--c:${c.colour};--s1:${c.sky[0]};--s2:${c.sky[1]};--i:${ci}"><div class="win-bar"><i></i><i></i><i></i><span>Chapter ${ci + 1}</span></div>
        <div class="win-art">${c.art}</div><div class="win-body"><h3>${esc(c.title)}</h3><p>${esc(c.blurb)}</p><div class="nodes">${nodes}</div>
        <div class="prog"><i style="width:${(done / ms.length) * 100}%"></i></div></div></article>`;
    });
    const w = SDL.WORKSHOP;
    cards.push(`<article class="win" style="--c:${w.colour};--s1:${w.sky[0]};--s2:${w.sky[1]};--i:${CH.length}"><div class="win-bar"><i></i><i></i><i></i><span>Free play</span></div>
      <div class="win-art">${w.art}</div><div class="win-body"><h3>${esc(w.title)}</h3><p>${esc(w.blurb)}</p>
      <div class="nodes"><button type="button" class="btn run" data-go="sb">${icon('wrench')}Open Workshop</button></div></div></article>`);
    $('#chapters').innerHTML = cards.join('');
    renderStars();
  }
  function stopSim() { if (S.sim && S.sim.state === 'running') { S.sim.state = 'paused'; updateButtons(); } }
  function leaveGame() { saveWs(); stopSim(); }
  function enterMission(i) {
    go('game');
    if (!ensureGame()) return;
    switchTo('mission', i); fit();
  }
  function enterSandbox() {
    go('game');
    if (!ensureGame()) return;
    switchTo('sandbox', 0); fit();
  }

  // ---------- tabs and objective ----------
  function renderTabs() {
    const m = cur(), ch = m ? m.ch : S.lastCh;
    let h = MS.map((x, i) => {
      if (x.ch !== ch) return '';
      const p = S.progress[x.id] || {};
      return `<button type="button" class="tab ${S.mode === 'mission' && S.idx === i ? 'on' : ''} ${p.done ? 'done' : ''}" data-i="${i}"><span class="num">${p.done ? icon('check') : x.lv + 1}</span><span class="tname">${esc(x.title)}</span>${p.ext ? `<span class="xstar" title="Extension complete">${icon('star')}</span>` : ''}</button>`;
    }).join('');
    h += `<button type="button" class="tab sbx ${S.mode === 'sandbox' ? 'on' : ''}" data-i="sb"><span class="tname">Workshop</span></button>`;
    $('#tabs').innerHTML = h;
    $('#chipChapter').textContent = m ? `Chapter ${m.ch + 1} · ${CH[m.ch].title}` : 'Workshop · free play';
    renderStars();
  }
  function renderObjective() {
    const m = cur();
    $('#objKicker').textContent = m ? `Level ${m.ch + 1}-${m.lv + 1} · ${m.tag}` : 'Free play';
    $('#objTitle').textContent = m ? m.title : 'Workshop';
    $('#objText').textContent = m ? m.objective : 'Pick a scenario or design your own level, write a program, and test it as many times as you like.';
    $('#sbBar').hidden = S.mode !== 'sandbox';
  }

  // ---------- Blockly workspace persistence ----------
  const wsKey = () => 'ws.' + (S.mode === 'mission' ? MS[S.idx].id : 'sandbox');
  function saveWs() {
    if (!S.ws || S.loading || !S.wsKeyLoaded) return;
    try { store.set(S.wsKeyLoaded, Blockly.serialization.workspaces.save(S.ws)); } catch (e) { /* ignore */ }
  }
  function loadWs() {
    S.loading = true;
    S.ws.clear();
    const m = cur(), key = wsKey(), saved = store.get(key, null);
    S.ws.updateToolbox(SDL.Blocks.toolbox(m ? m.blocks : SDL.ALL_BLOCKS));
    try { if (saved) Blockly.serialization.workspaces.load(saved, S.ws); } catch (e) { S.ws.clear(); }
    if (!S.ws.getTopBlocks().some((b) => b.type === 'car_start')) {
      S.ws.clear();
      const xml = `<xml><block type="car_start" deletable="false" x="30" y="30">${m && m.starter ? '<next>' + m.starter + '</next>' : ''}</block></xml>`;
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), S.ws);
    }
    S.wsKeyLoaded = key;
    S.loading = false;
    S.ws.scrollCenter();
    countBlocks();
  }
  const countBlocks = () => { const n = SDL.Blocks.stats(S.ws).blocks; $('#blkCount').textContent = n + (n === 1 ? ' block' : ' blocks'); };

  // ---------- scenario ----------
  function loadScenario() {
    const def = m_def();
    S.sim = new SDL.Sim(def); S.sim.onEnd = onEnd; S.runner = null; S.acc = 0;
    S.ren.setDef(def);
    $('#log').innerHTML = ''; hideResult(); if (S.ws) S.ws.highlightBlock(null);
    updateButtons();
  }
  const m_def = () => { const m = cur(); return m ? m.world() : SDL.sandboxDef(S.sb); };

  function switchTo(mode, idx) {
    saveWs(); S.mode = mode; S.idx = idx || 0;
    if (mode === 'mission') S.lastCh = MS[S.idx].ch;
    renderTabs(); renderObjective(); loadWs(); loadScenario(); hideToast();
    $('#btnGrid').classList.toggle('on', S.grid = (cur() ? !!S.sim.def.grid || S.grid : S.grid));
    const key = cur() ? cur().id : 'sandbox';
    if (!S.seen[key] && !(S.progress[key] || {}).done) showBrief();
  }

  // ---------- run controls ----------
  function run() {
    if (S.sim.state === 'running') return;
    if (S.sim.state === 'paused') { S.sim.state = 'running'; return updateButtons(); }
    if (S.sim.state !== 'idle') loadScenario();
    if (S.sim.def.problem) return toast('Finish your level first', S.sim.def.problem);
    hideOverlays();
    let code;
    try { code = SDL.Blocks.compile(S.ws); } catch (e) { return toast('Could not read your program', String(e.message || e)); }
    if (!code) return toast('Nothing to run yet', 'Snap some blocks underneath “when run is pressed”.');
    S.runInfo = SDL.Blocks.stats(S.ws);
    try { S.runner = new SDL.Runner(S.sim, code, hooks); } catch (e) { return toast('Could not read your program', String(e.message || e)); }
    S.sim.state = 'running'; updateButtons(); sfx.play('go');
  }
  const pause = () => { if (S.sim.state === 'running') S.sim.state = 'paused'; else if (S.sim.state === 'paused') S.sim.state = 'running'; updateButtons(); };
  const reset = () => loadScenario();
  const retry = () => { loadScenario(); run(); };
  const editing = () => S.mode === 'sandbox' && !!S.sim && (S.sim.state === 'idle' || S.sim.over);
  function updateButtons() {
    const st = S.sim.state;
    $('#btnRun').disabled = st === 'running';
    $('#btnPause').disabled = st !== 'running' && st !== 'paused';
    $('#btnPause').innerHTML = icon(st === 'paused' ? 'play' : 'pause') + (st === 'paused' ? 'Resume' : 'Pause');
    $('#sim').classList.toggle('click', editing());
  }

  // ---------- hooks from the running program ----------
  const hooks = {
    hl(id) {
      S.ws.highlightBlock(id);
      const b = S.ws.getBlockById(id), t = b && b.type;
      if (t === 'controls_if' || t === 'controls_whileUntil' || t === 'controls_repeat_ext') { S.sim.stats.decisions++; pulse('decide'); }
    },
    log(tag, text) {
      const el = $('#log'), d = document.createElement('div');
      d.className = 'ln ' + tag; d.innerHTML = `<b>${tag === 'sense' ? 'SENSE' : tag === 'act' ? 'ACT' : 'TEST'}</b>${esc(text)}`;
      el.appendChild(d); while (el.children.length > 60) el.removeChild(el.firstChild);
      el.scrollTop = el.scrollHeight;
    },
    pulse(k) { pulse(k); },
  };
  const timers = {};
  function pulse(k) {
    const chip = document.querySelector(`.chip[data-k="${k}"]`);
    chip.classList.add('on'); clearTimeout(timers[k]); timers[k] = setTimeout(() => chip.classList.remove('on'), 280);
  }

  // ---------- results ----------
  function onEnd(res) {
    const m = cur(), info = S.runInfo || { blocks: 0, types: new Set() };
    S.ws.highlightBlock(null); pulse('test');
    hooks.log('test', `${res.title} (${res.time.toFixed(1)} s)`);
    let extOk = false, newStar = false;
    if (res.ok && m) {
      extOk = !!m.ext.check({ time: res.time, blocks: info.blocks, types: info.types, minPed: res.stats.minPed });
      const p = S.progress[m.id] || {};
      newStar = !p.done || (extOk && !p.ext);
      S.progress[m.id] = { done: true, ext: !!(p.ext || extOk), best: p.best ? Math.min(p.best, res.time) : res.time };
      store.set('progress', S.progress); renderTabs();
    }
    const d = S.sim.def.dest;
    if (res.ok) S.ren.burst((d.x + d.w / 2) * SDL.TILE, (d.y + d.h / 2) * SDL.TILE, 'win');
    else if (S.sim.crash) S.ren.burst(S.sim.crash.x, S.sim.crash.y, 'crash');
    sfx.play(res.ok ? 'win' : 'crash');
    if (newStar) setTimeout(() => sfx.play('star'), 650);
    showResult(res, extOk); updateButtons();
  }
  function showResult(res, extOk) {
    const m = cur(), el = $('#ovResult'), s = res.stats, last = m && S.idx >= MS.length - 1;
    const stars = res.ok && m
      ? `<div class="starsrow"><span class="bigstar on" style="--d:.15s">${icon('star')}<em>Mission</em></span><span class="bigstar ${extOk ? 'on' : ''}" style="--d:.45s">${icon('star')}<em>Extension</em></span></div>` : '';
    el.className = 'overlay result ' + (res.ok ? 'ok' : 'bad');
    el.innerHTML = `<div class="card"><div class="badge">${icon(res.ok ? 'check' : 'cross')}</div><div class="rt"><h3>${esc(res.ok && m ? 'Mission complete!' : res.title)}</h3><p>${esc(res.ok ? (m ? res.msg : 'Your program got the car to the finish.') : res.msg)}</p>
      ${stars}
      <div class="chips"><span><b>${s.senses}</b> sensor reads <em>perception</em></span><span><b>${s.decisions}</b> rule checks <em>decisions</em></span><span><b>${s.acts}</b> actions <em>control</em></span></div>
      ${res.ok && m ? `<div class="ext ${extOk ? 'got' : ''}">${icon('star')}<span>Extension: ${esc(m.ext.text)} — ${extOk ? 'complete!' : 'not yet'}</span></div>` : ''}
      <p class="tip">${res.ok ? 'Testing tip: does it still work if you press Retry? In the Workshop you can change the situation.' : 'A failed test is useful data. Change one thing, then Retry.'}</p>
      <div class="acts"><button class="btn run" data-a="retry" type="button">${icon('retry')}Try again</button>${res.ok && m && !last ? `<button class="btn" data-a="next" type="button">Next level${icon('next')}</button>` : ''}${res.ok && m && last ? `<button class="btn" data-a="map" type="button">${icon('map')}Back to map</button>` : ''}<button class="btn ghost" data-a="close" type="button">Close</button></div></div></div>`;
    el.hidden = false;
  }
  const hideResult = () => { $('#ovResult').hidden = true; };
  function showBrief() {
    const m = cur(), el = $('#ovBrief');
    el.innerHTML = `<div class="card brief"><div class="mascot">${MASCOT}</div><span class="kicker">${m ? `Level ${m.ch + 1}-${m.lv + 1} · ${esc(m.tag)}` : 'Free play'}</span><h2>${esc(m ? m.title : 'Workshop')}</h2>
      <p>${esc(m ? m.brief : 'Same car, same blocks, your rules. Choose a scenario below the simulation, or pick “Design your own” to draw roads, junctions and corners, then place a start, a finish and hazards. Test your program as many times as you like.')}</p>
      ${m ? `<div class="objbox"><b>Objective</b>${esc(m.objective)}</div><div class="objbox x"><b>Extension star</b>${esc(m.ext.text)}</div>` : ''}
      <button class="btn run" data-a="start" type="button">${icon('play')}${m ? 'Start mission' : 'Start playing'}</button></div>`;
    el.hidden = false;
  }
  const hideOverlays = () => { $('#ovBrief').hidden = true; hideResult(); };

  let toastT;
  function toast(title, text) {
    const el = $('#toast'); el.innerHTML = `<b>${esc(title)}</b><span>${esc(text)}</span>`; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(hideToast, 9000);
  }
  const hideToast = () => { $('#toast').hidden = true; };

  // ---------- workshop bar ----------
  const TOOLS = [['road', 'Road'], ['erase', 'Erase'], ['start', 'Start car'], ['finish', 'Finish'], ['cone', 'Cone'], ['crate', 'Crate'], ['light', 'Traffic light'], ['trolley', 'Trolley']];
  function renderSb() {
    const s = S.sb, P = [['empty', 'Empty road'], ['lights', 'Traffic lights'], ['ped', 'Pedestrian crossing'], ['obstacles', 'Obstacle course'], ['custom', 'Design your own']];
    let h = `<div class="pills">${P.map(([k, n]) => `<button type="button" class="pill ${s.preset === k ? 'on' : ''}" data-p="${k}">${n}</button>`).join('')}</div>`;
    if (s.preset === 'custom') {
      h += `<div class="pills tools">${TOOLS.map(([k, n]) => `<button type="button" class="pill tool ${S.tool === k ? 'on' : ''}" data-tool="${k}">${n}</button>`).join('')}</div>`
        + `<div class="opts"><select id="sbTpl"><option value="">Load an example…</option>${Object.keys(SDL.TEMPLATES).map((n) => `<option>${esc(n)}</option>`).join('')}</select>`
        + `<label>Green light <input type="range" id="sbGreen" min="3" max="12" value="${s.green}"><output id="sbGreenO">${s.green} s</output></label>`
        + `<button class="link" id="sbClearAll" type="button">Clear all</button><button class="link" id="sbExport" type="button">Export code</button><button class="link" id="sbImport" type="button">Import code</button>`
        + `<span class="note">Drag to paint road · click Start car again to turn it · lights face right</span></div>`;
    } else {
      h += '<div class="opts">'
        + (s.preset === 'lights' ? `<label>Green light <input type="range" id="sbGreen" min="3" max="12" value="${s.green}"><output id="sbGreenO">${s.green} s</output></label>` : '')
        + (s.preset === 'ped' ? `<label>Pedestrians <select id="sbPed">${['calm', 'normal', 'busy'].map((v) => `<option ${s.ped === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : '')
        + (s.preset === 'obstacles' ? `<label class="chk"><input type="checkbox" id="sbTrolley" ${s.trolley ? 'checked' : ''}> Runaway trolley</label>` : '')
        + `<button class="link" id="sbClear" type="button">Clear cones</button><span class="note">Click the road to add or remove cones</span></div>`;
    }
    $('#sbBar').innerHTML = h;
  }
  const sbChanged = (rerender) => { store.set('sb', S.sb); if (rerender) renderSb(); loadScenario(); };

  // ---------- level editor ("Design your own") ----------
  const STARTS = '>v<^', OBJ = { cone: 'c', crate: 'x', light: 'L', trolley: 'T' };
  function setCh(x, y, c) { const r = S.sb.custom[y]; S.sb.custom[y] = r.slice(0, x) + c + r.slice(x + 1); }
  function wipe(pred) {
    for (let y = 0; y < SDL.ROWS; y++) for (let x = 0; x < SDL.COLS; x++) if (pred(S.sb.custom[y][x])) setCh(x, y, '#');
  }
  function editTile(t) {
    const ch = S.sb.custom[t.ty][t.tx], tool = S.tool, isStart = STARTS.includes(ch);
    let n = ch;
    if (tool === 'road') { if (ch === '.') n = '#'; }
    else if (tool === 'erase') n = '.';
    else if (ch === '.') return false; // everything else needs a road tile
    else if (tool === 'start') {
      if (isStart) n = STARTS[(STARTS.indexOf(ch) + 1) % 4];
      else { wipe((c) => STARTS.includes(c)); n = '>'; }
    } else if (tool === 'finish') {
      if (ch === 'F') return false;
      wipe((c) => c === 'F'); n = 'F';
    } else {
      if (isStart || ch === 'F') return false;
      n = ch === OBJ[tool] ? '#' : OBJ[tool];
    }
    if (n === ch) return false;
    setCh(t.tx, t.ty, n); store.set('sb', S.sb); S.dirty = true;
    return true;
  }
  function levelCode() {
    const r = S.sb.custom.map((x) => x.replace(/\.+$/, ''));
    while (r.length && !r[r.length - 1]) r.pop();
    return r.join('|');
  }
  function exportLevel() {
    const code = levelCode();
    const done = () => toast('Level code copied', 'Paste it into “Import code” to load it again, or send it to a friend.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, () => prompt('Copy your level code:', code));
    else prompt('Copy your level code:', code);
  }
  function importLevel() {
    const code = prompt('Paste a level code:');
    if (!code) return;
    const rows = code.trim().split(/[|\n]/).slice(0, SDL.ROWS).map((r) => r.trim());
    if (rows.some((r) => r.length > SDL.COLS || !/^[.#>v<^FcxLT]*$/.test(r)))
      return toast('That code did not work', 'It should be rows made of . # > v < ^ F c x L T characters, joined with |.');
    S.sb.custom = SDL.padGrid(rows); sbChanged(false);
  }

  // ---------- per-frame HUD ----------
  const last = {};
  function setText(id, v, on, dot) {
    const k = id + v; if (last[id] === k) return; last[id] = k;
    $('#' + id).textContent = v; const d = $('#' + id + 'D'); d.className = on ? 'on ' + (dot || '') : '';
  }
  const ARR = { F: '↑', L: '←', R: '→', B: '↓' };
  const arrows = (o) => ['F', 'L', 'R', 'B'].filter((k) => o[k]).map((k) => ARR[k]).join(' ');
  function updateHud() {
    const s = S.sim.sense, t = S.sim.time.toFixed(1) + ' s';
    if (last.t !== t) { last.t = t; $('#hudTime').textContent = t; }
    const ob = arrows(s.det.obs), pe = arrows(s.det.ped), rd = arrows(s.road), fmt = (v) => (v >= 9 ? '–' : v.toFixed(1));
    setText('sObs', ob || 'no', !!ob, 'bad'); setText('sPed', pe || 'no', !!pe, 'bad');
    setText('sLight', s.light, s.light !== 'none', s.light); setText('sDist', s.dist >= 9 ? 'clear' : s.dist.toFixed(1) + ' tiles', s.dist < 2, 'bad');
    setText('sSide', s.rng.L >= 9 && s.rng.R >= 9 ? 'clear' : fmt(s.rng.L) + ' · ' + fmt(s.rng.R), Math.min(s.rng.L, s.rng.R) < 1.5, 'bad');
    setText('sRoad', rd || 'none', !!rd, '');
    setText('sJunc', s.junction ? 'yes' : 'no', s.junction, 'amber');
    setText('sFace', s.face, false, '');
    setText('sDest', s.atDest ? 'yes' : 'no', s.atDest, 'green');
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - S.last) / 1000 || 0); S.last = now;
    if (S.screen !== 'game' || !S.ready || !S.sim) return;
    if (S.dirty) { S.dirty = false; loadScenario(); }
    const sim = S.sim;
    if (sim.state === 'running') {
      S.acc += dt * S.mult;
      for (let n = 0; S.acc >= SDL.STEP && sim.state === 'running' && n < 600; n++) {
        sim.tick(SDL.STEP); if (!sim.over) S.runner.step(); S.acc -= SDL.STEP;
      }
    }
    updateHud(); S.ren.draw(sim, { grid: S.grid, hover: S.hover, fan: S.fan }, now);
  }

  function fit() {
    if (!S.ren) return;
    const w = $('#wrap'), pad = 12, k = Math.min((w.clientWidth - pad) / SDL.W, (w.clientHeight - pad) / SDL.H);
    if (k > 0) S.ren.resize(Math.floor(SDL.W * k), Math.floor(SDL.H * k));
  }

  // ---------- events ----------
  function bind() {
    // shell: theme, sound, navigation
    document.querySelectorAll('.js-theme').forEach((b) => { b.onclick = () => applyTheme(S.theme === 'dark' ? 'light' : 'dark'); });
    document.querySelectorAll('.js-sound').forEach((b) => { b.onclick = () => { sfx.on = !sfx.on; store.set('sound', sfx.on); renderSound(); }; });
    document.addEventListener('click', (e) => { if (e.target.closest('button')) sfx.play('click'); });
    $('#btnPlay').onclick = () => go('map');
    $('#btnContinue').onclick = () => { const i = MS.findIndex((m) => !doneOf(m)); enterMission(i < 0 ? 0 : i); };
    $('#btnWorkshop').onclick = enterSandbox;
    $('#mapBack').onclick = () => go('home');
    $('#gameBack').onclick = () => { leaveGame(); go('map'); };
    $('#chapters').onclick = (e) => {
      const b = e.target.closest('[data-go]'); if (!b) return;
      if (b.dataset.go === 'sb') enterSandbox(); else enterMission(+b.dataset.go);
    };

    // game
    $('#tabs').onclick = (e) => { const b = e.target.closest('.tab'); if (b) switchTo(b.dataset.i === 'sb' ? 'sandbox' : 'mission', +b.dataset.i); };
    $('#btnRun').onclick = run; $('#btnPause').onclick = pause; $('#btnReset').onclick = reset; $('#btnRetry').onclick = retry;
    $('#btnBrief').onclick = showBrief;
    $('#btnHint').onclick = () => { const hs = cur() ? cur().hints : SB_HINTS; toast(`Hint ${S.hintI % hs.length + 1} of ${hs.length}`, hs[S.hintI % hs.length]); S.hintI++; };
    $('#btnGrid').onclick = (e) => { S.grid = !S.grid; e.currentTarget.classList.toggle('on', S.grid); };
    $('#btnFan').onclick = (e) => { S.fan = !S.fan; e.currentTarget.classList.toggle('on', S.fan); };
    $('#speed').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; S.mult = +b.dataset.m; document.querySelectorAll('#speed button').forEach((x) => x.classList.toggle('on', x === b)); };
    $('#toast').onclick = hideToast;
    $('#wrap').addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'start') { S.seen[cur() ? cur().id : 'sandbox'] = 1; store.set('seen', S.seen); $('#ovBrief').hidden = true; }
      if (a.dataset.a === 'retry') retry();
      if (a.dataset.a === 'next') switchTo('mission', S.idx + 1);
      if (a.dataset.a === 'map') { leaveGame(); go('map'); }
      if (a.dataset.a === 'close') hideResult();
    });
    $('#btnWipe').onclick = () => {
      if (!confirm('Clear completed missions and saved programs on this device?')) return;
      Object.keys(localStorage).filter((k) => k.startsWith('sdl.')).forEach((k) => localStorage.removeItem(k)); location.reload();
    };
    const bar = $('#sbBar');
    bar.addEventListener('click', (e) => {
      const tl = e.target.closest('[data-tool]');
      if (tl) { S.tool = tl.dataset.tool; renderSb(); return; }
      const p = e.target.closest('[data-p]');
      if (p) { S.sb.preset = p.dataset.p; sbChanged(true); return; }
      const id = e.target.id;
      if (id === 'sbClear') { S.sb.cones = []; sbChanged(false); }
      if (id === 'sbClearAll' && confirm('Clear the whole level?')) { S.sb.custom = SDL.padGrid([]); sbChanged(false); }
      if (id === 'sbExport') exportLevel();
      if (id === 'sbImport') importLevel();
    });
    bar.addEventListener('input', (e) => { if (e.target.id === 'sbGreen') { S.sb.green = +e.target.value; $('#sbGreenO').textContent = S.sb.green + ' s'; sbChanged(false); } });
    bar.addEventListener('change', (e) => {
      if (e.target.id === 'sbPed') { S.sb.ped = e.target.value; sbChanged(false); }
      if (e.target.id === 'sbTrolley') { S.sb.trolley = e.target.checked; sbChanged(false); }
      if (e.target.id === 'sbTpl' && e.target.value) {
        const name = e.target.value;
        if (confirm('Replace your current level with “' + name + '”?')) { S.sb.custom = SDL.padGrid(SDL.TEMPLATES[name]); sbChanged(true); }
        else renderSb();
      }
    });

    // picking: the 3D renderer turns a pointer position into a tile
    const cv = $('#sim');
    const tileAt = (e) => {
      const p = S.ren.pick(e.clientX, e.clientY);
      if (!p) return null;
      const tx = Math.floor(p.x / SDL.TILE), ty = Math.floor(p.y / SDL.TILE);
      return tx < 0 || ty < 0 || tx >= SDL.COLS || ty >= SDL.ROWS ? null : { tx, ty };
    };
    const coneToggle = (t) => {
      const d = S.sim.def, cx = t.tx * SDL.TILE + 20, cy = t.ty * SDL.TILE + 20;
      const blocked = !SDL.inRoad(d.roads, cx, cy) || (t.tx === d.car.tx && t.ty === d.car.ty)
        || (t.tx >= d.dest.x && t.tx < d.dest.x + d.dest.w && t.ty >= d.dest.y && t.ty < d.dest.y + d.dest.h)
        || (SDL.sandboxDef(Object.assign({}, S.sb, { cones: [] })).obstacles.some((o) => o.tx === t.tx && o.ty === t.ty));
      if (blocked) return;
      const k = t.tx + ',' + t.ty, i = S.sb.cones.indexOf(k);
      if (i >= 0) S.sb.cones.splice(i, 1); else S.sb.cones.push(k);
      sbChanged(false);
    };
    cv.addEventListener('pointerdown', (e) => {
      if (!editing()) return;
      const t = tileAt(e); if (!t) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
      if (S.sb.preset === 'custom') { S.painting = true; S.lastTile = t.tx + ',' + t.ty; editTile(t); } else coneToggle(t);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!editing()) { S.hover = null; return; }
      const t = tileAt(e); S.hover = t;
      if (S.painting && t && (S.tool === 'road' || S.tool === 'erase')) {
        const k = t.tx + ',' + t.ty;
        if (k !== S.lastTile) { S.lastTile = k; editTile(t); }
      }
    });
    const endPaint = () => { S.painting = false; };
    cv.addEventListener('pointerup', endPaint); cv.addEventListener('pointercancel', endPaint);
    cv.addEventListener('pointerleave', () => { S.hover = null; });

    window.addEventListener('resize', fit);
    if (window.ResizeObserver) {
      new ResizeObserver(fit).observe($('#wrap'));
      new ResizeObserver(() => S.ws && Blockly.svgResize(S.ws)).observe($('#blockly'));
    }
  }

  // ---------- the game engine is created the first time the game screen is shown ----------
  function ensureGame() {
    if (S.ready) return true;
    try {
      if (typeof Blockly === 'undefined') throw new Error('Blockly could not be loaded. Check your internet connection (it is loaded from a CDN) and refresh.');
      if (!SDL.Renderer) throw new Error('The 3D engine could not be loaded. Check your internet connection and refresh.');
      SDL.Blocks.init();
      S.bt = { dark: mkTheme('dark'), light: mkTheme('light') };
      S.ren = new SDL.Renderer($('#sim')); S.ren.setTheme(S.theme);
      S.ws = SDL.Blocks.create($('#blockly')); S.ws.setTheme(S.bt[S.theme]);
      S.ws.addChangeListener((e) => { if (e.isUiEvent || S.loading) return; clearTimeout(S.saveT); S.saveT = setTimeout(saveWs, 300); countBlocks(); });
      S.ready = true;
      return true;
    } catch (e) {
      $('#blockly').innerHTML = `<p class="fail-msg">${esc(e.message || e)}</p>`;
      return false;
    }
  }

  // ---------- start ----------
  function start() {
    S.theme = store.get('theme', null) || (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.querySelectorAll('[data-mascot]').forEach((e) => { e.innerHTML = MASCOT; });
    $('#heroCars').innerHTML = CAR + CAR;
    applyTheme(S.theme); renderSound(); renderSb(); bind(); renderStars();
    go('home'); requestAnimationFrame(frame);
  }
  start();
})();