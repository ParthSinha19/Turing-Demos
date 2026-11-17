# WonderPaws — Known Limitations

## Gameplay and curriculum

- Five worlds, 50 named levels and 150 data-driven challenge records are implemented on one shared interpreter. The full progression has not yet received an external classroom/playtest balance review.
- Tutorials and Academy lessons provide step-through explanations and TRY THIS prompts, but they do not yet enforce learner actions or use spotlight/highlight overlays on individual controls. The Academy uses the same block language concepts and core game engine model.
- Loops are constrained educational structures. WHILE uses the explicit loop counter as a safe stopping variable; there is no general mutable-variable system.

## Visuals and animation

- Existing visual prototype artwork is retained. Many registry animals intentionally reuse one of the six existing character images rather than having unique species artwork.
- Sorting outcomes appear as route badges on the factory scene and detailed cards after the run. The engine emits ordered simulation events, but there is no per-animal physical chute animation or physics simulation.
- Character expressions are simulated through CSS transforms and motion rather than unique expression artwork.
- Backgrounds remain single images with CSS overlays; there is no layered parallax scene system.
- The interface is adapted from a desktop-first layout. A dedicated tablet/mobile pass remains recommended.
- There is no audio system beyond the existing visual effects.

## Release engineering

- The full Vite/TanStack production build and Vitest suite were not executable in the current environment because dependency installation timed out and the dependencies were not cached locally. Standalone strict TypeScript compilation and direct Node smoke tests passed for the game modules. Run `npm install`, `npm run build`, `npm test` and `npm run lint` before publishing.
- The project uses the root Vite base path. For GitHub Pages or another subdirectory deployment, configure Vite's `base` and router asset/fallback paths for that exact deployment location.
