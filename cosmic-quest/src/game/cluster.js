// Real k-means clustering for Neptune (and the final signals).
export const COLOURS = { teal: '#2ec4b6', orange: '#ff9f1c', purple: '#a66bff' };
export const GROUP_COLOURS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0'];
export const GROUP_NAMES = ['Coral group', 'Sun group', 'Mint group', 'Sky group'];

export const FEATURES = [
  { id: 'colour', label: 'Colour', emoji: '🎨' },
  { id: 'size', label: 'Size', emoji: '📏' },
  { id: 'eyes', label: 'Eyes', emoji: '👁️' },
  { id: 'legs', label: 'Legs', emoji: '🦵' },
  { id: 'antennae', label: 'Antennae', emoji: '📡' },
  { id: 'shape', label: 'Shape', emoji: '🔷' },
];

const mk = (id, colour, size, eyes, legs, antennae, shape) => ({ id, colour, size, eyes, legs, antennae, shape });
export const CREATURES = [
  mk(1, 'teal', 'small', 1, 2, 0, 'round'),
  mk(2, 'teal', 'small', 1, 2, 1, 'round'),
  mk(3, 'teal', 'small', 2, 2, 0, 'round'),
  mk(4, 'teal', 'big', 2, 4, 0, 'round'),
  mk(5, 'orange', 'big', 2, 4, 1, 'tall'),
  mk(6, 'orange', 'big', 3, 4, 1, 'tall'),
  mk(7, 'orange', 'small', 2, 4, 1, 'tall'),
  mk(8, 'orange', 'big', 2, 4, 2, 'tall'),
  mk(9, 'purple', 'big', 3, 6, 2, 'flat'),
  mk(10, 'purple', 'big', 3, 6, 2, 'flat'),
  mk(11, 'purple', 'small', 3, 6, 1, 'flat'),
  mk(12, 'purple', 'big', 2, 6, 2, 'flat'),
  mk(13, 'orange', 'small', 1, 4, 0, 'round'),
  mk(14, 'purple', 'small', 3, 6, 2, 'tall'),
  mk(15, 'teal', 'big', 1, 2, 1, 'round'),
  mk(16, 'orange', 'big', 2, 2, 1, 'tall'),
];
export const NEW_CREATURES = [
  mk(101, 'teal', 'small', 1, 2, 1, 'round'),
  mk(102, 'purple', 'big', 3, 6, 1, 'flat'),
  mk(103, 'orange', 'big', 2, 4, 2, 'tall'),
];

const COLOUR_IDS = ['teal', 'orange', 'purple'];
const SHAPE_IDS = ['round', 'tall', 'flat'];
const K = Math.SQRT1_2;

export function vectorise(c, feats) {
  const v = [];
  feats.forEach((f) => {
    if (f === 'colour') COLOUR_IDS.forEach((x) => v.push(c.colour === x ? K : 0));
    else if (f === 'shape') SHAPE_IDS.forEach((x) => v.push(c.shape === x ? K : 0));
    else if (f === 'size') v.push(c.size === 'big' ? 1 : 0);
    else if (f === 'eyes') v.push((c.eyes - 1) / 2);
    else if (f === 'legs') v.push((c.legs - 2) / 4);
    else if (f === 'antennae') v.push(c.antennae / 2);
  });
  return v;
}

const dist2 = (a, b) => a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0);

// Deterministic k-means (farthest-first start, so the same choices always give the same groups).
export function kmeans(vecs, k, maxIter = 50) {
  k = Math.max(1, Math.min(k, vecs.length));
  const cent = [vecs[0].slice()];
  while (cent.length < k) {
    let bi = 0;
    let bd = -1;
    vecs.forEach((v, i) => {
      const d = Math.min(...cent.map((c) => dist2(v, c)));
      if (d > bd) {
        bd = d;
        bi = i;
      }
    });
    cent.push(vecs[bi].slice());
  }
  let labels = new Array(vecs.length).fill(-1);
  for (let it = 0; it < maxIter; it++) {
    const next = vecs.map((v) => {
      let b = 0;
      let bd = Infinity;
      cent.forEach((c, ci) => {
        const d = dist2(v, c);
        if (d < bd - 1e-12) {
          bd = d;
          b = ci;
        }
      });
      return b;
    });
    const changed = next.some((l, i) => l !== labels[i]);
    labels = next;
    cent.forEach((c, ci) => {
      const mem = vecs.filter((_, i) => labels[i] === ci);
      if (mem.length) c.forEach((_, d) => (c[d] = mem.reduce((s, m) => s + m[d], 0) / mem.length));
    });
    if (!changed) break;
  }
  // number groups by first member so colours stay stable between runs
  const order = [];
  labels.forEach((l) => {
    if (!order.includes(l)) order.push(l);
  });
  const map = new Map(order.map((l, i) => [l, i]));
  return { labels: labels.map((l) => map.get(l)), centroids: order.map((l) => cent[l]), k: order.length };
}

export function clusterCreatures(creatures, feats, k) {
  return kmeans(creatures.map((c) => vectorise(c, feats)), k);
}
export function assignNew(creature, centroids, feats) {
  const v = vectorise(creature, feats);
  let b = 0;
  let bd = Infinity;
  centroids.forEach((c, i) => {
    const d = dist2(v, c);
    if (d < bd) {
      bd = d;
      b = i;
    }
  });
  return { group: b, distance: Math.sqrt(bd) };
}

// "What do they have in common?" – values shared by at least 75% of a group
export function describeGroup(members, feats) {
  const out = [];
  feats.forEach((f) => {
    const counts = {};
    members.forEach((m) => (counts[m[f]] = (counts[m[f]] || 0) + 1));
    const [val, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    if (members.length && n / members.length >= 0.75) {
      const label =
        f === 'eyes' ? `${val} eye${+val > 1 ? 's' : ''}` :
        f === 'legs' ? `${val} legs` :
        f === 'antennae' ? (+val === 0 ? 'no antennae' : `${val} antenna${+val > 1 ? 'e' : ''}`) :
        f === 'shape' ? `${val} shape` : String(val);
      out.push(label);
    }
  });
  return out;
}

// ---------- Final mission signals ----------
export const SIGNALS = [
  [1, 1], [1.4, 1.2], [0.8, 1.6], [3, 3.2], [3.3, 2.8], [2.8, 3.5], [5, 1], [4.6, 1.5], [5.2, 1.3],
];
