const palette = {
  coral: '#ff796d',
  aqua: '#5ce4dd',
  violet: '#a78bfa',
  lime: '#b7ef72',
  gold: '#ffc96b',
  blue: '#75aaff',
  pink: '#ff91c8',
};

// A deliberately overlapping, repeatable collection: no single feature gives away every group.
const rows = [
  ['Pip', 'coral', 'round', 2, false, true],
  ['Bloop', 'aqua', 'oval', 1, true, false],
  ['Zuzu', 'violet', 'triangle', 3, false, true],
  ['Momo', 'lime', 'round', 1, true, true],
  ['Tink', 'gold', 'square', 2, true, false],
  ['Nix', 'blue', 'oval', 3, false, false],
  ['Fizzy', 'pink', 'triangle', 2, true, true],
  ['Orbit', 'coral', 'square', 1, false, false],
  ['Pebble', 'aqua', 'round', 3, true, false],
  ['Wiggle', 'violet', 'oval', 2, false, true],
  ['Pogo', 'lime', 'triangle', 1, true, false],
  ['Comet', 'gold', 'round', 2, false, true],
  ['Doodle', 'blue', 'square', 3, true, true],
  ['Mittens', 'pink', 'oval', 1, false, true],
  ['Sprout', 'coral', 'triangle', 3, true, false],
  ['Biscuit', 'aqua', 'square', 2, false, true],
  ['Twinkle', 'violet', 'round', 1, false, false],
  ['Gizmo', 'lime', 'oval', 3, true, true],
  ['Noodle', 'gold', 'triangle', 2, false, false],
  ['Puddle', 'blue', 'round', 2, true, false],
  ['Jellybean', 'pink', 'square', 3, false, true],
  ['Cosmo', 'coral', 'oval', 1, true, true],
  ['Fable', 'aqua', 'triangle', 2, false, false],
  ['Waffle', 'violet', 'square', 1, true, false],
  ['Dart', 'lime', 'round', 3, false, true],
  ['Marble', 'gold', 'oval', 2, true, false],
  ['Echo', 'blue', 'triangle', 1, false, true],
  ['Puffin', 'pink', 'round', 2, true, true],
];

export const FEATURE_META = {
  color: { label: 'Body colour', short: 'Colour', describe: 'the colour of its body' },
  shape: { label: 'Body shape', short: 'Shape', describe: 'the shape of its body' },
  eyes: { label: 'Number of eyes', short: 'Eyes', describe: 'how many eyes it has' },
  wings: { label: 'Wings', short: 'Wings', describe: 'whether it has wings' },
  antennae: { label: 'Antennae', short: 'Antennae', describe: 'whether it has antennae' },
};

export const FEATURE_KEYS = Object.keys(FEATURE_META);

export const ALIENS = rows.map(([name, color, shape, eyes, wings, antennae], index) => ({
  id: `alien-${String(index + 1).padStart(2, '0')}`,
  name,
  color,
  colorHex: palette[color],
  shape,
  eyes,
  wings,
  antennae,
  mark: index % 4,
  cheek: index % 3 === 0,
  spots: index % 2 === 0,
}));

export const STAGES = [
  { id: 1, title: 'First Contact', subtitle: 'Meet the locals', planet: 'Nova', time: '8 min', colour: 'mint', icon: 'scan' },
  { id: 2, title: 'The Great Space Sort', subtitle: 'Sort by a rule', planet: 'Tidy-9', time: '12 min', colour: 'orange', icon: 'sort' },
  { id: 3, title: 'Mystery of the Tribes', subtitle: 'Find hidden patterns', planet: 'Mosaic', time: '15 min', colour: 'pink', icon: 'cluster' },
  { id: 4, title: 'Train, Test & Improve', subtitle: 'Teach the ship computer', planet: 'Lab-42', time: '12 min', colour: 'blue', icon: 'lab' },
  { id: 5, title: 'Chief Galaxy Scientist', subtitle: 'Your own discovery', planet: 'Beyond', time: '13 min', colour: 'gold', icon: 'star' },
];

export const STAGE4_TRAIN = ALIENS.slice(0, 12);
export const STAGE4_TEST = ALIENS.slice(12, 16);
export const STAGE5_TRAIN = ALIENS.slice(8, 24);
export const STAGE5_TEST = ALIENS.slice(24, 28);

export function featureValue(alien, key) {
  if (key === 'wings' || key === 'antennae') return alien[key] ? 'Yes' : 'No';
  if (key === 'eyes') return String(alien.eyes);
  if (key === 'color') return alien.color;
  return alien.shape;
}

export function humanFeatureValue(alien, key) {
  if (key === 'wings' || key === 'antennae') return alien[key] ? 'Has them' : 'No';
  if (key === 'eyes') return `${alien.eyes} ${alien.eyes === 1 ? 'eye' : 'eyes'}`;
  if (key === 'color') return alien.color[0].toUpperCase() + alien.color.slice(1);
  return alien.shape[0].toUpperCase() + alien.shape.slice(1);
}
