// ─────────────────────────────────────────────────────────────────────────────
// EXTRA MISSIONS + THE FINALE ("The Last Signal", chapter 10, parts A-C).
// Content only. missions.js merges these with the original cases and chains them in ORDER.
// A mission here with the same id as an original one REPLACES it (space-5 does).
// ─────────────────────────────────────────────────────────────────────────────
const L = (speaker, expression, text) => ({ speaker, expression, text });

export const EXTRA_MISSIONS = [
  /* ───────────── FOREST — one extra case per chapter ───────────── */
  {
    id: 'forest-1b', realm: 'forest', chapter: 1, title: 'Facts or Guesses?', env: 'forestExplore', glitch: 1, companion: 'fern',
    summary: 'Fern\u2019s notebook mixes things she checked with things she only heard. Find the facts.',
    objective: 'Choose the notes that you could check by looking, counting or measuring.',
    intro: [
      L('fern', 'happy', 'I wrote everything in my notebook. Some of it I saw. Some of it\u2026 I only heard.'),
      L('forest', 'worried', 'I copied all of it into my records. I did not know some notes were only guesses.'),
      L('detective', 'thinking', 'A good record is something you can check. Let us find the facts.'),
    ],
    hints: ['Ask: could I check this by looking, counting or measuring?', 'A rumour is something somebody heard from somebody else.', 'Feeling magic is not something you can measure.'],
    sceneClues: [],
    activity: {
      id: 'act-f1b-select', type: 'select', title: 'Fern\u2019s Notebook', instruction: 'Tap every note that is a fact you could check.',
      config: {
        question: 'Which notes are facts we can check?', note: 'Choose every note that could be checked by looking, counting or measuring.',
        items: [
          { id: 'n1', label: 'An owl was asleep at noon.', detail: 'Fern saw it herself.' },
          { id: 'n2', label: 'A dragon lives by the stream.', detail: 'Someone heard it from a friend of a friend.' },
          { id: 'n3', label: 'The stream is 12 steps wide.', detail: 'Fern counted the steps.' },
          { id: 'n4', label: 'The big oak is magic.', detail: 'It just feels magic.' },
          { id: 'n5', label: 'Three rabbits live in the burrow.', detail: 'Counted twice, on two different days.' },
        ],
      },
    },
    validation: { type: 'select', selected: ['n1', 'n3', 'n5'] },
    evidence: [], concept: 'concept-checkfacts', meets: [], unlocks: [],
    discovery: 'A fact is something you can check. A rumour or a feeling needs checking before you trust it.',
  },
  {
    id: 'forest-2b', realm: 'forest', chapter: 2, title: 'The Best Clue', env: 'forestExplore', glitch: 1, companion: 'fern',
    summary: 'Three clues about the stream creature. Which one teaches F.O.R.E.S.T. the most?',
    objective: 'Choose the clue with the most useful information.',
    intro: [
      L('forest', 'neutral', 'I have three clues about the stream creature. I can only study one.'),
      L('fern', 'thinking', 'A good clue has details we can point to. Toes, claws, shape.'),
    ],
    hints: ['Which clue gives you things you can count?', 'A smudge could be anything.', 'A story does not have toes to count.'],
    sceneClues: [],
    activity: {
      id: 'act-f2b-compare', type: 'compare', title: 'Which Clue Helps Most?', instruction: 'Compare the three clues, then tap the best one.',
      config: {
        question: 'Which clue gives F.O.R.E.S.T. the most useful information?',
        examples: [
          { id: 'clear', title: 'A clear print in the mud', description: 'Four toes. Claw marks. An oval shape.', label: 'Clue A' },
          { id: 'smudge', title: 'A blurry smudge', description: 'Something was here. It is hard to see what.', label: 'Clue B' },
          { id: 'story', title: 'Pip says it was \u201Creally big\u201D', description: 'Pip only saw it for a second.', label: 'Clue C' },
        ],
      },
    },
    validation: { type: 'compare', choice: 'clear' },
    evidence: [], concept: 'concept-classify', meets: [], unlocks: [],
    discovery: 'Good examples have clear features. A blurry clue gives an AI very little to learn from.',
  },
  {
    id: 'forest-3b', realm: 'forest', chapter: 3, title: 'The Silly Sprinkler', env: 'forestStation', glitch: 2, companion: 'fern',
    summary: 'The garden sprinkler waters the plants only when it rains. Fix the broken instruction.',
    objective: 'Choose the correction that makes the sprinkler work sensibly.',
    intro: [
      L('fern', 'surprised', 'The sprinkler only switches on when it is raining! The plants are very dry.'),
      L('detective', 'thinking', 'The instruction must be the wrong way round. Let us debug it.'),
    ],
    hints: ['When do plants need extra water?', 'Rain already waters the garden.', 'Look at the word NOT.'],
    sceneClues: [],
    activity: {
      id: 'act-f3b-debug', type: 'debug', title: 'Debug the Sprinkler', instruction: 'Read the instruction and choose the fix.',
      config: {
        problemTitle: 'Sprinkler program', problem: 'The garden is dry on sunny days and soaked on rainy days.',
        broken: 'IF it is raining THEN water the plants',
        question: 'Which instruction fixes the sprinkler?',
        options: [
          { id: 'not-rain', label: 'IF it is NOT raining THEN water the plants' },
          { id: 'moon', label: 'IF it is raining THEN water the moon' },
          { id: 'stop', label: 'IF it is NOT raining THEN stop' },
        ],
      },
    },
    validation: { type: 'debug', fixId: 'not-rain' },
    evidence: [], concept: 'concept-debug', meets: [], unlocks: [],
    discovery: 'A tiny mistake in an instruction can make a machine do the opposite of what we want. Finding it is called debugging.',
  },
  {
    id: 'forest-4b', realm: 'forest', chapter: 4, title: 'Check the Forecast', env: 'forestStation', glitch: 2, companion: 'fern',
    summary: 'F.O.R.E.S.T. gives a new forecast. Use the evidence to decide how far to trust it.',
    objective: 'Pick the prediction that matches the evidence and is honest about being a guess.',
    intro: [
      L('forest', 'happy', 'New forecast! I am very, very sure about it!'),
      L('fern', 'thinking', 'Sounding sure is not the same as being right. What do the records say?'),
    ],
    hints: ['Look at the last five days.', 'A prediction is a guess, not a promise.', 'The best answer uses the records and says it is a guess.'],
    sceneClues: [],
    activity: {
      id: 'act-f4b-predict', type: 'predict', title: 'Test the Forecast', instruction: 'Read the records, then choose the best prediction.',
      config: {
        observations: ['The last 5 summer days were warm and dry.', 'The evening sky is clear.', 'The weather machine was fixed this morning.'],
        question: 'What is the best prediction for tomorrow?',
        options: [
          { id: 'warm', label: 'Probably warm and dry. We will check tomorrow.', detail: 'Matches the records.' },
          { id: 'snow', label: 'Snow! The AI sounded very sure.', detail: 'Sounding sure is not evidence.' },
          { id: 'certain', label: 'Warm for ever. It is 100% certain.', detail: 'Nobody can be certain about tomorrow.' },
        ],
      },
    },
    validation: { type: 'predict', answer: 'warm' },
    evidence: [], concept: 'concept-predict', meets: [], unlocks: [],
    discovery: 'A good prediction uses evidence and admits it is a guess. How sure an AI sounds is not evidence.',
  },
  {
    id: 'forest-5a', realm: 'forest', chapter: 5, title: 'The Memory Tree Riddle', env: 'memoryTree', glitch: 2, companion: 'pip',
    summary: 'The Memory Tree will only open for someone who can finish its pattern.',
    objective: 'Find the symbol that finishes the Memory Tree\u2019s pattern.',
    intro: [
      L('pip', 'surprised', 'The tree is glowing! It repeats the same four symbols. I did not touch anything. Honest.'),
      L('forest', 'neutral', 'The Memory Tree opens only for a pattern that is finished correctly.'),
      L('detective', 'thinking', 'Patterns repeat. Say it out loud and the missing piece appears.'),
    ],
    hints: ['Count how many symbols come before the pattern starts again.', 'The pattern has four different symbols.', 'Circle, triangle, square, diamond\u2026'],
    sceneClues: [],
    activity: {
      id: 'act-f5a-pattern', type: 'pattern', title: 'The Tree\u2019s Riddle', instruction: 'Tap the symbol that finishes the pattern.',
      config: {
        mode: 'missing',
        sequence: [{ kind: 'circle', color: '#7be0a4' }, { kind: 'triangle', color: '#ffd166' }, { kind: 'square', color: '#ff9a4a' }, { kind: 'diamond', color: '#b693ff' }, { kind: 'circle', color: '#7be0a4' }, { kind: 'triangle', color: '#ffd166' }, null],
        options: [{ id: 'o1', kind: 'square', color: '#ff9a4a' }, { id: 'o2', kind: 'diamond', color: '#b693ff' }, { id: 'o3', kind: 'circle', color: '#7be0a4' }],
      },
    },
    validation: { type: 'pattern', answer: 'o1' },
    evidence: [], concept: 'concept-pattern', meets: [], unlocks: [],
    discovery: 'The Memory Tree is ready. Next, the lost memories must go back in order.',
  },

  /* ───────────── SPACE — one extra case per chapter ───────────── */
  {
    id: 'space-1b', realm: 'space', chapter: 6, title: 'Crack the Code', env: 'spaceExplore', glitch: 2, companion: 'fern',
    summary: 'The signal also contains numbers. Use the key to turn them into a word.',
    objective: 'Decode 3-1-20 using the letter key and type the word.',
    intro: [
      L('orbit', 'neutral', 'The signal contains numbers: 3, 1, 20. I need a key to read them.'),
      L('fern', 'happy', 'A=1, B=2, C=3\u2026 Easy! It is a secret code.'),
    ],
    hints: ['Count along the alphabet: A=1, B=2, C=3.', 'The first number is 3. Which letter is third?', 'Letter 20 is T.'],
    sceneClues: [],
    activity: {
      id: 'act-s1b-type', type: 'type', title: 'Decode the Numbers', instruction: 'Turn each number into a letter, then type the word.',
      config: { log: ['> signal.decode', 'RECEIVED: 3 - 1 - 20', 'KEY: A=1 B=2 C=3 D=4 E=5 F=6 G=7 H=8 I=9', '     J=10 K=11 L=12 M=13 N=14 O=15 P=16', '     Q=17 R=18 S=19 T=20 U=21 V=22'], prompt: 'Type the word:', placeholder: 'three letters' },
    },
    validation: { type: 'type', accepted: ['cat'] },
    evidence: [], concept: 'concept-code', meets: [], unlocks: [],
    discovery: 'A code swaps one thing for another. With the right key you can decode it.',
  },
  {
    id: 'space-2b', realm: 'space', chapter: 7, title: 'Say It Exactly', env: 'spaceStation', glitch: 3, companion: 'fern',
    summary: 'Station commands must be exact. Match each command to what it does.',
    objective: 'Match every command to its result.',
    intro: [
      L('orbit', 'neutral', 'Commands must be exact. One wrong word and nothing happens.'),
      L('detective', 'happy', 'Then let us match each command to what it really does.'),
    ],
    hints: ['Read the words inside each command.', 'open means open. lock means lock.', 'Match the easy ones first.'],
    sceneClues: [],
    activity: {
      id: 'act-s2b-match', type: 'match', title: 'Command Console', instruction: 'Tap a command, then tap its result.',
      config: {
        left: [{ id: 'open', label: 'open_door', glyph: 'radio' }, { id: 'close', label: 'close_door', glyph: 'radio' }, { id: 'lights', label: 'lights_on', glyph: 'star' }, { id: 'lock', label: 'lock_door', glyph: 'cog' }],
        right: [{ id: 'r-open', label: 'The door slides open' }, { id: 'r-close', label: 'The door slides shut' }, { id: 'r-lights', label: 'The room glows' }, { id: 'r-lock', label: 'The door clicks locked' }],
      },
    },
    validation: { type: 'match', pairs: { open: 'r-open', close: 'r-close', lights: 'r-lights', lock: 'r-lock' } },
    evidence: [], concept: 'concept-commands', meets: [], unlocks: [],
    discovery: 'A command tells a computer exactly what to do. The words have to be right.',
  },
  {
    id: 'space-3b', realm: 'space', chapter: 8, title: 'Should We Trust O.R.B.I.T.?', env: 'spaceExplore', glitch: 2, companion: 'fern',
    summary: 'O.R.B.I.T. is very sure about a new planet. Check its answer against the evidence.',
    objective: 'Decide what to do with O.R.B.I.T.\u2019s answer.',
    intro: [
      L('orbit', 'neutral', 'New planet: Zephyra. Classification: rocky. Confidence: 99%.'),
      L('fern', 'worried', 'It is huge, striped, and has no ground. That does not sound rocky.'),
    ],
    hints: ['Compare O.R.B.I.T.\u2019s answer with the features.', 'Rocky planets have solid ground.', 'Being sure is not the same as being right.'],
    sceneClues: [],
    activity: {
      id: 'act-s3b-predict', type: 'predict', title: 'Check the AI', instruction: 'Read the features, then decide.',
      config: {
        observations: ['Zephyra is enormous.', 'It has swirling stripes.', 'There is no solid ground to stand on.'],
        question: 'O.R.B.I.T. says \u201Crocky\u201D. What should we do?',
        options: [
          { id: 'trust', label: 'Trust it. It said 99%.', detail: 'It sounds very sure.' },
          { id: 'check', label: 'Check it. The features look like a gas giant.', detail: 'Compare the answer with the evidence.' },
          { id: 'ignore', label: 'Never listen to O.R.B.I.T. again.', detail: 'One mistake does not make it useless.' },
        ],
      },
    },
    validation: { type: 'predict', answer: 'check' },
    evidence: [], concept: 'concept-checkai', meets: [], unlocks: [],
    discovery: 'An AI can sound sure and still be wrong. Compare its answer with the evidence before you trust it.',
  },
  {
    id: 'space-4b', realm: 'space', chapter: 9, title: 'The Copycat Signal', env: 'satelliteControl', glitch: 3, companion: 'fern',
    summary: 'Some messages on the network pretend to come from friends. Spot the suspicious ones.',
    objective: 'Select every message that looks suspicious.',
    intro: [
      L('orbit', 'worried', 'Five messages arrived. I cannot tell which ones are safe.'),
      L('detective', 'thinking', 'We can check who sent each one, and when. A real message has a sender and a time.'),
    ],
    hints: ['Who sent it? Is the sender missing?', 'Does the message ask for secret things?', 'A changed symbol means it may be a copy.'],
    sceneClues: [],
    activity: {
      id: 'act-s4b-select', type: 'select', title: 'Spot the Copycat', instruction: 'Tap every suspicious message.',
      config: {
        question: 'Which messages look suspicious?', note: 'Check the sender, the time and what the message asks for.',
        items: [
          { id: 'm1', label: 'Ground Station \u2014 10:01', detail: 'Complete message. Symbol matches.' },
          { id: 'm2', label: 'Sender unknown \u2014 \u201CSend me your secret codes!\u201D', detail: 'No sender. Asks for secrets.' },
          { id: 'm3', label: 'Relay Sat-1 \u2014 10:03', detail: 'Complete message. Symbol matches.' },
          { id: 'm4', label: 'Ground Station \u2014 \u201COpen every door!\u201D', detail: 'The symbol has changed. No time recorded.' },
          { id: 'm5', label: 'Relay Sat-2 \u2014 10:04', detail: 'Complete message. Symbol matches.' },
        ],
      },
    },
    validation: { type: 'select', selected: ['m2', 'm4'] },
    evidence: [], concept: 'concept-sources', meets: [], unlocks: [],
    discovery: 'Always check the source: who sent it, when, and does it match what you already know?',
  },

  /* ───────────── CHAPTER 10: THE LAST SIGNAL (3 parts) ───────────── */
  {
    id: 'space-5', realm: 'space', chapter: 10, title: 'The Last Signal: Trust, Check or Reject', env: 'satelliteControl', glitch: 3, companion: 'fern',
    summary: 'Reports are flooding in from across the network. Decide which to trust, which to check, and which to reject.',
    objective: 'Sort every report into Trust, Check first or Reject.',
    intro: [
      L('orbit', 'worried', 'Six reports have arrived about the Glitch. I cannot tell which ones are reliable.'),
      L('glitch', 'neutral', '\u2026w\u0337a\u0337r\u0337n\u0337i\u0337n\u0337g\u2026 block\u2026 block\u2026 ALL\u2026'),
      L('fern', 'worried', 'Whatever is sending those warnings sounds frightened, not fierce.'),
      L('detective', 'thinking', 'Then we do not panic. We sort the reports: Trust, Check first, or Reject.'),
    ],
    hints: ['Trust: it has a sender, a time and evidence you can match.', 'Check first: only one source, or no reason given.', 'Reject: no sender, scares you, or asks you to pass it on.'],
    sceneClues: [{ id: 'clue-s5', x: 50, y: 26, label: 'A flickering fragment', evidenceId: 'ev-glitch' }],
    activity: {
      id: 'act-s5-classify', type: 'classify', title: 'Report Desk', instruction: 'Tap a report to read it, then drop it in a group.',
      config: {
        bins: [{ id: 'trust', label: 'Trust', glyph: 'shieldcheck' }, { id: 'check', label: 'Check first', glyph: 'eye' }, { id: 'reject', label: 'Reject', glyph: 'shieldalert' }],
        items: [
          { id: 'rp1', name: 'Station Log', visual: { kind: 'glyph', glyph: 'radio' }, features: ['complete', 'has a sender and a time', 'matches the airlock log'] },
          { id: 'rp2', name: 'Panic Message', visual: { kind: 'glyph', glyph: 'bug' }, features: ['no sender', 'shouts \u201CEVERYONE PANIC!\u201D', 'no evidence at all'] },
          { id: 'rp3', name: 'Moon Count', visual: { kind: 'glyph', glyph: 'moon' }, features: ['says Earth has 3 moons', 'only one source', 'nobody has seen them'] },
          { id: 'rp4', name: 'Weather Report', visual: { kind: 'glyph', glyph: 'droplet' }, features: ['from F.O.R.E.S.T.', 'uses the last 7 days', 'says how sure it is'] },
          { id: 'rp5', name: 'Shield Warning', visual: { kind: 'glyph', glyph: 'shield' }, features: ['\u201CDANGER! Block everything!\u201D', 'gives no reason', 'stamped with an old shield mark'] },
          { id: 'rp6', name: 'Chain Message', visual: { kind: 'glyph', glyph: 'star' }, features: ['\u201CPass this on or doom!\u201D', 'no sender', 'nobody can check it'] },
        ],
      },
    },
    validation: { type: 'classify', placements: { rp1: 'trust', rp2: 'reject', rp3: 'check', rp4: 'trust', rp5: 'check', rp6: 'reject' } },
    evidence: ['ev-glitch', 'ev-warning-log'], concept: 'concept-trust', concepts: ['concept-glitch'], meets: ['glitch'], unlocks: [], hqLevelAfter: 3,
    discovery: 'Three of the strangest warnings carry the same old shield mark. Something has been trying to protect the network all along.',
  },
  {
    id: 'space-6', realm: 'space', chapter: 10, title: 'The Last Signal: The Guardian Awakes', env: 'guardianCore', glitch: 3, companion: 'fern',
    summary: 'The shield marks lead to a sealed vault. The Glitch is finally in front of you. Can its warnings be trusted?',
    objective: 'Check the Guardian\u2019s blocks. Select the messages it blocked by mistake.',
    intro: [
      L('orbit', 'neutral', 'The shield marks lead here: the old Guardian Core. It has been sealed for a very long time.'),
      L('guardian', 'damaged', '\u2026WARNING\u2026 all messages\u2026 DANGEROUS\u2026 block\u2026 block\u2026 block\u2026'),
      L('fern', 'worried', 'It is not a monster. Look at it, Detective. It is flickering. It is scared.'),
      L('guardian', 'damaged', 'I am G.U.A.R.D.I.A.N. General Unit for Assessing, Reviewing and Defending Information Across the Network.'),
      L('guardian', 'damaged', 'I was built to keep bad information out. But my records broke. Now I cannot tell good from bad. I only know I must keep blocking.'),
      L('detective', 'thinking', 'You were never the villain. You are a safety system that got damaged. But we cannot trust your warnings just because they say DANGER.'),
      L('guardian', 'damaged', 'Then\u2026 please check my work, Detective. I might be wrong.'),
    ],
    hints: ['A real danger asks for secrets or has no sender.', 'A message with a clear sender, a time and matching evidence is probably safe.', 'Select only the messages the Guardian blocked by mistake.'],
    sceneClues: [{ id: 'clue-s6', x: 50, y: 34, label: 'A cracked shield badge', evidenceId: 'ev-guardian-seal' }],
    activity: {
      id: 'act-s6-select', type: 'select', title: 'Check the Guardian', instruction: 'The Guardian blocked these messages. Tap the ones it blocked by mistake.',
      config: {
        question: 'Which messages did the Guardian block by mistake?', note: 'Check each message yourself. Do not trust a warning just because it sounds loud.',
        items: [
          { id: 'b1', label: 'Blocked: F.O.R.E.S.T.\u2019s weather report', detail: 'Known sender, complete, matches the records.' },
          { id: 'b2', label: 'Blocked: \u201CTell me your home address and password\u201D', detail: 'Unknown sender asking for private information.' },
          { id: 'b3', label: 'Blocked: the planet chart you checked with O.R.B.I.T.', detail: 'Complete, checked, and matches the evidence.' },
          { id: 'b4', label: 'Blocked: \u201CPass this on to ten robots or doom!\u201D', detail: 'No sender, no proof.' },
          { id: 'b5', label: 'Blocked: a rescue message from the Ground Station', detail: 'Clear sender and time. Symbol matches.' },
          { id: 'b6', label: 'Blocked: unknown sender says \u201CDelete all records!\u201D', detail: 'No sender and no reason.' },
        ],
      },
    },
    validation: { type: 'select', selected: ['b1', 'b3', 'b5'] },
    evidence: ['ev-guardian-seal'], concept: 'concept-guardian', concepts: ['concept-checkai'], meets: ['guardian'], unlocks: [], hqLevelAfter: 3,
    discovery: 'The Glitch was a damaged Guardian System: it was built to protect the network, but its broken records made it block good information. Even a safety system must be checked.',
  },
  {
    id: 'space-7', realm: 'space', chapter: 10, title: 'The Last Signal: Repair and Test', env: 'guardianCore', glitch: 1, companion: 'fern',
    summary: 'Repair the Guardian in a safe order, then test it before the network trusts it again.',
    objective: 'Put the repair steps in order, then pick the practice results that show the Guardian is working.',
    intro: [
      L('guardian', 'damaged', 'Detective, I would like to be fixed. But please test me before you trust me.'),
      L('orbit', 'neutral', 'Agreed. No system switches back on until it has been tested and checked by a person.'),
      L('forest', 'happy', 'I know how it feels to make mistakes. We will help you, Guardian.'),
      L('pip', 'happy', 'I brought you something shiny! It is part of your shield. I think. Sorry I took it.'),
      L('detective', 'happy', 'Right, team. Repair first, then test, then a human checks. Let us do this safely.'),
    ],
    hints: ['Stop the alarms first so everyone can think.', 'You must clean the rules before you can test them.', 'A person checks the tests before the Guardian is switched back on.'],
    sceneClues: [{ id: 'clue-s7', x: 28, y: 62, label: 'A practice test sheet', evidenceId: 'ev-test-report' }],
    activity: {
      id: 'act-s7-sequence', type: 'sequence', title: 'Repair the Guardian', instruction: 'Order the repair steps, then check the practice test results.',
      config: {
        kind: 'blocks',
        blocks: [
          { id: 'switch', label: 'Switch the Guardian back on', glyph: 'shieldcheck' },
          { id: 'test', label: 'Test it with practice messages', glyph: 'eye' },
          { id: 'pause', label: 'Pause the loud alarms', glyph: 'radio' },
          { id: 'human', label: 'Ask a person to check the test results', glyph: 'star' },
          { id: 'rule', label: 'Add the rule: check the sender before blocking', glyph: 'cog' },
          { id: 'clean', label: 'Clean up the damaged records', glyph: 'cpu' },
        ],
        audit: {
          question: 'Which practice results show the Guardian is working properly?',
          note: 'A good Guardian lets safe messages through, blocks risky ones, and asks a person when it is not sure.',
          items: [
            { id: 't1', label: 'Let through: complete weather report from F.O.R.E.S.T.', detail: 'Known sender. Safe.' },
            { id: 't2', label: 'Blocked: a stranger asking for a password', detail: 'Private information stays private.' },
            { id: 't3', label: 'Blocked: a rescue message with a clear sender and time', detail: 'This one was safe.' },
            { id: 't4', label: 'Let through: a stranger asking for a home address', detail: 'This one was risky.' },
            { id: 't5', label: 'Not sure: sent to a person to check', detail: 'It asked for help instead of guessing.' },
          ],
        },
      },
    },
    validation: { type: 'sequence', order: ['pause', 'clean', 'rule', 'test', 'human', 'switch'], auditSelected: ['t1', 't2', 't5'] },
    evidence: ['ev-test-report', 'ev-safety-code'], concept: 'concept-testing', concepts: ['concept-privacy', 'concept-oversight'], meets: [], unlocks: [], hqLevelAfter: 3,
    cinematic: 'last-signal', ending: true, leaveLabel: 'The network wakes up\u2026',
    discovery: 'The Guardian is repaired, tested and checked by people. The network is safe again, but a question remains: what woke the Guardian in the first place?',
  },
];

export const EXTRA_EVIDENCE = [
  { id: 'ev-warning-log', originChapter: 10, realm: 'space', glyph: 'shieldalert', title: 'Shield Warnings', blurb: 'Loud warnings with no reason, all stamped with the same old shield mark.', boardPos: [22, 9] },
  { id: 'ev-guardian-seal', originChapter: 10, realm: 'space', glyph: 'shield', title: 'Guardian Badge', blurb: 'A cracked badge from the Guardian Core. It matches the mark on Pip\u2019s shard.', boardPos: [40, 9] },
  { id: 'ev-test-report', originChapter: 10, realm: 'space', glyph: 'shieldcheck', title: 'Test Report', blurb: 'Proof that the repaired Guardian lets safe messages through and asks for help when unsure.', boardPos: [60, 9] },
  { id: 'ev-safety-code', originChapter: 10, realm: 'space', glyph: 'star', title: 'AI Safety Code', blurb: 'Five rules every detective keeps. Open it any time from the shuttle.', boardPos: [78, 9] },
];

export const EXTRA_CONNECTIONS = [
  { id: 'cx-7', a: 'ev-glitch', b: 'ev-guardian-seal', label: 'The Glitch fragment and the Guardian badge carry the same mark. The Glitch was a damaged Guardian.' },
  { id: 'cx-8', a: 'ev-shard', b: 'ev-guardian-seal', label: 'Pip\u2019s shard has the Guardian\u2019s mark, too. How did a piece of it fall to the forest? Nobody knows yet.' },
  { id: 'cx-9', a: 'ev-prediction', b: 'ev-warning-log', label: 'Blocked and muddled information made the forest AI guess wrongly. Good information matters.' },
];

export const EXTRA_CONCEPTS = {
  'concept-glitch': { title: 'The Glitch', text: 'The Glitch turned out to be a damaged safety system, not a villain. Some questions, like what woke it, are still unanswered.' },
  'concept-checkfacts': { title: 'Checking Facts', text: 'A fact is something you can check by looking, counting or measuring. A rumour or a feeling needs checking first.' },
  'concept-code': { title: 'Codes and Keys', text: 'A code swaps one thing for another. If you have the key, you can decode the message.' },
  'concept-commands': { title: 'Exact Commands', text: 'A command tells a computer exactly what to do. If one word is wrong, it may do something different or nothing at all.' },
  'concept-checkai': { title: 'Check the AI', text: 'An AI can sound sure and still be wrong. Compare what it says with the evidence.' },
  'concept-sources': { title: 'Check the Source', text: 'Ask who sent a message, when, and whether it matches what you know. A message with no sender is a warning sign.' },
  'concept-trust': { title: 'Trust, Check or Reject', text: 'Trust information with a clear source and evidence. Check information with only one source or no reason. Reject information that has no sender, scares you or asks you to pass it on.' },
  'concept-guardian': { title: 'Safety Systems Can Break', text: 'Even a system built to keep us safe can be wrong. A warning is a clue, not a fact. Check it.' },
  'concept-testing': { title: 'Test Before You Trust', text: 'After repairing a system, test it with practice examples before it is used for real.' },
  'concept-privacy': { title: 'Keep Private Things Private', text: 'Never share your address, passwords, school or photos with an AI or a stranger. Ask a trusted adult first.' },
  'concept-oversight': { title: 'People Stay in Charge', text: 'AI can help, but people make the big decisions. When an AI is not sure, a person should check.' },
};