/** Pure maze rules: no React, no three.js. */
export type Cmd = "forward" | "left" | "right";
export type Pos = { x: number; y: number; dir: number };
export type StepResult = Pos & { ok: boolean; reason?: "wall" };

export const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] as const;

// S = start (facing east), G = goal, . = path, # = bush
export const PRACTICE_MAP = ["S.G"];
export const MAIN_MAP = ["S...###", "###.###", "###...G"];

export function find(map: string[], ch: string) {
  for (let y = 0; y < map.length; y++) {
    const x = map[y]?.indexOf(ch) ?? -1;
    if (x >= 0) return { x, y };
  }
  return { x: 0, y: 0 };
}

export function isOpen(map: string[], x: number, y: number) {
  const row = map[y];
  if (!row || x < 0 || x >= row.length) return false;
  return row[x] !== "#";
}

export function step(map: string[], p: Pos, c: Cmd): StepResult {
  if (c === "left") return { ...p, dir: (p.dir + 3) % 4, ok: true };
  if (c === "right") return { ...p, dir: (p.dir + 1) % 4, ok: true };
  const [dx, dy] = DIRS[p.dir] ?? DIRS[0];
  const nx = p.x + dx;
  const ny = p.y + dy;
  if (!isOpen(map, nx, ny)) return { ...p, ok: false, reason: "wall" };
  return { x: nx, y: ny, dir: p.dir, ok: true };
}

export type Program = (Cmd | { repeat: number; body: Cmd[] })[];

export function flatten(p: Program): Cmd[] {
  const out: Cmd[] = [];
  for (const c of p) {
    if (typeof c === "string") out.push(c);
    else for (let i = 0; i < Math.min(c.repeat, 20); i++) out.push(...c.body);
  }
  return out;
}

/** Simulate a whole program; returns path and outcome. */
export function simulate(map: string[], cmds: Cmd[]) {
  let p: Pos = { ...find(map, "S"), dir: 0 };
  const goal = find(map, "G");
  const path: Pos[] = [p];
  for (let i = 0; i < cmds.length; i++) {
    const command = cmds[i];
    if (!command) continue;
    const r = step(map, p, command);
    if (!r.ok) return { path, result: "wall" as const, at: i };
    p = r;
    path.push(p);
    if (p.x === goal.x && p.y === goal.y) return { path, result: "goal" as const, at: i };
  }
  return { path, result: "short" as const, at: cmds.length };
}

/** Ghost preview: where the plan would walk if there were no bushes. */
export function ghost(map: string[], cmds: Cmd[]): [number, number][] {
  let p: Pos = { ...find(map, "S"), dir: 0 };
  const pts: [number, number][] = [];
  for (const c of cmds.slice(0, 40)) {
    if (c === "forward") {
      const [dx, dy] = DIRS[p.dir] ?? DIRS[0];
      p = { ...p, x: p.x + dx, y: p.y + dy };
      pts.push([p.x, p.y]);
    } else p = step(map, p, c);
  }
  return pts;
}
