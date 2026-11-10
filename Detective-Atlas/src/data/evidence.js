// All collectable evidence. `glyph` keys map to Lucide icons in components/Glyph.jsx.
// boardPos = percent position on the investigation board.

import { EXTRA_EVIDENCE, EXTRA_CONNECTIONS, EXTRA_CONCEPTS } from './extraMissions.js';

export const BASE_EVIDENCE = [
  { id: 'ev-feather', originChapter: 1, realm: 'forest', glyph: 'feather', title: 'Silver Feather', blurb: 'Too shiny to be a normal magpie feather. Something sparkly was here.', boardPos: [14, 22] },
  { id: 'ev-corrupt-log', originChapter: 1, realm: 'forest', glyph: 'cpu', title: 'Muddled Record', blurb: 'F.O.R.E.S.T. filed a badger under "pond". Records have been moved.', boardPos: [14, 62] },
  { id: 'ev-print', originChapter: 2, realm: 'forest', glyph: 'paw', title: 'Plaster Print', blurb: 'A four-toed print with claw marks. It belongs to a fox.', boardPos: [32, 38] },
  { id: 'ev-cog', originChapter: 3, realm: 'forest', glyph: 'cog', title: 'Brass Cog', blurb: 'A gear from the Forest Machine. Someone took it out of order.', boardPos: [32, 78] },
  { id: 'ev-prediction', originChapter: 4, realm: 'forest', glyph: 'eye', title: 'False Prediction', blurb: 'It predicted snow in summer. AI can be confidently wrong.', boardPos: [50, 22] },
  { id: 'ev-seed', originChapter: 5, realm: 'forest', glyph: 'leaf', title: 'Memory Seed', blurb: 'Holds the forest\u2019s lost memories. Safe, for now.', boardPos: [50, 62] },
  { id: 'ev-shard', originChapter: 5, realm: 'space', glyph: 'gem', title: 'Pip’s Sky Shard', blurb: 'Pip found it in the forest. It fell from orbit and carries the same symbol as the transmission.', boardPos: [60, 43] },
  { id: 'ev-signal', originChapter: 6, realm: 'space', glyph: 'activity', title: 'Signal Capture', blurb: 'A repeating pattern hidden inside the noise.', boardPos: [68, 76] },
  { id: 'ev-station-log', originChapter: 7, realm: 'space', glyph: 'radio', title: 'Station Log', blurb: 'The last message from the abandoned station.', boardPos: [84, 20] },
  { id: 'ev-planet-chart', originChapter: 8, realm: 'space', glyph: 'orbit', title: 'Planet Chart', blurb: 'Planets sorted by what they are made of, not how they look.', boardPos: [84, 50] },
  { id: 'ev-relay-key', originChapter: 9, realm: 'space', glyph: 'satellite', title: 'Relay Key', blurb: 'Unlocks the satellite relays so data can travel.', boardPos: [84, 80] },
  { id: 'ev-glitch', originChapter: 10, realm: 'space', glyph: 'bug', title: 'Glitch Fragment', blurb: 'A piece of the signal. It was never meant to be found.', boardPos: [50, 90] },
];

// Hidden relationships the board can reveal. `a`/`b` are evidence ids.
export const BASE_CONNECTIONS = [
  { id: 'cx-1', a: 'ev-feather', b: 'ev-shard', label: 'Pip\u2019s shiny treasure fell from the sky. The forest mystery began in space.' },
  { id: 'cx-2', a: 'ev-seed', b: 'ev-signal', label: 'The Memory Tree and the satellites received the very same signal.' },
  { id: 'cx-3', a: 'ev-corrupt-log', b: 'ev-planet-chart', label: 'Records got muddled in the forest AND in space. Same kind of mistake.' },
  { id: 'cx-4', a: 'ev-prediction', b: 'ev-glitch', label: 'The false predictions were caused by The Glitch.' },
  { id: 'cx-5', a: 'ev-cog', b: 'ev-relay-key', label: 'Both machines broke because a step was out of order.' },
  { id: 'cx-6', a: 'ev-print', b: 'ev-station-log', label: 'Someone left traces in both worlds. Someone, or something.' },
];

export const BASE_CONCEPTS = {
  'concept-data': { title: 'Data and Records', text: 'Data is information we write down. If records get mixed up, a computer can believe wrong things.' },
  'concept-classify': { title: 'Classification', text: 'Sorting things into groups by looking at their features, like toes, claws and size.' },
  'concept-algorithm': { title: 'Algorithms', text: 'An algorithm is a list of steps in a useful order. Some steps depend on earlier ones, so changing the order can break a machine.' },
  'concept-dataquality': { title: 'Good Data', text: 'Useful data is complete, correctly labelled and stored in the right place. Duplicates and missing details can confuse a computer.' },
  'concept-predict': { title: 'AI Predictions', text: 'An AI makes a smart guess from examples. Guesses can be wrong, so we test them.' },
  'concept-restore': { title: 'Organising Data', text: 'Putting information in a clear order makes it easy to find, trust and fix.' },
  'concept-pattern': { title: 'Pattern Recognition', text: 'Spotting what repeats. Patterns help us predict what comes next.' },
  'concept-debug': { title: 'Debugging', text: 'A bug is a mistake in instructions. Debugging means finding it and fixing it.' },
  'concept-classify2': { title: 'Training Examples', text: 'AI learns categories from examples. Better examples make better sorting.' },
  'concept-transmit': { title: 'Data Transmission', text: 'Data travels in small packets through a network, passed along relay to relay.' },
  'concept-anomaly': { title: 'Anomaly Detection', text: 'Finding information that is unusual compared with the pattern we expected.' },
  'concept-glitch': { title: 'The Unknown Signal', text: 'The same strange pattern has appeared in different systems. We have found a connection, but we do not yet know what The Glitch is.' },
};

export const EVIDENCE = [...BASE_EVIDENCE, ...EXTRA_EVIDENCE];
export const CONNECTIONS = [...BASE_CONNECTIONS, ...EXTRA_CONNECTIONS];
export const CONCEPTS = { ...BASE_CONCEPTS, ...EXTRA_CONCEPTS };