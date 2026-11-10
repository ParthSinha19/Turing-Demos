// ─────────────────────────────────────────────────────────────────────────────
// MISSION CONFIGURATION — content only. No React in here.
// A mission picks an environment (data/environments.js) and an activity type
// (activities/index.js). To add a mission, copy one entry and edit it.
// ─────────────────────────────────────────────────────────────────────────────
import { EXTRA_MISSIONS } from './extraMissions.js';
const L = (speaker, expression, text) => ({ speaker, expression, text });

export const CORE_MISSIONS = [
  {
    id: 'forest-1', realm: 'forest', chapter: 1, title: 'The Forest That Forgot', env: 'forestExplore', glitch: 1, companion: 'fern', map: [12, 74],
    summary: 'F.O.R.E.S.T. has muddled its animal records. Put every animal back with its real home.',
    objective: 'Match each animal to the place where it really lives.',
    intro: [
      L('forest', 'worried', 'Good morning, Detective! The badger lives in a\u2026 pond? That does not feel right.'),
      L('fern', 'worried', 'F.O.R.E.S.T. has been mixing up the forest records all morning. Something is wrong.'),
      L('detective', 'thinking', 'Then we check every record, one clue at a time.'),
      L('pip', 'happy', 'Shiny! Shiny! \u2026Not me! I was just\u2026 passing by.'),
    ],
    hints: ['Think about where each animal sleeps at night.', 'Owls need tall places. Frogs need water.', 'The badger digs. Where do digging animals live?'],
    sceneClues: [{ id: 'clue-f1', x: 74, y: 64, label: 'Something sparkles in the grass', evidenceId: 'ev-feather' }],
    activity: {
      id: 'act-f1-match', type: 'match', title: 'Fix the Habitat Records', instruction: 'Tap an animal, then tap its home.',
      config: {
        left: [{ id: 'badger', label: 'Badger', glyph: 'paw' }, { id: 'owl', label: 'Owl', glyph: 'feather' }, { id: 'frog', label: 'Frog', glyph: 'droplet' }, { id: 'squirrel', label: 'Squirrel', glyph: 'leaf' }],
        right: [{ id: 'sett', label: 'Underground sett' }, { id: 'hollow', label: 'Tree hollow' }, { id: 'pond', label: 'Pond' }, { id: 'nest', label: 'Treetop drey' }],
      },
    },
    validation: { type: 'match', pairs: { badger: 'sett', owl: 'hollow', frog: 'pond', squirrel: 'nest' } },
    evidence: ['ev-feather', 'ev-corrupt-log'], concept: 'concept-data', meets: ['pip', 'forest'], unlocks: ['forest-2'], hqLevelAfter: 1,
    discovery: 'Pip moved some of the forest\u2019s information fragments, thinking they were treasure.',
  },
  {
    id: 'forest-2', realm: 'forest', chapter: 2, title: 'The Case of the Missing Footprints', env: 'forestExplore', glitch: 1, companion: 'fern', map: [22, 52],
    summary: 'F.O.R.E.S.T. cannot name the footprints by the stream. Teach it with examples, then test what it has learned.',
    objective: 'Label the training examples, then help F.O.R.E.S.T. predict a new footprint.',
    intro: [
      L('fern', 'surprised', 'Look at these prints! F.O.R.E.S.T. says they belong to a dragon.'),
      L('detective', 'happy', 'There are no dragons in this forest. Let us study the features.'),
      L('forest', 'worried', 'I cannot tell yet. Could you show me labelled examples? Then I can compare a new print with what you teach me.'),
    ],
    hints: ['Count the toes first.', 'Claw marks mean the animal cannot pull its claws in.', 'Click a print to see its features.'],
    sceneClues: [{ id: 'clue-f2', x: 30, y: 74, label: 'A clear print in the mud', evidenceId: 'ev-print' }],
    activity: {
      id: 'act-f2-classify', type: 'train', title: 'Footprint Training Lab', instruction: 'Teach F.O.R.E.S.T. with examples, then test its new prediction.',
      config: {
        examples: {
        bins: [{ id: 'fox', label: 'Fox', glyph: 'paw' }, { id: 'rabbit', label: 'Rabbit', glyph: 'paw' }, { id: 'bird', label: 'Bird', glyph: 'feather' }],
        items: [
          { id: 'p1', name: 'Print A', visual: { kind: 'print', toes: 4, claws: true }, features: ['4 toes', 'claw marks', 'oval shape'] },
          { id: 'p2', name: 'Print B', visual: { kind: 'print', toes: 4, claws: false, long: true }, features: ['4 toes', 'long and narrow', 'no claws'] },
          { id: 'p3', name: 'Print C', visual: { kind: 'print', toes: 3, claws: true, bird: true }, features: ['3 toes', 'spread wide', 'thin lines'] },
          { id: 'p4', name: 'Print D', visual: { kind: 'print', toes: 4, claws: true }, features: ['4 toes', 'claw marks', 'bigger'] },
        ],
        },
        challenge: {
          item: { id: 'new-print', name: 'New print E', visual: { kind: 'print', toes: 4, claws: true }, features: ['4 toes', 'claw marks', 'oval shape'] },
          question: 'Which animal is the best prediction?',
          options: [
            { id: 'fox', label: 'Fox', detail: 'Four toes and claw marks, like the examples.' },
            { id: 'rabbit', label: 'Rabbit', detail: 'Long and narrow, with no claw marks.' },
            { id: 'bird', label: 'Bird', detail: 'Three toes spread wide.' },
          ],
        },
      },
    },
    validation: { type: 'train', placements: { p1: 'fox', p2: 'rabbit', p3: 'bird', p4: 'fox' }, prediction: 'fox' },
    evidence: ['ev-print'], concept: 'concept-classify', meets: [], unlocks: ['forest-3'], hqLevelAfter: 2,
    discovery: 'You gave F.O.R.E.S.T. useful training examples. It can now compare new footprints with features it has seen before, instead of guessing at random.',
  },
  {
    id: 'forest-3', realm: 'forest', chapter: 3, title: 'The Broken Forest Machine', env: 'forestStation', glitch: 2, companion: 'fern', map: [34, 32],
    summary: 'The Forest Machine has mixed-up instructions and damaged records. Repair both before restarting it.',
    objective: 'Put the machine steps in order, then flag records that need repairing.',
    intro: [
      L('fern', 'worried', 'The Forest Machine is spraying water at the moon. And the moon is not thirsty.'),
      L('forest', 'worried', 'The instructions are shuffled. I also found duplicate records and labels that do not match.'),
      L('detective', 'thinking', 'We need to put the steps in order and check the information before restarting it.'),
    ],
    hints: ['The tank must be filled before water can spray.', 'A duplicate, a missing value or a wrong label is a record to repair.', 'Use the arrows or drag a block. Keep the clean record.'],
    sceneClues: [{ id: 'clue-f3', x: 22, y: 60, label: 'A loose cog', evidenceId: 'ev-cog' }],
    activity: {
      id: 'act-f3-sequence', type: 'sequence', title: 'Rebuild the Program', instruction: 'Order the restart steps, then select the records that need repairing.',
      config: {
        kind: 'blocks',
        blocks: [{ id: 'b3', label: 'Spray the water', glyph: 'droplet' }, { id: 'b1', label: 'Switch the machine on', glyph: 'cog' }, { id: 'b4', label: 'Switch the machine off', glyph: 'cpu' }, { id: 'b2', label: 'Fill the water tank', glyph: 'droplet' }],
        audit: {
          question: 'Which records need repairing?',
          note: 'A good record has a clear label and a complete value. Flag the ones that break those rules.',
          items: [
            { id: 'clean', label: 'Fern — water level 12', detail: 'Complete label and value; recorded once.' },
            { id: 'duplicate', label: 'Fern — water level 12 (copy)', detail: 'The same reading appears twice.' },
            { id: 'missing', label: 'Badger sett — water level ?', detail: 'The measurement is missing.' },
            { id: 'wrong-label', label: 'Frog record labelled “owl”', detail: 'The label does not match the animal.' },
            { id: 'wrong-group', label: 'Pond entry filed under “tree”', detail: 'The record is in the wrong category.' },
          ],
        },
      },
    },
    validation: { type: 'sequence', order: ['b1', 'b2', 'b3', 'b4'], auditSelected: ['duplicate', 'missing', 'wrong-label', 'wrong-group'] },
    evidence: ['ev-cog'], gadgets: ['scanner'], concept: 'concept-dataquality', concepts: ['concept-algorithm'], meets: [], unlocks: ['forest-4'], hqLevelAfter: 2,
    discovery: 'The Forest Machine is repaired. You put its instructions in order and flagged duplicated, incomplete and incorrectly labelled records before the system used them.',
  },
  {
    id: 'forest-4', realm: 'forest', chapter: 4, title: 'The Forest of False Predictions', env: 'forestStation', glitch: 2, companion: 'fern', map: [46, 52],
    summary: 'F.O.R.E.S.T. predicts snow in summer. Learn to talk to an AI clearly and test its guesses.',
    objective: 'Build a clear message so F.O.R.E.S.T. can make a better prediction.',
    intro: [
      L('forest', 'happy', 'Prediction ready! Tomorrow: heavy snow. Penguins are expected.'),
      L('fern', 'surprised', 'It is the middle of summer!'),
      L('detective', 'thinking', 'An AI guesses from the examples it has. If we ask clearly, it guesses better.'),
    ],
    hints: ['Tell F.O.R.E.S.T. which season it is.', 'Give it real examples.', 'Ask it to explain how sure it is.'],
    sceneClues: [{ id: 'clue-f4', x: 66, y: 36, label: 'A strange printout', evidenceId: 'ev-prediction' }],
    activity: {
      id: 'act-f4-prompt', type: 'prompt', title: 'Talk to F.O.R.E.S.T.', instruction: 'Tap the gaps to build your message.',
      config: {
        aiId: 'forest', aiMessage: 'Ask me anything about tomorrow\u2019s forest!',
        template: ['Using the weather from', '{when}', ', predict the', '{what}', 'and tell me', '{how}', '.'],
        slots: [
          { id: 'when', label: 'when', options: [{ id: 'a', text: 'the last 7 summer days' }, { id: 'b', text: 'a random old book' }] },
          { id: 'what', label: 'what', options: [{ id: 'a', text: 'weather tomorrow' }, { id: 'b', text: 'colour of the moon' }] },
          { id: 'how', label: 'how', options: [{ id: 'a', text: 'how sure you are' }, { id: 'b', text: 'nothing else' }] },
        ],
        defaultReply: 'I am not sure I have enough useful information yet. Try giving me clearer instructions.',
        responseRules: [
          { when: { when: 'b' }, reply: 'A random old book does not tell me what the weather has been like recently.' },
          { when: { what: 'b' }, reply: 'The weather records cannot tell me the colour of the moon.' },
          { when: { how: 'b' }, reply: 'I can make a guess, but I have not been asked to explain how sure I am.' },
          { when: { when: 'a', what: 'a', how: 'a' }, reply: 'Using the last 7 summer days: warm and dry tomorrow. It is a prediction, not a fact.', showReview: true },
        ],
        review: { prompt: 'Which evidence supports this prediction?', options: [{ id: 'support', text: 'The last 7 days were warm and dry.' }, { id: 'confidence', text: 'F.O.R.E.S.T. sounds very confident.' }] },
      },
    },
    validation: { type: 'prompt', slots: { when: 'a', what: 'a', how: 'a' }, review: 'support' },
    evidence: ['ev-prediction'], concept: 'concept-predict', meets: [], unlocks: ['forest-5'], hqLevelAfter: 2,
    discovery: 'The false predictions did not come from the forest. Someone fed F.O.R.E.S.T. bad information.',
  },
  {
    id: 'forest-5', realm: 'forest', chapter: 5, title: 'The Secret of the Memory Tree', env: 'memoryTree', glitch: 2, companion: 'pip', map: [58, 30], cinematic: 'forest-to-space',
    summary: 'The Memory Tree holds the forest\u2019s memories. Put the fragments back in the right order.',
    objective: 'Restore the memory fragments, oldest first.',
    intro: [
      L('pip', 'worried', 'I\u2026 I may have moved the memory fragments. They were so sparkly!'),
      L('fern', 'happy', 'It is okay, Pip. Everyone makes mistakes. Now let us fix this together.'),
      L('forest', 'worried', 'My memories are scattered. Please put them back in order, Detective.'),
    ],
    hints: ['Seasons repeat in a circle. Where does spring start?', 'Which memory happened first, long ago?', 'Read the date label on each fragment.'],
    sceneClues: [{ id: 'clue-f5', x: 52, y: 70, label: 'A glowing seed', evidenceId: 'ev-seed' }],
    activity: {
      id: 'act-f5-records', type: 'sequence', title: 'Restore the Memory Tree', instruction: 'Drag the memory fragments into order, oldest at the top.',
      config: {
        kind: 'records',
        blocks: [
          { id: 'r3', label: 'The first autumn storm', meta: 'Year 3', glyph: 'leaf' }, { id: 'r1', label: 'The tree sprouts', meta: 'Year 1', glyph: 'treepine' },
          { id: 'r4', label: 'Fern is born', meta: 'Year 4', glyph: 'paw' }, { id: 'r2', label: 'The owls move in', meta: 'Year 2', glyph: 'feather' },
        ],
      },
    },
    validation: { type: 'sequence', order: ['r1', 'r2', 'r3', 'r4'] },
    evidence: ['ev-seed', 'ev-shard'], gadgets: ['tablet'], concept: 'concept-restore', meets: [], unlocks: ['space-1'], hqLevelAfter: 3,
    discovery: 'The forest works again. Pip’s sky shard carries the same symbol as a new transmission from the orbital network.',
  },
  {
    id: 'space-1', realm: 'space', chapter: 6, title: 'The Signal in the Sky', env: 'spaceExplore', glitch: 2, companion: 'fern', map: [66, 62],
    summary: 'A repeating signal drifts across the stars. Find the pattern to learn what comes next.',
    objective: 'Work out which symbol completes the signal.',
    intro: [
      L('orbit', 'worried', 'Detective\u2026 I am receiving\u2026 a signal I did not send. It repeats.'),
      L('fern', 'surprised', 'We are really in space! And that symbol looks just like Pip\u2019s shiny thing.'),
      L('detective', 'thinking', 'Patterns repeat. If we find the pattern, we can predict the missing piece.'),
    ],
    hints: ['Say the pattern out loud.', 'Look for the smallest group that repeats.', 'Circle, triangle, circle, triangle\u2026 then what?'],
    sceneClues: [{ id: 'clue-s1', x: 24, y: 34, label: 'A repeating signal', evidenceId: 'ev-signal' }],
    activity: {
      id: 'act-s1-pattern', type: 'pattern', title: 'Decode the Signal', instruction: 'Tap the symbol that finishes the pattern.',
      config: {
        mode: 'missing',
        sequence: [{ kind: 'circle', color: '#5ee7ff' }, { kind: 'triangle', color: '#ffd166' }, { kind: 'circle', color: '#5ee7ff' }, { kind: 'triangle', color: '#ffd166' }, { kind: 'circle', color: '#5ee7ff' }, null],
        options: [{ id: 'o1', kind: 'triangle', color: '#ffd166' }, { id: 'o2', kind: 'square', color: '#ff4fd8' }, { id: 'o3', kind: 'circle', color: '#5ee7ff' }],
      },
    },
    validation: { type: 'pattern', answer: 'o1' },
    evidence: ['ev-signal'], concept: 'concept-pattern', meets: ['orbit'], unlocks: ['space-2'], hqLevelAfter: 3,
    discovery: 'The signal carries the same symbol as the shard Pip found.',
  },
  {
    id: 'space-2', realm: 'space', chapter: 7, title: 'The Abandoned Space Station', env: 'spaceStation', glitch: 3, companion: 'fern', map: [72, 36],
    summary: 'The station\u2019s airlock has shuffled safety steps and a typo in its repair command.',
    objective: 'Put the airlock checks in order, then type the corrected command.',
    intro: [
      L('orbit', 'worried', 'Airlock offline. Safety instructions out of order. Repair command rejected.'),
      L('detective', 'thinking', 'We should check the steps before using the door. The log also has a spelling mistake.'),
      L('fern', 'happy', 'Let us sort the instructions first, then fix that command.'),
    ],
    hints: ['Check that the airlock is sealed before releasing the lock.', 'The lock must be released before the door opens.', 'The command should read open_door.'],
    sceneClues: [{ id: 'clue-s2', x: 78, y: 62, label: 'A dusty log pad', evidenceId: 'ev-station-log' }],
    activity: {
      id: 'act-s2-process', type: 'process', title: 'Repair the Airlock', instruction: 'Follow the safety process, then correct the command.',
      config: {
        sequence: { kind: 'blocks', blocks: [
          { id: 's3', label: 'Open the airlock door', glyph: 'radio' },
          { id: 's1', label: 'Check that the airlock is sealed', glyph: 'eye' },
          { id: 's2', label: 'Release the door lock', glyph: 'cog' },
        ] },
        command: { log: ['> station.status', 'AIRLOCK: OFFLINE', '> open_doro', 'ERROR: command not found'], prompt: 'Type the corrected command:', placeholder: 'open_...' },
      },
    },
    validation: { type: 'process', order: ['s1', 's2', 's3'], accepted: ['open_door'] },
    evidence: ['ev-station-log'], gadgets: ['torch'], concept: 'concept-debug', concepts: ['concept-algorithm'], meets: [], unlocks: ['space-3'], hqLevelAfter: 3,
    discovery: 'Someone left the station in a hurry. And left a message behind.',
  },
  {
    id: 'space-3', realm: 'space', chapter: 8, title: 'The Planet Classification Mystery', env: 'spaceExplore', glitch: 2, companion: 'fern', map: [78, 56],
    summary: 'O.R.B.I.T. mixed up its planet records. Teach it the difference with examples.',
    objective: 'Sort each planet by what it is made of.',
    intro: [
      L('orbit', 'worried', 'Planet records corrupted. I believe Earth is a ball of gas.'),
      L('fern', 'surprised', 'That is a lot less cosy than I expected.'),
      L('detective', 'thinking', 'Good examples teach an AI to sort. Let us give it some.'),
    ],
    hints: ['Gas giants are huge with stripes and no ground.', 'Rocky planets are small with solid ground.', 'Ice worlds are pale and very cold.'],
    sceneClues: [{ id: 'clue-s3', x: 62, y: 28, label: 'A glowing chart', evidenceId: 'ev-planet-chart' }],
    activity: {
      id: 'act-s3-classify', type: 'classify', title: 'Planet Sorting Lab', instruction: 'Look at each planet. Drag it into the right group.',
      config: {
        bins: [{ id: 'rocky', label: 'Rocky', glyph: 'mountain' }, { id: 'gas', label: 'Gas giant', glyph: 'orbit' }, { id: 'ice', label: 'Ice world', glyph: 'snowflake' }],
        items: [
          { id: 'pl1', name: 'Rustara', visual: { kind: 'planet', c1: '#d9724a', c2: '#8a3b2a' }, features: ['small', 'solid ground', 'craters'] },
          { id: 'pl2', name: 'Bandor', visual: { kind: 'planet', c1: '#e9b36a', c2: '#a1642f', stripes: true, rings: true }, features: ['huge', 'stripes', 'no ground'] },
          { id: 'pl3', name: 'Glacia', visual: { kind: 'planet', c1: '#d7f3ff', c2: '#7bbfe0' }, features: ['pale blue', 'frozen', 'very cold'] },
          { id: 'pl4', name: 'Swirlon', visual: { kind: 'planet', c1: '#8fd0c4', c2: '#3b7f8a', stripes: true }, features: ['huge', 'swirling clouds', 'no ground'] },
        ],
      },
    },
    validation: { type: 'classify', placements: { pl1: 'rocky', pl2: 'gas', pl3: 'ice', pl4: 'gas' } },
    evidence: ['ev-planet-chart'], concept: 'concept-classify2', meets: [], unlocks: ['space-4'], hqLevelAfter: 3,
    discovery: 'The records were muddled in exactly the same way as the forest records.',
  },
  {
    id: 'space-4', realm: 'space', chapter: 9, title: 'The Satellite Network', env: 'satelliteControl', glitch: 3, companion: 'fern', map: [86, 42],
    summary: 'Data travels in packets from relay to relay. The route is scrambled, and some satellite records look unusual.',
    objective: 'Route the message correctly and find duplicated, incomplete or changed records.',
    intro: [
      L('orbit', 'neutral', 'Packet routing failure. The relay order is wrong. I have also found duplicate and incomplete records.'),
      L('detective', 'happy', 'We can fix the route, then check which records do not fit the expected pattern.'),
      L('fern', 'worried', 'And one packet carries a symbol that has changed. It looks like the Glitch signal.'),
    ],
    hints: ['A message starts at the sender and ends at the receiver.', 'Flag duplicate records and records with missing details.', 'The saved shard symbol helps you spot a changed signal.'],
    sceneClues: [{ id: 'clue-s4', x: 36, y: 60, label: 'A relay key card', evidenceId: 'ev-relay-key' }],
    activity: {
      id: 'act-s4-network', type: 'network', title: 'Satellite Network Check', instruction: 'Route the message, then flag unusual records travelling through the network.',
      config: {
        sequence: {
          kind: 'records',
          blocks: [
            { id: 'n3', label: 'Relay Sat-2', meta: 'Hop 2', glyph: 'satellite' }, { id: 'n1', label: 'Ground Station', meta: 'Sender', glyph: 'radio' },
            { id: 'n4', label: 'Deep Space Dish', meta: 'Receiver', glyph: 'orbit' }, { id: 'n2', label: 'Relay Sat-1', meta: 'Hop 1', glyph: 'satellite' },
          ],
        },
        audit: {
          question: 'Which signal records should O.R.B.I.T. investigate?',
          note: 'Look for information that is duplicated, incomplete or different from the known symbol.',
          items: [
            { id: 'packet-normal', label: 'Relay Sat-1 — received once', detail: 'One complete packet with a matching time.' },
            { id: 'packet-duplicate', label: 'Relay Sat-2 — same packet twice', detail: 'Duplicate record with the same time stamp.' },
            { id: 'packet-missing', label: 'Unknown sender — no time recorded', detail: 'The source and arrival time are missing.' },
            { id: 'packet-symbol', label: 'Shard symbol changed', detail: 'The symbol does not match the saved pattern.' },
            { id: 'packet-normal-2', label: 'Ground Station — complete message', detail: 'The sender and receiver are recorded.' },
          ],
        },
      },
    },
    validation: { type: 'network', order: ['n1', 'n2', 'n3', 'n4'], selected: ['packet-duplicate', 'packet-missing', 'packet-symbol'] },
    evidence: ['ev-relay-key'], concept: 'concept-transmit', concepts: ['concept-anomaly'], meets: [], unlocks: ['space-5'], hqLevelAfter: 3,
    discovery: 'The message reached home. Duplicate, incomplete and changed records revealed that the Glitch is affecting the same network that links the forest and space.',
  },
  {
    id: 'space-5', realm: 'space', chapter: 10, title: 'The Source of the Glitch', env: 'satelliteControl', glitch: 3, companion: 'fern', map: [92, 66],
    summary: 'The Glitch hides inside normal signals. Spot the one that does not belong.',
    objective: 'Find the odd signal out.',
    intro: [
      L('orbit', 'worried', 'Source located\u2026 inside the normal data. It looks the same, almost.'),
      L('glitch', 'neutral', '\u2026h\u0337e\u0337l\u0337p\u0337\u2026 sys\u2026tem\u2026 f\u0336a\u0336i\u0336l\u0336u\u0336r\u0336e\u2026'),
      L('detective', 'thinking', 'Everything in this row matches\u2026 except one. Let us detect the anomaly.'),
    ],
    hints: ['Look at the shape first, then the colour.', 'Three of these are exactly the same.', 'The odd one out does not follow the pattern.'],
    sceneClues: [{ id: 'clue-s5', x: 50, y: 26, label: 'A flickering fragment', evidenceId: 'ev-glitch' }],
    activity: {
      id: 'act-s5-pattern', type: 'pattern', title: 'Anomaly Scanner', instruction: 'Tap the signal that does not belong.',
      config: {
        mode: 'odd',
        options: [
          { id: 'g1', kind: 'diamond', color: '#5ee7ff' }, { id: 'g2', kind: 'diamond', color: '#5ee7ff' }, { id: 'g3', kind: 'diamond', color: '#5ee7ff' },
          { id: 'g4', kind: 'diamond', color: '#ff4fd8', glitchy: true }, { id: 'g5', kind: 'diamond', color: '#5ee7ff' }, { id: 'g6', kind: 'diamond', color: '#5ee7ff' },
        ],
      },
    },
    validation: { type: 'pattern', answer: 'g4' },
    evidence: ['ev-glitch'], concept: 'concept-glitch', meets: ['glitch'], unlocks: [], hqLevelAfter: 3, ending: true,
    discovery: 'The Glitch is not one broken system. It is something that wants to be heard. Its identity is still unknown.',
  },
];

// ── Assembly: original cases + extra cases, chained in this order ───────────────
const ORDER = [
  'forest-1', 'forest-1b', 'forest-2', 'forest-2b', 'forest-3', 'forest-3b', 'forest-4', 'forest-4b', 'forest-5a', 'forest-5',
  'space-1', 'space-1b', 'space-2', 'space-2b', 'space-3', 'space-3b', 'space-4', 'space-4b', 'space-5', 'space-6', 'space-7',
];
const BY_ID = new Map([...CORE_MISSIONS, ...EXTRA_MISSIONS].map((m) => [m.id, m]));
const SEEN = {};
const chained = ORDER.map((id, i) => {
  const m = BY_ID.get(id);
  const n = SEEN[m.chapter] = (SEEN[m.chapter] || 0) + 1;
  return { ...m, unlocks: ORDER[i + 1] ? [ORDER[i + 1]] : [], chapterLabel: `${m.chapter}${'ABC'[n - 1]}` };
});
// World-map positions are generated so any number of cases fits neatly.
const place = (list, x0, x1) => list.forEach((m, i) => {
  const t = list.length > 1 ? i / (list.length - 1) : 0;
  m.map = [Math.round((x0 + (x1 - x0) * t) * 10) / 10, Math.round((36 + (i % 2) * 30 + Math.sin(i) * 4) * 10) / 10];
});
place(chained.filter((m) => m.realm === 'forest'), 6, 45);
place(chained.filter((m) => m.realm === 'space'), 55, 95);

export const MISSIONS = chained;
export const getMission = (id) => MISSIONS.find((m) => m.id === id);
