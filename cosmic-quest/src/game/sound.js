import { save } from './save.js';

let ctx = null;
function audio() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = 'sine', vol = 0.06, delay = 0, to = null } = {}) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const SFX = {
  click: () => tone(520, 0.08, { type: 'triangle' }),
  select: () => {
    tone(440, 0.1, { type: 'triangle' });
    tone(660, 0.12, { type: 'triangle', delay: 0.07 });
  },
  step: () => tone(300, 0.1, { type: 'square', vol: 0.025 }),
  launch: () => tone(120, 1.4, { type: 'sawtooth', vol: 0.05, to: 700 }),
  collect: () => {
    tone(784, 0.1);
    tone(1175, 0.18, { delay: 0.08 });
  },
  good: () => {
    tone(523, 0.12, { type: 'triangle' });
    tone(659, 0.12, { type: 'triangle', delay: 0.1 });
    tone(784, 0.2, { type: 'triangle', delay: 0.2 });
  },
  oops: () => tone(300, 0.35, { type: 'sawtooth', vol: 0.04, to: 140 }),
  unlock: () =>
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { type: 'triangle', delay: i * 0.11, vol: 0.05 })),
  win: () =>
    [392, 523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
      tone(f, 0.28, { type: 'triangle', delay: i * 0.13, vol: 0.05 })
    ),
};

export function sfx(name) {
  if (save.get().muted) return;
  try {
    SFX[name] && SFX[name]();
  } catch {
    /* audio is optional */
  }
}

// Optional read-aloud using the browser's built-in voices (no external service).
export function speak(text) {
  const s = save.get();
  if (!s.speech || s.muted || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[^\p{L}\p{N}\s.,!?'-]/gu, ''));
    u.lang = 'en-GB';
    u.rate = 0.95;
    u.pitch = 1.25;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
