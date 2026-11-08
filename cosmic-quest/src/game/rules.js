// IF / THEN rule engine for Jupiter (and the final mission).
// rules: [{ id, cond, action }] read from top to bottom – the first matching rule wins.
export function decide(rules, facts) {
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    if (r.cond && r.action && facts.includes(r.cond)) return { index: i, rule: r, action: r.action };
  }
  return { index: -1, rule: null, action: null };
}

export const J_CONDS = [
  { id: 'lowO2', emoji: '😮‍💨', label: 'Oxygen is low' },
  { id: 'engine', emoji: '🔧', label: 'Engine is damaged' },
  { id: 'hungry', emoji: '😋', label: 'Is hungry' },
  { id: 'fine', emoji: '😊', label: 'Is fine' },
];
export const J_ACTS = [
  { id: 'oxygen', emoji: '🫧', label: 'Give oxygen' },
  { id: 'repair', emoji: '🧰', label: 'Give repair kit' },
  { id: 'food', emoji: '🍎', label: 'Give food' },
  { id: 'wave', emoji: '👋', label: 'Say hello' },
];

export const J_ROUNDS = [
  {
    title: 'Round 1: Three visitors',
    say: 'Three visitors need help! Teach me a rule for each problem.',
    cases: [
      { id: 'a', who: 'Ava', kind: 'astro', facts: ['lowO2'], correct: 'oxygen' },
      { id: 'b', who: 'Ben', kind: 'astro', facts: ['engine'], correct: 'repair' },
      { id: 'c', who: 'Zog', kind: 'alien', facts: ['hungry'], correct: 'food' },
    ],
  },
  {
    title: 'Round 2: Surprise visitors',
    say: 'Some visitors are fine, some are new. Do my rules still work?',
    cases: [
      { id: 'd', who: 'Cleo', kind: 'astro', facts: ['fine'], correct: 'wave' },
      { id: 'e', who: 'Pip', kind: 'alien', facts: ['hungry'], correct: 'food' },
      { id: 'f', who: 'Dev', kind: 'astro', facts: ['lowO2'], correct: 'oxygen' },
      { id: 'g', who: 'Mia', kind: 'astro', facts: ['engine'], correct: 'repair' },
    ],
  },
  {
    title: 'Round 3: Two problems at once',
    say: 'Uh-oh, two problems each! I read my rules from the top. What matters most?',
    cases: [
      { id: 'h', who: 'Kai', kind: 'astro', facts: ['lowO2', 'hungry'], correct: 'oxygen' },
      { id: 'i', who: 'Bix', kind: 'alien', facts: ['engine', 'hungry'], correct: 'repair' },
      { id: 'j', who: 'Rae', kind: 'astro', facts: ['lowO2', 'engine'], correct: 'oxygen' },
    ],
  },
];
