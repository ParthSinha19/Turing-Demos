// Pure navigation logic for the Mars mission (and the final asteroid field).
export const GRID = 7;
export const DIRS = [
  [0, -1], // north
  [1, 0], // east
  [0, 1], // south
  [-1, 0], // west
];
export const BASE_ANG = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];

export const LEVELS = [
  {
    id: 1,
    title: 'Reach the rover',
    say: 'The rover is over there! Tell me how to get to it.',
    start: { x: 0, z: 3, d: 1 },
    rover: { x: 4, z: 3 },
    crystal: null,
    rocks: [],
    craters: [{ x: 2, z: 0 }, { x: 5, z: 6 }],
  },
  {
    id: 2,
    title: 'Collect a crystal',
    say: 'I need that energy crystal for the rover. Then we can go to it!',
    start: { x: 0, z: 5, d: 0 },
    rover: { x: 4, z: 2 },
    crystal: { x: 0, z: 2 },
    rocks: [{ x: 2, z: 4 }, { x: 3, z: 5 }],
    craters: [{ x: 5, z: 4 }],
  },
  {
    id: 3,
    title: 'Go around the rocks',
    say: 'Big rocks are in the way! Can you find a way around?',
    start: { x: 0, z: 3, d: 1 },
    rover: { x: 4, z: 3 },
    crystal: null,
    rocks: [{ x: 2, z: 2 }, { x: 2, z: 3 }, { x: 2, z: 4 }],
    craters: [{ x: 1, z: 5 }, { x: 3, z: 0 }],
  },
  {
    id: 4,
    title: 'Find the shortest route',
    say: 'Crystal first, then the rover. Can you find a short way?',
    start: { x: 0, z: 6, d: 0 },
    rover: { x: 6, z: 0 },
    crystal: { x: 2, z: 3 },
    rocks: [{ x: 1, z: 4 }, { x: 2, z: 4 }, { x: 3, z: 3 }, { x: 3, z: 2 }, { x: 4, z: 2 }, { x: 4, z: 5 }],
    craters: [{ x: 5, z: 4 }, { x: 0, z: 1 }],
  },
];

// Asteroid field for the final mission.
export const FINAL_LEVEL = {
  id: 'f',
  title: 'Asteroid field',
  say: 'Asteroids ahead! Plan a safe path to the glowing gate.',
  start: { x: 0, z: 6, d: 0 },
  rover: { x: 6, z: 1 },
  crystal: null,
  rocks: [{ x: 0, z: 3 }, { x: 1, z: 3 }, { x: 2, z: 5 }, { x: 3, z: 4 }, { x: 3, z: 3 }, { x: 4, z: 1 }, { x: 5, z: 3 }, { x: 5, z: 4 }],
  craters: [{ x: 2, z: 1 }],
};

const same = (a, b) => a && b && a.x === b.x && a.z === b.z;
const hit = (list, x, z) => list.some((r) => r.x === x && r.z === z);

export const startState = (level) => ({
  x: level.start.x,
  z: level.start.z,
  d: level.start.d,
  ang: BASE_ANG[level.start.d],
  crystal: false,
});

// cmd: F forward, B back, L left, R right.  Returns { state, event }
export function stepCmd(state, cmd, level) {
  let { x, z, d, ang, crystal } = state;
  if (cmd === 'L') {
    return { state: { x, z, d: (d + 3) % 4, ang: ang - Math.PI / 2, crystal }, event: 'turn' };
  }
  if (cmd === 'R') {
    return { state: { x, z, d: (d + 1) % 4, ang: ang + Math.PI / 2, crystal }, event: 'turn' };
  }
  const s = cmd === 'F' ? 1 : -1;
  const nx = x + DIRS[d][0] * s;
  const nz = z + DIRS[d][1] * s;
  if (nx < 0 || nz < 0 || nx >= GRID || nz >= GRID) return { state, event: 'edge' };
  if (hit(level.rocks, nx, nz)) return { state, event: 'rock' };
  if (hit(level.craters, nx, nz)) return { state, event: 'crater' };
  let event = 'move';
  const next = { x: nx, z: nz, d, ang, crystal };
  if (level.crystal && !crystal && same(level.crystal, next)) {
    next.crystal = true;
    event = 'crystal';
  }
  if (same(level.rover, next)) event = level.crystal && !next.crystal ? 'needcrystal' : 'rover';
  return { state: next, event };
}

// Breadth-first search: the fewest commands needed to solve the level.
export function shortest(level) {
  const key = (s) => `${s.x},${s.z},${s.d},${s.crystal ? 1 : 0}`;
  const start = { ...startState(level) };
  const seen = new Set([key(start)]);
  let frontier = [{ s: start, n: 0 }];
  while (frontier.length) {
    const nextF = [];
    for (const { s, n } of frontier) {
      for (const c of ['F', 'B', 'L', 'R']) {
        const r = stepCmd(s, c, level);
        if (r.event === 'rover') return n + 1;
        if (['edge', 'rock', 'crater'].includes(r.event)) continue;
        const k = key(r.state);
        if (!seen.has(k)) {
          seen.add(k);
          nextF.push({ s: r.state, n: n + 1 });
        }
      }
    }
    frontier = nextF;
  }
  return null;
}

// Run a whole program without animation (used for tests and the star rating).
export function runProgram(prog, level) {
  let s = startState(level);
  for (let i = 0; i < prog.length; i++) {
    const r = stepCmd(s, prog[i], level);
    if (['edge', 'rock', 'crater'].includes(r.event)) return { ok: false, event: r.event, at: i, state: s };
    s = r.state;
    if (r.event === 'rover') return { ok: true, event: 'rover', at: i, state: s };
  }
  return { ok: false, event: 'ended', at: prog.length, state: s };
}
