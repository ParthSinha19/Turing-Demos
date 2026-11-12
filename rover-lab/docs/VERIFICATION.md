# Verification record

This record distinguishes checks performed against the current source from checks that require the project's package dependencies or a browser runtime.

## Checks performed in the handoff environment

- TypeScript syntax/transpile pass: 121 `.ts` / `.tsx` implementation files; zero diagnostics from `transpileModule` using the globally available TypeScript 5.8.3 compiler.
- Strict TypeScript check: passed for the pure rover configuration/catalogue/layout/statistics/physics-profile code, terrain definitions and height functions, simulation types/physics/world, and mission definitions using a temporary strict compiler configuration.
- Thirteen runtime smoke checks loaded the real TypeScript modules through a temporary Node transpilation loader and exercised:
  - smooth differential-drive acceleration and wheel rotation;
  - wheel/motor configuration effects on derived statistics and movement;
  - reset to the configured start while retaining the remaining battery;
  - collision blocking at an over-height obstacle and passable-step handling;
  - installed-sensor range checks and autonomous sensor prerequisites;
  - mission 01 direct travel;
  - mission 02 a manually steered route through the checkpoint and around the authored rocks;
  - mission 03 installed-LiDAR obstacle detection and autonomous bypass to the exit;
  - mission 04 sample collection with a configured collector;
  - mission 05 climbing with the high-torque motor configuration.
- Archive checks: `unzip -t` passed for the delivered ZIP; required source, manifest, lockfile, documentation and tests are present.

## Checks not run

The uploaded archive did not contain `node_modules`. The package registry was not reachable from this environment (`EAI_AGAIN`), so dependencies could not be installed. Therefore these project commands were not successfully executed:

- `npm run typecheck` (blocked by missing installed type packages, including `vite/client` and `vitest/globals`);
- `npm run test` (Vitest is not installed in this environment);
- `npm run lint` (ESLint is not installed in this environment);
- `npm run build` / `npm run preview` (Vite and application dependencies are not installed);
- interactive browser end-to-end checks, including visual WebGL inspection and the full click/keyboard workflow.

The repository contains 36 Vitest test cases across rover configuration, simulation physics, mission integration, custom-level storage/world generation and root routing. They are included in the package but must be run after dependencies are installed.

## Known model and product limitations

- The vehicle solver is an explainable differential-drive approximation, not a full six-wheel rigid-body or tyre-contact simulation.
- Obstacle contact uses simplified footprints and step-height smoothing; suspension articulation is derived from six local ground samples.
- The stability value is a geometry-based warning indicator. Full chassis rollover, recovery and wheel unloading are not simulated.
- LiDAR is a 48-ray scan; distance/side/camera sensors use discrete ray samples. The mast-camera view is a geometric perspective preview rather than a physical camera render.
- Autonomous navigation is a local obstacle-bypass state machine, not global mapping or path planning. Difficult layouts can still require manual intervention.
- Custom levels and mission progress are stored in browser local storage. The live simulation snapshot is retained when switching application sections in the same page session, but it is not persisted through a full browser reload.
- Google Fonts are loaded remotely when available; system font fallbacks are included. Terrain and rock textures are generated locally at runtime.
