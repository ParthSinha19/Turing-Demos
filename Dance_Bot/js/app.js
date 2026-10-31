/* Teach the Robot to Dance: app logic. State, rendering and actions. No frameworks, no build step. */
(function () {
  'use strict';
  const DL = window.DL, ML = DL.ML, Mv = DL.Moves, Pk = DL.Packs, Ch = DL.Char;
  const RAW = DL.config || {};
  const nn = o => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v != null));
  const urlMode = new URLSearchParams(location.search).get('mode');
  const JR = (urlMode === 'full' || urlMode === 'junior' ? urlMode : RAW.mode) !== 'full';
  const MODEDEF = JR
    ? { defaultPack: 'moods', showBrainChoice: false, defaultBrain: 'knn', maxLabels: 4, maxMoves: 8, showLab: false, starterMovesOnly: true }
    : { defaultPack: 'dance', showBrainChoice: true, defaultBrain: 'tree', maxLabels: 8, maxMoves: 16, showLab: true, starterMovesOnly: false };
  const CFG = Object.assign({ title: 'Teach the Robot to Dance', allowPhotos: true, soundDefault: false, theme: 'dark', tutorial: 'auto' }, MODEDEF, nn(RAW), nn(RAW.overrides));
  const hooks = [];
  function runHooks() { hooks.forEach(f => { try { f(); } catch (e) { /* tutorial must never break the app */ } }); }
  const params = new URLSearchParams(location.search);
  const M = Mv.list, MV = Mv.byId, REST = Mv.REST, PFX = 'rb-';

  const BRAINS = {
    tree: { name: 'Question tree', blurb: 'Asks yes/no questions about the dance, one after another, until it reaches a guess.' },
    knn: { name: 'Look-alike finder', blurb: 'Compares a new dance with every dance it studied and copies the answer of the closest ones.' }
  };
  const BADGES = {
    first: ['First lesson', 'Trained a brain from your own examples.'],
    designer: ['Label designer', 'Invented your own label and gave it 3 or more examples.'],
    mistake: ['Mistake spotter', 'Found a dance the robot guessed wrong.'],
    mixed: ['Mixed signals', 'Gave the same dance two different labels.'],
    stale: ['Old brain', 'Asked the robot after the examples changed, without retraining.'],
    fair: ['Fair test', 'Scored two different brains on the same exam.'],
    rival: ['Brain battle', 'Scored both kinds of brain on the same exam.'],
    order: ['Order detective', 'Found a dance whose answer changes when the moves are reversed.'],
    star: ['Star of the show', 'Gave your dancer a look of their very own.']
  };
  const EXPERIMENTS = [
    ['The tiny dataset', 'Data quantity', 'Delete examples until each label has just one, press Teach the robot, and ask about a new dance. Then add more examples, teach again and compare.'],
    ['The confusing dance', 'Class overlap', 'Make two labels that share lots of moves and pairs. Check the brain map to see where the robot struggles to tell them apart.'],
    ['The misleading teacher', 'Label quality', 'Move one example into the wrong label, teach the robot, then run the exam. Did one wrong label change the brain?'],
    ['The unfamiliar dance', 'Generalisation', 'Ask about a dance made of moves the robot never saw in training. The explanation lists them. Is its answer still a good one?'],
    ['Before and after', 'Evaluation', 'Run the exam, change the examples, teach again and run the same exam. The Test tab lines up the scores for you.'],
    ['Brain battle', 'Choosing a model', 'Teach the Question tree, run the exam. Switch to the Look-alike finder, teach, run the same exam. Which won? Look at which dances each one got wrong.'],
    ['Your own label', 'Feature design', 'Invent a label with a clear rule, like "always starts with a spin". Can the robot work out your rule? Compare your clue with what it says it learned.'],
    ['Order matters', 'Sequences', 'Load the Order puzzle pack. Does the robot notice that crouch-then-jump is different from jump-then-crouch? Try both brains.']
  ];
  const BEAT = { slow: 940, normal: 680, fast: 440 };

  /* ---------- state ---------- */
  const KEY = 'dance-lab-v2', OLDKEY = 'robot-dance-v1';
  let S = null;
  const U = { tab: 'moves', cat: 'starter', sel: null, replace: false, delLabel: null, confirm: null, edit: null };

  function base() {
    return {
      v: 2, labels: [], examples: [], exam: [], dsVersion: 1, examVersion: 1, brain: 'tree', k: 3,
      models: { tree: null, knn: null }, history: [], badges: {}, last: null, log: [], order: null, lastExam: null,
      tray: [], nid: 1, nmodel: 1, char: Ch.normalise(Ch.PRESETS[0]), stage: 'club', theme: CFG.theme, sound: !!CFG.soundDefault, tempo: 'normal', packId: 'blank'
    };
  }
  function applyPack(s, p) {
    s.labels = []; s.examples = []; s.exam = [];
    p.labels.forEach(l => {
      const id = 'l' + (s.nid++);
      s.labels.push({ id, name: l.name, icon: l.icon, color: l.color, rule: l.rule || '' });
      (l.ex || []).forEach(q => s.examples.push({ id: 'e' + (s.nid++), seq: q.split(' '), labelId: id }));
      (l.exam || []).forEach(q => s.exam.push({ id: 'x' + (s.nid++), seq: q.split(' '), labelId: id }));
    });
    s.tray = s.examples.length ? [...s.examples[0].seq] : [];
    s.dsVersion++; s.examVersion++; s.models = { tree: null, knn: null }; s.history = []; s.last = null; s.lastExam = null; s.log = []; s.order = null; s.packId = p.id;
  }
  function fresh(packId) {
    const s = base(); applyPack(s, Pk.get(packId) || Pk.get('dance'));
    s.brain = CFG.defaultBrain === 'knn' ? 'knn' : 'tree'; return s;
  }
  const hex = c => /^#[0-9a-f]{6}$/i.test(c || '');
  /* Build a clean project from untrusted JSON (file import) */
  function sanitize(o) {
    if (!o || typeof o !== 'object' || !Array.isArray(o.labels)) return null;
    const s = base(), ids = new Set(), map = {};
    o.labels.slice(0, 16).forEach(l => {
      if (!l || typeof l.id !== 'string' || ids.has(l.id)) return;
      ids.add(l.id); map[l.id] = 'l' + (s.nid++);
      s.labels.push({ id: map[l.id], name: String(l.name || 'Label').slice(0, 24), icon: Array.from(String(l.icon || '⭐')).slice(0, 2).join(''), color: hex(l.color) ? l.color : '#a58bff', rule: String(l.rule || '').slice(0, 140), custom: !!l.custom });
    });
    const okSeq = q => Array.isArray(q) && q.length > 0 && q.length <= 16 && q.every(m => MV[m]);
    const conv = (arr, p) => (Array.isArray(arr) ? arr : []).filter(e => e && okSeq(e.seq) && map[e.labelId]).slice(0, 400).map(e => ({ id: p + (s.nid++), seq: e.seq.slice(), labelId: map[e.labelId] }));
    s.examples = conv(o.examples, 'e'); s.exam = conv(o.exam, 'x');
    s.tray = okSeq(o.tray) ? o.tray.slice() : (s.examples[0] ? s.examples[0].seq.slice() : []);
    s.brain = o.brain === 'knn' ? 'knn' : 'tree'; s.char = Ch.normalise(o.char);
    s.stage = ['club', 'space', 'sunset', 'forest', 'lab'].includes(o.stage) ? o.stage : 'club';
    return s;
  }
  function migrateV1(o) {
    const n = sanitize({
      labels: o.styles.map(x => ({ id: x.id, name: x.name, icon: '⭐', color: x.color })),
      examples: o.examples.map(e => ({ seq: e.seq, labelId: e.styleId })), exam: o.exam.map(e => ({ seq: e.seq, labelId: e.styleId })), tray: o.tray
    });
    if (n) n.examples.forEach(() => 0);
    return n && n.labels.length ? n : null;
  }
  function load() {
    try {
      const r = localStorage.getItem(KEY);
      if (r) {
        const o = JSON.parse(r);
        if (o && o.v === 2 && Array.isArray(o.labels) && Array.isArray(o.examples) && Array.isArray(o.exam) && Array.isArray(o.tray) && o.models) {
          const s = Object.assign(base(), o);
          s.char = Ch.normalise(o.char);
          ['tree', 'knn'].forEach(t => { const m = s.models[t]; if (m && m.type !== t) s.models[t] = null; });
          return s;
        }
      }
      const old = localStorage.getItem(OLDKEY);
      if (old) { const o = JSON.parse(old); if (o && Array.isArray(o.styles)) return migrateV1(o); }
    } catch (e) { /* ignore */ }
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }

  S = load();
  if (!S) { S = fresh(params.get('pack') && Pk.get(params.get('pack')) ? params.get('pack') : CFG.defaultPack); }
  if (params.get('brain') === 'knn' || params.get('brain') === 'tree') S.brain = params.get('brain');
  if (params.get('theme') === 'light' || params.get('theme') === 'dark') S.theme = params.get('theme');
  if (!CFG.showBrainChoice) S.brain = CFG.defaultBrain === 'knn' ? 'knn' : 'tree';
  if (!CFG.allowPhotos && S.char.head === 'photo') S.char.head = 'round';
  if (params.get('tab') && ['moves', 'labels', 'test', 'lab', 'me', 'project'].includes(params.get('tab'))) U.tab = params.get('tab');
  if (U.tab === 'lab' && !CFG.showLab) U.tab = 'moves';

  /* ---------- helpers ---------- */
  const $ = s => document.querySelector(s), el = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nm = id => (MV[id] ? MV[id].name : String(id));
  const icons = seq => seq.map(m => (MV[m] ? MV[m].icon : '?')).join('');
  const lab = id => S.labels.find(l => l.id === id);
  const key = s => s.join(',');
  const pct = x => Math.round(x * 100) + '%';
  const uid = p => p + (S.nid++);
  const model = () => S.models[S.brain];
  const status = t => { const m = S.models[t || S.brain]; return !m ? 'none' : (m.dsVersion === S.dsVersion ? 'current' : 'stale'); };
  const bname = t => BRAINS[t].name;
  function cinfo(id) {
    const l = lab(id); if (l) return { name: l.name, color: l.color, icon: l.icon };
    for (const t of ['tree', 'knn']) { const m = S.models[t], c = m && m.classes.find(c => c.id === id); if (c) return { name: c.name + ' (deleted)', color: c.color, icon: c.icon }; }
    return { name: 'Unknown label', color: '#888', icon: '?' };
  }
  const chipFor = c => `<span class="sty" style="--c:${esc(c.color)}"><span class="ico">${esc(c.icon || '')}</span>${esc(c.name)}</span>`;
  const chipOf = id => chipFor(cinfo(id));
  let toastT = 0;
  function toast(t) { const e = $('#toast'); e.textContent = JR ? t.replace(/\bexam\b/g, 'quiz').replace(/\bExam\b/g, 'Quiz') : t; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { e.hidden = true; }, 3800); }
  function badge(id) { if (!S.badges[id]) { S.badges[id] = 1; toast('Discovery unlocked: ' + BADGES[id][0] + '. ' + BADGES[id][1]); } }
  function conflicts() {
    const by = {}, out = {};
    S.examples.forEach(e => { (by[key(e.seq)] = by[key(e.seq)] || []).push(e); });
    Object.values(by).forEach(g => { const ids = new Set(g.map(e => e.labelId)); if (ids.size > 1) g.forEach(e => { out[e.id] = [...ids].filter(i => i !== e.labelId); }); });
    return out;
  }
  function dataChanged() {
    S.dsVersion++;
    if (Object.keys(conflicts()).length) badge('mixed');
    if (S.labels.some(l => l.custom && S.examples.filter(e => e.labelId === l.id).length >= 3)) badge('designer');
  }
  const maxMoves = () => CFG.maxMoves;

  /* ---------- sound ---------- */
  const Snd = {
    ctx: null,
    on() { if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
    note(id) {
      if (!S.sound || !this.ctx || !MV[id]) return;
      const i = MV[id].idx, steps = [0, 2, 4, 7, 9], semi = steps[i % 5] + 12 * (Math.floor(i / 5) % 3);
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(), t = this.ctx.currentTime;
      o.type = 'triangle'; o.frequency.value = 220 * Math.pow(2, semi / 12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.4);
    }
  };

  /* ---------- robot ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let token = 0;
  function renderRobot() {
    el('robot').innerHTML = Ch.svg(S.char, PFX);
    Ch.setPose(PFX, REST);
    $('#nametag').textContent = S.char.name;
    $('#stage').dataset.theme = S.stage;
  }
  const setGlow = c => document.documentElement.style.setProperty('--glow', c || (S.theme === 'light' ? '#e0307f' : '#ff58a8'));
  const showBubble = html => { $('#bubble').innerHTML = html ? `<div>${html}</div>` : ''; };
  async function perform(seq, opt) {
    opt = opt || {};
    const my = ++token, beat = opt.beat || BEAT[S.tempo] || 680;
    $('#stage').style.setProperty('--tt', Math.round(beat / 2 * 0.85) + 'ms');
    setGlow(null); showBubble('');
    for (let i = 0; i < seq.length; i++) {
      if (my !== token) return false;
      const mv = MV[seq[i]];
      if (opt.onStep) opt.onStep(i);
      $('#now').textContent = `Move ${i + 1} of ${seq.length}: ${mv.name}`;
      Snd.note(mv.id);
      Ch.setPose(PFX, mv.a); await sleep(beat / 2);
      if (my !== token) return false;
      Ch.setPose(PFX, mv.b); await sleep(beat / 2);
    }
    if (my !== token) return false;
    Ch.setPose(PFX, REST); if (opt.onStep) opt.onStep(-1);
    $('#now').textContent = 'Ready for a dance';
    return true;
  }
  const hlChip = i => document.querySelectorAll('#tray .chip').forEach((c, k) => c.classList.toggle('on', k === i));
  const preview = id => perform([id], { beat: 900 });

  /* ---------- header and tray ---------- */
  function renderHead() {
    document.documentElement.dataset.theme = S.theme;
    document.body.classList.toggle('jr', JR);
    $('#themeBtn').textContent = S.theme === 'dark' ? '☀️' : '🌙';
    $('#soundBtn').textContent = S.sound ? '🔊' : '🔇';
    $('#soundBtn').setAttribute('aria-pressed', String(S.sound));
    $('#soundBtn').classList.toggle('on', S.sound);
    const t = CFG.title.trim(), words = t.split(' ');
    document.title = t;
    $('#title').innerHTML = words.length > 3 ? `${esc(words.slice(0, -2).join(' '))} <span>${esc(words.slice(-2).join(' '))}</span>` : esc(t);
    const sw = $('#brainsw');
    sw.style.display = CFG.showBrainChoice ? '' : 'none';
    sw.innerHTML = Object.keys(BRAINS).map(k => `<button data-act="brain" data-id="${k}" aria-pressed="${S.brain === k}" title="${esc(BRAINS[k].blurb)}">${esc(BRAINS[k].name)}</button>`).join('');
    const st = status(), b = $('#brain'), m = model();
    b.className = 'brain ' + (st === 'current' ? 'ok' : st === 'stale' ? 'stale' : 'none');
    $('#brainTxt').textContent = JR
      ? (st === 'none' ? 'The robot has not learned anything yet. Teach it!' : st === 'current' ? `The robot has learned from ${m.nTrain} dances.` : 'The examples changed. Teach the robot again!')
      : (st === 'none' ? `${bname(S.brain)} is empty. Nothing learned yet.`
        : st === 'current' ? `Brain ${m.v} (${bname(S.brain)}) is up to date. It learned ${m.classes.length} labels from ${m.nTrain} dances.`
          : `Brain ${m.v} (${bname(S.brain)}) is out of date. The examples changed after it learned.`);
    const btn = $('#trainBtn'); btn.textContent = st === 'none' ? 'Teach the robot' : 'Teach the robot again';
    btn.classList.toggle('pulse', st !== 'current');
  }
  function renderTray() {
    const t = S.tray;
    const chips = t.length ? t.map((m, i) => `<button class="chip ${U.sel === i ? 'sel' : ''}" data-act="sel" data-i="${i}" aria-label="Move ${i + 1}: ${esc(nm(m))}"><i>${i + 1}</i><span class="ci">${MV[m].icon}</span><span class="cn">${esc(nm(m))}</span></button>`).join('')
      : '<div class="empty">No moves yet. Pick moves from the Moves tab to build a dance.</div>';
    let tools = '';
    if (U.sel != null && t[U.sel]) {
      tools = `<div class="tools"><button class="btn sm" data-act="left">Earlier</button><button class="btn sm" data-act="right">Later</button><button class="btn sm" data-act="repeat">Repeat</button><button class="btn sm" data-act="replace" ${U.replace ? 'style="border-color:var(--warn)"' : ''}>Replace</button><button class="btn sm" data-act="remove">Remove</button><button class="btn sm" data-act="done">Done</button>${U.replace ? '<span class="tip">Now pick a move to swap in.</span>' : '<span class="tip">New moves go after the selected one.</span>'}</div>`;
    }
    const teach = S.labels.length ? S.labels.map(l => `<button class="sty" style="--c:${esc(l.color)}" data-act="saveEx" data-id="${l.id}"><span class="ico">${esc(l.icon)}</span>${esc(l.name)}</button>`).join('') : '<span class="note">Design a label in the Labels tab first.</span>';
    $('#tray').innerHTML = `<div class="tray-head"><h2>Your dance</h2><small>${t.length}/${maxMoves()} moves</small></div><div class="chips">${chips}</div>${tools}
    <div class="row"><button class="btn" data-act="play">Play it</button><button class="btn" data-act="clear">Clear</button>
      <label class="note" for="tempo">Speed</label><select id="tempo" data-chg="tempo" aria-label="Dance speed">${['slow', 'normal', 'fast'].map(k => `<option value="${k}" ${S.tempo === k ? 'selected' : ''}>${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}</select></div>
    <div class="teach"><span>Save this dance as an example of:</span><div class="counts">${teach}</div></div>
    <div class="row"><button class="btn primary big" data-act="ask">Ask the robot which label this is</button></div>`;
  }
  function renderTabs() {
    const T = [['moves', 'Moves'], ['labels', 'Labels'], ['test', JR ? 'Try it' : 'Test']];
    if (CFG.showLab) T.push(['lab', 'Lab']);
    T.push(['me', 'My dancer'], ['project', JR ? 'Extras' : 'Project']);
    $('#tabs').innerHTML = T.map(([id, l]) => `<button class="tab" role="tab" aria-selected="${U.tab === id}" data-act="tab" data-id="${id}">${l}</button>`).join('');
  }

  /* ---------- panels ---------- */
  function pMoves() {
    const starterOnly = CFG.starterMovesOnly && !JR;
    const cats = JR ? [['starter', 'Starter moves'], ['all', 'More moves']] : starterOnly ? [['starter', 'Starter set']] : Mv.CATS;
    const cat = starterOnly ? 'starter' : (JR && U.cat !== 'all' ? 'starter' : U.cat);
    const list = M.filter(m => cat === 'all' || (cat === 'starter' ? Mv.STARTERS.has(m.id) : m.cat === cat));
    return `<p class="hint">${JR ? 'Tap a move to add it to your dance. Tap the little ▶ to preview a move first.' : `Tap a move to add it to your dance. The small play button shows the move without adding it. There are ${starterOnly ? Mv.STARTERS.size : M.length} moves to choose from.`}</p>
    <div class="cats">${cats.map(([id, l]) => `<button class="cat" aria-pressed="${cat === id}" data-act="cat" data-id="${id}">${l}</button>`).join('')}</div>
    <div class="moves">${list.map(m => `<div class="tile" style="--c:${Mv.CATC[m.cat]}"><button class="tb" data-act="pick" data-id="${m.id}"><span class="ti">${m.icon}</span><span class="tn">${esc(m.name)}</span></button><button class="tp" data-act="look" data-id="${m.id}" aria-label="Preview ${esc(m.name)}">▶</button></div>`).join('')}</div>`;
  }
  function designer() {
    const e = U.edit; if (!e) return '';
    const sw = Pk.PALETTE.map(c => `<button class="sw ${e.color === c ? 'on' : ''}" style="--c:${c}" data-act="edColor" data-id="${c}" aria-label="Colour ${c}" aria-pressed="${e.color === c}"></button>`).join('');
    const em = Pk.EMOJI.map(x => `<button class="em ${e.icon === x ? 'on' : ''}" data-act="edIcon" data-id="${x}" aria-pressed="${e.icon === x}" aria-label="Badge ${x}">${x}</button>`).join('');
    return `<div class="card designer"><h3>${e.id ? 'Edit this label' : 'Design a new label'}</h3>
      <div class="fld"><label for="lbName">Name</label><input id="lbName" maxlength="24" value="${esc(e.name)}" placeholder="Lava Dance" autocomplete="off"></div>
      <div class="fld"><span>Badge</span><div class="emojis">${em}</div><div class="own"><label for="lbIcon" class="note">or type your own emoji</label><input id="lbIcon" value="${esc(e.icon)}" autocomplete="off"></div></div>
      <div class="fld"><span>Colour</span><div class="swatches">${sw}<input type="color" id="lbColor" value="${esc(e.color)}" aria-label="Pick any colour"></div></div>
      <div class="fld"><label for="lbRule">Our clue (what makes this label different?)</label><input id="lbRule" maxlength="120" value="${esc(e.rule)}" placeholder="Lots of jumping and arms in the air" autocomplete="off"></div>
      <div class="preview">Preview: <span id="lbPreview">${chipFor(e)}</span></div>
      <div class="row" style="margin-top:0"><button class="btn primary" data-act="edSave">${e.id ? 'Save changes' : 'Add label'}</button><button class="btn" data-act="edCancel">Cancel</button></div></div>`;
  }
  function pLabels() {
    const cf = conflicts();
    const cards = S.labels.map(s => {
      const ex = S.examples.filter(e => e.labelId === s.id);
      const conf = U.delLabel === s.id ? `<div class="confirm">Delete ${esc(s.name)} and its ${ex.length} example${ex.length === 1 ? '' : 's'}? <button class="btn sm" data-act="delYes" data-id="${s.id}">Yes, delete</button><button class="btn sm" data-act="delNo">Keep it</button></div>` : '';
      const rows = ex.map(e => `<div class="ex"><span class="ic" title="${esc(e.seq.map(nm).join(', '))}">${icons(e.seq)}</span><button class="btn sm" data-act="exPlay" data-id="${e.id}" aria-label="Play example">Play</button><select data-chg="reassign" data-id="${e.id}" aria-label="Label of this example">${S.labels.map(o => `<option value="${o.id}" ${o.id === s.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select><button class="btn sm" data-act="exDel" data-id="${e.id}" aria-label="Remove example">Remove</button>${cf[e.id] ? `<span class="flag">The same dance is also labelled ${cf[e.id].map(i => esc(cinfo(i).name)).join(', ')}. One dance with two answers makes the robot's job ambiguous.</span>` : ''}</div>`).join('');
      return `<div class="card scard" style="--c:${esc(s.color)}"><div class="shead"><div class="id"><span class="badgeico">${esc(s.icon)}</span><div><h3>${esc(s.name)}</h3><small>${ex.length} example${ex.length === 1 ? '' : 's'}</small></div></div>
        <div class="acts"><button class="btn sm" data-act="showStyle" data-id="${s.id}" ${ex.length ? '' : 'disabled'}>Show style</button><button class="btn sm" data-act="saveEx" data-id="${s.id}">Add my dance</button><button class="btn sm" data-act="edStart" data-id="${s.id}">Edit</button><button class="btn sm" data-act="delAsk" data-id="${s.id}">Delete</button></div></div>
        ${s.rule ? `<p class="clue">Our clue: ${esc(s.rule)}</p>` : ''}${conf}
        ${ex.length ? rows : '<p class="note">No examples yet. The robot cannot learn this label until it has at least one dance to study. Build a dance, then press Add my dance.</p>'}
        ${ex.length > 0 && ex.length < 3 ? '<p class="note">Tip: three or four different examples give the robot something to compare.</p>' : ''}</div>`;
    }).join('');
    const canAdd = S.labels.length < CFG.maxLabels;
    return `<p class="hint">You design the labels. Give each one a name, a badge, a colour and a clue, then fill it with example dances. Changing examples does not change what the robot already learned until you teach it again.</p>
    ${U.edit ? designer() : `<div class="row" style="margin-top:0"><button class="btn primary" data-act="edStart" ${canAdd ? '' : 'disabled'}>Design a new label</button>${canAdd ? '' : `<span class="note">That is the most labels for now: ${CFG.maxLabels}.</span>`}</div>`}
    ${cards || '<p class="note">No labels yet. Design your first one above, or load a pack from the Project tab.</p>'}`;
  }
  function nbHtml(L, simple) {
    const info = L.info;
    return info.neighbours.map(n => `<div class="nb"><span class="ic">${icons(n.seq)}</span>${chipOf(n.cls)}${simple ? '' : `<div class="bar" style="--c:${esc(cinfo(n.cls).color)}"><u style="width:${Math.round(n.sim * 100)}%"></u></div><span>${pct(n.sim)} alike</span>`}</div>`).join('');
  }
  function explain(L) {
    const info = L.info;
    let body = '';
    if (L.type === 'tree') {
      const steps = info.path.length ? info.path.map(p => `<div>Does it ${esc(ML.phrase(p.f, p.thr, nm))}? <b class="${p.yes ? 'y' : 'n'}">${p.yes ? 'Yes' : 'No'}</b></div>`).join('') : '<div>All my training dances had one label, so I had no questions to ask.</div>';
      const counts = Object.entries(info.counts).map(([id, n]) => `<span class="sty" style="--c:${esc(cinfo(id).color)}"><span class="ico">${esc(cinfo(id).icon)}</span>${n} ${esc(cinfo(id).name)}</span>`).join('');
      body = `<div class="steps">${steps}</div><p class="note">I landed in a group of ${info.n} training dance${info.n === 1 ? '' : 's'}:</p><div class="counts">${counts}</div>`;
      if (L.tie) body += '<p class="note">It was a tie in this group, so my pick is close to a coin flip.</p>';
      else if (info.n < 3) body += `<p class="note">Only ${info.n} training dance${info.n === 1 ? '' : 's'} back this guess. That is thin evidence.</p>`;
    } else if (JR) {
      body = `<p class="note">Your dance looks most like these dances I studied, so I copied their label:</p><div class="res">${nbHtml(L, true)}</div>`;
    } else {
      const votes = Object.entries(info.counts).map(([id, n]) => `${n} for ${esc(cinfo(id).name)}`).join(', ');
      body = `<p class="note">These are the ${info.neighbours.length} dances I studied that look most like yours. Each one gets a vote.</p><div class="res">${nbHtml(L)}</div><p class="note">Votes: ${votes}.</p>`;
      if (L.tie) body += '<p class="note">The vote was tied, so my pick is close to a coin flip.</p>';
      if (info.bestSim < 0.2) body += '<p class="note">Nothing I studied looks much like this dance, so I am mostly guessing.</p>';
    }
    if (L.unseen.length) body += `<p class="note">I never saw ${L.unseen.map(i => esc(nm(i))).join(', ')} in training, so I could not learn anything about ${L.unseen.length === 1 ? 'it' : 'them'}.</p>`;
    return body;
  }
  function confusion(rows) {
    const ids = [...new Set(rows.map(r => r.want).concat(rows.map(r => r.got)))];
    const cell = (w, g) => rows.filter(r => r.want === w && r.got === g).length;
    const th = ids.map(i => `<th title="${esc(cinfo(i).name)}">${esc(cinfo(i).icon)}</th>`).join('');
    const tr = ids.map(w => `<tr><th scope="row" title="${esc(cinfo(w).name)}">${esc(cinfo(w).icon)}</th>${ids.map(g => { const n = cell(w, g); return `<td class="${n ? (w === g ? 'd' : 'x') : ''}">${n || ''}</td>`; }).join('')}</tr>`).join('');
    return `<p class="note">Mix-up table. Down the side is what you meant. Across the top is what the robot guessed. Green is right, red is a mix-up.</p><div style="overflow-x:auto"><table class="cm"><thead><tr><th></th>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  }
  function pTest() {
    const L = S.last;
    let free;
    if (!L) free = '<p class="note">Build a dance, then press "Ask the robot which label this is". The reasoning appears here.</p>';
    else {
      const reveal = L.intended == null
        ? `<p class="note">What did you mean it to be?</p><div class="counts">${S.labels.map(s => `<button class="sty" style="--c:${esc(s.color)}" data-act="reveal" data-id="${s.id}"><span class="ico">${esc(s.icon)}</span>${esc(s.name)}</button>`).join('')}</div>`
        : `<div class="verdict">${L.intended === L.cls ? '<span class="ok-t">The robot got it.</span>' : `<span class="no-t">A mistake. You meant</span> ${chipOf(L.intended)}`}</div>${L.intended !== L.cls ? '<div class="row"><button class="btn sm" data-act="lastToTrain">Add as a training example</button><button class="btn sm" data-act="lastToExam">Save to the exam</button></div><p class="note">Adding an example does not teach the robot until you press Teach the robot again.</p>' : ''}`;
      free = `<div class="verdict"><span style="font-size:22px">${icons(L.seq)}</span></div>
      <div class="verdict"><b>My guess:</b> ${chipOf(L.cls)} ${JR ? '' : `<span class="note">${pct(L.conf)} sure</span>`}</div>
      ${JR ? (L.stale ? '<p class="note">My brain was out of date when I guessed. Teach me again so I learn the new examples!</p>' : '') : `<p class="note">Made by Brain ${L.mv} (${bname(L.type)})${L.stale ? ', which was already out of date when I guessed' : ''}.</p>`}${explain(L)}${reveal}`;
    }
    const log = !JR && S.log.length ? `<p class="note">Recent guesses</p><div class="res">${S.log.slice(0, 6).map(l => `<div class="r"><span class="ic">${icons(l.seq)}</span>${chipOf(l.cls)}${l.intended != null ? (l.intended === l.cls ? '<span class="ok-t">right</span>' : '<span class="no-t">wrong</span>') : '<span class="note">not revealed</span>'}</div>`).join('')}</div>` : '';
    const inTrain = n => S.examples.some(e => key(e.seq) === key(n.seq));
    const items = S.exam.map(x => `<div class="r"><span class="ic">${icons(x.seq)}</span>${lab(x.labelId) ? chipOf(x.labelId) : '<span class="note">label deleted, not scored</span>'}<button class="btn sm" data-act="examPlay" data-id="${x.id}">Play</button><button class="btn sm" data-act="examToTrain" data-id="${x.id}">Use for training</button><button class="btn sm" data-act="examDel" data-id="${x.id}">Remove</button>${inTrain(x) ? '<span class="flag">Also in the training examples, so this is not a fair test.</span>' : ''}</div>`).join('');
    let results = '';
    const le = S.lastExam;
    if (le) {
      const cur = le.exam === S.examVersion;
      results = `<h3 style="font-size:18px">${JR ? `Quiz score: ${le.correct} out of ${le.total}` : `Latest result: Brain ${le.mv} (${bname(le.type)}), ${le.correct} of ${le.total} correct`}</h3>${cur ? '' : '<p class="warnbox">The exam has changed since this result.</p>'}
      <div class="res">${le.rows.map(r => `<div class="r"><span class="ic">${icons(r.seq)}</span><span class="note">meant</span>${chipOf(r.want)}<span class="note">guessed</span>${chipOf(r.got)}${r.ok ? '<span class="ok-t">right</span>' : '<span class="no-t">wrong</span>'}</div>`).join('')}</div>${JR ? '' : confusion(le.rows)}`;
    }
    const groups = {};
    S.history.forEach(h => Object.keys(h.scores).forEach(ev => { (groups[ev] = groups[ev] || []).push({ h, sc: h.scores[ev] }); }));
    const gk = Object.keys(groups).map(Number).sort((a, b) => b - a);
    const hist = gk.length ? gk.map(ev => {
      const rows = groups[ev].sort((a, b) => a.h.v - b.h.v);
      return `<div class="card" style="background:var(--panel-2)"><b>Exam ${ev}</b> <span class="note">${ev === S.examVersion ? 'current exam. Scores below use the same questions, so they can be compared.' : 'an older exam. Do not compare these with the current one.'}</span>${rows.map((r, i) => {
        const f = r.sc.correct / r.sc.total, d = i ? r.sc.correct - rows[i - 1].sc.correct : null;
        return `<div class="hrow"><b style="min-width:80px">Brain ${r.h.v}</b><span class="note">${bname(r.h.type)}, ${r.h.nTrain} dances</span><div class="bar" style="--c:var(--good)"><u style="width:${f * 100}%"></u></div><span>${r.sc.correct}/${r.sc.total}</span>${d == null ? '' : `<span class="${d > 0 ? 'ok-t' : d < 0 ? 'no-t' : 'note'}">${d > 0 ? '+' : ''}${d} vs Brain ${rows[i - 1].h.v}</span>`}</div>`;
      }).join('')}</div>`;
    }).join('') : '';
    const add = S.labels.length ? `<span class="note">Add your current dance to the exam as:</span><div class="counts">${S.labels.map(s => `<button class="sty" style="--c:${esc(s.color)}" data-act="examAdd" data-id="${s.id}"><span class="ico">${esc(s.icon)}</span>${esc(s.name)}</button>`).join('')}</div>` : '';
    return `<div class="card sec"><h3>${JR ? 'Try it out' : 'Free play'}</h3><p class="hint">${JR ? 'Make any dance and see what the robot thinks. Then tell it what you meant.' : 'Invent any dance and see what the robot makes of it. You choose when to reveal what you meant.'}</p>${free}${log}</div>
    <div class="card sec"><h3>${JR ? 'Robot quiz' : 'Fair exam'}</h3><p class="hint">${JR ? 'Test the robot on dances it has never studied. If the quiz used dances it already learned, that would be cheating!' : 'To tell whether a change really helped, score every brain on the same set of dances that were never used for training. These dances stay out of training unless you move them in yourself.'}</p>
    ${items || '<p class="note">The exam is empty.</p>'}${add}
    <div class="row"><button class="btn primary" data-act="runExam">${JR ? 'Run the exam' : `Run the exam on the current brain (${esc(bname(S.brain))})`}</button></div>${results}${JR ? '' : hist}</div>`;
  }
  function tr(node, d, on, path) {
    if (node.leaf) {
      const c = cinfo(node.cls), ct = Object.entries(node.counts).map(([id, n]) => `${n} ${cinfo(id).name}`).join(', ');
      return `<div class="leaf ${on ? 'hl' : ''}" style="--c:${esc(c.color)}"><b>${esc(c.icon)} ${esc(c.name)}</b><span>${esc(ct)}</span></div>`;
    }
    const st = on && path ? path[d] : null;
    return `<div class="node ${on ? 'hl' : ''}"><div class="q">Does it ${esc(ML.phrase(node.f, node.thr, nm))}?</div><div class="br"><div class="yes ${st && st.yes ? 'go' : ''}"><em>Yes</em>${tr(node.yes, d + 1, !!(st && st.yes), path)}</div><div class="no ${st && !st.yes ? 'go' : ''}"><em>No</em>${tr(node.no, d + 1, !!(st && !st.yes), path)}</div></div></div>`;
  }
  function meanings(m) {
    return m.classes.map(c => {
      const l = lab(c.id), info = cinfo(c.id);
      let robot;
      if (m.type === 'tree') {
        const ps = ML.leafPaths(m.tree, c.id).sort((a, b) => b.n - a.n).slice(0, 3);
        robot = ps.length ? '<ul>' + ps.map(p => { const t = p.steps.length ? p.steps.map(s => (s.yes ? ML.phrase(s.f, s.thr, nm) : ML.phraseNeg(s.f, s.thr, nm))).join(' and ') : 'are anything at all'; return `<li>Dances that ${esc(t)}</li>`; }).join('') + '</ul>' : '<p class="note">No group of dances ended with this label.</p>';
      } else {
        const mine = m.items.filter(it => it.cls === c.id), cnt = {}, bg = {};
        mine.forEach(it => it.seq.forEach((x, i) => { cnt[x] = (cnt[x] || 0) + 1; if (i < it.seq.length - 1) { const k = x + '>' + it.seq[i + 1]; bg[k] = (bg[k] || 0) + 1; } }));
        const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => nm(x)).join(', ');
        const tb = Object.entries(bg).sort((a, b) => b[1] - a[1])[0];
        robot = `<p>Its dances use these moves most: ${esc(top || 'none')}.${tb ? ` Common pair: ${esc(nm(tb[0].split('>')[0]))} then ${esc(nm(tb[0].split('>')[1]))}.` : ''}</p>`;
      }
      return `<div class="m">${chipFor(info)}${l && l.rule ? `<p class="clue">Your clue: ${esc(l.rule)}</p>` : ''}<div>What the robot noticed:${robot}</div></div>`;
    }).join('');
  }
  function pLab() {
    const m = model(), info = BRAINS[S.brain];
    let brain = `<p class="note">Teach the ${esc(info.name)} first and its learned map appears here.</p>`;
    if (m) {
      const stale = status() === 'stale' ? `<p class="warnbox">This is Brain ${m.v}. Your examples have changed since, so teach the robot again to see a new map.</p>` : '';
      if (m.type === 'tree') {
        const path = S.last && S.last.mv === m.v && S.last.type === 'tree' ? S.last.info.path : null;
        brain = `<p class="hint">These are the questions the robot learned to ask. Each end box shows how many training dances landed there.${path ? ' The pink route is your latest guess.' : ''}</p><div class="tree">${tr(m.tree, 0, !!path, path)}</div>${stale}`;
      } else {
        const nbs = S.last && S.last.mv === m.v && S.last.type === 'knn' ? `<p class="note">Your latest guess:</p><div class="res">${nbHtml(S.last)}</div>` : '<p class="note">Ask the robot about a dance and its nearest look-alikes show up here.</p>';
        brain = `<p class="hint">The Look-alike finder has no questions to show. It stores all ${m.nTrain} dances and, for a new one, finds the ${m.k} most similar by comparing moves, neighbouring pairs, first move and last move.</p>${nbs}${stale}`;
      }
    }
    const feats = S.tray.length ? `<div class="feat">${ML.features(S.tray, nm).map(f => `<span>${esc(f)}</span>`).join('')}</div><p class="note">This list is all either brain sees of your dance. It keeps counts, neighbouring pairs, the first move and the last move. It cannot see how far apart two moves are, so some patterns are invisible to it.</p>` : '<p class="note">Build a dance to see how the robot describes it.</p>';
    let ord = '';
    if (S.order) {
      const o = S.order;
      ord = `<div class="res"><div class="r"><span class="ic">${icons(o.a)}</span>${chipOf(o.ca)}</div><div class="r"><span class="ic">${icons(o.b)}</span>${chipOf(o.cb)}</div></div><p class="note">${o.ca === o.cb ? 'Same answer for both orders. For this dance the order did not matter to the robot.' : 'Different answers. Order matters here, because the robot looks at which moves come straight after which.'}</p>`;
    }
    const cnt = S.labels.map(s => ({ s, n: S.examples.filter(e => e.labelId === s.id).length }));
    const mx = Math.max(1, ...cnt.map(c => c.n)), nz = cnt.filter(c => c.n > 0).map(c => c.n);
    const unbal = nz.length > 1 && Math.max(...nz) / Math.min(...nz) >= 2;
    const bal = `${cnt.map(c => `<div class="hrow"><b style="min-width:150px;font-weight:500">${esc(c.s.icon)} ${esc(c.s.name)}</b><div class="bar" style="--c:${esc(c.s.color)}"><u style="width:${c.n / mx * 100}%"></u></div><span>${c.n}</span></div>`).join('')}<p class="note">${unbal ? 'Some labels have at least twice as many examples as others. The robot may lean towards the biggest label.' : 'The labels have a similar number of examples.'}</p>`;
    let over = '<p class="note">Teach the robot, then run the exam on the Test tab to compare.</p>';
    if (m) {
      const h = S.history.find(h => h.v === m.v), sc = h && h.scores[S.examVersion];
      over = `<div class="hrow"><b style="min-width:170px;font-weight:500">Dances it studied</b><div class="bar" style="--c:var(--good)"><u style="width:${m.trainAcc * 100}%"></u></div><span>${pct(m.trainAcc)}</span></div>` +
        (sc ? `<div class="hrow"><b style="min-width:170px;font-weight:500">Unseen exam dances</b><div class="bar" style="--c:var(--warn)"><u style="width:${sc.correct / sc.total * 100}%"></u></div><span>${pct(sc.correct / sc.total)}</span></div><p class="note">${m.trainAcc - sc.correct / sc.total >= 0.25 ? 'Big gap. The robot may have memorised its examples more than it learned a pattern.' : 'The two scores are close, so the robot is handling new dances about as well as old ones.'}</p>` : '<p class="note">Run the exam on this brain to see how it does on dances it never studied.</p>');
    }
    const cmp = ['tree', 'knn'].map(t => {
      const mm = S.models[t], h = mm && S.history.find(h => h.v === mm.v), sc = h && h.scores[S.examVersion];
      return `<div class="hrow"><b style="min-width:150px;font-weight:500">${esc(bname(t))}</b>${!mm ? '<span class="note">not taught yet</span>' : sc ? `<div class="bar" style="--c:var(--good)"><u style="width:${sc.correct / sc.total * 100}%"></u></div><span>${sc.correct}/${sc.total} on the current exam</span>` : '<span class="note">taught, but not scored on the current exam</span>'}</div>`;
    }).join('');
    return `<div class="card sec"><h3>The robot's brain: ${esc(info.name)}</h3><p class="note">${esc(info.blurb)}</p>${brain}</div>
    ${m ? `<div class="card sec"><h3>What the robot thinks each label means</h3><p class="hint">Compare this with your own clues. Did the robot find the rule you had in mind, or a different one?</p><div class="meaning">${meanings(m)}</div></div>` : ''}
    <div class="card sec"><h3>How the robot sees your dance</h3>${feats}</div>
    <div class="card sec"><h3>Does order matter?</h3><p class="hint">Ask about your dance, then the same moves backwards.</p><div class="row" style="margin:0"><button class="btn" data-act="orderTest">Compare with reversed</button></div>${ord}</div>
    <div class="card sec"><h3>Is the data balanced?</h3>${bal}</div>
    <div class="card sec"><h3>Studied or understood?</h3>${over}</div>
    <div class="card sec"><h3>Brain battle</h3><p class="hint">Teach each brain and run the exam on both to compare them fairly.</p>${cmp}</div>
    <div class="card sec"><h3>Experiments to try</h3><div class="exps">${EXPERIMENTS.map(e => `<div class="exp"><b>${e[0]}</b><small>${e[1]}</small><p>${e[2]}</p></div>`).join('')}</div></div>
    <div class="card sec"><h3>Discoveries</h3><div class="badges">${Object.entries(BADGES).map(([k, v]) => `<div class="badge ${S.badges[k] ? 'got' : ''}"><b>${v[0]}</b>${v[1]}</div>`).join('')}</div></div>`;
  }
  function pMe() {
    const c = S.char, O = Ch.OPTIONS;
    const grp = (title, k, opts) => `<div class="fld"><span>${title}</span><div class="opts">${opts.filter(o => k !== 'head' || o[0] !== 'photo' || CFG.allowPhotos).map(([v, l]) => `<button class="cat" aria-pressed="${c[k] === v}" data-act="ch" data-k="${k}" data-id="${v}">${l}</button>`).join('')}</div></div>`;
    const col = (title, k) => `<div class="fld"><span>${title}</span><div class="swatches">${Ch.PALETTE.map(p => `<button class="sw ${c[k] === p ? 'on' : ''}" style="--c:${p}" data-act="ch" data-k="${k}" data-id="${p}" aria-label="${title} ${p}" aria-pressed="${c[k] === p}"></button>`).join('')}<input type="color" data-chg="chcolor" data-k="${k}" value="${esc(c[k])}" aria-label="Pick any ${title.toLowerCase()}"></div></div>`;
    const tog = (title, k) => `<button class="cat" aria-pressed="${!!c[k]}" data-act="chtog" data-k="${k}">${title}</button>`;
    const emoji = c.head === 'emoji' ? `<div class="fld"><span>Head emoji</span><div class="emojis">${Ch.HEAD_EMOJI.map(x => `<button class="em ${c.emoji === x ? 'on' : ''}" data-act="chEmoji" data-id="${x}" aria-label="Emoji ${x}">${x}</button>`).join('')}</div><div class="own"><label class="note" for="chEmoji">or type your own</label><input id="chEmoji" value="${esc(c.emoji)}" autocomplete="off"></div></div>` : '';
    const photo = c.head === 'photo' && CFG.allowPhotos ? `<div class="fld"><span>Your picture</span><input type="file" id="chPhoto" accept="image/*" data-chg="photo" aria-label="Choose a picture or drawing for the head"><p class="note">Draw a character on paper, take a photo of it, and use it as the head. The picture is shrunk and kept only on this device.</p>${c.photo ? '<div class="row" style="margin:0"><button class="btn sm" data-act="chPhotoClear">Remove picture</button></div>' : ''}</div>` : '';
    return `<p class="hint">Make a dancer that is all yours. Every change shows on the stage straight away, and your character can do every move.</p>
    <div class="card sec"><h3>Start from a character</h3><div class="presets">${Ch.PRESETS.map((p, i) => `<button class="btn sm" data-act="preset" data-id="${i}">${esc(p.head === 'emoji' ? p.emoji : '')} ${esc(p.name)}</button>`).join('')}<button class="btn sm" data-act="randomChar">🎲 Surprise me</button></div></div>
    <div class="card sec"><h3>Design your dancer</h3>
      <div class="fld"><label for="chName">Name</label><input id="chName" maxlength="18" value="${esc(c.name)}" autocomplete="off"></div>
      ${grp('Head', 'head', O.head)}${emoji}${photo}${grp('Body', 'body', O.body)}${grp('Arms and legs', 'limbs', O.limbs)}
      ${c.head !== 'emoji' && c.head !== 'photo' ? grp('Eyes', 'face', O.face) + grp('Mouth', 'mouth', O.mouth) : ''}
      ${grp('Hat', 'hat', O.hat)}${grp('Chest', 'belly', O.belly)}
      <div class="fld"><span>Extras</span><div class="opts">${tog('Glasses', 'glasses')}${tog('Headphones', 'headphones')}${tog('Cape', 'cape')}</div></div>
      ${col('Body colour', 'main')}${col('Limb colour', 'limb')}${col('Accent colour', 'accent')}
      <div class="row" style="margin-top:0"><button class="btn" data-act="tryMove">Show me a dance move</button></div></div>
    <div class="card sec"><h3>Stage</h3><div class="opts">${[['club', 'Dance club'], ['space', 'Outer space'], ['sunset', 'Sunset'], ['forest', 'Forest'], ['lab', 'Bright lab']].map(([v, l]) => `<button class="cat" aria-pressed="${S.stage === v}" data-act="stage" data-id="${v}">${l}</button>`).join('')}</div></div>`;
  }
  function badgesCard() {
    return `<div class="card sec"><h3>My stickers</h3><div class="badges">${Object.entries(BADGES).map(([k, v]) => `<div class="badge ${S.badges[k] ? 'got' : ''}"><b>${v[0]}</b>${v[1]}</div>`).join('')}</div></div>`;
  }
  function pProject() {
    const confirm = U.confirm;
    const packs = Pk.filter(p => !p.hidden).map(p => {
      const ask = confirm === 'pack:' + p.id;
      return `<div class="pack"><span class="pi">${p.icon}</span><b>${esc(p.name)}</b><p>${esc(p.blurb)}</p>${p.labels.length ? `<div class="counts">${p.labels.map(l => `<span class="sty" style="--c:${esc(l.color)}"><span class="ico">${esc(l.icon)}</span>${esc(l.name)}</span>`).join('')}</div>` : ''}
        ${ask ? `<div class="confirm">Replace your labels and examples with this pack? <button class="btn sm" data-act="packYes" data-id="${p.id}">Yes, load it</button><button class="btn sm" data-act="confirmNo">Keep mine</button></div>` : `<button class="btn sm" data-act="packAsk" data-id="${p.id}">Load this pack</button>`}</div>`;
    }).join('');
    const reset = confirm === 'reset' ? '<div class="confirm">Start again from the beginning? This clears your labels, examples, exam and dancer. <button class="btn sm" data-act="resetYes">Yes, start fresh</button><button class="btn sm" data-act="confirmNo">Keep everything</button></div>' : '<button class="btn sm" data-act="resetAsk">Start again from scratch</button>';
    return `<div class="card sec"><h3>Label packs</h3><p class="hint">A pack gives you ready-made labels with examples and a fair exam. Load one and then change anything you like, or pick Blank slate and invent every label yourself.</p><div class="packs">${packs}</div></div>
    <div class="card sec"><h3>Save and share</h3><p class="hint">Save your labels, examples, exam and dancer as a file. Open it later, on another computer, or send it to a friend. The robot's brain is not saved, so teach it again after opening.</p>
      <div class="row" style="margin-top:0"><button class="btn" data-act="exportP">Save project file</button><label class="btn" for="projFile" style="cursor:pointer">Open project file</label><input type="file" id="projFile" accept=".json,application/json" data-chg="import" style="position:absolute;left:-9999px" aria-label="Open a project file"></div></div>
    <div class="card sec teachers"><h3>For teachers</h3><p class="hint">Settings live in <code>js/config.js</code>. A printable worksheet is in <a href="teacher/worksheet-junior.html" target="_blank" rel="noopener">teacher/worksheet.html</a> and the lesson guide is in the teacher folder. You can also link straight to a setup, for example <code>?pack=moods&amp;brain=knn&amp;theme=light</code>.</p></div>
    ${JR ? badgesCard() : ''}
    <div class="card sec"><h3>Other</h3><div class="row" style="margin-top:0">${reset}</div></div>`;
  }
  function renderPanel() {
    const p = $('#panel'), f = { moves: pMoves, labels: pLabels, test: pTest, lab: pLab, me: pMe, project: pProject }[U.tab] || pMoves;
    let h = f();
    if (JR && U.tab === 'test') h = h.replace(/\bexam\b/g, 'quiz').replace(/\bExam\b/g, 'Quiz');
    p.innerHTML = h;
    if (U.tab === 'labels' && U.edit && U.edit.fresh) { const i = el('lbName'); if (i) { i.focus(); U.edit.fresh = false; } }
  }
  function render() { renderHead(); renderTray(); renderTabs(); renderPanel(); save(); runHooks(); }

  /* ---------- label designer plumbing ---------- */
  const clip = (v, n) => Array.from(v).slice(0, n).join('');
  function syncEdit() {
    const e = U.edit; if (!e) return;
    const n = el('lbName'), r = el('lbRule'), i = el('lbIcon'), c = el('lbColor');
    if (n) e.name = n.value; if (r) e.rule = r.value;
    if (i && i.value.trim()) e.icon = clip(i.value.trim(), 2);
    if (c && hex(c.value)) e.color = c.value;
  }
  function updatePreview() { const p = el('lbPreview'); if (p && U.edit) p.innerHTML = chipFor({ name: U.edit.name || 'Your label', icon: U.edit.icon, color: U.edit.color }); }

  /* ---------- actions ---------- */
  function train() {
    const type = S.brain;
    const order = S.labels.filter(l => S.examples.some(e => e.labelId === l.id)).map(l => l.id);
    if (order.length < 2) { toast('Give at least two labels one dance each, then teach the robot.'); return; }
    const rows = S.examples.filter(e => order.includes(e.labelId)).map(e => ({ seq: e.seq, cls: e.labelId }));
    const m = ML.train(type, rows, order, { k: S.k });
    const v = S.nmodel++;
    Object.assign(m, {
      v, classes: order.map(id => { const l = lab(id); return { id, name: l.name, color: l.color, icon: l.icon }; }),
      dsVersion: S.dsVersion, nTrain: rows.length, trainAcc: ML.evaluate(m, rows), vocab: [...new Set(rows.flatMap(r => r.seq))]
    });
    S.models[type] = m;
    S.history.push({ v, type, dsVersion: S.dsVersion, nTrain: rows.length, trainAcc: m.trainAcc, scores: {} });
    badge('first');
    const svg = el('robot'); svg.classList.add('thinking'); token++; Ch.setPose(PFX, REST); setGlow(null);
    showBubble('Thinking…'); $('#now').textContent = 'Learning from ' + rows.length + ' dances';
    render();
    setTimeout(() => { svg.classList.remove('thinking'); showBubble(`I learned ${order.length} labels from ${rows.length} dances.`); $('#now').textContent = 'Ready for a dance'; }, 900);
  }
  function ask() {
    const m = model();
    if (!m) { toast(`The ${bname(S.brain)} has not learned anything yet. Press Teach the robot first.`); return; }
    if (!S.tray.length) { toast('Build a dance first.'); return; }
    const seq = [...S.tray], p = ML.predict(m, seq), stale = status() === 'stale';
    if (stale) badge('stale');
    const vocab = new Set(m.vocab), unseen = [...new Set(seq.filter(x => !vocab.has(x)))], id = S.nid++;
    const info = m.type === 'tree' ? { path: p.path, counts: p.counts, n: p.n } : { neighbours: p.neighbours, counts: p.counts, bestSim: p.bestSim };
    S.last = { id, seq, cls: p.cls, type: m.type, mv: m.v, conf: p.conf, tie: p.tie, stale, unseen, intended: null, info };
    S.log.unshift({ id, seq, cls: p.cls, intended: null }); S.log = S.log.slice(0, 8);
    render();
    const c = cinfo(p.cls);
    perform(seq, { onStep: hlChip }).then(ok => {
      if (!ok) return;
      setGlow(c.color);
      showBubble(`<span class="dot" style="--c:${esc(c.color)}"></span>I guess <b>${esc(c.icon)} ${esc(c.name)}</b><button data-act="tab" data-id="test">Why?</button>`);
    });
  }
  function addEx(labelId) {
    if (S.tray.length < 2) { toast('A dance needs at least two moves.'); return; }
    S.examples.push({ id: uid('e'), seq: [...S.tray], labelId });
    dataChanged();
    toast(`Added to ${lab(labelId).name}. The robot only learns it after you teach it again.`);
    render();
  }
  function scoreExam() {
    const m = model();
    if (!m) { toast(`Teach the ${bname(S.brain)} first.`); return; }
    const items = S.exam.filter(x => lab(x.labelId));
    if (!items.length) { toast('Add dances to the exam first.'); return; }
    const rows = items.map(x => { const g = ML.predict(m, x.seq).cls; return { seq: x.seq, want: x.labelId, got: g, ok: g === x.labelId }; });
    const correct = rows.filter(r => r.ok).length;
    S.lastExam = { mv: m.v, type: m.type, exam: S.examVersion, correct, total: rows.length, rows };
    const h = S.history.find(h => h.v === m.v);
    if (h) h.scores[S.examVersion] = { correct, total: rows.length };
    const sc = S.history.filter(h => h.scores[S.examVersion]);
    if (new Set(sc.map(h => h.v)).size >= 2) badge('fair');
    if (new Set(sc.map(h => h.type)).size >= 2) badge('rival');
    if (status() === 'stale') toast('This scored the old brain. The examples have changed since it learned.');
    render();
  }
  function download(name, text) {
    const a = document.createElement('a'), u = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  function charChanged(full) {
    renderRobot();
    if (S.char.photo || S.char.head !== Ch.PRESETS[0].head || S.char.body !== Ch.PRESETS[0].body || S.char.main !== Ch.PRESETS[0].main) badge('star');
    if (full) render(); else { save(); runHooks(); }
  }
  const A = {
    tab: id => { syncEdit(); U.tab = id; render(); const p = el('panel'); if (p && window.matchMedia && window.matchMedia('(max-width:900px)').matches) p.scrollIntoView({ block: 'nearest' }); },
    cat: id => { U.cat = id; render(); },
    pick: id => {
      if (U.sel != null && U.replace && S.tray[U.sel]) { S.tray[U.sel] = id; U.replace = false; }
      else if (S.tray.length >= maxMoves()) { toast('Dances can have up to ' + maxMoves() + ' moves.'); return; }
      else if (U.sel != null && S.tray[U.sel] != null) { S.tray.splice(U.sel + 1, 0, id); U.sel++; }
      else S.tray.push(id);
      preview(id); render();
    },
    look: id => preview(id),
    sel: (_, i) => { U.sel = U.sel === i ? null : i; U.replace = false; render(); },
    left: () => { const i = U.sel; if (i > 0) { [S.tray[i - 1], S.tray[i]] = [S.tray[i], S.tray[i - 1]]; U.sel = i - 1; } render(); },
    right: () => { const i = U.sel; if (i < S.tray.length - 1) { [S.tray[i + 1], S.tray[i]] = [S.tray[i], S.tray[i + 1]]; U.sel = i + 1; } render(); },
    repeat: () => { if (S.tray.length >= maxMoves()) { toast('Dances can have up to ' + maxMoves() + ' moves.'); return; } S.tray.splice(U.sel + 1, 0, S.tray[U.sel]); U.sel++; render(); },
    replace: () => { U.replace = !U.replace; render(); },
    remove: () => { S.tray.splice(U.sel, 1); U.sel = null; U.replace = false; render(); },
    done: () => { U.sel = null; U.replace = false; render(); },
    clear: () => { S.tray = []; U.sel = null; U.replace = false; token++; Ch.setPose(PFX, REST); render(); },
    play: () => { if (!S.tray.length) { toast('Add some moves first.'); return; } perform(S.tray, { onStep: hlChip }); },
    saveEx: id => addEx(id),
    ask, train,
    brain: id => { if (BRAINS[id]) { S.brain = id; render(); } },
    sound: () => { S.sound = !S.sound; if (S.sound) Snd.on(); render(); toast(S.sound ? 'Sound on.' : 'Sound off.'); },
    theme: () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; setGlow(null); render(); },
    /* label designer */
    edStart: id => {
      if (id) { const l = lab(id); U.edit = { id, name: l.name, icon: l.icon, color: l.color, rule: l.rule || '', fresh: true }; }
      else { const used = new Set(S.labels.map(l => l.color)); U.edit = { id: null, name: '', icon: Pk.EMOJI[Math.floor(Math.random() * 12)], color: Pk.PALETTE.find(c => !used.has(c)) || Pk.PALETTE[0], rule: '', fresh: true }; }
      U.tab = 'labels'; render();
    },
    edCancel: () => { U.edit = null; render(); },
    edIcon: id => { syncEdit(); U.edit.icon = id; render(); },
    edColor: id => { syncEdit(); U.edit.color = id; render(); },
    edSave: () => {
      syncEdit(); const e = U.edit, n = e.name.trim();
      if (!n) { toast('Give your label a name first.'); return; }
      if (S.labels.some(l => l.id !== e.id && l.name.toLowerCase() === n.toLowerCase())) { toast('You already have a label with that name.'); return; }
      if (e.id) {
        const l = lab(e.id); l.name = n; l.icon = e.icon || '⭐'; l.color = e.color; l.rule = e.rule.trim();
        toast('Label updated.');
      } else {
        if (S.labels.length >= CFG.maxLabels) { toast('That is the most labels for now: ' + CFG.maxLabels + '.'); return; }
        S.labels.push({ id: uid('l'), name: n, icon: e.icon || '⭐', color: e.color, rule: e.rule.trim(), custom: true });
        toast(`${n} is ready. Now build some dances and save them as examples.`);
      }
      U.edit = null; render();
    },
    delAsk: id => { U.delLabel = id; render(); },
    delNo: () => { U.delLabel = null; render(); },
    delYes: id => {
      S.examples = S.examples.filter(e => e.labelId !== id);
      S.labels = S.labels.filter(l => l.id !== id);
      if (S.exam.some(x => x.labelId === id)) S.examVersion++;
      U.delLabel = null; dataChanged(); render();
    },
    showStyle: async id => {
      const exs = S.examples.filter(e => e.labelId === id), c = cinfo(id);
      for (const e of exs) { const ok = await perform(e.seq); if (!ok) return; await sleep(260); }
      void c;
    },
    exPlay: id => { const e = S.examples.find(e => e.id === id); if (e) perform(e.seq); },
    exDel: id => { S.examples = S.examples.filter(e => e.id !== id); dataChanged(); render(); },
    reveal: id => {
      const L = S.last; if (!L) return;
      L.intended = id; const l = S.log.find(l => l.id === L.id); if (l) l.intended = id;
      if (id !== L.cls) { badge('mistake'); toast('A mistake. That tells you something about the examples.'); } else toast('The robot got it.');
      render();
    },
    lastToTrain: () => { const L = S.last; if (L.seq.length < 2) { toast('A dance needs at least two moves.'); return; } S.examples.push({ id: uid('e'), seq: [...L.seq], labelId: L.intended }); dataChanged(); toast('Added as a training example. Teach the robot again to learn from it.'); render(); },
    lastToExam: () => { const L = S.last; S.exam.push({ id: uid('x'), seq: [...L.seq], labelId: L.intended }); S.examVersion++; toast('Saved to the exam. This starts a new exam, so older scores are not comparable.'); render(); },
    examAdd: id => {
      if (!S.tray.length) { toast('Build a dance first.'); return; }
      S.exam.push({ id: uid('x'), seq: [...S.tray], labelId: id }); S.examVersion++;
      toast(S.examples.some(e => key(e.seq) === key(S.tray)) ? 'Added, but this exact dance is also a training example.' : 'Added to the exam. This starts a new exam, so older scores are not comparable.');
      render();
    },
    examDel: id => { S.exam = S.exam.filter(x => x.id !== id); S.examVersion++; render(); },
    examPlay: id => { const x = S.exam.find(x => x.id === id); if (x) perform(x.seq); },
    examToTrain: id => {
      const x = S.exam.find(x => x.id === id); if (!x) return;
      if (!lab(x.labelId)) { toast('Its label was deleted. Remove it or pick a label first.'); return; }
      S.exam = S.exam.filter(y => y.id !== id); S.examVersion++;
      S.examples.push({ id: uid('e'), seq: x.seq, labelId: x.labelId }); dataChanged();
      toast('Moved into training. The exam lost a dance, so it is a new exam.'); render();
    },
    runExam: scoreExam,
    orderTest: () => {
      const m = model();
      if (!m) { toast(`Teach the ${bname(S.brain)} first.`); return; }
      if (S.tray.length < 2) { toast('Build a dance with at least two moves.'); return; }
      const a = [...S.tray], b = [...a].reverse(), ca = ML.predict(m, a).cls, cb = ML.predict(m, b).cls;
      S.order = { a, b, ca, cb };
      if (ca !== cb) badge('order');
      render();
    },
    /* character */
    ch: (id, _, b) => { syncEdit(); const k = b.dataset.k; S.char[k] = id; charChanged(true); },
    chtog: (_, __, b) => { const k = b.dataset.k; S.char[k] = !S.char[k]; charChanged(true); },
    chEmoji: id => { S.char.emoji = id; charChanged(true); },
    chPhotoClear: () => { S.char.photo = ''; charChanged(true); },
    preset: id => { const p = Ch.PRESETS[+id]; S.char = Ch.normalise(p); charChanged(true); },
    randomChar: () => { S.char = Ch.random(); charChanged(true); },
    stage: id => { S.stage = id; charChanged(true); },
    tryMove: () => { const ids = ['jazz', 'spin', 'jump', 'wave', 'celebrate', 'shimmy']; perform([ids[Math.floor(Math.random() * ids.length)], 'clap', 'bounce']); },
    /* project */
    packAsk: id => { U.confirm = 'pack:' + id; render(); },
    confirmNo: () => { U.confirm = null; render(); },
    packYes: id => { applyPack(S, Pk.get(id)); U.confirm = null; U.edit = null; U.sel = null; token++; Ch.setPose(PFX, REST); showBubble(''); toast('Pack loaded. Teach the robot to learn from it.'); render(); },
    resetAsk: () => { U.confirm = 'reset'; render(); },
    resetYes: () => {
      const keep = { badges: S.badges, theme: S.theme, sound: S.sound };
      S = fresh('blank'); Object.assign(S, keep); S.char = Ch.normalise(Ch.PRESETS[0]); S.brain = CFG.defaultBrain === 'knn' ? 'knn' : 'tree';
      U.confirm = null; U.edit = null; U.sel = null; U.tab = 'labels'; token++; renderRobot(); showBubble(''); render();
    },
    exportP: () => {
      download('dance-lab-project.json', JSON.stringify({ app: 'dance-lab', version: 2, labels: S.labels, examples: S.examples, exam: S.exam, tray: S.tray, brain: S.brain, char: S.char, stage: S.stage }, null, 1));
      toast('Project file saved to your downloads.');
    }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    if (b.dataset.act === 'sound' || b.dataset.act === 'play' || b.dataset.act === 'ask') Snd.on();
    const f = A[b.dataset.act]; if (f) f(b.dataset.id, b.dataset.i != null ? +b.dataset.i : null, b);
  });
  document.addEventListener('change', e => {
    const t = e.target, kind = t.dataset && t.dataset.chg; if (!kind) return;
    if (kind === 'reassign') { const ex = S.examples.find(x => x.id === t.dataset.id); if (!ex) return; ex.labelId = t.value; dataChanged(); render(); }
    else if (kind === 'tempo') { S.tempo = t.value; save(); }
    else if (kind === 'photo') {
      Ch.photoFromFile(t.files[0]).then(url => { S.char.photo = url; charChanged(true); }).catch(() => toast('That file did not load as a picture. Try a JPG or PNG.'));
    } else if (kind === 'import') {
      const f = t.files[0]; if (!f) return;
      if (f.size > 4e6) { toast('That file is too big to be a project.'); t.value = ''; return; }
      const fr = new FileReader();
      fr.onload = () => {
        let n = null; try { n = sanitize(JSON.parse(fr.result)); } catch (x) { n = null; }
        if (!n) { toast('That file is not a Dance Lab project.'); return; }
        const keep = { badges: S.badges, theme: S.theme, sound: S.sound, tempo: S.tempo };
        S = Object.assign(n, keep); n.dsVersion = 2; n.examVersion = 2; U.edit = null; U.sel = null; U.confirm = null;
        renderRobot(); toast('Project opened. Teach the robot to learn from it.'); render();
      };
      fr.readAsText(f); t.value = '';
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'lbName' || t.id === 'lbIcon' || t.id === 'lbRule' || t.id === 'lbColor') { syncEdit(); updatePreview(); }
    else if (t.id === 'chName') { S.char.name = clip(t.value, 18) || 'Dancer'; $('#nametag').textContent = S.char.name; save(); }
    else if (t.id === 'chEmoji') { if (t.value.trim()) { S.char.emoji = clip(t.value.trim(), 2); renderRobot(); save(); } }
    else if (t.dataset && t.dataset.chg === 'chcolor' && hex(t.value)) { S.char[t.dataset.k] = t.value; renderRobot(); save(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.target.id === 'lbName' || e.target.id === 'lbRule' || e.target.id === 'lbIcon')) { e.preventDefault(); A.edSave(); }
    else if (e.key === 'Escape' && U.edit && /^lb/.test(e.target.id || '')) A.edCancel();
  });

  /* ---------- hooks for Training Camp (tutorial.js) ---------- */
  const BKEY = 'dance-lab-backup';
  function hardReset(fn) {
    fn(); U.edit = null; U.sel = null; U.confirm = null; U.delLabel = null; U.replace = false;
    token++; renderRobot(); showBubble(''); Ch.setPose(PFX, REST); render();
  }
  DL.App = {
    cfg: CFG, junior: JR,
    get S() { return S; }, get U() { return U; },
    render, toast, status: () => status(), model: () => model(),
    act: (name, id) => { if (A[name]) A[name](id, null, { dataset: {} }); },
    go: id => { if (U.tab !== id) { syncEdit(); U.tab = id; render(); } },
    onRender: f => hooks.push(f),
    loadPack: id => hardReset(() => applyPack(S, Pk.get(id))),
    makeLabel: o => { S.labels.push({ id: uid('l'), name: o.name, icon: o.icon, color: o.color, rule: o.rule || '', custom: true }); dataChanged(); render(); },
    setTray: seq => { S.tray = seq.slice(0, maxMoves()); U.sel = null; render(); },
    backup: () => { try { localStorage.setItem(BKEY, JSON.stringify(S)); } catch (e) { /* ignore */ } },
    hasBackup: () => { try { return !!localStorage.getItem(BKEY); } catch (e) { return false; } },
    restoreBackup: () => {
      try {
        const o = JSON.parse(localStorage.getItem(BKEY));
        if (!o || o.v !== 2 || !Array.isArray(o.labels)) return false;
        const keep = { char: S.char, badges: S.badges, theme: S.theme, sound: S.sound, tempo: S.tempo };
        hardReset(() => { S = Object.assign(base(), o, keep); ['tree', 'knn'].forEach(t => { const m = S.models[t]; if (m && m.type !== t) S.models[t] = null; }); if (!CFG.showBrainChoice) S.brain = CFG.defaultBrain === 'knn' ? 'knn' : 'tree'; });
        return true;
      } catch (e) { return false; }
    }
  };

  renderRobot();
  render();
})();
