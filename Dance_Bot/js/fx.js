/* Fun effects: confetti, beat-synced stage lights, music notes, button sparks and a mouse-tilt 3D stage.
   Pure decoration. It watches the app through DL.App and never changes any state.
   Turn off with the ✨ button, ?fx=0, or the operating system's "reduce motion" setting. */
(function () {
  'use strict';
  const DL = window.DL, App = DL.App;
  if (!App) return;
  const $ = id => document.getElementById(id);
  const html = document.documentElement;
  const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const params = new URLSearchParams(location.search);

  /* on / off, remembered between visits */
  let on = !reduce;
  try { const v = localStorage.getItem('dance-lab-fx'); if (v === '0') on = false; if (v === '1' && !reduce) on = true; } catch (e) { /* ignore */ }
  if (params.get('fx') === '0') on = false;
  if (params.get('fx') === '1') on = true;
  function applyOn() {
    html.classList.toggle('fx-off', !on);
    const b = $('fxBtn'); if (b) { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('on', on); }
    if (!on) { parts.length = 0; clearCanvas(); }
  }

  /* ---------- confetti engine (one canvas, runs only while there are particles) ---------- */
  const cv = $('fx');
  const ctx = (cv && !/jsdom/i.test(navigator.userAgent) && cv.getContext) ? cv.getContext('2d') : null;
  const parts = []; let raf = 0, dpr = 1;
  const COLOURS = ['#ff3d9a', '#ffe03d', '#27e1ff', '#8dff3d', '#ff8a1f', '#b78bff', '#ffffff'];
  function fit() { if (!ctx) return; dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function clearCanvas() { if (ctx) ctx.clearRect(0, 0, cv.width, cv.height); }
  const rnd = (a, b) => a + Math.random() * (b - a);
  function add(p) { if (parts.length < 400) parts.push(p); }
  function loop() {
    raf = 0; if (!ctx) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      if (p.life <= 0 || p.y > innerHeight + 40 || p.y < -60) { parts.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 24); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      if (p.t) { ctx.font = p.s + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.t, 0, 0); }
      else { ctx.fillStyle = p.c; if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 6.3); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6); }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (ctx && !raf && parts.length) raf = requestAnimationFrame(loop); };
  function confetti(x, y, n, spread) {
    if (!on || !ctx) return;
    for (let i = 0; i < n; i++) {
      const a = rnd(-Math.PI, 0) + rnd(-.4, .4), sp = rnd(5, spread || 13);
      add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: .32, drag: .985, r: rnd(0, 6), vr: rnd(-.3, .3), s: rnd(7, 13), c: COLOURS[i % COLOURS.length], round: Math.random() < .3, life: rnd(70, 120) });
    }
    kick();
  }
  function sparks(x, y) {
    if (!on || !ctx) return;
    for (let i = 0; i < 9; i++) { const a = rnd(0, 6.3), sp = rnd(2, 6); add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: .12, drag: .93, r: 0, vr: 0, s: rnd(4, 8), c: COLOURS[i % COLOURS.length], round: true, life: rnd(18, 30) }); }
    kick();
  }
  function notes(x, y) {
    if (!on || !ctx) return;
    const t = ['♪', '♫', '✨', '⭐', '🎵'][Math.floor(Math.random() * 5)];
    add({ x: x + rnd(-40, 40), y, vx: rnd(-1, 1), vy: rnd(-3.4, -2), g: -.01, drag: .99, r: 0, vr: rnd(-.04, .04), s: rnd(20, 30), t, life: 70 });
    kick();
  }
  const robotXY = () => { const r = $('robot').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * 0.35]; };
  const bigShow = () => { const [x, y] = robotXY(); confetti(x, y, 90, 15); confetti(innerWidth * .2, innerHeight * .7, 40, 14); confetti(innerWidth * .8, innerHeight * .7, 40, 14); };

  /* ---------- the beat: stage lights and notes follow each dance move ---------- */
  const now = $('now'), stage = $('stage'), scene = $('scene');
  if (now && stage) {
    new MutationObserver(() => {
      const dancing = /^Move \d/.test(now.textContent || '');
      stage.classList.toggle('dancing', dancing);
      if (dancing) {
        stage.classList.remove('beat'); void stage.offsetWidth; stage.classList.add('beat');
        const [x, y] = robotXY(); notes(x, y);
      } else stage.classList.remove('beat');
    }).observe(now, { childList: true, characterData: true, subtree: true });
  }

  /* ---------- 3D tilt: the whole stage leans towards the pointer ---------- */
  if (stage && scene && !reduce) {
    stage.addEventListener('pointermove', e => {
      if (!on) return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      scene.style.setProperty('--ty', (px * 16).toFixed(1) + 'deg');
      scene.style.setProperty('--tx', (-py * 9).toFixed(1) + 'deg');
    });
    stage.addEventListener('pointerleave', () => { scene.style.setProperty('--ty', '0deg'); scene.style.setProperty('--tx', '0deg'); });
  }

  /* ---------- sparks on every sticker-button press ---------- */
  document.addEventListener('pointerdown', e => {
    if (!on || !e.target.closest) return;
    if (e.target.closest('.btn,.tb,.chip,.sty,.tab,.cat,.em,.sw,.camp-stage,.pack')) sparks(e.clientX, e.clientY);
  }, true);

  /* ---------- celebrations: watch the app and cheer at the right moments ---------- */
  const snap = () => {
    const S = App.S, L = S.last, m = App.model();
    return { rev: L ? L.id + ':' + L.intended : '', badges: Object.keys(S.badges || {}).length, mv: m ? m.v : 0, exam: S.lastExam || null };
  };
  let prev = snap();
  App.onRender(() => {
    const S = App.S, L = S.last, cur = snap();
    if (L && L.intended != null && cur.rev !== prev.rev) {
      if (L.intended === L.cls) { const [x, y] = robotXY(); confetti(x, y, 70, 14); }
      else if (stage) { stage.classList.remove('oops'); void stage.offsetWidth; stage.classList.add('oops'); setTimeout(() => stage.classList.remove('oops'), 600); }
    }
    if (cur.mv && cur.mv !== prev.mv) setTimeout(() => { const [x, y] = robotXY(); confetti(x, y, 40, 11); }, 900);
    if (cur.badges > prev.badges) confetti(innerWidth * .5, 90, 45, 11);
    if (cur.exam && cur.exam !== prev.exam && cur.exam.total && cur.exam.correct === cur.exam.total) bigShow();
    prev = cur;
  });

  /* ---------- the ✨ switch ---------- */
  const btn = $('fxBtn');
  if (btn) btn.addEventListener('click', () => {
    on = !on; try { localStorage.setItem('dance-lab-fx', on ? '1' : '0'); } catch (e) { /* ignore */ }
    applyOn(); App.toast(on ? 'Fun effects on!' : 'Fun effects off. Calm mode.');
    if (on) { const r = btn.getBoundingClientRect(); confetti(r.left + r.width / 2, r.bottom, 30, 10); }
  });
  window.addEventListener('resize', fit);
  fit(); applyOn();
})();
