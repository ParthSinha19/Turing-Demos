// Nearest-example recogniser used on Earth (objects) and Saturn (space items).
// The robot compares a new item with every example it has been taught and picks the
// example that shares the most clues. Ties go to the example it learned most recently, so new teaching always counts.
export function nearest(examples, item, keys) {
  let best = null;
  examples.forEach((ex) => {
    const matches = keys.map((k) => ex.f[k] === item.f[k]);
    const score = matches.filter(Boolean).length;
    if (!best || score >= best.score) best = { ex, score, matches };
  });
  return best;
}
export function predict(examples, item, keys) {
  const n = nearest(examples, item, keys);
  return n ? { label: n.ex.label, near: n } : { label: null, near: null };
}

// ---------- Earth ----------
export const E_KEYS = ['colour', 'shape', 'size', 'moves'];
export const E_CATS = [
  { id: 'food', name: 'Food', emoji: '🍎' },
  { id: 'animal', name: 'Animal', emoji: '🐾' },
  { id: 'toy', name: 'Toy', emoji: '🧸' },
];
export const E_OBJECTS = {
  apple: { name: 'Apple', label: 'food', f: { colour: 'red', shape: 'round', size: 'small', moves: 'still' }, fact: 'You can eat it!' },
  banana: { name: 'Banana', label: 'food', f: { colour: 'yellow', shape: 'long', size: 'small', moves: 'still' }, fact: 'Yummy and yellow.' },
  carrot: { name: 'Carrot', label: 'food', f: { colour: 'orange', shape: 'long', size: 'small', moves: 'still' }, fact: 'Crunchy and good for you.' },
  pear: { name: 'Pear', label: 'food', f: { colour: 'green', shape: 'round', size: 'small', moves: 'still' }, fact: 'Sweet and juicy.' },
  cat: { name: 'Cat', label: 'animal', f: { colour: 'orange', shape: 'long', size: 'medium', moves: 'moves' }, fact: 'It purrs and chases things.' },
  bird: { name: 'Bird', label: 'animal', f: { colour: 'blue', shape: 'round', size: 'small', moves: 'moves' }, fact: 'It can fly!' },
  dog: { name: 'Dog', label: 'animal', f: { colour: 'brown', shape: 'long', size: 'medium', moves: 'moves' }, fact: 'It loves to play.' },
  block: { name: 'Toy block', label: 'toy', f: { colour: 'blue', shape: 'boxy', size: 'small', moves: 'still' }, fact: 'Great for building.' },
  teddy: { name: 'Teddy', label: 'toy', f: { colour: 'brown', shape: 'round', size: 'medium', moves: 'still' }, fact: 'Soft and cuddly.' },
  ball: { name: 'Red ball', label: 'toy', f: { colour: 'red', shape: 'round', size: 'small', moves: 'still' }, fact: 'It bounces!' },
  tree: { name: 'Tree', label: 'plant', f: { colour: 'green', shape: 'tall', size: 'big', moves: 'still' }, fact: 'It grows tall and does not move.' },
  balloon: { name: 'Balloon', label: 'toy', f: { colour: 'yellow', shape: 'round', size: 'medium', moves: 'moves' }, fact: 'It floats in the air.' },
};
export const E_MEET = ['apple', 'tree', 'cat', 'bird', 'balloon', 'ball'];
export const E_TEACH = ['apple', 'banana', 'cat', 'bird', 'block', 'teddy'];
export const E_TESTS = ['ball', 'dog', 'balloon', 'carrot'];
export const eItem = (id) => ({ id, ...E_OBJECTS[id] });

// ---------- Saturn ----------
export const S_KEYS = ['shape', 'colour', 'shine', 'glow'];
export const S_CATS = [
  { id: 'crystal', name: 'Crystals', emoji: '💎', clue: 'Crystals are pointy and often glow!' },
  { id: 'rock', name: 'Space rocks', emoji: '🪨', clue: 'Space rocks are lumpy and dull.' },
  { id: 'plant', name: 'Alien plants', emoji: '🌿', clue: 'Alien plants have leaves!' },
  { id: 'gadget', name: 'Equipment', emoji: '🛰️', clue: 'Equipment is boxy, with little lights.' },
];
const it = (id, label, shape, colour, shine, glow) => ({ id, label, f: { shape, colour, shine, glow } });
export const S_TRAIN = [
  it('c1', 'crystal', 'pointy', 'blue', 'shiny', 'glows'),
  it('c2', 'crystal', 'pointy', 'pink', 'shiny', 'glows'),
  it('c3', 'crystal', 'pointy', 'green', 'shiny', 'glows'),
  it('r1', 'rock', 'lumpy', 'grey', 'matte', 'dark'),
  it('r2', 'rock', 'lumpy', 'brown', 'matte', 'dark'),
  it('r3', 'rock', 'lumpy', 'grey', 'shiny', 'dark'),
  it('p1', 'plant', 'leafy', 'green', 'matte', 'dark'),
  it('p2', 'plant', 'leafy', 'purple', 'matte', 'glows'),
  it('p3', 'plant', 'leafy', 'orange', 'matte', 'dark'),
  it('g1', 'gadget', 'boxy', 'silver', 'shiny', 'glows'),
  it('g2', 'gadget', 'boxy', 'white', 'matte', 'glows'),
  it('g3', 'gadget', 'boxy', 'red', 'shiny', 'dark'),
];
export const S_TEST = [
  it('t1', 'crystal', 'pointy', 'orange', 'shiny', 'glows'),
  it('t2', 'rock', 'lumpy', 'blue', 'shiny', 'dark'),
  it('t3', 'plant', 'leafy', 'green', 'shiny', 'glows'),
  it('t4', 'gadget', 'boxy', 'grey', 'matte', 'dark'),
  it('t5', 'rock', 'lumpy', 'brown', 'matte', 'glows'),
  it('t6', 'crystal', 'pointy', 'grey', 'matte', 'dark'),
];
export const S_PASS = 5;
export function runTest(training, tests = S_TEST) {
  return tests.map((t) => {
    const p = predict(training, t, S_KEYS);
    return { item: t, guess: p.label, near: p.near, ok: p.label === t.label };
  });
}

// ---------- Final mission: Saturn recap ----------
export const F_SHIP_OBJECTS = [
  it('x1', 'crystal', 'pointy', 'pink', 'shiny', 'glows'),
  it('x2', 'gadget', 'boxy', 'silver', 'shiny', 'glows'),
  it('x3', 'plant', 'leafy', 'green', 'matte', 'dark'),
  it('x4', 'rock', 'lumpy', 'brown', 'matte', 'dark'),
];
