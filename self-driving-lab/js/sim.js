/* Self-Driving Lab — core simulation. No DOM, no Blockly: just the world, the car and its sensors. */
(function (g) {
  'use strict';
  const SDL = (g.SDL = g.SDL || {});
  const TILE = 40, COLS = 22, ROWS = 14, W = COLS * TILE, H = ROWS * TILE;
  const STEP = 1 / 60, HL = 17; // fixed time step (s) and car half-length (px)
  const HEAD = { e: 0, s: 90, w: 180, n: 270 };
  const FACE = ['east', 'south', 'west', 'north'];
  const VEC = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const rad = (d) => (d * Math.PI) / 180;
  const tc = (t) => t * TILE + TILE / 2;
  const norm = (a) => ((a % 360) + 360) % 360;
  Object.assign(SDL, { TILE, COLS, ROWS, W, H, STEP, HL, rad, norm });

  SDL.rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  SDL.inRoad = (roads, x, y) =>
    roads.some((r) => x >= r.x * TILE - 1.5 && x <= (r.x + r.w) * TILE + 1.5 && y >= r.y * TILE - 1.5 && y <= (r.y + r.h) * TILE + 1.5);

  // Which colour is a light showing, and for how long has it shown it?
  function lightPhase(l, t) {
    const total = l.cycle.reduce((a, c) => a + c[1], 0), q = t + l.offset;
    let p = q % total;
    for (const [colour, d] of l.cycle) {
      if (p < d) return { colour, into: p, idx: Math.floor(q / total) };
      p -= d;
    }
    return { colour: 'green', into: 0, idx: 0 };
  }

  class Sim {
    constructor(def) {
      this.def = def;
      this.onEnd = null;
      this.reset();
    }

    get over() { return this.state === 'success' || this.state === 'fail'; }

    reset() {
      const d = this.def;
      this.time = 0; this.state = 'idle'; this.result = null; this.crash = null;
      this.car = { x: tc(d.car.tx), y: tc(d.car.ty), h: HEAD[d.car.dir], th: HEAD[d.car.dir], moving: false, slow: false, trail: [], last: null };
      this.obstacles = (d.obstacles || []).map((o) => {
        const r = o.kind === 'crate' ? 16 : 11;
        return { ...o, x: tc(o.tx), y: tc(o.ty), r, lat: r + 13 };
      });
      this.peds = (d.peds || []).map((p) => ({ ...p, st: 'pending', w: 0, y: 0 }));
      this.movers = (d.movers || []).map((m) => ({ ...m, len: Math.hypot(m.x2 - m.x1, m.y2 - m.y1), s: m.s0 || 0, dir: 1, x: m.x1, y: m.y1 }));
      this.cross = (d.cross || []).map((c) => ({ ...c, active: false, cyc: -1, y: c.from }));
      this.lights = (d.lights || []).map((l) => ({ ...l, colour: lightPhase(l, 0).colour }));
      this.stats = { senses: 0, decisions: 0, acts: 0, minPed: Infinity };
      this.updateMovers(0);
      this.perceive();
    }

    // ---- world update -------------------------------------------------
    tick(dt) {
      if (this.over) return;
      this.time += dt;
      this.car.moving = false;
      for (const l of this.lights) l.colour = lightPhase(l, this.time).colour;
      this.updatePeds(dt); this.updateMovers(dt); this.updateCross(dt); this.updateCar(dt);
      this.checkHazards(); this.checkDest();
      if (!this.over && this.time > this.def.limit)
        this.finish(false, 'Out of time', 'The car was still waiting or stuck. Check your conditions and loops.');
      this.perceive();
    }

    updatePeds(dt) {
      const P = this.def.pedPath;
      for (const p of this.peds) {
        if (p.st === 'gone') continue;
        if (p.st === 'pending') {
          if (this.time >= p.t) { p.st = 'wait'; p.w = 0; p.y = p.from === 'top' ? P.topY : P.botY; }
          continue;
        }
        if (p.st === 'wait') { p.w += dt; if (p.w >= 0.8) p.st = 'cross'; continue; }
        const down = p.from === 'top';
        p.y += (down ? 1 : -1) * P.speed * dt;
        if (down ? p.y >= P.botEnd : p.y <= P.topEnd) p.st = 'gone';
      }
    }

    updateMovers(dt) {
      for (const m of this.movers) {
        m.s += m.dir * m.speed * dt;
        if (m.s > m.len) { m.s = m.len; m.dir = -1; }
        if (m.s < 0) { m.s = 0; m.dir = 1; }
        m.x = m.x1 + ((m.x2 - m.x1) * m.s) / m.len;
        m.y = m.y1 + ((m.y2 - m.y1) * m.s) / m.len;
      }
    }

    // Cross traffic drives through the junction while the car's light is red.
    updateCross(dt) {
      const l = this.lights[0];
      if (!l) return;
      const ph = lightPhase(l, this.time);
      for (const c of this.cross) {
        if (!c.active) {
          if (ph.colour === 'red' && c.cyc !== ph.idx && ph.into >= c.spawn) { c.active = true; c.cyc = ph.idx; c.y = c.from; }
        } else {
          c.y += c.vy * c.speed * dt;
          if (c.vy > 0 ? c.y >= c.to : c.y <= c.to) c.active = false;
        }
      }
    }

    updateCar(dt) {
      const c = this.car, diff = c.th - c.h;
      if (Math.abs(diff) > 0.01) c.h += Math.sign(diff) * Math.min(Math.abs(diff), 320 * dt);
    }

    // ---- collisions and goals ------------------------------------------
    solids() {
      const out = [];
      for (const o of this.obstacles) out.push({ x: o.x, y: o.y, r: o.r, k: 'obs', lat: o.lat });
      for (const m of this.movers) out.push({ x: m.x, y: m.y, r: 15, k: 'obs', lat: 80 });
      for (const c of this.cross)
        if (c.active) out.push({ x: c.x, y: c.y - 10, r: 10, k: 'obs', lat: 24 }, { x: c.x, y: c.y + 10, r: 10, k: 'obs', lat: 24 });
      for (const p of this.peds) if (p.st === 'wait' || p.st === 'cross') out.push({ x: p.x, y: p.y, r: 7, k: 'ped', lat: 46 });
      return out;
    }

    carParts() {
      const c = this.car, a = rad(c.h), cx = Math.cos(a), sy = Math.sin(a);
      return [-11, 0, 11].map((o) => ({ x: c.x + cx * o, y: c.y + sy * o, r: 9.5 }));
    }

    checkHazards() {
      if (this.over) return;
      const c = this.car, parts = this.carParts();
      for (const s of this.solids()) {
        if (s.k === 'ped') this.stats.minPed = Math.min(this.stats.minPed, Math.hypot(s.x - c.x, s.y - c.y));
        for (const p of parts) {
          if (Math.hypot(p.x - s.x, p.y - s.y) < p.r + s.r - 1) {
            this.crash = { x: (p.x + s.x) / 2, y: (p.y + s.y) / 2 };
            return s.k === 'ped'
              ? this.finish(false, 'You hit a pedestrian!', 'The car did not stop for the person crossing. Check for pedestrians before every move.')
              : this.finish(false, 'Collision!', 'The car hit something in its way. Check what is ahead before you drive forward.');
          }
        }
      }
      const a = rad(c.h), cs = Math.cos(a), sn = Math.sin(a);
      for (const [sx, sy] of [[HL, 9], [HL, -9], [-HL, 9], [-HL, -9]]) {
        if (!SDL.inRoad(this.def.roads, c.x + cs * sx - sn * sy, c.y + sn * sx + cs * sy)) {
          this.crash = { x: c.x, y: c.y };
          return this.finish(false, 'Off the road!', 'The car left the road. Count your steps and check each turn.');
        }
      }
    }

    inDest() {
      const d = this.def.dest, c = this.car;
      return c.x >= d.x * TILE && c.x <= (d.x + d.w) * TILE && c.y >= d.y * TILE && c.y <= (d.y + d.h) * TILE;
    }

    checkDest() {
      if (!this.over && this.inDest()) this.finish(true, 'Destination reached!', 'Your program got the car there safely.');
    }

    finish(ok, title, msg) {
      if (this.over) return;
      this.state = ok ? 'success' : 'fail';
      this.result = { ok, title, msg, time: this.time, stats: { ...this.stats } };
      if (this.onEnd) this.onEnd(this.result);
    }

    programEnded() {
      this.checkDest();
      if (!this.over) this.finish(false, 'The program finished early', 'The car stopped before the destination. Check your step counts, or use a loop to keep going.');
    }

    // ---- sensors -------------------------------------------------------
    // Look from the car in a direction (off = degrees relative to the heading: 0 ahead, 90 right, 180 behind, -90 left).
    // Returns the nearest hazard of that kind and the gap (px) to its edge.
    scan(kind, off, list) {
      const c = this.car, a = rad(c.h + off), fx = Math.cos(a), fy = Math.sin(a), side = off === 90 || off === -90;
      const half = side ? 10 : HL;
      let best = Infinity, hit = null;
      for (const s of list) {
        if (kind !== 'any' && s.k !== kind) continue;
        const dx = s.x - c.x, dy = s.y - c.y, f = dx * fx + dy * fy, l = -dx * fy + dy * fx;
        if (f <= 0 || Math.abs(l) > (off === 0 ? s.lat : s.r + 16)) continue;
        const gap = f - s.r - half;
        if (gap < best) { best = gap; hit = s; }
      }
      return { gap: Math.max(0, best), hit };
    }

    // Is there road one tile away? turn: 0 ahead, 1 right, 2 behind, -1 left.
    roadAt(turn) {
      const c = this.car, k = (((Math.round(c.h / 90) + turn) % 4) + 4) % 4, v = VEC[k];
      return SDL.inRoad(this.def.roads, c.x + v[0] * TILE, c.y + v[1] * TILE);
    }

    lightAhead() {
      const c = this.car;
      if (Math.abs(norm(c.h)) > 1) return 'none';
      for (const l of this.lights) {
        const d = l.lineX - (c.x + HL);
        if (l.dir === 'e' && c.y >= l.y0 && c.y <= l.y1 && d >= -2 && d <= 200) return l.colour;
      }
      return 'none';
    }

    perceive() {
      const list = this.solids(), D = { F: 0, R: 90, B: 180, L: -90 };
      const obs = {}, ped = {}, any = {}, rng = {}, hits = {};
      for (const k in D) {
        const o = this.scan('obs', D[k], list), p = this.scan('ped', D[k], list), a = this.scan('any', D[k], list);
        obs[k] = !!o.hit && o.gap <= 60;
        ped[k] = !!p.hit && p.gap <= (k === 'F' ? 85 : 70);
        any[k] = obs[k] || ped[k];
        rng[k] = a.hit ? Math.min(9, Math.round(a.gap / 4) / 10) : 9; // tiles, 9 = nothing in range
        hits[k] = { obs: o.hit, ped: p.hit };
      }
      const road = { F: this.roadAt(0), R: this.roadAt(1), B: this.roadAt(2), L: this.roadAt(-1) };
      return (this.sense = {
        obs: obs.F, ped: ped.F, dist: rng.F, light: this.lightAhead(), atDest: this.inDest(),
        hitObs: hits.F.obs, hitPed: hits.F.ped,
        det: { obs, ped, any }, rng, road, hits,
        junction: [road.F, road.L, road.R].filter(Boolean).length >= 2,
        face: FACE[((Math.round(this.car.h / 90) % 4) + 4) % 4],
      });
    }

    // ---- movement used by the Blockly runtime ----------------------------
    moveCar(d) {
      const c = this.car, a = rad(c.h), cs = Math.cos(a), sn = Math.sin(a), f0 = c.x + cs * HL;
      c.x += cs * d; c.y += sn * d; c.moving = true;
      if (!c.last || Math.hypot(c.x - c.last[0], c.y - c.last[1]) > 10) {
        c.trail.push([c.x, c.y]); c.last = [c.x, c.y];
        if (c.trail.length > 500) c.trail.shift();
      }
      if (Math.abs(norm(c.h)) < 1)
        for (const l of this.lights)
          if (l.dir === 'e' && c.y >= l.y0 && c.y <= l.y1 && f0 < l.lineX && c.x + HL >= l.lineX && l.colour === 'red')
            return this.finish(false, 'You ran a red light!', 'The car drove through a red signal. Read the traffic light and stop while it is red.');
      this.checkHazards(); this.checkDest();
    }

    snap() {
      const c = this.car;
      c.x = tc(Math.round((c.x - TILE / 2) / TILE));
      c.y = tc(Math.round((c.y - TILE / 2) / TILE));
    }
  }

  SDL.Sim = Sim;
})(globalThis);