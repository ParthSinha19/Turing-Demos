import { useGame } from "./state";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicTimer: number | null = null;
let musicKey = -1;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (!ctx || !master) return null;
  if (ctx.state === "suspended") void ctx.resume();
  const { muted, volume } = useGame.getState();
  master.gain.value = muted ? 0 : volume;
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", when = 0, vol = 0.2) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  click: () => tone(660, 0.08, "triangle", 0, 0.12),
  pick: () => tone(520, 0.1, "sine", 0, 0.15),
  drop: () => {
    tone(440, 0.08, "triangle");
    tone(660, 0.1, "triangle", 0.06);
  },
  good: () => [523, 659, 784].forEach((f, i) => tone(f, 0.25, "triangle", i * 0.08, 0.18)),
  bad: () => {
    tone(300, 0.18, "sine", 0, 0.15);
    tone(220, 0.25, "sine", 0.12, 0.15);
  },
  bonk: () => tone(120, 0.2, "square", 0, 0.1),
  step: () => tone(380, 0.05, "triangle", 0, 0.08),
  beep: () => [880, 990, 760].forEach((f, i) => tone(f, 0.07, "square", i * 0.07, 0.06)),
  reward: () =>
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4, "triangle", i * 0.1, 0.16)),
  fanfare: () =>
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.35, "triangle", i * 0.14, 0.18),
    ),
};

// Gentle per-environment loops (pentatonic arpeggios).
const SCALES = [
  [262, 330, 392, 523],
  [294, 349, 440, 587],
  [330, 392, 494, 659],
  [262, 311, 392, 466],
  [349, 440, 523, 698],
  [294, 370, 440, 554],
  [392, 494, 587, 784],
];

export function playMusic(key: number) {
  if (musicKey === key && musicTimer) return;
  stopMusic();
  musicKey = key;
  const notes = SCALES[key % SCALES.length];
  if (!notes) return;
  let i = 0;
  musicTimer = window.setInterval(() => {
    const pat = [0, 2, 1, 3, 2, 1, 0, 2];
    const note = notes[pat[i % pat.length] ?? 0] ?? 262;
    tone(note / 2, 0.6, "sine", 0, 0.05);
    if (i % 4 === 0) tone((notes[0] ?? 262) / 4, 1.2, "sine", 0, 0.05);
    i++;
  }, 420);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  musicKey = -1;
}

export function refreshVolume() {
  ac();
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string) {
  if (!canSpeak() || useGame.getState().muted) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = 1.6;
  u.rate = 1.02;
  u.volume = useGame.getState().volume;
  window.speechSynthesis.speak(u);
  return true;
}
