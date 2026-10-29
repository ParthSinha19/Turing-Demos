/* Self-Driving Lab — mission registry and scenario builders. Add a mission by adding an entry to SDL.MISSIONS. */
(function (g) {
  'use strict';
  const SDL = (g.SDL = g.SDL || {});
  const H = SDL.H;
  const road = (x, y, w, h) => ({ x, y, w, h });

  const PED = { topY: 232, botY: 328, topEnd: 206, botEnd: 354, speed: 42 };
  const ZEBRA = { x: 440, y: 240, h: 80, w: 64 };
  const lightDef = (green) => ({ dir: 'e', lineX: 320, y0: 240, y1: 320, cycle: [['green', green], ['amber', 1.5], ['red', 7]], offset: green + 0.5 });
  const crossCars = () =>
    [[420, -30, H + 30, 1, 0.2], [420, -30, H + 30, 1, 2.2], [380, H + 30, -30, -1, 0.8], [380, H + 30, -30, -1, 3.0]]
      .map(([x, from, to, vy, spawn]) => ({ x, from, to, vy, spawn, speed: 110 }));
  const peds = (list) => list.map(([t, from, x]) => ({ t, from, x }));
  const trolley = () => ({ kind: 'trolley', x1: 620, y1: 80, x2: 620, y2: 440, speed: 60, s0: 60 });
  const M3_PEDS = [[2.4, 'top', 440], [7.0, 'bottom', 430], [11.5, 'top', 452], [15.5, 'bottom', 438], [19.5, 'top', 426], [20.0, 'top', 456], [24, 'bottom', 440]];

  function pedSchedule(freq) {
    const gap = { calm: 6, normal: 4, busy: 2.6 }[freq] || 4, rnd = SDL.rng ? SDL.rng(5) : Math.random;
    const out = [];
    for (let t = 2.5, i = 0; t < 90; t += gap * (0.8 + rnd() * 0.5), i++) out.push({ t, from: i % 2 ? 'bottom' : 'top', x: 428 + Math.round(rnd() * 24) });
    return out;
  }

  const ALL = ['forward', 'turn', 'curve', 'stop', 'brake', 'obstacle', 'pedestrian', 'light', 'distance', 'detect', 'range', 'road', 'junction', 'facing', 'dest',
    'if', 'ifelse', 'compare', 'andor', 'not', 'repeat', 'while'];
  SDL.ALL_BLOCKS = ALL;

  // ---------------------------------------------------------------------------------------------
  // Text-map levels. One character per tile:
  //   .  empty      #  road       > v < ^  start (facing right / down / left / up)
  //   F  finish     c  cone       x  crate      L  traffic light (cars heading right)     T  trolley
  // ---------------------------------------------------------------------------------------------
  SDL.padGrid = (rows) => Array.from({ length: SDL.ROWS }, (_, y) => String((rows && rows[y]) || '').padEnd(SDL.COLS, '.').slice(0, SDL.COLS));

  SDL.levelFromAscii = function (rows, o) {
    o = o || {};
    const { COLS, ROWS, TILE } = SDL;
    const grid = SDL.padGrid(rows), at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? '.' : grid[y][x]);
    const isRoad = (x, y) => at(x, y) !== '.';
    const green = o.green || 6, offs = o.offsets || [], DIR = { '>': 'e', v: 's', '<': 'w', '^': 'n' };
    const d = {
      townKey: o.townKey || 'ascii', seed: o.seed || 7, limit: o.limit || 90, grid: !!o.grid, gridAll: !!o.gridAll, nocache: !!o.nocache,
      roads: [], tiles: [], obstacles: [], lights: [], movers: [], car: null, dest: null, problem: '',
    };
    const trolleys = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const ch = at(x, y);
      if (ch === '.') continue;
      d.tiles.push(x + ',' + y);
      if (DIR[ch]) d.car = { tx: x, ty: y, dir: DIR[ch] };
      else if (ch === 'F') d.dest = { x, y, w: 1, h: 1 };
      else if (ch === 'c' || ch === 'x') d.obstacles.push({ kind: ch === 'c' ? 'cone' : 'crate', tx: x, ty: y });
      else if (ch === 'L') {
        const i = d.lights.length;
        d.lights.push({ dir: 'e', lineX: x * TILE, y0: y * TILE, y1: (y + 1) * TILE, cycle: [['green', green], ['amber', 1.5], ['red', 7]], offset: offs[i] != null ? offs[i] : 0 });
      } else if (ch === 'T') trolleys.push([x, y]);
    }
    // Merge road tiles into rectangles (row runs, then stack identical runs).
    const open = {};
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS;) {
        if (!isRoad(x, y)) { x++; continue; }
        const x0 = x;
        while (x < COLS && isRoad(x, y)) x++;
        const k = x0 + '_' + (x - x0), prev = open[k];
        if (prev && prev.y + prev.h === y) prev.h++;
        else { const r = road(x0, y, x - x0, 1); open[k] = r; d.roads.push(r); }
      }
    }
    // Trolleys patrol the straight run of road they sit on.
    for (const [x, y] of trolleys) {
      const ext = (dx, dy) => {
        let a = 0, b = 0;
        while (isRoad(x - dx * (a + 1), y - dy * (a + 1))) a++;
        while (isRoad(x + dx * (b + 1), y + dy * (b + 1))) b++;
        return [a, b];
      };
      let [a, b] = ext(0, 1), vert = true;
      if (a + b < 1) { [a, b] = ext(1, 0); vert = false; }
      if (a + b < 1) continue;
      let lo = -a, hi = b;
      if (hi - lo + 1 >= 4) { lo++; hi--; } // keep clear of the corners on long runs
      const base = vert ? y : x, c1 = (base + lo) * TILE + 18, c2 = (base + hi + 1) * TILE - 18, mid = (vert ? x : y) * TILE + TILE / 2;
      d.movers.push(vert
        ? { kind: 'trolley', x1: mid, y1: c1, x2: mid, y2: c2, speed: 55, s0: 0 }
        : { kind: 'trolley', x1: c1, y1: mid, x2: c2, y2: mid, speed: 55, s0: 0 });
    }
    let prob = '';
    if (!d.car) { prob = 'Add a start: choose “Start car” and click a road tile.'; d.car = { tx: 1, ty: 1, dir: 'e' }; }
    if (!d.dest) { prob = prob || 'Add a finish: choose “Finish” and click a road tile.'; d.dest = { x: 0, y: 0, w: 1, h: 1 }; }
    d.problem = prob;
    return d;
  };

  const rep = (c, n) => c.repeat(n), dots = (n) => '.'.repeat(n);
  const LV = {
    straight: ['', '', '', '', '', '', '.>' + rep('#', 18) + 'F'],
    stairs: ['', '', '.>#####', '......#', '......#', '......######', dots(11) + '#', dots(11) + '#', dots(11) + '######', dots(16) + '#', dots(16) + '#', dots(16) + 'F'],
    winding: ['', '.>#######', dots(8) + '#', dots(8) + '#', dots(3) + rep('#', 6), dots(3) + '#', dots(3) + '#', dots(3) + rep('#', 12),
      dots(14) + '#', dots(14) + '#', dots(14) + rep('#', 7), dots(20) + '#', dots(20) + 'F'],
    branch: ['', '', '', dots(6) + '#', dots(6) + '#', dots(6) + '#', dots(6) + 'x', '.>' + rep('#', 5) + dots(6) + rep('#', 7) + 'F',
      dots(6) + '#' + dots(6) + '#', dots(6) + '#' + dots(6) + '#', dots(6) + '#' + dots(6) + '#', dots(6) + rep('#', 8), dots(13) + 'x', dots(13) + '#'],
    rush: ['', '', '', '.>###L#####', dots(10) + '#', dots(10) + '#', dots(10) + 'T', dots(10) + '#', dots(10) + '#', dots(10) + '####L####',
      dots(18) + '#', dots(18) + '#', dots(18) + 'F'],
    cross: ['', '', dots(10) + '#', dots(10) + '#', dots(10) + '#', dots(10) + '#', '.>###L' + rep('#', 14) + 'F', dots(10) + '#', dots(10) + '#', dots(10) + '#', dots(10) + '#'],
  };

  SDL.TEMPLATES = {
    'Straight road': LV.straight, 'Staircase': LV.stairs, 'Winding road': LV.winding,
    'Choose a branch': LV.branch, 'Traffic-light street': LV.rush, 'Crossroads with light': LV.cross,
  };

  SDL.MISSIONS = [
    {
      id: 'm1', title: 'First Drive', tag: 'Sequences',
      brief: 'Your car follows instructions exactly, one block at a time. One drive-forward step moves it one tile. Plan the route, then write it as a sequence.',
      objective: 'Drive the car from the start to the chequered flag.',
      hints: ['Switch on the Grid button: each square is one step.', 'The car starts facing right. Drive forward 5 steps to reach the corner, then turn.', 'Route: forward 5, turn right, forward 6, turn left, forward 8.'],
      ext: { text: 'Use a repeat block in your solution.', check: (r) => r.types.has('controls_repeat_ext') },
      blocks: ['forward', 'turn', 'repeat'],
      starter: '<block type="car_forward"><value name="STEPS"><shadow type="math_number"><field name="NUM">5</field></shadow></value></block>',
      world: () => ({
        townKey: 'm1', seed: 11, grid: true, limit: 60,
        roads: [road(0, 2, 8, 2), road(6, 2, 2, 8), road(6, 8, 12, 2)],
        car: { tx: 1, ty: 2, dir: 'e' }, dest: { x: 14, y: 8, w: 1, h: 1 },
      }),
    },
    {
      id: 'm2', title: 'Traffic Lights', tag: 'Perception + rules',
      brief: 'A junction ahead has traffic lights, and cross traffic uses it when your light is red. The car must read the light (perception), then decide whether to wait or go.',
      objective: 'Reach the destination without running a red light.',
      hints: ['The light sensor only sees the light when it is within about 5 tiles ahead.', 'Repeat until at destination: if the light is red, stop, otherwise drive forward 1.', 'Far from the junction the sensor sees no light at all. Stop on red or amber, not just when it is not green.'],
      ext: { text: 'Finish in under 16 seconds.', check: (r) => r.time < 16 },
      blocks: ['forward', 'stop', 'light', 'dest', 'if', 'ifelse', 'andor', 'not', 'repeat', 'while'],
      world: () => ({
        townKey: 'm2', seed: 2, limit: 60,
        roads: [road(0, 6, 22, 2), road(9, 0, 2, 14)],
        car: { tx: 1, ty: 6, dir: 'e' }, dest: { x: 20, y: 6, w: 1, h: 2 },
        lights: [lightDef(6)], cross: crossCars(),
      }),
    },
    {
      id: 'm3', title: 'Pedestrian Safety', tag: 'Safe decisions',
      brief: 'People use the zebra crossing at unpredictable moments. The car must notice them early, stop, and only continue when the crossing is clear.',
      objective: 'Reach the destination without hitting anyone.',
      hints: ['The pedestrian sensor looks about 2 tiles ahead of the car.', 'Inside a repeat loop: if pedestrian ahead, stop, otherwise drive forward 1.', 'Check before every step. Retry a few times: does your car cope when pedestrians appear at different moments?'],
      ext: { text: 'Never come within 1.5 tiles of a pedestrian.', check: (r) => r.minPed >= 60 },
      blocks: ['forward', 'stop', 'brake', 'pedestrian', 'distance', 'dest', 'if', 'ifelse', 'compare', 'andor', 'not', 'repeat', 'while'],
      world: () => ({
        townKey: 'm3', seed: 3, limit: 60,
        roads: [road(0, 6, 22, 2)], crossing: ZEBRA, pedPath: PED, peds: peds(M3_PEDS),
        car: { tx: 1, ty: 6, dir: 'e' }, dest: { x: 20, y: 6, w: 1, h: 2 },
      }),
    },
    {
      id: 'm4', title: 'Unexpected Obstacles', tag: 'Test and improve',
      brief: 'A cone, a crate and a runaway shopping trolley block the road. Sensors tell the car what is ahead; you decide how to react. Your first program may not work, so test it and improve it.',
      objective: 'Reach the finish line without touching anything.',
      hints: ['Use repeat while NOT obstacle ahead to drive up to the first cone.', 'To go round: turn right, drive 1, turn left, drive 3. The crate is in the other lane, so turn the opposite way.', 'For the trolley: stop while an obstacle is ahead, then drive on. Watch the sensor panel and improve.'],
      ext: { text: 'Use the distance sensor in your program.', check: (r) => r.types.has('sense_distance') },
      blocks: ['forward', 'turn', 'stop', 'brake', 'obstacle', 'pedestrian', 'distance', 'dest', 'if', 'ifelse', 'compare', 'andor', 'not', 'repeat', 'while'],
      world: () => ({
        townKey: 'm4', seed: 4, limit: 70,
        roads: [road(0, 6, 22, 2), road(15, 2, 2, 10)],
        car: { tx: 1, ty: 6, dir: 'e' }, dest: { x: 20, y: 6, w: 1, h: 2 },
        obstacles: [{ kind: 'cone', tx: 7, ty: 6 }, { kind: 'crate', tx: 11, ty: 7 }], movers: [trolley()],
      }),
    },
    {
      id: 'm5', title: 'Corners', tag: 'Turning + loops',
      brief: 'Roads bend! At a corner the car stops, turns on the spot, then drives on. This staircase repeats the same pattern again and again, which is exactly what a loop is for.',
      objective: 'Follow the staircase road to the chequered flag.',
      hints: ['Switch on the Grid. Count the steps along the first stretch, then the first drop.', 'The pattern is: forward 5, turn right, forward 3, turn left. It happens 3 times.', 'Put that pattern inside a repeat 3 times block. Try the curve block too: it turns a corner smoothly.'],
      ext: { text: 'Solve it with a repeat block and 6 blocks or fewer.', check: (r) => r.types.has('controls_repeat_ext') && r.blocks <= 6 },
      blocks: ['forward', 'turn', 'curve', 'repeat'],
      world: () => SDL.levelFromAscii(LV.stairs, { townKey: 'm5', seed: 5, limit: 70, grid: true }),
    },
    {
      id: 'm6', title: 'Follow the Road', tag: 'Sensing the road',
      brief: 'This road twists and turns, and you do not know how long each stretch is. Use the road sensors to let the car work it out for itself: keep going while the road continues, and turn when it bends.',
      objective: 'Reach the finish without counting a single step.',
      hints: ['Repeat until at destination, then check the road with the sensors.', 'If road ahead: drive forward 1. Otherwise the road bends.', 'Otherwise, if road left: turn left, else turn right. Watch the Road row in the sensor panel.'],
      ext: { text: 'Solve it with 10 blocks or fewer.', check: (r) => r.types.has('sense_road') && r.blocks <= 10 },
      blocks: ['forward', 'turn', 'curve', 'road', 'dest', 'if', 'ifelse', 'andor', 'not', 'repeat', 'while'],
      world: () => SDL.levelFromAscii(LV.winding, { townKey: 'm6', seed: 6, limit: 90 }),
    },
    {
      id: 'm7', title: 'Pick the Open Road', tag: 'Side sensors',
      brief: 'The road splits at T-junctions, and one branch is blocked by a crate. Side sensors tell the car what is beside it. Detect the blocked branch, then choose the other one.',
      objective: 'Get through both junctions to the finish.',
      hints: ['Use road ahead to keep driving, and at a corner turn towards the side that has road.', 'At a junction both sides have road, so check obstacle left?: if the left branch is blocked, turn right.', 'The second junction is blocked on the opposite side. A program that senses works on both. A fixed one will not.'],
      ext: { text: 'Use the junction sensor in your program.', check: (r) => r.types.has('sense_junction') },
      blocks: ['forward', 'turn', 'curve', 'road', 'junction', 'detect', 'range', 'facing', 'dest', 'if', 'ifelse', 'andor', 'not', 'repeat', 'while'],
      world: () => SDL.levelFromAscii(LV.branch, { townKey: 'm7', seed: 8, limit: 100 }),
    },
    {
      id: 'm8', title: 'Rush Hour', tag: 'Everything together',
      brief: 'Two traffic lights, a runaway trolley patrolling the road and two corners. Combine everything you have learned: perceive, decide, act, then test and improve.',
      objective: 'Reach the finish without breaking any rules.',
      hints: ['Start with a loop: repeat until at destination.', 'Handle one thing at a time: red light means stop, an obstacle ahead means stop, road ahead means drive, otherwise turn.', 'Retry and watch the trolley. Does your program still work if the timing changes?'],
      ext: { text: 'Finish in under 40 seconds.', check: (r) => r.time < 40 },
      blocks: ['forward', 'turn', 'curve', 'stop', 'brake', 'obstacle', 'distance', 'light', 'detect', 'range', 'road', 'dest', 'if', 'ifelse', 'compare', 'andor', 'not', 'repeat', 'while'],
      world: () => SDL.levelFromAscii(LV.rush, { townKey: 'm8', seed: 9, limit: 120, green: 4, offsets: [5.5, 3.5] }),
    },
  ];

  // Sandbox: presets that reuse the same engine. Settings: green length, pedestrian frequency, trolley, extra cones, custom level.
  SDL.sandboxDefaults = { preset: 'lights', green: 6, ped: 'normal', trolley: true, cones: [], custom: null };
  SDL.sandboxDef = function (s) {
    if (s.preset === 'custom')
      return SDL.levelFromAscii(s.custom || LV.straight, { townKey: 'custom', nocache: true, gridAll: true, grid: true, seed: 7, limit: 120, green: s.green });
    const d = { townKey: 'sb-' + s.preset, seed: 7, limit: 90, roads: [road(0, 6, 22, 2)], car: { tx: 1, ty: 6, dir: 'e' }, dest: { x: 20, y: 6, w: 1, h: 2 }, obstacles: [] };
    if (s.preset === 'lights') { d.roads.push(road(9, 0, 2, 14)); d.lights = [lightDef(s.green)]; d.cross = crossCars(); }
    if (s.preset === 'ped') { d.crossing = ZEBRA; d.pedPath = PED; d.peds = pedSchedule(s.ped); }
    if (s.preset === 'obstacles') {
      d.roads.push(road(15, 2, 2, 10));
      d.obstacles = [{ kind: 'cone', tx: 7, ty: 6 }, { kind: 'crate', tx: 11, ty: 7 }];
      if (s.trolley) d.movers = [trolley()];
    }
    for (const k of s.cones || []) { const [tx, ty] = k.split(',').map(Number); d.obstacles.push({ kind: 'cone', tx, ty }); }
    return d;
  };
})(globalThis);