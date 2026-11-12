# Rover Lab

Rover Lab is a browser-based Mars rover engineering laboratory for students in Years 5–8. It extends the original React/Three.js Design Lab with a shared driving sandbox, sensor-assisted autonomy, five guided missions and a persistent custom-level editor.

The existing rover design remains the single source of truth. The Design Lab, Sandbox, Missions and Custom Levels all use the same Zustand rover configuration, `RoverAssembly`, derived engineering statistics and `RoverPhysicsProfile`.

## Verification status for this package

The source has been syntax-transpiled across 121 TypeScript/TSX files, the pure rover/terrain/simulation/mission core has passed a strict TypeScript check, and runtime smoke checks have exercised the movement, collision, reset, sensor, autonomy and five mission paths. The full Vitest suite, app-wide typecheck, lint, production build and browser end-to-end checks could not be run in the handoff environment because dependencies are not installed and the package registry was unreachable. See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for the exact scope and limitations.

## Requirements

- Node.js 22.12 or later (Node.js 22 LTS recommended)
- npm 10 or Bun compatible with the included `bun.lock`
- A WebGL 2 capable desktop browser

## Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The app starts in the Design Lab.

## Commands

```bash
npm run dev        # Local development server
npm run typecheck  # TypeScript check
npm run test       # Automated Vitest suite
npm run lint       # ESLint checks
npm run build      # Production build
npm run preview    # Preview the production build
```

The repository includes `bun.lock` for reproducible Bun installs. With Bun installed, use `bun install` followed by `bun run dev`, `bun run test` or `bun run build`.

## Application sections

### Design Lab

Use the original component catalogue and rover model to change chassis, wheels, motors, sensors and attachments. Component fit, mounting, payload limits, geometry and engineering statistics are retained from the original implementation. The saved rover design is stored in browser local storage.

### Sandbox

Drive the configured rover on the Mars test yard with WASD / arrow keys or the on-screen press-and-hold controls. Space brakes. Use the controls to pause, reset the rover, switch between camera-follow and free orbit, show sensor rays, and change between manual and autonomous operation. A stopped rover recharges on the central assembly pad.

### Missions

Five missions use the same rover and simulation systems: First Contact, Rocky Road, The Blind Spot, Sample Recovery and The Final Ascent. Mission completion, attempts and hint progress are retained in browser local storage. The active rover design is never replaced by a mission preset.

### Custom Levels

Create and save local levels, choose a terrain preset, position obstacles, ramps, checkpoints and samples, set a start point and name the goal, then test the level with the current rover. Levels are saved in browser local storage on the current browser profile.

## Controls

| Input | Action |
|---|---|
| W / Up arrow | Drive forward |
| S / Down arrow | Reverse |
| A / Left arrow | Turn left |
| D / Right arrow | Turn right |
| Space | Brake |
| Mouse drag / scroll | Orbit and zoom in free-camera mode |

The on-screen controls support touch and pointer input. Use the camera-follow toggle to switch to free orbit controls.

## Architecture overview

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the system boundaries, state ownership and simulation contracts. The simulation runtime is in `src/simulation/`; mission definitions and evaluation live in `src/missions/`; custom level storage and world conversion live in `src/levels/`.

## Assets and network use

The Mars terrain and rock materials are generated locally at runtime as Three.js data textures. The rover and environment geometry are created by the source code; no external 3D model download is required. The app requests IBM Plex fonts from Google Fonts when online; system sans-serif and monospace fallbacks are specified for offline use. No account credentials or external API keys are required.

Third-party package and icon notices are documented in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). The original project did not include a project-level open-source licence; no new licence is asserted for the Rover Lab source code in this package.

## Simulation model and known limits

The driving model is a deterministic, SI-unit differential-drive approximation. It uses the actual selected rover's derived mass, wheel radius, grip, motor torque/RPM/power, battery, centre of mass, suspension travel, component colliders and installed sensor specifications. It includes a Mars gravity term, terrain gradients, power and traction limits, rounded obstacle footprints, step-height limits, suspension articulation, sensor rays and battery charging.

This is an educational engineering model, not a validated planetary rover dynamics package. It is not a full six-wheel rigid-body solver: wheel contact and obstacle climbing are approximated, obstacle footprints are simplified, and the stability indicator does not simulate a complete chassis rollover. The 360-degree LiDAR is represented by 48 rays. The mast-camera panel is a geometric perspective preview, not an optical render from a physical camera sensor. The autonomous controller is a small rule-based obstacle avoider, not a global path planner. Custom levels are local to the browser and are not synchronised or exported to a server.

The automated tests cover the original design/configuration contracts and new physics, sensor, mission and level-world logic. Run the commands above in an environment with dependencies installed before using the application for a classroom session.
