import { createStore } from './mini.js';

export const KEY = 'cosmic-quest-save-v1';
export const PLANET_ORDER = ['earth', 'mars', 'jupiter', 'saturn', 'neptune'];
export const ALL_MISSIONS = [...PLANET_ORDER, 'final'];

export const OPTIONS = {
  body: ['round', 'square', 'compact', 'tall'],
  head: ['dome', 'visor', 'antenna', 'screen'],
  eyes: ['round', 'wide', 'square', 'happy'],
  antenna: ['none', 'stick', 'bulb', 'dish'],
};
export const LABELS = {
  body: { round: 'Round', square: 'Square', compact: 'Compact', tall: 'Tall' },
  head: { dome: 'Dome', visor: 'Visor', antenna: 'Antenna', screen: 'Screen' },
  eyes: { round: 'Round', wide: 'Wide', square: 'Square', happy: 'Happy' },
  antenna: { none: 'None', stick: 'Stick', bulb: 'Bulb', dish: 'Dish' },
};
export const ACCESSORIES = [
  { id: 'jetpack', label: 'Jetpack', icon: '🚀' },
  { id: 'wings', label: 'Wings', icon: '🪽' },
  { id: 'toolarms', label: 'Tool arms', icon: '🦾' },
  { id: 'scanner', label: 'Scanner', icon: '📡' },
  { id: 'badge', label: 'Badge', icon: '🏅' },
];
export const PALETTES = [
  { name: 'Sunny', c1: '#ffb703', c2: '#3a86ff' },
  { name: 'Mint', c1: '#2ec4b6', c2: '#ff6b6b' },
  { name: 'Berry', c1: '#e63e8b', c2: '#ffd166' },
  { name: 'Ocean', c1: '#3a86ff', c2: '#ffffff' },
  { name: 'Lime', c1: '#8ac926', c2: '#6a4c93' },
  { name: 'Snow', c1: '#e9eef7', c2: '#ff7b00' },
  { name: 'Grape', c1: '#9b5de5', c2: '#00f5d4' },
  { name: 'Fire', c1: '#ef476f', c2: '#ffd166' },
  { name: 'Copper', c1: '#c9794a', c2: '#4cc9f0' },
  { name: 'Shadow', c1: '#4a5568', c2: '#ffd23f' },
];
export const MODULES = {
  earth: { name: 'Robot Scanner', icon: '📷', up: 'scanner', blurb: 'Your robot can now scan things and look for clues!' },
  mars: { name: 'Navigation Module', icon: '🧭', up: 'nav', blurb: 'Wheels and a map pin! Your robot can plan routes.' },
  jupiter: { name: 'Decision Module', icon: '🧠', up: 'decision', blurb: 'A glowing brain cube! Your robot can follow rules.' },
  saturn: { name: 'Recognition Module', icon: '👁️', up: 'recognition', blurb: 'Super eyes! Your robot can recognise new things.' },
  neptune: { name: 'Discovery Module', icon: '🔭', up: 'discovery', blurb: 'A holo-antenna! Your robot can discover groups by itself.' },
};
export const NAMES = ['Bleep', 'Sparky', 'Nova', 'Zippy', 'Orbit', 'Pixel', 'Comet', 'Bolt', 'Gizmo', 'Twinkle'];

const defaults = () => ({
  v: 1,
  created: false,
  robot: { body: 'round', head: 'dome', eyes: 'round', antenna: 'stick', palette: 0, accessories: [], name: '' },
  completed: {},
  muted: false,
  low: false,
  speech: false,
});

function sanitize(o) {
  const d = defaults();
  if (!o || typeof o !== 'object') return d;
  const r = o.robot && typeof o.robot === 'object' ? o.robot : {};
  const pick = (k) => (OPTIONS[k].includes(r[k]) ? r[k] : d.robot[k]);
  const acc = Array.isArray(r.accessories)
    ? [...new Set(r.accessories.filter((a) => ACCESSORIES.some((x) => x.id === a)))]
    : [];
  const robot = {
    body: pick('body'),
    head: pick('head'),
    eyes: pick('eyes'),
    antenna: pick('antenna'),
    palette: Number.isInteger(r.palette) && r.palette >= 0 && r.palette < PALETTES.length ? r.palette : 0,
    accessories: acc,
    name: typeof r.name === 'string' ? r.name.replace(/[<>]/g, '').slice(0, 14) : '',
  };
  const completed = {};
  const c = o.completed && typeof o.completed === 'object' ? o.completed : {};
  ALL_MISSIONS.forEach((m) => {
    if (c[m] === true) completed[m] = true;
  });
  // keep progression valid: a mission can only be complete if the previous one is
  PLANET_ORDER.forEach((m, i) => {
    if (completed[m] && i > 0 && !completed[PLANET_ORDER[i - 1]]) delete completed[m];
  });
  if (completed.final && !PLANET_ORDER.every((m) => completed[m])) delete completed.final;
  return {
    v: 1,
    created: o.created === true && robot.name.length > 0,
    robot,
    completed,
    muted: o.muted === true,
    low: o.low === true,
    speech: o.speech === true,
  };
}

function load() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return defaults();
  }
}

export const save = createStore(load());
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save.get()));
  } catch {
    /* private mode etc. – the game still works for this session */
  }
}
export function patch(p) {
  save.set(p);
  persist();
}
export function setRobot(p) {
  patch({ robot: { ...save.get().robot, ...p } });
}
export function toggleAccessory(id) {
  const a = save.get().robot.accessories;
  setRobot({ accessories: a.includes(id) ? a.filter((x) => x !== id) : [...a, id] });
}
export function markComplete(id) {
  patch({ completed: { ...save.get().completed, [id]: true } });
}
export function resetAll() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  save.set(defaults());
}
export function randomRobot() {
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
  const accessories = ACCESSORIES.filter(() => Math.random() < 0.4).map((a) => a.id);
  setRobot({
    body: pickOne(OPTIONS.body),
    head: pickOne(OPTIONS.head),
    eyes: pickOne(OPTIONS.eyes),
    antenna: pickOne(OPTIONS.antenna),
    palette: Math.floor(Math.random() * PALETTES.length),
    accessories,
  });
}
export function isUnlocked(id, completed) {
  if (id === 'earth') return true;
  if (id === 'final') return PLANET_ORDER.every((p) => completed[p]);
  const i = PLANET_ORDER.indexOf(id);
  return i > 0 && !!completed[PLANET_ORDER[i - 1]];
}
export const nextMission = (completed) => ALL_MISSIONS.find((m) => !completed[m]) || null;
