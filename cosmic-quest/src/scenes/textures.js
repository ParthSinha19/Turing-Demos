import * as THREE from 'three';

// Procedural planet textures drawn on a canvas: nothing to download, nothing to break.
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function makeNoise(seed) {
  const r = rng(seed);
  const G = 64;
  const grid = new Float32Array(G * G);
  for (let i = 0; i < grid.length; i++) grid[i] = r();
  const val = (i, j, period) => grid[(((j % G) + G) % G) * G + ((((i % period) + period) % period) % G)];
  const noise = (x, y, period) => {
    const fx = x * period;
    const fy = y * period;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const a = val(x0, y0, period) * (1 - sx) + val(x0 + 1, y0, period) * sx;
    const b = val(x0, y0 + 1, period) * (1 - sx) + val(x0 + 1, y0 + 1, period) * sx;
    return a * (1 - sy) + b * sy;
  };
  return (x, y) => noise(x, y, 4) * 0.5 + noise(x, y, 8) * 0.28 + noise(x, y, 16) * 0.14 + noise(x, y, 32) * 0.08;
}
const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.min(1, Math.max(0, t)));

function paint(w, h, seed, fn) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const n = makeNoise(seed);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = fn(x / w, y / h, n);
      const i = (y * w + x) * 4;
      img.data[i] = col[0];
      img.data[i + 1] = col[1];
      img.data[i + 2] = col[2];
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return { c, g };
}

const makers = {
  earth: () =>
    paint(512, 256, 11, (u, v, n) => {
      const h = n(u, v);
      const pole = Math.abs(v - 0.5) > 0.43 + n(u, 0.3) * 0.04;
      if (pole) return hex(0xf4f8ff);
      if (h < 0.5) return mix(hex(0x14509e), hex(0x3aa0e6), (h - 0.3) * 4);
      if (h < 0.53) return hex(0xe9d9a0);
      const land = mix(hex(0x3fae4a), hex(0x8a7a4a), (h - 0.55) * 3);
      return h > 0.7 ? mix(land, hex(0xffffff), (h - 0.7) * 5) : land;
    }),
  mars: () =>
    paint(512, 256, 23, (u, v, n) => {
      const h = n(u, v);
      let c = mix(hex(0xc1502e), hex(0xe9965a), h);
      c = mix(c, hex(0x7a2f1c), Math.max(0, n(u + 0.3, v) - 0.55) * 3);
      return Math.abs(v - 0.5) > 0.46 ? hex(0xfdf3ee) : c;
    }),
  jupiter: () =>
    paint(512, 256, 37, (u, v, n) => {
      const warp = n(u, v) * 0.06;
      const band = Math.sin((v + warp) * Math.PI * 11) * 0.5 + 0.5;
      let c = mix(hex(0xf3d9b1), hex(0xc7743a), band);
      c = mix(c, hex(0x8a4a2a), Math.max(0, n(u * 2, v * 3) - 0.6) * 2);
      const dx = (u - 0.35) / 0.07;
      const dy = (v - 0.62) / 0.045;
      if (dx * dx + dy * dy < 1) c = mix(c, hex(0xc4381f), 0.85);
      return c;
    }),
  saturn: () =>
    paint(512, 256, 41, (u, v, n) => {
      const band = Math.sin((v + n(u, v) * 0.03) * Math.PI * 9) * 0.5 + 0.5;
      return mix(hex(0xf2deaa), hex(0xd4b06a), band);
    }),
  neptune: () =>
    paint(512, 256, 53, (u, v, n) => {
      const h = n(u * 1.5, v * 2);
      const streak = Math.sin((v + n(u, v) * 0.05) * Math.PI * 7) * 0.5 + 0.5;
      return mix(mix(hex(0x1c3fb5), hex(0x4aa3ff), h), hex(0xa9e1ff), streak * 0.25);
    }),
  sun: () =>
    paint(512, 256, 67, (u, v, n) => mix(hex(0xff8a00), hex(0xffe066), n(u * 2, v * 2) * 1.4 - 0.1)),
  ice: () =>
    paint(512, 512, 71, (u, v, n) => mix(hex(0xb8ecff), hex(0xf4fdff), n(u, v) * 1.6)),
  rust: () =>
    paint(512, 512, 83, (u, v, n) => mix(hex(0xb5472a), hex(0xe58a55), n(u, v) * 1.5)),
  grass: () =>
    paint(512, 512, 97, (u, v, n) => mix(hex(0x3f9f4a), hex(0x7bcf5a), n(u, v) * 1.5)),
  cloud: () =>
    paint(512, 256, 101, (u, v, n) => mix(hex(0xf6dcb8), hex(0xd98a4a), n(u * 2, v * 4))),
};

const cache = {};
export function planetTexture(kind) {
  if (!cache[kind]) {
    const { c } = makers[kind]();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.wrapS = THREE.RepeatWrapping;
    cache[kind] = t;
  }
  return cache[kind];
}

let ringTex;
export function ringTexture() {
  if (!ringTex) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 4;
    const g = c.getContext('2d');
    const r = rng(5);
    for (let x = 0; x < 512; x++) {
      const t = x / 512;
      const gap = t > 0.46 && t < 0.52;
      const a = gap ? 0.05 : 0.45 + 0.5 * r() * Math.sin(t * 40) ** 2;
      const c1 = mix(hex(0xe8d4a2), hex(0xb89a6a), r());
      g.fillStyle = `rgba(${c1[0] | 0},${c1[1] | 0},${c1[2] | 0},${a})`;
      g.fillRect(x, 0, 1, 4);
    }
    ringTex = new THREE.CanvasTexture(c);
    ringTex.colorSpace = THREE.SRGBColorSpace;
  }
  return ringTex;
}

// Ring geometry whose UVs run from inside edge (0) to outside edge (1)
export function ringGeometry(inner, outer, seg = 96) {
  const g = new THREE.RingGeometry(inner, outer, seg, 1);
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const r = Math.hypot(p.getX(i), p.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  return g;
}

let glowTex;
export function glowTexture() {
  if (!glowTex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.3, 'rgba(255,255,255,0.35)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  return glowTex;
}
