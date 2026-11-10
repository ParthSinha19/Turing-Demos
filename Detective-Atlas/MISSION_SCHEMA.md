# Detective Atlas — Mission Schema

This document describes the content contract consumed by the game. Mission content lives in `src/data/missions.js`; it contains plain JavaScript data and a tiny dialogue helper, not React components. The gameplay screen does not contain chapter-specific answer logic.

## 1. Mission object

Every entry in `MISSIONS` follows this shape:

```js
{
  id: 'forest-2',                 // stable unique ID; never reuse an ID
  realm: 'forest',               // 'forest' | 'space'
  chapter: 2,                    // chapter number displayed to the player
  title: 'The Case of the Missing Footprints',
  env: 'forestExplore',           // environment ID from data/environments.js
  glitch: 1,                      // scene interference level, 0–3
  companion: 'fern',              // character staged in the mission
  map: [22, 52],                  // x/y percentages for the world map
  summary: '...',                 // short case-board description
  objective: '...',               // player-facing objective
  intro: [                        // DialogueStage lines
    { speaker: 'fern', expression: 'surprised', text: '...' },
  ],
  hints: ['...', '...', '...'],  // progressive nudges, then stronger guidance
  sceneClues: [                   // optional in-scene evidence hotspots
    { id: 'clue-f2', x: 30, y: 74, label: 'A clear print', evidenceId: 'ev-print' },
  ],
  activity: {
    id: 'act-f2-classify',       // stable activity ID for workspace/selectors
    type: 'train',               // key in ACTIVITY_TYPES
    title: 'Footprint Training Lab',
    instruction: '...',
    config: { /* activity-specific display data */ },
  },
  validation: { /* answer contract; kept separate from display config */ },
  evidence: ['ev-print'],       // evidence IDs awarded at case completion
  gadgets: ['scanner'],         // optional gadget IDs unlocked at case completion
  concept: 'concept-classify',  // primary notebook concept
  concepts: ['concept-data'],   // optional additional concepts
  meets: ['pip'],               // optional character IDs added to notebook
  unlocks: ['forest-3'],        // missions unlocked on successful completion
  hqLevelAfter: 2,              // headquarters visual level, 1–3
  discovery: '...',             // notebook discovery written on completion
  storyFlags: ['...'],          // optional additional story flags
  cinematic: 'forest-to-space', // optional transition after the case
  ending: true,                 // optional end-of-arc presentation copy
}
```

`id`, `realm`, `chapter`, `title`, `env`, `summary`, `objective`, `intro`, `hints`, `activity`, `validation`, `evidence`, `concept`, `unlocks`, and `discovery` are the core fields used by current missions. `companion`, `map`, `glitch`, `sceneClues`, `concepts`, `meets`, `hqLevelAfter`, `gadgets`, `storyFlags`, `cinematic`, and `ending` are optional presentation/progression metadata where not required by the screen.

## 2. Separation of concerns

- **Mission data** (`src/data/missions.js`) describes narrative, activity configuration, validation answers, rewards and unlocks.
- **Activity presentation** (`src/activities/*.jsx`) renders a reusable interaction. Each activity receives `{ config, value, onChange, status, disabled }`.
- **Activity registry** (`src/activities/index.jsx`) maps `activity.type` to its component. `MissionScreen` and `ActivityShell` do not branch on individual mission IDs.
- **Validation** (`src/lib/validate.js`) checks a player's structured response against `mission.validation` and returns `{ ok, message }`.
- **Progression and rewards** (`src/state/GameContext.jsx`) records a mission only after its activity has validated successfully. Evidence, concepts, characters, discoveries, unlock IDs and story flags are awarded from mission data.
- **Persistence** (`src/state/save.js`) serialises a versioned JSON save to localStorage.

Do not put correct answers into `activity.config`. The config is presentation data; the separate `validation` object is the answer contract.

## 3. Activity types

The following types are registered today. The 14 requested classroom interaction patterns are covered by these reusable types or combinations:

| Activity type | Interaction | Typical response shape |
|---|---|---|
| `choice` | Multiple-choice identification | `{ choice: 'option-id' }` |
| `classify` | Drag/tap objects into groups | `{ placements: { itemId: 'bin-id' } }` |
| `train` | Label examples, then predict a new example | `{ placements: { itemId: 'bin-id' }, prediction: 'option-id' }` |
| `process` | Order a safety process, then enter a corrected command | `{ order: ['step-id'], text: 'open_door' }` |
| `match` | Match one set of objects/records to another | `{ pairs: { leftId: 'right-id' } }` |
| `sequence` | Order instructions or records | `{ order: ['step-1', 'step-2'] }` |
| `type` | Type a short corrected response/command | `{ text: 'open_door' }` |
| `select` | Select useful or unusual information | `{ selected: ['record-id'] }` |
| `compare` | Compare examples and choose a conclusion | `{ choice: 'option-id' }` |
| `pattern` | Complete a repeating pattern or find an odd one | `{ answer: 'option-id' }` |
| `prompt` | Construct a guided prompt and inspect a response | `{ slots: { slotId: 'option-id' }, review: 'option-id' }` |
| `predict` | Test a prediction against observations | `{ answer: 'option-id' }` |
| `debug` | Choose a repair for a broken instruction | `{ fixId: 'option-id' }` |
| `network` | Composite: route packets and audit records | `{ order: ['node-id'], selected: ['record-id'] }` |

Sorting records is handled by `classify` or `sequence`; simple sequencing and ordering instructions share `sequence`; detecting an unusual pattern uses `pattern` or `select`. The `network` activity composes `SequenceActivity` and `SelectActivity`; `process` composes `SequenceActivity` and `TypeActivity`. Neither creates a second mission framework.

### Common activity config conventions

- `classify`: `{ bins: [{ id, label, glyph }], items: [{ id, name, visual, features }] }`.
- `match`: `{ left: [{ id, label, glyph }], right: [{ id, label }] }`.
- `sequence`: `{ kind: 'blocks' | 'records', blocks: [{ id, label, glyph, meta? }], audit? }`. `audit` is an optional select-stage configuration.
- `prompt`: `{ aiId, aiMessage, template, slots, defaultReply, responseRules, review? }`. A `responseRules` entry has a `when` object mapping slot IDs to chosen option IDs, plus a `reply` and optional `showReview`.
- `pattern`: `mode: 'missing'` with a `sequence` containing `null`, or `mode: 'odd'` with `options`.
- `type`: `{ log, prompt, placeholder }`.
- `network`: `{ sequence, audit }`.
- `process`: `{ sequence, command }`.
- `train`: `{ examples: { bins, items }, challenge: { item, question, options } }`.

Visual records can use `visual.kind: 'print'`, `'planet'`, or a glyph reference supported by `SpecimenVisual`.

## 4. Validation contracts

Use the following shapes in a mission's `validation` field:

```js
// classify
{ type: 'classify', placements: { p1: 'fox', p2: 'rabbit' } }

// train
{ type: 'train', placements: { p1: 'fox', p2: 'rabbit' }, prediction: 'fox' }

// match
{ type: 'match', pairs: { badger: 'sett', owl: 'hollow' } }

// sequence, optionally with a record audit
{ type: 'sequence', order: ['start', 'fill', 'run'], auditSelected: ['duplicate', 'missing'] }

// guided prompt; optional review answer makes children check evidence
{ type: 'prompt', slots: { when: 'recent', what: 'weather', how: 'explain' }, review: 'support' }

// pattern
{ type: 'pattern', answer: 'triangle' }

// typed response; accepted values are normalised for case and spaces
{ type: 'type', accepted: ['open_door'] }

// process: correct sequence AND corrected command
{ type: 'process', order: ['seal', 'unlock', 'open'], accepted: ['open_door'] }

// choice / compare
{ type: 'choice', choice: 'best-clue' }
{ type: 'compare', choice: 'same-feature' }

// select / network
{ type: 'select', selected: ['useful-1', 'useful-2'] }
{ type: 'network', order: ['sender', 'relay-a', 'relay-b', 'receiver'], selected: ['duplicate', 'incomplete'] }

// prediction / debugging
{ type: 'predict', answer: 'rain' }
{ type: 'debug', fixId: 'replace-typo' }
```

The validator checks completeness before correctness and gives a short retry message. Hints are always available and are not scored or deducted. A successful response disables further edits, changes the mission session to `success`, and enables the existing **Case solved** action. The progression reducer independently checks that successful status before awarding completion rewards.

## 5. Example: training mission

The Forest footprint case demonstrates the intended pattern for a multi-stage activity:

```js
{
  id: 'forest-2',
  activity: {
    id: 'act-f2-classify',
    type: 'train',
    title: 'Footprint Training Lab',
    instruction: 'Teach F.O.R.E.S.T. with examples, then test its new prediction.',
    config: {
      examples: { bins: [/* animal groups */], items: [/* labelled examples */] },
      challenge: {
        item: { id: 'new-print', name: 'New print E', visual: { kind: 'print', toes: 4, claws: true }, features: ['4 toes', 'claw marks'] },
        question: 'Which animal is the best prediction?',
        options: [/* fox, rabbit, bird */],
      },
    },
  },
  validation: {
    type: 'train',
    placements: { p1: 'fox', p2: 'rabbit', p3: 'bird', p4: 'fox' },
    prediction: 'fox',
  },
}
```

The example labels are stored separately from the final prediction. The simulated forest AI only advances to the challenge after every example is labelled; all processing stays in the browser.

## 6. Adding content

### Add a mission with an existing activity

1. Add a unique object to `MISSIONS` in the correct story order.
2. Add its `validation` object separately from `activity.config`.
3. Add any evidence in `src/data/evidence.js`, including a unique ID, `originChapter`, realm, glyph, title, blurb and board position.
4. Add any concept IDs to `CONCEPTS` and reference them from `concept` or `concepts`.
5. Add the next mission ID to `unlocks` (or leave `unlocks` empty for a finale).
6. Add a validator test with both an accepted answer and a rejected answer in `tests/mission-validation.test.js`.

### Add a new activity type

Only when no existing interaction fits:

1. Create a component in `src/activities/` that follows `{ config, value, onChange, status, disabled }`.
2. Register it in `ACTIVITY_TYPES` in `src/activities/index.jsx`.
3. Add its pure validation branch to `src/lib/validate.js`.
4. Add a correct and incorrect answer test.
5. Document the new config/value/validation shape in this file.

Do not add chapter-specific UI branching to `MissionScreen`.
