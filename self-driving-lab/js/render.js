/* Self-Driving Lab — 3D renderer (Three.js). Day/night themes, transparent canvas (the page paints the sky). */
(function (g) {
  'use strict';
  const SDL = (g.SDL = g.SDL || {});
  const THREE = g.THREE;
  if (!THREE) throw new Error('Three.js not loaded: add the three.min.js script tag before render.js');
  const { TILE, W, H, COLS, ROWS, rad } = SDL;
  const PAL = [['#ecd2ae', '#d9b98e'], ['#dfbcb0', '#c99f92'], ['#bccbdc', '#9fb3c9'], ['#e6dfcb', '#cfc6aa'], ['#c9d9c2', '#aac2a2'], ['#e0b3a6', '#c98f80']];
  const ROOFS = ['#c9604a', '#b8503c', '#d17a4a', '#8a5a7a', '#5e7fa8'];
  const FLOWERS = ['#ff7a8a', '#ffd24a', '#ffffff', '#b78bff', '#ff9a4a'];
  const COL = { red: '#ff4d5e', amber: '#ffb62e', green: '#34e39b' };
  const DIM = { red: '#4a2229', amber: '#4a3a1d', green: '#1f4034' };
  const PI = Math.PI;

  /* ---------- small helpers ---------- */
  const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const bas = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  const gc = {};
  const cache = (k, f) => {
    if (!gc[k]) { const v = f(); if (v && v.userData) v.userData.shared = true; gc[k] = v; }
    return gc[k];
  };
  const boxG = (w, h, d) => cache('b' + w + '_' + h + '_' + d, () => new THREE.BoxGeometry(w, h, d));
  const cylG = (a, b, h, s) => cache('c' + a + '_' + b + '_' + h + '_' + (s || 16), () => new THREE.CylinderGeometry(a, b, h, s || 16));
  const sphG = (r) => cache('s' + r, () => new THREE.SphereGeometry(r, 14, 10));
  const M = (geo, mat, x, y, z, cast) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = cast !== false; return m;
  };
  const flat = (geo) => { geo.rotateX(-PI / 2); return geo; };
  const disposeTree = (o) => o.traverse((n) => {
    if (n.geometry && !(n.geometry.userData && n.geometry.userData.shared)) n.geometry.dispose();
    if (!n.material) return;
    (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => {
      if (m.userData && m.userData.shared) return;
      if (m.map) m.map.dispose();
      m.dispose();
    });
  });
  const tex = (cv, aniso) => {
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = aniso || 1; return t;
  };

  // materials shared between towns (their look changes with day / night)
  const bandMat = lam('#2b3552'); bandMat.userData.shared = true;     // building window bands
  const lampMat = bas('#d8d2b0'); lampMat.userData.shared = true;     // street lamp bulbs

  /* ---------- static town (cached per townKey, rebuilt fresh for editable levels) ---------- */
  function buildTown(def, aniso) {
    const S = 2, cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    const c = cv.getContext('2d'); c.scale(S, S);
    const R = SDL.rng(def.seed || 1), roads = def.roads;
    const line = (x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
    const rr = (x, y, w, h, r) => {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    };
    // grass
    c.fillStyle = '#a8d48e'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 170; i++) {
      c.fillStyle = R() < 0.5 ? 'rgba(120,170,90,.3)' : 'rgba(205,238,175,.35)';
      c.beginPath(); c.ellipse(R() * W, R() * H, 10 + R() * 26, 6 + R() * 14, R() * 3, 0, 7); c.fill();
    }
    // pavement + asphalt
    c.fillStyle = '#dcd8cc';
    for (const r of roads) { rr(r.x * TILE - 16, r.y * TILE - 16, r.w * TILE + 32, r.h * TILE + 32, 10); c.fill(); }
    c.fillStyle = '#454c5a';
    for (const r of roads) c.fillRect(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE);
    // markings
    if (def.tiles) {
      const T = new Set(def.tiles), has = (x, y) => T.has(x + ',' + y), tl = def.tiles.map((k) => k.split(',').map(Number));
      c.setLineDash([]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.5)';
      for (const [tx, ty] of tl) {
        const x = tx * TILE, y = ty * TILE;
        if (!has(tx, ty - 1)) line(x, y + 5, x + TILE, y + 5);
        if (!has(tx, ty + 1)) line(x, y + TILE - 5, x + TILE, y + TILE - 5);
        if (!has(tx - 1, ty)) line(x + 5, y, x + 5, y + TILE);
        if (!has(tx + 1, ty)) line(x + TILE - 5, y, x + TILE - 5, y + TILE);
      }
      c.setLineDash([10, 10]); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,236,170,.85)';
      for (const [tx, ty] of tl) {
        const x = tx * TILE, y = ty * TILE;
        const hz = has(tx - 1, ty) || has(tx + 1, ty), vt = has(tx, ty - 1) || has(tx, ty + 1);
        if (hz && !vt) line(x, y + TILE / 2, x + TILE, y + TILE / 2);
        else if (vt && !hz) line(x + TILE / 2, y, x + TILE / 2, y + TILE);
      }
      c.setLineDash([]);
    } else {
      for (const r of roads) {
        const x = r.x * TILE, y = r.y * TILE, w = r.w * TILE, h = r.h * TILE, horiz = w >= h;
        c.setLineDash([]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.5)';
        if (horiz) { line(x, y + 5, x + w, y + 5); line(x, y + h - 5, x + w, y + h - 5); }
        else { line(x + 5, y, x + 5, y + h); line(x + w - 5, y, x + w - 5, y + h); }
        c.setLineDash([14, 12]); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,236,170,.85)';
        if (horiz) line(x, y + h / 2, x + w, y + h / 2); else line(x + w / 2, y, x + w / 2, y + h);
        c.setLineDash([]);
      }
      c.fillStyle = '#454c5a'; // junctions hide the markings
      for (let i = 0; i < roads.length; i++) for (let j = i + 1; j < roads.length; j++) {
        const a = roads[i], b = roads[j], x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y), x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
        if (x2 > x1 && y2 > y1) c.fillRect(x1 * TILE, y1 * TILE, (x2 - x1) * TILE, (y2 - y1) * TILE);
      }
    }
    if (def.crossing) {
      const z = def.crossing; c.fillStyle = 'rgba(255,255,255,.88)';
      for (let i = 0; i < 5; i++) c.fillRect(z.x - z.w / 2, z.y + 6 + i * 16, z.w, 8);
    }

    // choose building / tree / lamp spots (random per tile, so editing roads does not reshuffle the whole town)
    const occ = new Set(), key = (x, y) => x + ',' + y;
    const isRoad = (tx, ty) => roads.some((r) => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h);
    for (const l of def.lights || []) for (let x = Math.floor(l.lineX / TILE) - 2; x <= Math.floor(l.lineX / TILE); x++) for (let y = Math.floor(l.y0 / TILE) - 2; y < Math.floor(l.y0 / TILE); y++) occ.add(key(x, y));
    if (def.crossing) { const cx = Math.floor(def.crossing.x / TILE); for (let x = cx - 2; x <= cx + 1; x++) for (const y of [3, 4, 5, 8, 9, 10]) occ.add(key(x, y)); }
    const fits = (tx, ty, w, h) => { for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) if (x >= COLS || y >= ROWS || isRoad(x, y) || occ.has(key(x, y))) return false; return true; };
    const sizes = [[3, 2], [2, 2], [2, 3], [3, 3], [4, 2], [2, 2]], blds = [], trees = [], bushes = [], flowers = [], lamps = [];
    for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
      if (occ.has(key(tx, ty)) || isRoad(tx, ty)) continue;
      const Rt = SDL.rng((def.seed || 1) * 100003 + ty * COLS + tx);
      let placed = false;
      if (Rt() < 0.8) for (let k = 0; k < 4 && !placed; k++) {
        const [bw, bh] = sizes[Math.floor(Rt() * sizes.length)];
        if (!fits(tx, ty, bw, bh)) continue;
        for (let y = ty; y < ty + bh; y++) for (let x = tx; x < tx + bw; x++) occ.add(key(x, y));
        blds.push({
          x: tx * TILE + 18, y: ty * TILE + 18, w: bw * TILE - 36, d: bh * TILE - 36, col: PAL[Math.floor(Rt() * PAL.length)],
          h: 26 + Rt() * 34 + bw * bh * 2, pyr: Rt() < 0.55, roof: ROOFS[Math.floor(Rt() * ROOFS.length)],
        });
        placed = true;
      }
      if (!placed) {
        occ.add(key(tx, ty));
        const r1 = Rt(), r2 = Rt(), r3 = Rt(), r4 = Rt();
        const near = isRoad(tx + 1, ty) || isRoad(tx - 1, ty) || isRoad(tx, ty + 1) || isRoad(tx, ty - 1);
        if (near && r1 < 0.3) {
          let lx = tx * TILE + 8 + r2 * 24, lz = ty * TILE + 8 + r3 * 24;
          if (isRoad(tx + 1, ty)) lx = tx * TILE + TILE - 5; else if (isRoad(tx - 1, ty)) lx = tx * TILE + 5;
          else if (isRoad(tx, ty + 1)) lz = ty * TILE + TILE - 5; else lz = ty * TILE + 5;
          lamps.push([lx, lz]);
        } else if (r1 < 0.62) trees.push([tx * TILE + 12 + r2 * 16, ty * TILE + 12 + r3 * 16, 9 + r4 * 6, r4 < 0.35 ? 2 : r4 < 0.7 ? 1 : 0]);
        else if (r1 < 0.78) bushes.push([tx * TILE + 10 + r2 * 20, ty * TILE + 10 + r3 * 20, 5 + r4 * 3, r4 < 0.5]);
        else if (r1 < 0.92) flowers.push([tx * TILE + 8 + r2 * 24, ty * TILE + 8 + r3 * 24, r4]);
      }
    }

    const grp = new THREE.Group(), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color();
    const put = (mesh, i, x, y, z, sx, sy, sz) => { p.set(x, y, z); s.set(sx, sy, sz); mx.compose(p, q, s); mesh.setMatrixAt(i, mx); };
    const done = (...ms) => ms.forEach((m) => { m.castShadow = true; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; grp.add(m); });

    // diorama base: soil block with a grass rim, plus the painted ground
    const soil = M(boxG(W, 18, H), lam('#7b5a3c'), W / 2, -15.05, H / 2, false); soil.receiveShadow = true; grp.add(soil);
    const rim = M(boxG(W, 6, H), lam('#6f9a58'), W / 2, -3.05, H / 2, false); rim.receiveShadow = true; grp.add(rim);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), lam('#ffffff', { map: tex(cv, aniso) }));
    ground.rotation.x = -PI / 2; ground.position.set(W / 2, 0, H / 2); ground.receiveShadow = true; grp.add(ground);

    // grid overlay (clipped to roads unless the level is being edited), toggled from draw()
    const gcv = document.createElement('canvas'); gcv.width = W * S; gcv.height = H * S;
    const gx = gcv.getContext('2d'); gx.scale(S, S);
    if (!def.gridAll) {
      gx.beginPath();
      for (const r of roads) gx.rect(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE);
      gx.clip();
    }
    gx.strokeStyle = 'rgba(255,255,255,.28)'; gx.lineWidth = 1; gx.beginPath();
    for (let x = 0; x <= W; x += TILE) { gx.moveTo(x, 0); gx.lineTo(x, H); }
    for (let y = 0; y <= H; y += TILE) { gx.moveTo(0, y); gx.lineTo(W, y); }
    gx.stroke();
    const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), bas('#ffffff', { map: tex(gcv, aniso), transparent: true, depthWrite: false }));
    gridMesh.rotation.x = -PI / 2; gridMesh.position.set(W / 2, 0.3, H / 2); grp.add(gridMesh);
    grp.userData.grid = gridMesh;

    // buildings (instanced): body, flat or pitched roof, window bands, door
    if (blds.length) {
      const unit = boxG(1, 1, 1).clone().translate(0, 0.5, 0), n = blds.length;
      const body = new THREE.InstancedMesh(unit, lam('#ffffff'), n);
      const bandA = new THREE.InstancedMesh(unit, bandMat, n), bandB = new THREE.InstancedMesh(unit, bandMat, n);
      const door = new THREE.InstancedMesh(unit, lam('#7a4a2b'), n);
      const flatR = blds.filter((b) => !b.pyr), pyrR = blds.filter((b) => b.pyr);
      blds.forEach((b, i) => {
        const cx = b.x + b.w / 2, cz = b.y + b.d / 2;
        put(body, i, cx, 0, cz, b.w, b.h, b.d); body.setColorAt(i, col.set(b.col[0]));
        put(bandA, i, cx, b.h * 0.3, cz, b.w + 0.8, 5, b.d + 0.8);
        put(bandB, i, cx, b.h * 0.65, cz, b.w + 0.8, 5, b.d + 0.8);
        put(door, i, cx, 0, cz + b.d / 2 + 0.6, 8, 13, 1.6);
      });
      done(body, bandA, bandB, door);
      body.receiveShadow = true;
      if (flatR.length) {
        const roof = new THREE.InstancedMesh(unit, lam('#ffffff'), flatR.length);
        flatR.forEach((b, i) => { put(roof, i, b.x + b.w / 2, b.h, b.y + b.d / 2, b.w + 4, 3, b.d + 4); roof.setColorAt(i, col.set(b.col[1])); });
        done(roof);
      }
      if (pyrR.length) {
        const pg = new THREE.ConeGeometry(0.7071, 1, 4).rotateY(PI / 4).translate(0, 0.5, 0);
        const pyr = new THREE.InstancedMesh(pg, lam('#ffffff'), pyrR.length);
        pyrR.forEach((b, i) => { put(pyr, i, b.x + b.w / 2, b.h, b.y + b.d / 2, b.w + 7, 10 + Math.min(b.w, b.d) * 0.3, b.d + 7); pyr.setColorAt(i, col.set(b.roof)); });
        done(pyr);
      }
    }
    // trees (instanced): trunks, round foliage, pines
    if (trees.length) {
      const trunk = new THREE.InstancedMesh(cylG(1.6, 2.2, 8, 8).clone().translate(0, 4, 0), lam('#7a5430'), trees.length);
      const round = trees.filter((t) => t[3] < 2), pines = trees.filter((t) => t[3] === 2);
      trees.forEach(([x, z], i) => put(trunk, i, x, 0, z, 1, 1, 1));
      done(trunk);
      if (round.length) {
        const leaf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam('#ffffff'), round.length);
        round.forEach(([x, z, r, v], i) => { put(leaf, i, x, 8 + r * 0.85, z, r * 1.05, r * 1.05, r * 1.05); leaf.setColorAt(i, col.set(v ? '#74c46c' : '#5faa5a')); });
        done(leaf);
      }
      if (pines.length) {
        const pine = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.2, 8).translate(0, 1.1, 0), lam('#ffffff'), pines.length);
        pines.forEach(([x, z, r], i) => { put(pine, i, x, 6, z, r * 0.95, r * 1.05, r * 0.95); pine.setColorAt(i, col.set('#3f8f57')); });
        done(pine);
      }
    }
    // bushes
    if (bushes.length) {
      const bu = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam('#ffffff'), bushes.length);
      bushes.forEach(([x, z, r, v], i) => { put(bu, i, x, r * 0.6, z, r, r * 0.8, r); bu.setColorAt(i, col.set(v ? '#4e9f55' : '#67b966')); });
      done(bu);
    }
    // flowers
    if (flowers.length) {
      const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), lam('#ffffff'), flowers.length * 3);
      let k = 0;
      flowers.forEach(([x, z, v]) => {
        for (let j = 0; j < 3; j++) {
          put(fl, k, x + Math.cos(j * 2.1 + v * 6) * 5, 2.2, z + Math.sin(j * 2.1 + v * 6) * 5, 2.1, 2.1, 2.1);
          fl.setColorAt(k, col.set(FLOWERS[(Math.floor(v * 10) + j) % FLOWERS.length])); k++;
        }
      });
      done(fl);
    }
    // street lamps (the bulbs glow at night)
    if (lamps.length) {
      const pole = new THREE.InstancedMesh(cylG(1.1, 1.5, 34, 8).clone().translate(0, 17, 0), lam('#394058'), lamps.length);
      const bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(3, 10, 8), lampMat, lamps.length);
      lamps.forEach(([x, z], i) => { put(pole, i, x, 0, z, 1, 1, 1); put(bulb, i, x, 36, z, 1, 1, 1); });
      done(pole, bulb);
    }
    return grp;
  }

  /* ---------- models ---------- */
  function makeVehicle(body, o) {
    const gp = new THREE.Group(), b0 = lam(body[0]), b1 = lam(body[1]), glass = lam('#1b2740'), dark = lam('#171c28');
    gp.add(M(boxG(34, 6, 18), b0, 0, 5.5, 0));
    gp.add(M(boxG(16, 6, 15), glass, -3, 11.5, 0));
    gp.add(M(boxG(13, 1.4, 14), b1, -3, 14.9, 0));
    gp.add(M(boxG(6, 1, 15.5), b1, 11, 8.7, 0));
    if (o.stripe) { const st = bas('#ffffff'); gp.add(M(boxG(34.2, 0.3, 2.8), st, 0, 8.55, 0, false)); gp.add(M(boxG(13.2, 0.2, 2.8), st, -3, 15.7, 0, false)); }
    for (const sx of [-11, 11]) for (const sz of [-9.5, 9.5]) { const w = M(cylG(4.2, 4.2, 3), dark, sx, 4.2, sz); w.rotation.x = PI / 2; gp.add(w); }
    const hl = bas('#fff7c2'), brake = bas('#8f2a36');
    for (const sz of [-6, 6]) { gp.add(M(boxG(1, 2.4, 3.4), hl, 17.2, 6, sz, false)); gp.add(M(boxG(1, 2.4, 3.4), brake, -17.2, 6, sz, false)); }
    let arm = null;
    if (o.lidar) {
      gp.add(M(cylG(3.6, 3.6, 3), lam('#0f1626'), -2.5, 17.1, 0));
      arm = new THREE.Group(); arm.position.set(-2.5, 18.8, 0); arm.add(M(boxG(5.5, 0.7, 1.5), bas('#4ff0c0'), 2.75, 0, 0, false)); gp.add(arm);
    }
    const sh = new THREE.Shape(); sh.moveTo(16, -5); sh.lineTo(62, -17); sh.lineTo(62, 17); sh.lineTo(16, 5); sh.closePath();
    const beam = new THREE.Mesh(flat(new THREE.ShapeGeometry(sh)), bas('#fff4b0', { transparent: true, opacity: 0.22, depthWrite: false }));
    beam.position.y = 0.6; beam.visible = false; gp.add(beam);
    gp.userData = { brake, beam, arm };
    return gp;
  }
  function placeVehicle(v, x, y, ang, o, t) {
    v.position.set(x, 0, y); v.rotation.y = -rad(ang);
    const u = v.userData; u.beam.visible = !!o.moving; u.brake.color.set(o.brake ? '#ff3b4e' : '#8f2a36');
    if (u.arm) u.arm.rotation.y = -t * 6;
  }
  const coneMat = lam('#ff7a1a'), whiteMat = lam('#ffffff'), crateMat = lam('#c58a4b');
  function makeCone() {
    const gp = new THREE.Group();
    gp.add(M(boxG(24, 2, 24), coneMat, 0, 1, 0));
    gp.add(M(cache('cone', () => new THREE.ConeGeometry(10, 24, 18)), coneMat, 0, 13, 0));
    gp.add(M(cylG(6.1, 7.6, 5, 18), whiteMat, 0, 12, 0));
    return gp;
  }
  function makeCrate() {
    const gp = new THREE.Group();
    gp.add(M(boxG(32, 32, 32), crateMat, 0, 16, 0));
    const e = new THREE.LineSegments(cache('crateE', () => new THREE.EdgesGeometry(boxG(32.2, 32.2, 32.2))), new THREE.LineBasicMaterial({ color: '#8d5b2a' }));
    e.position.y = 16; gp.add(e);
    for (const sz of [-9, 9]) gp.add(M(boxG(33, 33, 4), lam('#a8713a'), 0, 16, sz, false));
    return gp;
  }
  function makeTrolley() {
    const gp = new THREE.Group();
    gp.add(M(boxG(26, 2, 30), lam('#9aa4b8'), 0, 5, 0));
    gp.add(M(boxG(26, 14, 30), bas('#e1e8f5', { transparent: true, opacity: 0.28, depthWrite: false }), 0, 13, 0, false));
    const e = new THREE.LineSegments(cache('trE', () => new THREE.EdgesGeometry(boxG(26, 14, 30))), new THREE.LineBasicMaterial({ color: '#f2f5fb' }));
    e.position.y = 13; gp.add(e);
    gp.add(M(boxG(26, 1.4, 1.4), lam('#c9d1e0'), 0, 23, -15));
    for (const sx of [-12.5, 12.5]) gp.add(M(boxG(1.4, 8, 1.4), lam('#c9d1e0'), sx, 19, -15));
    for (const [x, z] of [[-11, -13], [11, -13], [-11, 13], [11, 13]]) { const w = M(cylG(2.6, 2.6, 2.2, 10), lam('#222a3c'), x, 2.6, z); w.rotation.x = PI / 2; gp.add(w); }
    return gp;
  }
  const pedCols = ['#ffb703', '#8ecae6', '#e76f9a', '#9b7bff'].map((c) => lam(c));
  const skin = lam('#f1c9a5'), hair = lam('#3b2a20'), shoe = lam('#2b2f3a');
  function makePed(p) {
    const gp = new THREE.Group(), idx = (((Math.floor(p.t) || 0) % 4) + 4) % 4;
    gp.add(M(cache('cap', () => new THREE.CapsuleGeometry(3.4, 6.5, 4, 10)), pedCols[idx], 0, 10, 0));
    gp.add(M(sphG(3), skin, 0.5, 17.4, 0));
    gp.add(M(cache('hair', () => new THREE.SphereGeometry(3.4, 10, 6, 0, PI * 2, 0, PI * 0.55)), hair, -0.4, 17.8, 0));
    const legG = cache('leg', () => new THREE.BoxGeometry(2.4, 6, 2.4).translate(0, -3, 0)), legs = [];
    for (const sz of [-2, 2]) { const l = M(legG, shoe, 0, 6, sz); gp.add(l); legs.push(l); }
    gp.userData.legs = legs;
    return gp;
  }
  function fanTexture() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d'); c.translate(128, 128);
    const gr = c.createRadialGradient(0, 0, 12, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gr; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 128, -0.5, 0.5); c.closePath(); c.fill();
    return new THREE.CanvasTexture(cv);
  }

  /* ---------- renderer ---------- */
  class Renderer {
    constructor(cv) {
      this.cv = cv; this.parts = []; this.shake = 0; this.towns = {}; this.last = 0; this.aw = W; this.ah = H; this.night = true;
      const r = (this.r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }));
      r.setClearColor(0x000000, 0);
      r.outputEncoding = THREE.sRGBEncoding;
      r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
      this.aniso = r.capabilities.getMaxAnisotropy();
      const sc = (this.scene = new THREE.Scene());
      this.cam = new THREE.PerspectiveCamera(38, 1, 10, 4000); this.el = 58 * PI / 180; this.base = new THREE.Vector3();

      this.hemi = new THREE.HemisphereLight('#ffffff', '#86a878', 0.78); sc.add(this.hemi);
      const sun = (this.sun = new THREE.DirectionalLight('#fff3dc', 0.62));
      sun.position.set(W / 2 - 280, 560, H / 2 - 160); sun.target.position.set(W / 2, 0, H / 2);
      const m = Math.max(W, H) * 0.8;
      Object.assign(sun.shadow.camera, { left: -m, right: m, top: m, bottom: -m, near: 10, far: 1600 });
      sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
      sc.add(sun, sun.target);
      this.carLight = new THREE.PointLight('#ffe9a8', 0, 190); this.carLight.position.set(0, 26, 0); sc.add(this.carLight); // headlights at night

      this.defG = new THREE.Group(); this.dyn = new THREE.Group(); sc.add(this.defG, this.dyn);
      this.maps = { obs: new Map(), mov: new Map(), cross: new Map(), ped: new Map() };
      this.car = makeVehicle(['#ff5f2e', '#ff9a5c'], { stripe: true, lidar: true }); this.dyn.add(this.car);

      // sensor fans: front (long) + right / rear / left (short), plus hit rings on the front hazards
      this.fanTex = fanTexture();
      this.fanMat = bas('#50dcaa', { map: this.fanTex, transparent: true, depthWrite: false });
      this.fan3 = new THREE.Mesh(flat(new THREE.PlaneGeometry(250, 250)), this.fanMat); this.fan3.position.y = 0.6; this.dyn.add(this.fan3);
      this.sideFans = [90, 180, -90].map((off) => {
        const sf = new THREE.Mesh(flat(new THREE.PlaneGeometry(250, 250)), bas('#50dcaa', { map: this.fanTex, transparent: true, depthWrite: false }));
        sf.scale.set(0.5, 1, 0.5); sf.position.y = 0.55; sf.userData.off = off; this.dyn.add(sf); return sf;
      });
      this.rings = [0, 1].map(() => {
        const m2 = new THREE.Mesh(flat(new THREE.RingGeometry(0.86, 1, 36)), bas('#ff5d6c', { side: THREE.DoubleSide }));
        m2.position.y = 1.2; m2.visible = false; this.dyn.add(m2); return m2;
      });
      // trail
      this.trailArr = new Float32Array(3000 * 3);
      const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(this.trailArr, 3));
      this.trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: '#ff8a3d', transparent: true, opacity: 0.85 }));
      this.trail.frustumCulled = false; this.dyn.add(this.trail);
      // hover tile
      this.hov = new THREE.Mesh(flat(new THREE.PlaneGeometry(TILE, TILE)), bas('#ffffff', { transparent: true, opacity: 0.28, depthWrite: false }));
      this.hov.position.y = 0.9; this.hov.visible = false; this.dyn.add(this.hov);
      // particle pool
      this.pool = [];
      for (let i = 0; i < 140; i++) { const pm = new THREE.Mesh(boxG(5, 5, 5), bas('#ffffff')); pm.visible = false; this.dyn.add(pm); this.pool.push(pm); }

      this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      this.setTheme('dark');
      this.fit();
    }

    /** 'dark' = night scene (glowing windows, lamps, headlights), 'light' = sunny day. */
    setTheme(mode) {
      const n = mode === 'dark';
      this.night = n;
      this.hemi.color.set(n ? '#8a99e0' : '#ffffff'); this.hemi.groundColor.set(n ? '#2c3558' : '#86a878'); this.hemi.intensity = n ? 0.66 : 0.78;
      this.sun.color.set(n ? '#a9bcff' : '#fff3dc'); this.sun.intensity = n ? 0.4 : 0.62;
      this.carLight.intensity = n ? 0.9 : 0;
      bandMat.emissive.set(n ? '#e9b44c' : '#000000'); bandMat.emissiveIntensity = n ? 0.85 : 0;
      lampMat.color.set(n ? '#fff1a8' : '#d8d2b0');
    }

    fit() {
      const asp = this.aw / this.ah, cam = this.cam, vf = (cam.fov * PI) / 360, el = this.el;
      cam.aspect = asp; cam.updateProjectionMatrix();
      const dv = (H / 2 * Math.sin(el) + 70 * Math.cos(el)) / Math.tan(vf), dh = W / 2 / (Math.tan(vf) * asp);
      const d = Math.max(dv, dh) * 1.15;
      this.base.set(W / 2, d * Math.sin(el), H / 2 + d * Math.cos(el));
      cam.position.copy(this.base); cam.lookAt(W / 2, 0, H / 2); cam.updateMatrixWorld();
    }
    resize(w, h) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.cv.style.width = w + 'px'; this.cv.style.height = h + 'px';
      this.r.setPixelRatio(dpr); this.r.setSize(w, h, false);
      this.aw = w; this.ah = h; this.fit();
    }
    /** Screen -> world (sim coordinates). Use this for click / hover picking. */
    pick(clientX, clientY) {
      const b = this.cv.getBoundingClientRect();
      this.ray.setFromCamera(new THREE.Vector2(((clientX - b.left) / b.width) * 2 - 1, -(((clientY - b.top) / b.height) * 2 - 1)), this.cam);
      const pt = new THREE.Vector3();
      return this.ray.ray.intersectPlane(this.plane, pt) ? { x: pt.x, y: pt.z } : null;
    }

    setDef(def) {
      if (this.town) { this.scene.remove(this.town); if (this.town.userData.fresh) disposeTree(this.town); }
      let t;
      if (def.nocache) { t = buildTown(def, this.aniso); t.userData.fresh = true; }
      else t = this.towns[def.townKey] || (this.towns[def.townKey] = buildTown(def, this.aniso));
      this.town = t; this.scene.add(t);
      // per-mission props
      disposeTree(this.defG); this.defG.clear(); this.flag = null;
      for (const mp of Object.values(this.maps)) mp.clear();
      this.parts = []; this.shake = 0;
      this.buildDest(def.dest); this.buildLights(def.lights || []);
    }
    buildDest(d) {
      const x = d.x * TILE, y = d.y * TILE, w = d.w * TILE, h = d.h * TILE, cv = document.createElement('canvas');
      cv.width = Math.max(10, Math.round(w)); cv.height = Math.max(10, Math.round(h));
      const c = cv.getContext('2d');
      for (let i = 0; i < w / 10; i++) for (let j = 0; j < h / 10; j++) { c.fillStyle = (i + j) % 2 ? '#101626' : '#f4f6fb'; c.fillRect(i * 10, j * 10, 10, 10); }
      const t = tex(cv, this.aniso); t.magFilter = THREE.NearestFilter;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), bas('#ffffff', { map: t, transparent: true, opacity: 0.92 }));
      pl.rotation.x = -PI / 2; pl.position.set(x + w / 2, 0.5, y + h / 2); this.defG.add(pl);
      this.destMat = bas('#ffd246', { transparent: true });
      const fr = (bw, bd, px, pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, 1.6, bd), this.destMat); m.position.set(px, 1, pz); this.defG.add(m); };
      fr(w + 6, 3, x + w / 2, y - 1.5); fr(w + 6, 3, x + w / 2, y + h + 1.5); fr(3, h, x - 1.5, y + h / 2); fr(3, h, x + w + 1.5, y + h / 2);
      const col = new THREE.Mesh(new THREE.BoxGeometry(w, 70, h), bas('#ffd246', { transparent: true, opacity: 0.07, depthWrite: false }));
      col.position.set(x + w / 2, 35, y + h / 2); this.defG.add(col);
      // waving chequered flag on a pole
      const fx = x + 5, fz = y + 5, fc = document.createElement('canvas'); fc.width = 64; fc.height = 40;
      const f2 = fc.getContext('2d');
      for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { f2.fillStyle = (i + j) % 2 ? '#101626' : '#ffffff'; f2.fillRect(i * 8, j * 8, 8, 8); }
      const ft = tex(fc, 1); ft.magFilter = THREE.NearestFilter;
      this.defG.add(M(cylG(1.2, 1.2, 56, 8), lam('#e8ecf5'), fx, 28, fz));
      this.defG.add(M(sphG(2.4), bas('#ffd246'), fx, 57, fz, false));
      const fg = new THREE.Group(); fg.position.set(fx, 48, fz);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), bas('#ffffff', { map: ft, side: THREE.DoubleSide })); cloth.position.set(13, 0, 0);
      fg.add(cloth); this.defG.add(fg); this.flag = fg;
    }
    buildLights(lights) {
      const lampG = cache('lamp', () => new THREE.CircleGeometry(3.2, 18).rotateY(-PI / 2));
      this.lightObjs = lights.map((l) => {
        const barMat = bas(COL.red), glowMat = bas(COL.red, { transparent: true, opacity: 0.28, depthWrite: false });
        const len = l.y1 - l.y0 - 4, cz = (l.y0 + l.y1) / 2;
        const bar = M(boxG(5, 1.2, len), barMat, l.lineX, 0.7, cz, false);
        const glow = new THREE.Mesh(boxG(16, 0.5, len), glowMat); glow.position.set(l.lineX, 0.45, cz);
        this.defG.add(bar, glow);
        const px = l.lineX - 24, pz = l.y0 - 31;
        this.defG.add(M(cylG(1.6, 1.8, 46, 10), lam('#2a3042'), px, 23, pz));
        this.defG.add(M(boxG(5, 22, 11), lam('#161c2b'), px, 50, pz));
        const lamps = {};
        ['red', 'amber', 'green'].forEach((n, i) => {
          const mat = bas(DIM[n]), m = new THREE.Mesh(lampG, mat);
          m.position.set(px - 2.7, 56.5 - i * 6.5, pz); this.defG.add(m); lamps[n] = { mat, m };
        });
        return { barMat, glowMat, lamps };
      });
    }

    burst(x, y, kind) {
      const win = kind === 'win', cols = win ? ['#ffd24a', '#ff6a3d', '#34e39b', '#4aa3ff', '#c58bff'] : ['#ff5d6c', '#ffb62e', '#ffffff'];
      for (let i = 0; i < (win ? 80 : 28); i++)
        this.parts.push({
          x, y: 12, z: y, vx: (Math.random() - 0.5) * (win ? 300 : 220), vz: (Math.random() - 0.5) * (win ? 300 : 220),
          vy: win ? 150 + Math.random() * 190 : 60 + Math.random() * 120, g: win ? 420 : 320, life: 1, col: cols[i % cols.length],
        });
      if (this.parts.length > this.pool.length) this.parts.splice(0, this.parts.length - this.pool.length);
      if (!win) this.shake = 1;
    }

    sync(list, map, group, make, update) {
      const seen = new Set();
      for (const it of list) {
        let m = map.get(it);
        if (!m) { m = make(it); map.set(it, m); group.add(m); }
        update(m, it); seen.add(it);
      }
      for (const [k, m] of map) if (!seen.has(k)) { group.remove(m); map.delete(k); }
    }

    draw(sim, ui, now) {
      const dt = Math.min(0.05, (now - this.last) / 1000 || 0), t = now / 1000, car = sim.car;
      this.last = now;
      if (this.town) this.town.userData.grid.visible = !!ui.grid;

      // finish pulse + waving flag
      const pulse = (Math.sin(now / 300) + 1) / 2;
      if (this.destMat) this.destMat.opacity = 0.45 + 0.4 * pulse;
      if (this.flag) { this.flag.rotation.y = Math.sin(t * 2.2) * 0.35; this.flag.scale.x = 0.92 + 0.08 * Math.sin(t * 5); }

      // trail
      const tr = car.trail, n = Math.min(tr.length, 3000), s0 = tr.length - n;
      for (let i = 0; i < n; i++) { this.trailArr[i * 3] = tr[s0 + i][0]; this.trailArr[i * 3 + 1] = 1; this.trailArr[i * 3 + 2] = tr[s0 + i][1]; }
      this.trail.geometry.setDrawRange(0, n > 1 ? n : 0); this.trail.geometry.attributes.position.needsUpdate = true;

      // traffic lights
      (sim.lights || []).forEach((l, i) => {
        const lo = this.lightObjs && this.lightObjs[i]; if (!lo) return;
        lo.barMat.color.set(COL[l.colour]); lo.glowMat.color.set(COL[l.colour]);
        for (const nme of ['red', 'amber', 'green']) {
          const on = nme === l.colour, lp = lo.lamps[nme];
          lp.mat.color.set(on ? COL[nme] : DIM[nme]); lp.m.scale.setScalar(on ? 1.2 : 1);
        }
      });

      // obstacles, trolleys, crossing traffic, pedestrians
      this.sync(sim.obstacles, this.maps.obs, this.dyn, (o) => (o.kind === 'crate' ? makeCrate() : makeCone()), (m, o) => m.position.set(o.x, 0, o.y));
      this.sync(sim.movers, this.maps.mov, this.dyn, makeTrolley, (m, o) => m.position.set(o.x, 0, o.y));
      this.sync(sim.cross, this.maps.cross, this.dyn, () => makeVehicle(['#3f7fe0', '#6fb1ff'], {}), (m, cc) => {
        m.visible = !!cc.active; placeVehicle(m, cc.x, cc.y, cc.vy > 0 ? 90 : 270, {}, t);
      });
      this.sync(sim.peds, this.maps.ped, this.dyn, makePed, (m, p) => {
        const vis = p.st === 'wait' || p.st === 'cross'; m.visible = vis; if (!vis) return;
        const sw = p.st === 'cross' ? Math.sin(t * 9) : 0, a = p.from === 'top' ? PI / 2 : -PI / 2;
        m.position.set(p.x, p.st === 'cross' ? Math.abs(sw) * 0.8 : 0, p.y); m.rotation.y = -a;
        m.userData.legs[0].rotation.z = sw * 0.7; m.userData.legs[1].rotation.z = -sw * 0.7;
      });

      // our car (+ headlight glow at night)
      placeVehicle(this.car, car.x, car.y, car.h, { moving: car.moving, lidar: true, brake: (sim.state === 'running' && !car.moving) || car.slow }, t);
      const ca = rad(car.h);
      this.carLight.position.set(car.x + Math.cos(ca) * 30, 26, car.y + Math.sin(ca) * 30);

      // sensor fans + hit rings
      const se = sim.sense || {}, hit = se.obs || se.ped, showFan = ui.fan !== false && sim.state !== 'fail';
      this.fan3.visible = showFan;
      if (showFan) {
        this.fan3.position.set(car.x, 0.6, car.y); this.fan3.rotation.y = -rad(car.h);
        this.fanMat.color.set(hit ? '#ff5d6c' : '#50dcaa');
      }
      const dk = ['R', 'B', 'L'];
      this.sideFans.forEach((sf, i) => {
        sf.visible = showFan;
        if (!showFan) return;
        sf.position.set(car.x, 0.55, car.y); sf.rotation.y = -rad(car.h + sf.userData.off);
        sf.material.color.set(se.det && se.det.any[dk[i]] ? '#ff5d6c' : '#50dcaa');
      });
      [se.obs && se.hitObs, se.ped && se.hitPed].forEach((h, i) => {
        const rg = this.rings[i];
        if (showFan && h) { rg.visible = true; rg.position.set(h.x, 1.2, h.y); rg.scale.setScalar(h.r + 6 + Math.sin(now / 120) * 1.5); }
        else rg.visible = false;
      });

      // hover tile
      if (ui.hover) { this.hov.visible = true; this.hov.position.set(ui.hover.tx * TILE + TILE / 2, 0.9, ui.hover.ty * TILE + TILE / 2); }
      else this.hov.visible = false;

      // particles
      this.parts = this.parts.filter((p) => (p.life -= dt * 0.8) > 0);
      this.pool.forEach((m, i) => {
        const p = this.parts[i];
        if (!p) { m.visible = false; return; }
        p.vy -= p.g * dt; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
        if (p.y < 1) { p.y = 1; p.vy = 0; p.vx *= 0.85; p.vz *= 0.85; }
        m.visible = true; m.position.set(p.x, p.y, p.z); m.scale.setScalar(Math.min(1, p.life * 1.5)); m.material.color.set(p.col);
      });

      // camera (with crash shake)
      this.cam.position.copy(this.base);
      if (this.shake > 0) {
        this.cam.position.x += (Math.random() - 0.5) * this.shake * 10; this.cam.position.y += (Math.random() - 0.5) * this.shake * 6;
        this.shake = Math.max(0, this.shake - dt * 3);
      }
      this.r.render(this.scene, this.cam);
    }
  }
  SDL.Renderer = Renderer;
})(globalThis);