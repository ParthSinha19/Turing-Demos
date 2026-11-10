# DETECTIVE ATLAS: THE SIGNAL FILES — Game Handover (Phase 2)

**A single React/Vite educational adventure for Years 3–4.** The child creates one detective, investigates five Forest chapters and five Space chapters, collects shared evidence, and follows one mystery: The Glitch. Its identity and intentions are intentionally unresolved at the end of this first adventure.

The supplied visual design has been preserved. This phase adds working progression, answer validation, reusable activities, evidence and notebook updates, story transitions, and versioned local saves.

## 1. Run and test

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The Vite configuration is intentionally kept as supplied:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' makes the build work from any GitHub Pages subdirectory
export default defineConfig({ base: './', plugins: [react()], build: { chunkSizeWarningLimit: 1500 } });
```

Use relative asset references. The build is intended to work under the repository's `./game` subdirectory and in local development. Do not change the relative base to `/`.

## 2. Project structure

```text
src/
  App.jsx                       screen router and overlay/transition/toast hosts
  state/
    GameContext.jsx             React provider, actions and autosave wiring
    gameReducer.js              pure reducer and initial game state
    save.js                     versioned localStorage format and safe helpers
  lib/validate.js               pure activity answer validators
  data/
    missions.js                 ten story missions, dialogue, activities, rewards
    evidence.js                 evidence, cross-world links and notebook concepts
    characters.js               character metadata
    customise.js                appearance, outfit and gadget options
    environments.js             existing environment definitions
  activities/
    index.jsx                   activity registry and shared ActivityShell
    ClassifyActivity.jsx        drag/tap sorting into groups
    TrainingActivity.jsx        labelled examples followed by a new prediction
    ProcessActivity.jsx         ordered safety process + command repair
    MatchActivity.jsx           record/object matching
    SequenceActivity.jsx        instruction/record ordering and optional audit
    PromptActivity.jsx          guided prompt construction and local AI simulation
    PatternActivity.jsx         missing pattern element / odd-one-out
    TypeActivity.jsx            short typed answer
    ChoiceActivity.jsx          reusable multiple-choice selection
    SelectActivity.jsx          reusable multi-select
    CompareActivity.jsx         comparison interaction
    PredictActivity.jsx         prediction check
    DebugActivity.jsx           choose a correction
    NetworkActivity.jsx         sequence + anomaly audit composite
  components/                   supplied HUD, scene, dialogue, character and clue UI
  scenes/                       supplied forest, space and headquarters artwork
  screens/                      menu, customise, HQ, mission, cinematic and overlays
  styles.css                     supplied design system plus activity additions

tests/
  mission-validation.test.js
  progression.test.js
  save.test.js
```

## 3. Screen and story flow

`menu → customise → hq ⇄ mission (intro → play → complete) → cinematic → space-1 … space-5`

- The world map and mission board read the same `MISSIONS` array.
- Only `forest-1` is initially unlocked.
- Completing a mission grants its evidence, concepts, discoveries, character meetings, story flags, HQ level and `unlocks` from data.
- The Space Wing does not unlock until `forest-5` is solved.
- The Forest finale grants `ev-shard` (Pip's Sky Shard). The transition plays the incoming orbital transmission and Pip's explanation, then begins `space-1` in the same save.
- The shard/symbol is referred to again in the satellite investigation and appears on the cross-world evidence board.
- Mission replay is allowed for completed cases. Replaying starts a fresh mission session but does not remove discoveries or evidence.
- Chapter 10 ends the first major adventure but does not explain who/what The Glitch is.

## 4. Mission data and validation

All mission content lives in `src/data/missions.js`. Each mission has a stable ID, realm, chapter, title, environment, story intro, objective, hints, scene clues, activity data, validation answer contract, rewards, discovery text and unlock IDs.

Keep presentation config and correct answers separate:

- `activity.config` contains the UI content the child can see and interact with.
- `mission.validation` contains the correct response contract.
- `validateActivity()` in `src/lib/validate.js` is a pure function returning `{ ok, message }`.
- `GameContext.submitActivity()` supplies the mission's validation object to the validator.
- Successful validation disables the activity controls and enables **Case solved**. `COMPLETE_MISSION` independently checks the session's success state before recording completion.

For exact fields and examples, see [`MISSION_SCHEMA.md`](./MISSION_SCHEMA.md).

## 5. Reusable activity engine

`ActivityShell` receives one activity from mission data and renders its registered component from `ACTIVITY_TYPES`. Every activity follows this contract:

```jsx
<Body config={activity.config}
      value={value}
      onChange={setValue}
      status={status}
      disabled={status === 'success'} />
```

Registered types are `choice`, `classify`, `train`, `process`, `match`, `sequence`, `type`, `select`, `compare`, `pattern`, `prompt`, `predict`, `debug`, and `network`.

Some requested learning tasks deliberately reuse the same component: sorting records uses classification/selection; sequencing and ordering instructions share the sequence component; detecting unusual patterns uses pattern/select; the network case composes sequence and selection. Add a new component only if none of the existing types fits. If a new type is introduced, register it in `src/activities/index.jsx`, add its validator in `src/lib/validate.js`, test correct and incorrect answers, and update `MISSION_SCHEMA.md`.

### Notable authored interactions

- **Forest 2:** children label four footprint examples, then classify a new print. The local F.O.R.E.S.T. simulation demonstrates an improved prediction after receiving useful labels.
- **Forest 3:** children arrange the Forest Machine's restart instructions and flag duplicate, incomplete, mislabelled and misfiled records.
- **Forest 4:** children complete a prompt with relevant recent data, a clear task and a request for the AI to explain its confidence. The simulated AI reply changes according to the prompt; the child must select evidence supporting its prediction.
- **Space 2:** children order the airlock safety checks before fixing the typed command.
- **Space 4:** children route a message from sender through two relays to receiver, then select duplicated, incomplete and changed-symbol records.

Prompt responses are local data-driven simulations. No child input is sent to an external AI API.

## 6. Game state and persistence

`useGame()` is the public game-state interface. Important state fields include:

- `screen`, `overlay`, `hasSave`, `transition`, `toast`
- `player`, `settings`, `hqLevel`, `hqJustExpanded`
- `activeMissionId`, `missionSession`
- `completed`, `unlocked`, `evidence`, `concepts`, `discoveries`, `characters`, `links`, `storyFlags`

`missionSession` persists `missionId`, `phase`, activity `value`, validation `status`, feedback `message` and `hintLevel`. Reloading during dialogue, activity work, or the completion screen resumes the saved phase and response.

`src/state/save.js` uses the key `detective-atlas-the-signal-files` and save version `1`. It catches storage access/quota errors and rejects malformed or unsupported saves safely. The game remains playable in session-only mode if localStorage is unavailable.

The main menu offers New Game / Continue. Starting a new game from an existing save requires confirmation. Settings includes a confirmed reset action. Player name, appearance, outfit, accessory, gadget and preferences are stored in the same save as story progress.

## 7. Evidence, notebook and headquarters

- Evidence items are defined in `src/data/evidence.js`, with `originChapter` identifying where they were discovered.
- Evidence can be found through mission scene clues and is also awarded on case completion. Duplicate awards are ignored.
- The investigation board only allows a link when both evidence items have been collected. Valid links are defined in `CONNECTIONS`.
- The notebook's Evidence, Characters, Discoveries, Concepts and Cases tabs read from saved state.
- Mission rewards update the notebook automatically. The scanner, field tablet and glow torch are unlocked through story cases and are stored as part of the same save; the workshop shows future gadgets as locked until earned.
- Headquarters upgrades are driven by `hqLevelAfter`; Pip and O.R.B.I.T. become available for conversation after they are discovered.
- The workshop and map use the existing supplied overlays.

## 8. Existing design and stable selectors

The existing forest/space scenes, character illustrations, HUD, dialogue, hints, evidence cards, notebook, investigation board, map, transitions and type styling have been kept. The new activity styles extend the existing CSS variables and component language rather than introducing a new theme.

Useful selectors retained/added include:

- `data-screen`, `data-mission-id`, `data-realm`, `data-env`
- `data-component="ActivityShell"`, `data-activity-type`, `data-component="TrainingActivity"`
- `data-item-id`, `data-bin-id`, `data-block-id`, `data-option-id`, `data-slot-id`
- `data-evidence-id`, `data-character`, mission clue IDs and existing HUD hotspot IDs
- `data-id="check-button"`, `data-id="solved-button"`, `data-id="continue-button"`, `data-id="begin-mission"`

## 9. QA status and caveats

`npm test` currently covers the authored ten-mission answer contracts, expected/rejected activity responses, evidence IDs/origin chapters, unlock references, Forest-to-Space shard handoff, and save payload read/write/version handling.

All 45 JS/JSX files passed a syntax parser check in the implementation environment. The production Vite build and full browser click-through were not verified because the environment did not have the Vite executable installed and npm registry access failed with DNS/network errors (`EAI_AGAIN`). Once dependencies are available, run `npm ci`, `npm test`, and `npm run build`, then verify a fresh-save playthrough, mid-mission refresh, mobile layout, and `./game` deployment.

The supplied Sound setting is still a visual preference toggle; the original project has no audio engine or sound assets.
