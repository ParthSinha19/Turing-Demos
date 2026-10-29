/* Self-Driving Lab — Blockly runtime. Runs generated code as a generator, one frame at a time. No Blockly dependency. */
(function (g) {
  'use strict';
  const SDL = (g.SDL = g.SDL || {});
  const { STEP, TILE } = SDL;
  const DK = { ahead: 'F', left: 'L', right: 'R', behind: 'B' };

  // The "api" object is what the generated program talks to: sensors (perception) and actions (control).
  class Api {
    constructor(sim, hooks) {
      this.sim = sim; this.hooks = hooks || {}; this.read = null; this.seen = {};
    }
    hl(id) { if (this.hooks.hl) this.hooks.hl(id); }
    log(tag, text) { if (this.hooks.log) this.hooks.log(tag, text); }
    pulse(k) { if (this.hooks.pulse) this.hooks.pulse(k); }

    *tick() { yield; }
    *wait(sec) {
      const t0 = this.sim.time;
      do { yield; } while (this.sim.time - t0 < sec);
    }

    act(text) {
      this.sim.stats.acts++;
      const why = this.read; this.read = null;
      this.log('act', text + (why ? ' · ' + why : ''));
      this.pulse('act');
    }

    *forward(n) {
      const s = this.sim;
      n = Math.max(0, Math.min(40, Math.round(Number(n) || 0)));
      const slow = s.car.slow; s.car.slow = false;
      this.act(`drive forward ${n} ${n === 1 ? 'step' : 'steps'}${slow ? ' (slowly)' : ''}`);
      let left = n * TILE;
      const v = slow ? 40 : 100;
      while (left > 0.001) {
        const d = Math.min(v * STEP, left);
        s.moveCar(d); left -= d;
        yield;
      }
      s.snap();
    }
    *turn(dir) {
      const c = this.sim.car;
      this.act('turn ' + dir);
      c.th += dir === 'left' ? -90 : 90;
      while (Math.abs(c.th - c.h) > 0.01) yield;
      c.h = c.th = SDL.norm(c.th);
    }
    // Smooth quarter-circle: one tile forward and one tile sideways, ending facing the new direction.
    *curve(dir) {
      const s = this.sim, c = s.car, sign = dir === 'left' ? -1 : 1;
      const slow = c.slow; c.slow = false;
      this.act(`curve ${dir}${slow ? ' (slowly)' : ''}`);
      const v = slow ? 40 : 90, R = TILE, end = c.th + sign * 90;
      let turned = 0;
      while (turned < 90 - 1e-6) {
        const dA = Math.min(((v * STEP) / R) * (180 / Math.PI), 90 - turned);
        const d = R * ((dA * Math.PI) / 180);
        c.h += (sign * dA) / 2; c.th = c.h;
        s.moveCar(d);
        c.h += (sign * dA) / 2; c.th = c.h;
        turned += dA;
        yield;
      }
      c.h = c.th = SDL.norm(end);
      s.snap();
    }
    *stop() { this.act('stop'); yield* this.wait(0.5); }
    *brake() { this.sim.car.slow = true; this.act('brake — next move is slow'); yield* this.wait(0.2); }

    sensor(key, val, label) {
      this.sim.stats.senses++;
      const txt = `${label}: ${typeof val === 'boolean' ? (val ? 'yes' : 'no') : val}`;
      this.read = txt;
      if (this.seen[key] !== txt) { this.seen[key] = txt; this.log('sense', txt); }
      this.pulse('sense');
      return val;
    }
    obstacle() { return this.sensor('obs', this.sim.perceive().obs, 'obstacle ahead'); }
    pedestrian() { return this.sensor('ped', this.sim.perceive().ped, 'pedestrian ahead'); }
    light(c) { return this.sensor('light' + c, this.sim.perceive().light === c, `light is ${c}`); }
    dest() { return this.sensor('dest', this.sim.perceive().atDest, 'at destination'); }
    distance() { return this.sensor('dist', this.sim.perceive().dist, 'distance ahead (tiles)'); }

    // ---- directional sensors ----
    detect(kind, dir) {
      const s = this.sim.perceive(), D = DK[dir] || 'F', k = kind === 'pedestrian' ? 'ped' : kind === 'any' ? 'any' : 'obs';
      return this.sensor('det' + kind + dir, !!s.det[k][D], `${kind} ${dir}`);
    }
    range(dir) { return this.sensor('rng' + dir, this.sim.perceive().rng[DK[dir] || 'F'], `distance ${dir} (tiles)`); }
    road(dir) { return this.sensor('road' + dir, !!this.sim.perceive().road[DK[dir] || 'F'], `road ${dir}`); }
    junction() { return this.sensor('junc', this.sim.perceive().junction, 'at a junction'); }
    facing(name) { return this.sensor('face' + name, this.sim.perceive().face === name, `facing ${name}`); }
  }

  class Runner {
    constructor(sim, code, hooks) {
      this.sim = sim; this.done = false;
      this.api = new Api(sim, hooks);
      const GenFn = Object.getPrototypeOf(function* () {}).constructor;
      this.gen = new GenFn('api', code)(this.api);
    }
    // Advance the program until its next wait (one frame at most per action/loop pass).
    step() {
      if (this.done || this.sim.over) return;
      try {
        if (this.gen.next().done) { this.done = true; this.sim.programEnded(); }
      } catch (e) {
        this.done = true;
        this.sim.finish(false, 'Program error', String((e && e.message) || e));
      }
    }
  }

  SDL.Api = Api; SDL.Runner = Runner;
})(globalThis);