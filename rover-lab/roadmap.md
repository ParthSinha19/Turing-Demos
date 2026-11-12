# Rover Lab development status

The original archive's visual Design Lab, shared rover assembly and component catalogue have been retained. The continuation adds a common driving sandbox, a sensor/autonomy runtime, five data-driven missions and a browser-persisted custom-level editor.

| Phase | Status |
|---|---|
| 1. Visual foundation | Retained from source archive; procedural Mars textures make the package independent of missing hosted JPGs |
| 2. Functional customisation | Retained; one persistent rover configuration and one rendered rover assembly |
| 3. Sandbox | Implemented using a documented differential-drive approximation, terrain slope/traction, obstacle contact, suspension articulation, battery use and telemetry |
| 4. Sensors and autonomy | Implemented with configured sensor range/FOV, discrete ray measurements, camera preview, 48-ray LiDAR and local obstacle bypass |
| 5. Missions | Five shared-physics missions with requirements, hints, progress, retry and completion records |
| 6. Custom levels and polish | Terrain presets, object placement/removal, start/goal/checkpoints, local save/select/rehydration and shared simulation test mode |

## Verification status

See `docs/VERIFICATION.md` for the full handoff record. At this stage:

- 121 TypeScript/TSX files passed syntax/transpile validation with zero diagnostics.
- The pure rover, terrain, simulation and mission core passed a strict TypeScript check.
- Thirteen runtime smoke checks passed, including a route through Rocky Road, LiDAR autonomous completion, sample pickup and high-torque ascent.
- The package contains 36 Vitest test cases, but Vitest has not been executed here.
- App-wide typecheck, test, lint, production build and interactive browser verification remain unverified because dependencies were absent and the package registry could not be reached.

## Known model limitations

The solver is intentionally educational, not a validated Mars rover dynamics model. Full wheel contact and rigid-body rollover are approximated. LiDAR uses 48 rays; the camera is a geometric preview. Autonomous control is a local obstacle-bypass state machine, not global mapping or path planning. These limits are documented in `README.md` and `docs/ARCHITECTURE.md`.
