# WonderPaws — Engineering Handover

## 1. Project status

WonderPaws is the playable implementation of the supplied visual prototype. The frontend visual identity, character/environment artwork, CSS motion, palette, typography and existing navigation components have been retained. The game engine is implemented as independent TypeScript modules and connected to the `/interface` game route.

The project contains five worlds, 50 named levels and 150 challenge definitions. Each level exposes a guided, practice and independent challenge. The game uses a safe structured block representation; it does not evaluate arbitrary JavaScript or Python.

## 2. Run and verify

```bash
npm install
npm run dev
```

Quality commands:

```bash
npm run build
npm test
npm run lint
```

The browser game starts at `/`. Select **PLAY** to open `/interface`. Progress is stored in browser local storage under `wonderpaws-progress`. The `/characters`, `/worlds`, `/factory` and `/components` paths are retained as presentation galleries.

## 3. Source map

| Path | Responsibility |
|---|---|
| `src/game/types.ts` | Animal, level, challenge, condition, program, event and progress contracts |
| `src/game/animals.ts` | Central animal registry, properties, display labels and property choices |
| `src/game/levels.ts` | Five world definitions, all 50 named levels, challenge batches, destinations, rules and available block sets |
| `src/game/interpreter.ts` | Program validation, predicates, Boolean conditions, bounded loops and deterministic event production |
| `src/game/engine.ts` | Challenge lookup, execution, destination comparison, completion, feedback and star calculation |
| `src/game/tutorials.ts` | Guided tutorial lessons and independent Programming Academy categories |
| `src/game/progress.ts` | Versioned local save, sanitation, unlock checks, challenge/level scoring and reset |
| `src/routes/interface.tsx` | World/level selection, challenge editor, engine invocation, feedback, tutorials, Academy, Animal Book and Sanctuary |
| `src/components/cw/FactoryStage.tsx` | Existing factory art and conveyor animation, with engine-result route badges |
| `src/lib/critters.ts` | Existing presentation-layer character and world artwork records |
| `src/assets/` | Original project art assets; retained and reused |

## 4. Engine and integration contract

### Level and challenge access

`levels` is the complete flat level catalogue. `worldDefinitions` contains the ordered world descriptors. `levelById` allows lookup by stable level ID. Each `LevelDefinition` has three `ChallengeDefinition` objects with stage values `guided`, `practice` and `independent`.

A challenge contains:
- stable `id`, display title and briefing;
- `animalIds` referencing `animalById`;
- the available `destinations`;
- ordered `rules` plus a `defaultDestinationId`;
- `availableBlocks`, concept, hint and efficiency target;
- an optional `tutorialId` for first-use guidance.

### Program representation

`ProgramNode` is a recursive discriminated union:

- `route`: assign an animal to a valid destination;
- `if`: evaluate a `Condition`, then run a THEN or ELSE branch;
- `repeat`: repeat a body a fixed number of times;
- `while`: repeat a body while a condition remains true;
- `forEach`: visit the `animals` collection and execute the body for each animal.

`Condition` supports property predicates, AND, OR and NOT. Predicates support equality, inequality, numeric greater/less comparisons, list includes and list excludes. The editor exposes the `loopCounter` property so WHILE conditions can have a bounded stopping point.

### Public game functions

```ts
runChallenge(levelId: string, challengeId: string, program: ProgramNode[]): ChallengeRunResult
getLevelChallenges(levelId: string): ChallengeDefinition[]
getLevelById(levelId: string): LevelDefinition | undefined
programBlockCount(program: ProgramNode[]): number
validateProgram(program: ProgramNode[], challenge: ChallengeDefinition): ValidationResult
executeProgram(program: ProgramNode[], challenge: ChallengeDefinition): ExecutionResult
```

`runChallenge` validates first, executes against the challenge's animal batch, compares assigned destinations with the challenge's expected rules, and returns a `ChallengeRunResult` containing correctness counts, mistakes, star score, friendly feedback and ordered `SimulationEvent` records. The React screen owns the visual presentation. It uses the event results to show per-animal route badges on the factory stage and detailed result cards below the editor.

### Safety limits

- No `eval`, `Function`, player-supplied script execution or Python runtime.
- Maximum nested block/condition depth: 6.
- Maximum nodes in one sequence: 100.
- Repeat count is limited to 1–10.
- WHILE loop is limited to 10 iterations.
- Global instruction budget per shipment execution: 1,200.
- Unknown blocks and destinations are rejected before execution.
- Engine errors are phrased for the target audience, not shown as stack traces.

## 5. Progression and persistence

The local save contains completed challenges, per-challenge best stars/mistakes/block count, completed levels, Academy completion and discovered animal IDs. The data is versioned and sanitised when read. Missing, malformed or unsupported versions safely return a fresh progress object. Browser storage errors do not stop the current play session.

A later challenge unlocks after the previous challenge is completed. A later level unlocks after the previous level is completed. The next world unlocks when the preceding world has at least nine stars. Replaying preserves the best challenge stars. The reset action clears the local save.

Challenge stars are awarded as follows:
- 1 star: all animals receive a route and the challenge is completed;
- 2 stars: all animals are routed correctly;
- 3 stars: all animals are routed correctly and the efficiency block target is met.

A level's displayed stars use the lowest best-star count across its three challenges, so all challenge stages contribute to level/world progression.

## 6. Learning screens

- Contextual first-use tutorials are attached to the relevant first challenge in a level sequence. Tutorials explain the idea in short steps with TRY THIS prompts and can be replayed. They are step-through guidance rather than action-gated spotlight tutorials.
- Programming Academy lessons are independent of level progression and can be revisited.
- Academy Python-style code is explanatory only; the game never runs that text.
- Animal Book exposes registry records and their properties.
- Sanctuary shows progress across the worlds and animals discovered by completing challenges.

## 7. Data and implementation notes

- World/level IDs are stable: `meadows-01` through `sanctuary-10`; challenge IDs append `-a`, `-b` or `-c`.
- The registry contains 49 animal records. Some species share an existing visual prototype character asset to retain the original asset budget.
- Animal rules use structured properties (species group, habitat, movement, climate, size, diet and special features); world rules do not rely on arbitrary script strings.
- Arctic and Antarctic tags are distinct. Penguins are not given flying movement; polar bears are tagged Arctic.
- The game routes animals deterministically. The factory conveyor and route result badges are visual feedback, not a physics simulation.
- The interface uses the prototype's established art and components. The existing showcase routes (`/characters`, `/worlds`, `/factory`, `/components`) remain available; `/interface` is the playable route.

## 8. Known limitations

1. The package was not built in this execution environment because the package-manager dependency installation could not complete (network timeout, and dependencies were not available in the local npm cache). The game modules passed standalone strict TypeScript compilation and direct Node smoke tests; the full Vite/TanStack production build and Vitest runner still need to be run after `npm install` in a connected development environment.
2. The 50-level catalogue and 150 challenge data records exist and are playable through the common engine, but the later-world challenge balance has not had a full classroom/playtest pass. Challenge variety is represented through increasing batch sizes, rule sets and progressively available blocks; a curriculum specialist should validate pacing.
3. Some species reuse the original six character artworks. New per-species portraits, expression sheets, sound and full chute/animal motion would require additional art/animation assets.
4. Simulation is deterministic and event-driven but intentionally has no physics, multiplayer, online account system, cloud save or teacher dashboard.
5. Responsive presentation is adapted from a desktop-first prototype. A dedicated tablet/mobile accessibility pass remains advisable.

See `IMPLEMENTATION_REPORT.md` for the verification record and current completion status.
