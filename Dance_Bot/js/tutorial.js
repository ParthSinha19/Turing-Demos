/* Training Camp: a stage-by-stage tutorial that teaches every feature.
   A coach card tells the student what to do, the right button glows, and the step ticks itself off
   when the student does it. Stages can be replayed any time from the Training Camp button. */
(function () {
  'use strict';
  const DL = window.DL, App = DL.App;
  if (!App) return;
  const JR = App.junior, KEY = 'dance-lab-camp';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = () => App.S, U = () => App.U;

  let P = { seen: false, done: {} };
  try { Object.assign(P, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ignore */ }
  if (!P.done) P.done = {};
  const saveP = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ignore */ } };

  /* ---------- helpers used by steps ---------- */
  const customLabel = () => S().labels.filter(l => l.custom).slice(-1)[0];
  const exCount = () => { const l = customLabel(); return l ? S().examples.filter(e => e.labelId === l.id).length : 0; };
  const lastId = () => (S().last ? S().last.id : null);
  const parentOf = sel => () => { const e = document.querySelector(sel); return e && e.parentElement; };
  function ensureCamp() { if (S().packId !== 'camp') { App.backup(); App.loadPack('camp'); } }
  function ensureTrained() { if (App.status() !== 'current') App.act('train'); }
  function ensureCustom() { if (!customLabel()) App.makeLabel({ name: 'My Style', icon: '⭐', color: '#ff58a8', rule: 'My own style of dance' }); }
  const clearTray = () => App.setTray([]);

  /* ---------- the stages ---------- */
  const ST = [
    { id: 'dancer', group: 'Basics', icon: '🧑‍🎤', title: 'Meet your dancer', sum: 'Make a character that is all yours.', steps: [
      { tab: 'me', target: '#stage', info: true, text: 'This is your <b>dancer</b>. They will perform every dance you make. Let us make them look the way you want.' },
      { tab: 'me', target: '.presets', init: () => ({ c: JSON.stringify(S().char) }), done: b => JSON.stringify(S().char) !== b.c, text: 'Pick a ready-made character, or change the <b>head</b>, <b>hat</b> or <b>colours</b>. Change something!' },
      { tab: 'me', target: '#chName', info: true, text: () => 'Give your dancer a <b>name</b> if you like.' + (App.cfg.allowPhotos ? ' You can even use your own drawing as the head: choose <b>Head, then Photo</b>, and pick a picture. It never leaves this computer.' : '') },
      { tab: 'me', target: parentOf('[data-act="stage"]'), init: () => ({ s: S().stage }), done: b => S().stage !== b.s, text: 'Now pick a <b>stage</b> for your dancer to perform on.' }
    ] },
    { id: 'dance', group: 'Basics', icon: '🕺', title: 'Make a dance', sum: 'Pick moves and put them in order.', steps: [
      { tab: 'moves', target: '.moves', setup: clearTray, done: () => S().tray.length >= 3, text: 'Tap <b>3 moves</b> to build a dance. Each move you tap is added to <b>Your dance</b>. Tap the little ▶ on a move to preview it first.' },
      { target: '[data-act="play"]', click: 'play', text: 'Press <b>Play it</b> and watch your dancer perform!' },
      { target: '#tray .chips', done: () => U().sel != null, text: 'Tap one of your moves in <b>Your dance</b> to select it.' },
      { target: '.tools', info: true, text: 'Now you can move it <b>Earlier</b> or <b>Later</b>, <b>Repeat</b> it, <b>Replace</b> it, or <b>Remove</b> it. Press <b>Done</b> when you have finished.' }
    ] },
    { id: 'labels', group: 'Basics', icon: '🏷️', title: 'What are labels?', sum: 'Names for styles of dance, with examples.', camp: true, steps: [
      { tab: 'labels', target: '.scard', info: true, text: 'A <b>label</b> is a name for a style of dance, like <b>Happy</b> or <b>Sleepy</b>. Each label has <b>examples</b>: dances that show the robot what that style looks like.' },
      { tab: 'labels', target: '[data-act="showStyle"]', click: 'showStyle', text: 'Press <b>Show style</b> to watch the example dances for a label.' },
      { tab: 'labels', target: '.scard .ex', info: true, text: 'Each row is one <b>example dance</b>. The robot learns by studying lots of examples, so <b>more good examples make a smarter robot</b>.' }
    ] },
    { id: 'teach', group: 'Teaching', icon: '🎓', title: 'Teach the robot', sum: 'Let the robot study the examples.', camp: true, steps: [
      { target: '#trainBtn', click: 'train', ok: () => App.status() === 'current', text: 'The robot knows nothing yet! Press <b>Teach the robot</b> and it will study every example.' },
      { target: '#brain', info: true, text: 'This light shows what the robot knows. <b>Green</b> means it is up to date. If you change the examples it turns <b>yellow</b>, and you press the button again.' }
    ] },
    { id: 'ask', group: 'Teaching', icon: '🔮', title: 'Ask the robot', sum: 'Make a new dance and see what it guesses.', camp: true, steps: [
      { tab: 'moves', target: '.moves', setup: () => { ensureTrained(); clearTray(); }, done: () => S().tray.length >= 3, text: 'Make a <b>brand-new dance</b> with 3 or more moves. It should be one the robot has never seen.' },
      { target: '[data-act="ask"]', init: () => ({ id: lastId() }), click: 'ask', ok: b => !!S().last && S().last.id !== b.id, text: 'Press <b>Ask the robot</b>. It will dance your moves, then guess the label.' },
      { target: '#bubble', info: true, text: 'The robot\'s guess appears in this bubble. Press <b>Why?</b> in the bubble to find out how it decided.' },
      { tab: 'test', target: '#panel .card', info: true, text: () => JR ? 'The robot found the <b>example dances that look most like yours</b>, then copied their label. That is how many real AI systems work!' : 'This is the robot\'s reasoning. Read it to see how it reached its guess.' }
    ] },
    { id: 'right', group: 'Teaching', icon: '✅', title: 'Was the robot right?', sum: 'Spot mistakes and learn from them.', camp: true, steps: [
      { tab: 'test', target: parentOf('[data-act="reveal"]'), setup: () => { ensureTrained(); const L = S().last; if (!L || L.intended != null) { App.setTray(['jump', 'clap', 'bounce']); App.act('ask'); } }, done: () => !!S().last && S().last.intended != null, text: 'Now tell the robot <b>what you meant</b>. Tap the label you were aiming for.' },
      { tab: 'test', target: '#panel .card', info: true, text: 'If the robot got it wrong, <b>that is useful!</b> A mistake is a clue that it needs better examples. You can add the dance as a new example, then teach the robot again.' }
    ] },
    { id: 'invent', group: 'Your own', icon: '🎨', title: 'Invent your own label', sum: 'Design a style of dance that nobody else has.', camp: true, steps: [
      { tab: 'labels', target: '[data-act="edStart"]', setup: () => { if (!U().edit && S().labels.length >= App.cfg.maxLabels) App.act('delYes', S().labels[S().labels.length - 1].id); }, done: () => !!U().edit, text: 'Press <b>Design a new label</b>.' },
      { tab: 'labels', target: '.designer', init: () => ({ n: S().labels.length }), click: 'edSave', ok: b => S().labels.length > b.n, text: 'Type a <b>name</b>, pick a <b>badge</b> and a <b>colour</b>, and write a <b>clue</b> about what makes this style different. Then press <b>Add label</b>.' }
    ] },
    { id: 'style', group: 'Your own', icon: '🧪', title: 'Teach it your style', sum: 'Give your label examples and test it.', camp: true, steps: [
      { tab: 'moves', target: '#tray .teach', setup: () => { ensureCustom(); clearTray(); }, init: () => ({ n: exCount() }), done: b => exCount() >= b.n + 2,
        text: () => `Build a dance for <b>${esc((customLabel() || { name: 'your label' }).name)}</b> (2 or more moves), then tap its badge under <b>Save this dance as an example</b>. Do it <b>twice</b> with different dances.` },
      { target: '#trainBtn', click: 'train', ok: () => App.status() === 'current', text: 'The robot has not seen your new examples yet. Press <b>Teach the robot again</b>.' },
      { tab: 'moves', target: '.moves', setup: clearTray, done: () => S().tray.length >= 3, text: 'Now make a <b>new</b> dance in the same style.' },
      { target: '[data-act="ask"]', init: () => ({ id: lastId() }), click: 'ask', ok: b => !!S().last && S().last.id !== b.id, text: () => `Press <b>Ask the robot</b>. Will it pick <b>${esc((customLabel() || { name: 'your label' }).name)}</b>?` },
      { target: '#bubble', info: true, text: 'If it chose your label, <b>you taught a robot something new!</b> If not, add more examples and teach again. Real AI engineers do this all the time.' }
    ] },
    { id: 'quiz', group: 'Check it', icon: '📝', title: 'Quiz the robot', sum: 'A fair test on dances it has never seen.', camp: true, steps: [
      { tab: 'test', target: '#panel > .card:nth-child(2)', info: true, text: () => `A ${JR ? 'quiz' : 'exam'} uses dances the robot has <b>never studied</b>. If we tested it on dances it had already learned, that would be cheating!` },
      { tab: 'test', target: '[data-act="runExam"]', setup: ensureTrained, init: () => ({ e: S().lastExam }), click: 'runExam', ok: b => S().lastExam !== b.e, text: () => `Press <b>Run the ${JR ? 'quiz' : 'exam'}</b>.` },
      { tab: 'test', target: '#panel > .card:nth-child(2)', info: true, text: 'Here is the <b>score</b>. Every row shows what the dance was meant to be and what the robot guessed. Better examples usually mean a better score!' }
    ] },
    { id: 'brain', group: 'Pro', icon: '🔬', title: 'Look inside the brain', sum: 'See how the robot thinks.', full: true, camp: true, steps: [
      { tab: 'lab', setup: ensureTrained, target: '#panel .card', info: true, text: 'The <b>Lab</b> shows how the robot thinks. The Question tree shows the yes/no questions it learned to ask. The Look-alike finder shows the closest dances it remembers.' },
      { tab: 'lab', target: '.meaning', info: true, text: 'This lists what the robot thinks each label means. <b>Compare it with your own clue.</b> Did it find the rule you had in mind?' },
      { tab: 'lab', target: '.feat', info: true, text: 'These facts are <b>all the robot sees</b> of a dance: counts, neighbouring pairs, first move, last move. It cannot notice anything else!' }
    ] },
    { id: 'battle', group: 'Pro', icon: '🥊', title: 'Brain battle', sum: 'Compare two kinds of brain fairly.', full: true, camp: true, steps: [
      { target: '#brainsw', init: () => ({ b: S().brain }), done: b => S().brain !== b.b, text: 'There are two kinds of brain. Click the one that is <b>not</b> selected.' },
      { target: '#trainBtn', click: 'train', ok: () => App.status() === 'current', text: 'Teach this brain with the same examples.' },
      { tab: 'test', target: '[data-act="runExam"]', init: () => ({ e: S().lastExam }), click: 'runExam', ok: b => S().lastExam !== b.e, text: 'Run the exam. Then switch back to the other brain, teach it, and run the <b>same exam</b> again.' },
      { tab: 'test', target: '#panel > .card:nth-child(2)', info: true, text: 'Compare the two scores. A fair comparison uses the <b>same exam</b> for both brains. Which one won, and which dances did each get wrong?' }
    ] },
    { id: 'extras', group: 'Extras', icon: '💾', title: 'Packs, saving and buttons', sum: 'Ready-made label packs, save files and more.', steps: [
      { tab: 'project', target: '.packs', info: true, text: '<b>Packs</b> are ready-made sets of labels with examples. Load one to start quickly, or choose <b>Blank slate</b> and invent everything yourself.' },
      { tab: 'project', target: '[data-act="exportP"]', click: 'exportP', text: 'Press <b>Save project file</b> to keep your work. You can open it again later or share it.' },
      { target: '#soundBtn', info: true, text: 'The speaker turns on <b>sound</b>. Every move plays a little note.' },
      { target: '#themeBtn', info: true, text: 'The sun and moon switch between <b>light</b> and <b>dark</b>.' },
      { target: '#campBtn', info: true, text: 'Come back to <b>Training Camp</b> any time to replay a stage.' }
    ] }
  ];
  const stages = () => ST.filter(s => !(s.full && JR));

  /* ---------- state ---------- */
  let cur = null, busy = false, timer = 0, lastFocus = null;
  const step = () => cur && cur.s.steps[cur.i];

  function startStage(id) {
    const s = ST.find(x => x.id === id); if (!s) return;
    closeOv(true); P.seen = true; saveP();
    cur = { s, i: 0, base: {}, ok: false, complete: false, scrolled: '' };
    if (s.camp) { busy = true; ensureCamp(); busy = false; }
    startStep();
  }
  function startStep() {
    clearTimeout(timer); busy = true;
    const st = step(); cur.ok = false; cur.scrolled = '';
    if (st.tab) App.go(st.tab);
    if (st.setup) st.setup();
    cur.base = st.init ? st.init() : {};
    busy = false; update();
  }
  function complete() {
    if (!cur || cur.ok) return;
    cur.ok = true; update();
    clearTimeout(timer); timer = setTimeout(next, 850);
  }
  function next() {
    clearTimeout(timer); if (!cur) return;
    cur.i++;
    if (cur.i >= cur.s.steps.length) { P.done[cur.s.id] = 1; saveP(); cur.complete = true; update(); return; }
    startStep();
  }
  function back() { if (cur && cur.i > 0) { clearTimeout(timer); cur.i--; startStep(); } }
  function endCamp() { clearTimeout(timer); cur = null; update(); }

  /* ---------- rendering ---------- */
  function target() {
    const st = step(); if (!st) return null;
    if (st.tab && U().tab !== st.tab) return document.querySelector(`.tab[data-id="${st.tab}"]`);
    const t = st.target; return typeof t === 'function' ? t() : (t ? document.querySelector(t) : null);
  }
  function highlight() {
    document.querySelectorAll('.tut-hi').forEach(e => e.classList.remove('tut-hi'));
    if (!cur || cur.complete) return;
    const el = target(); if (!el) return;
    el.classList.add('tut-hi');
    const key = cur.s.id + cur.i + (U().tab);
    if (cur.scrolled !== key) {
      cur.scrolled = key;
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.bottom > (window.innerHeight || 800) - 260) { try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* ignore */ } }
    }
  }
  function coach() {
    const box = $('coach');
    if (!cur) { box.hidden = true; box.innerHTML = ''; document.body.classList.remove('tut-on'); return; }
    box.hidden = false; document.body.classList.add('tut-on');
    const list = stages(), n = list.indexOf(cur.s) + 1, st = step();
    if (cur.complete) {
      const nx = list[n];
      box.innerHTML = `<div class="cavatar" aria-hidden="true">🎉</div><div class="cbody"><div class="cmeta">Stage ${n} of ${list.length}</div><p class="ctext"><b>Stage complete: ${esc(cur.s.title)}!</b></p><div class="cact">${nx ? `<button class="btn primary sm" data-c="nextStage" data-id="${nx.id}">Next stage: ${esc(nx.title)}</button>` : '<button class="btn primary sm" data-c="finish">Start the main game</button>'}<button class="btn sm" data-c="menu">All stages</button></div></div>`;
      return;
    }
    const txt = typeof st.text === 'function' ? st.text(cur.base) : st.text;
    const off = st.tab && U().tab !== st.tab;
    const dots = cur.s.steps.map((_, k) => `<i class="${k < cur.i ? 'd' : k === cur.i ? 'c' : ''}"></i>`).join('');
    const act = cur.ok ? '' : (st.info ? '<button class="btn primary sm" data-c="next">Next</button>' : '<span class="try">👆 Try it and I will tick it off</span><button class="btn sm" data-c="skipStep">Skip this step</button>');
    box.innerHTML = `<div class="cavatar" aria-hidden="true">${cur.ok ? '✅' : cur.s.icon}</div><div class="cbody"><div class="cmeta"><b>${esc(cur.s.title)}</b><span>Stage ${n} of ${list.length}</span><span class="dots" aria-label="Step ${cur.i + 1} of ${cur.s.steps.length}">${dots}</span></div>
      ${cur.ok ? '<p class="ctext good">Nice work!</p>' : `<p class="ctext">${txt}</p>`}
      ${off && !cur.ok ? `<div class="off">This step is on the <b>${esc(tabName(st.tab))}</b> tab. <button class="btn sm" data-c="goto">Take me there</button></div>` : ''}
      <div class="cact">${act}${cur.i > 0 && !cur.ok ? '<button class="btn sm" data-c="back">Back</button>' : ''}<button class="btn sm" data-c="menu">All stages</button><button class="btn sm" data-c="leave">Leave camp</button></div></div>`;
  }
  const tabName = id => { const b = document.querySelector(`.tab[data-id="${id}"]`); return b ? b.textContent : id; };
  function update() {
    if (busy) return;
    if (cur && !cur.complete && !cur.ok) {
      const st = step();
      if (st && st.done && st.done(cur.base)) { coach(); highlight(); complete(); return; }
    }
    coach(); highlight();
  }
  App.onRender(update);

  /* ---------- menu, welcome and "start the game" screens ---------- */
  function openOv(view) {
    const ov = $('campOv'); lastFocus = document.activeElement;
    const list = stages(), done = list.filter(s => P.done[s.id]).length;
    let html = '';
    if (view === 'welcome') {
      html = `<h2 id="campT">${JR ? 'Welcome to Robot Dance School!' : 'Welcome to the Dance Lab!'}</h2>
        <p class="big">You will teach a robot to recognise styles of dance, just like real scientists teach computers. <b>Training Camp</b> shows you what to do, one small step at a time.</p>
        <div class="camp-act"><button class="btn primary big" data-c="startFirst">Start Training Camp</button><button class="btn" data-c="menu">Choose a stage</button><button class="btn" data-c="skipGame">I know what to do. Skip to the game</button></div>
        <p class="note">Come back any time with the Training Camp button at the top.</p>`;
    } else if (view === 'start') {
      html = `<h2 id="campT">Ready for the main game?</h2><p class="big">Where would you like to begin?</p>
        <div class="camp-act"><button class="btn primary big" data-c="keep">Keep going with these labels</button><button class="btn" data-c="pack">Pick a ready-made pack</button><button class="btn" data-c="blank">Start from a blank slate and invent everything</button>${App.hasBackup() ? '<button class="btn" data-c="restore">Go back to my earlier game</button>' : ''}</div>`;
    } else {
      const groups = [...new Set(list.map(s => s.group))];
      html = `<h2 id="campT">Training Camp</h2><p class="note">${done} of ${list.length} stages done. Do them in order, or jump to any stage.</p>
        ${groups.map(g => `<div class="camp-group"><h3>${esc(g)}</h3>${list.filter(s => s.group === g).map(s => `<button class="camp-stage" data-c="stage" data-id="${s.id}"><span class="si" aria-hidden="true">${s.icon}</span><span><b>${esc(s.title)}</b><small>${esc(s.sum)}</small></span>${P.done[s.id] ? '<span class="tick" aria-label="done">✓</span>' : ''}</button>`).join('')}</div>`).join('')}
        <div class="camp-act"><button class="btn primary" data-c="finish">Start the main game</button><button class="btn" data-c="close">Close</button></div>`;
    }
    ov.innerHTML = `<div class="camp-card" role="dialog" aria-modal="true" aria-labelledby="campT">${html}</div>`;
    ov.hidden = false;
    const f = ov.querySelector('button'); if (f) f.focus();
  }
  function closeOv(quiet) {
    const ov = $('campOv'); if (ov.hidden) return;
    ov.hidden = true; ov.innerHTML = '';
    if (!quiet && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  }
  const firstTodo = () => stages().find(s => !P.done[s.id]) || stages()[0];

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-c]');
    if (b) {
      const c = b.dataset.c, id = b.dataset.id;
      switch (c) {
        case 'startFirst': startStage(stages()[0].id); break;
        case 'stage': case 'nextStage': startStage(id); break;
        case 'menu': openOv('menu'); break;
        case 'skipGame': case 'close': P.seen = true; saveP(); closeOv(); break;
        case 'next': next(); break;
        case 'back': back(); break;
        case 'skipStep': next(); break;
        case 'goto': if (step() && step().tab) App.go(step().tab); break;
        case 'leave': endCamp(); break;
        case 'finish': endCamp(); openOv('start'); break;
        case 'keep': P.seen = true; saveP(); closeOv(); break;
        case 'pack': P.seen = true; saveP(); closeOv(); App.go('project'); App.toast('Pick a pack, then press Load this pack.'); break;
        case 'blank': P.seen = true; saveP(); closeOv(); App.loadPack('blank'); App.go('labels'); App.toast('A blank slate. Design your first label!'); break;
        case 'restore': P.seen = true; saveP(); closeOv(); App.restoreBackup(); break;
      }
      return;
    }
    const a = e.target.closest('[data-act]'); if (!a || a.disabled) return;
    if (a.dataset.act === 'camp') { openOv(cur ? 'menu' : 'menu'); return; }
    if (!cur || cur.complete) return;
    const st = step();
    if (st && st.click === a.dataset.act) {
      setTimeout(() => { if (!cur || step() !== st) return; if (!st.ok || st.ok(cur.base)) complete(); else update(); }, 140);
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('campOv').hidden) { P.seen = true; saveP(); closeOv(); } });

  /* the welcome appears once, on a student's first visit */
  const q = new URLSearchParams(location.search);
  if (App.cfg.tutorial === 'auto' && !P.seen && q.get('camp') !== '0') setTimeout(() => openOv('welcome'), 250);
  else if (App.cfg.tutorial === 'off') { const cb = $('campBtn'); if (cb) cb.style.display = 'none'; }

  DL.Camp = { stages, open: openOv, start: startStage, _state: () => cur && { stage: cur.s.id, i: cur.i, info: !cur.complete && !!step().info, complete: cur.complete, ok: cur.ok, n: cur.s.steps.length } };
})();
