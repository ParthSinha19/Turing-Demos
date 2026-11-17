# WonderPaws: The Great Animal Factory

WonderPaws is a browser-based animal-sorting and beginner-programming game. Players build safe visual programs, route animals to the right habitats, learn programming concepts and grow a sanctuary across five worlds.

## Requirements

- Node.js 22.12+ (or a current Bun runtime)
- npm or Bun

## Run locally

```bash
npm install
npm run dev
```

Or, with Bun:

```bash
bun install
bun run dev
```

Open the local URL printed by Vite. The project uses TanStack Start, React 19, TypeScript and Vite 8. The visual prototype artwork and component system have been retained.

## Build and test

```bash
npm run build
npm test
npm run lint
```

## Game navigation

- `/` — WonderPaws main menu
- `/interface` — world map, level progression and playable factory
- `/characters` — mascot and character gallery
- `/worlds` — world environment gallery
- `/factory` — factory environment showcase
- `/components` — visual component gallery

The game data contains five worlds, 50 data-driven levels and three challenges per level (150 challenges total). Progress is stored locally in the browser under `wonderpaws-progress`.

## Project structure

- `src/game/animals.ts` — animal registry and property helpers
- `src/game/levels.ts` — five worlds, 50 levels and 150 challenge definitions
- `src/game/interpreter.ts` — validation, condition evaluation and safe block interpreter
- `src/game/engine.ts` — deterministic sorting simulation and challenge scoring
- `src/game/progress.ts` — versioned local save data, stars and unlock rules
- `src/game/tutorials.ts` — first-use tutorials and Programming Academy lessons
- `src/routes/interface.tsx` — world map, in-game editor, Animal Book, Academy and Sanctuary views
- `src/assets/` — original visual prototype assets, retained for the playable game

## Game rules and architecture

See `GAME_DESIGN.md`, `ART_DIRECTION.md`, `HANDOVER.md` and `IMPLEMENTATION_REPORT.md`. The block interpreter executes only the structured block representation. It never evaluates player-supplied JavaScript or Python. Python-style snippets in Academy lessons are illustrative teaching examples only.

## Deployment

The Vite app currently uses the standard root base path. For deployment inside a repository subdirectory, set Vite's `base` to that exact subdirectory path and verify asset and router fallback behaviour for the chosen host.
