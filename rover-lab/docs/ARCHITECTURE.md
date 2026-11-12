# Rover Lab architecture

## Design principle

There is one rover design and one simulation runtime. Application sections change the world or objective, not the vehicle implementation. `roverStore` remains authoritative for the student's component configuration; all runtime systems derive geometry, physical properties and statistics from it.

## Main application flow

- `src/routes/index.tsx` mounts the existing TanStack Start application route.
- `src/design-lab/DesignLabPage.tsx` owns the four-section navigation shell and selects Design Lab, Sandbox, Missions or Custom Levels.
- `src/components/navigation/TopBar.tsx` changes the active section through `simulationStore`.
- Design Lab continues to use the original `DesignLabScene`, catalogue, overlays, statistics and controls.

## Rover design and assembly

- `src/state/roverStore.ts` is the single source of truth for the persisted `RoverConfiguration`.
- `src/rover/catalogue.ts` contains structured part specifications and engineering properties.
- `src/rover/configuration.ts` validates and updates installed components, compatibility and slot limits.
- `src/rover/layout.ts` derives body, mount, wheel and clearance geometry.
- `src/rover/stats.ts` derives mass, centre of mass, speed, grip, step height, grade, battery and power statistics.
- `src/rover/physicsProfile.ts` converts the design into an SI-unit interface for runtime physics. The simulation does not look up component catalogue records directly.
- `src/rover/model/RoverAssembly.tsx` is the only rendered rover assembly. Both Design Lab and Sandbox render this model; Sandbox supplies the live joint state.

## Environment and simulation

- `src/environment/environmentDefinition.ts` defines deterministic terrain, craters, flat zones, rock fields and ramps.
- `src/environment/terrainHeight.ts` defines the pure terrain height function shared by visible terrain and movement physics.
- `src/environment/rockPlacement.ts` deterministically places terrain rocks. The world builder creates matching simplified obstacle records for the simulation.
- `src/environment/proceduralTextures.ts` generates local terrain and rock diffuse/normal textures, removing the original unavailable hosted texture URLs.
- `src/simulation/world.ts` combines an environment, placed obstacles, optional sample/checkpoints and start/goal markers into a `SimulationWorld`.
- `src/simulation/physics.ts` owns the deterministic differential-drive step, slope and traction forces, power limits, collisions, wheel spin, suspension articulation, sensor raycasts, battery use/charging and autonomous-control decisions.
- `src/simulation/SimulationRover.tsx` runs the step from the Three.js frame loop, moves the existing `RoverAssembly`, and copies the computed joints into the shared `RoverJointState` object.
- `src/simulation/WorldVisuals.tsx` renders mission/custom objects, goals, samples, checkpoints and sensor rays.
- `src/simulation/SandboxPage.tsx` provides the common drive UI, telemetry, camera controls and operating-mode selection.

### Key simulation contracts

`RoverPhysicsProfile` is the boundary between design and physics. Its wheel records include wheel radius, friction, torque, angular velocity and mount position. The profile also contains mass, centre of mass, colliders, drive-side wheel groups, motor/battery power, suspension travel and installed sensor positions/ranges/FOV.

`SimulationWorld` contains the `EnvironmentDefinition`, its stable world ID, obstacle records, start point and optional goal/sample/checkpoint data. `HeightFn` is a pure `(x, z) => y` function. It is passed to the simulation from the same environment definition used by the renderer.

`SimulationSnapshot` is the live vehicle/telemetry state: pose, linear velocity and yaw rate, wheel rotation, existing suspension/steering joints, battery, readings, status, mission progress and interaction state. `simulationStore` keeps the snapshot in memory as the student switches sections, so returning to the same world restores the current attempt. The rover component configuration is persisted separately by `roverStore`.

The current physics engine is intentionally lightweight and deterministic. It provides an explainable relationship between engineering inputs and movement but does not claim full rigid-body or tyre-contact fidelity. More advanced physics can replace `stepSimulation` later without changing the configuration/catalogue contract or adding another rover.

## Sensors and autonomy

`castSensorReadings()` converts the installed sensor records in `RoverPhysicsProfile` into ray measurements. Distance, side and camera sensors sample their configured field of view; LiDAR samples 48 azimuths. All hits are tested against the current world's obstacle records and range limits. The on-screen sensor rays use these same readings.

`chooseAutonomousInput()` is a rule-based local obstacle avoider. It requires a front distance sensor (or LiDAR) and either side sensors or LiDAR. It stops, compares left/right clearance, pivots in place, drives a short bypass while continuing to read sensors, then turns back towards the world target and resumes. With a target, the controller makes local heading corrections while driving. A missing sensor prevents the controller from pretending it can see. It is not a global planner and may need a human to choose a different route around complex obstacles.

The camera panel uses the configured camera attachment and projects nearby scene objects into a compact geometric preview; it is not a rendered optical camera.

## Missions

- `src/missions/definitions.ts` contains the five data-driven missions and their objectives, requirements, world features, hints and evaluation rules.
- `src/missions/MissionsPage.tsx` presents briefings and the active mission UI while embedding the shared `SandboxPage`.
- `src/missions/missionStore.ts` persists completed mission IDs, attempts and hint position locally.

Mission evaluation reads the live snapshot and the student's real configuration. Sample recovery requires an installed collector or arm; sensor route completion requires installed sensor hardware and a sensor-obstacle detection event. Mission worlds use authored obstacle layouts and a locally flattened test corridor so the challenge is driven by mission-specific engineering choices rather than a random background boulder blocking the start-to-goal line.

## Custom levels

- `src/levels/levelStore.ts` persists custom level definitions in browser local storage.
- `src/levels/levelDefinition.ts` converts a saved level into the same `EnvironmentDefinition` and `SimulationWorld` contracts used by Sandbox and Missions.
- `src/levels/CustomLevelsPage.tsx` provides the level editor and test-mode UI.

Custom objects are not handled by a separate renderer or physics path. They enter the standard world obstacle, ramp, sample and checkpoint records. The current custom-level objective supports one collectible sample per level.

## Persistence

- Rover component design: `rover-lab:config:v1` through `roverStore`.
- Custom levels: `rover-lab:custom-levels:v1` through `levelStore`.
- Mission completion/attempts: `rover-lab:missions:v1` through `missionStore`.
- Simulation snapshot: in-memory `simulationStore` (persists across section navigation in the current page session, not across a browser reload).

## Testing

- Original rover tests remain in `src/rover/rover.test.ts`.
- `src/simulation/physics.test.ts` covers acceleration, wheel-size effects, collision, range/FOV sensors, autonomy requirements, reset semantics and pad charging.
- `src/missions/missions.test.ts` covers mission definitions/objectives and simulation paths for all five missions, including sensor-driven obstacle avoidance, sample collection and a high-torque ascent.
- `src/levels/levelDefinition.test.ts` covers custom-world composition and ramp terrain height; `src/levels/levelStore.test.ts` covers browser-storage save/select/load behaviour.
- `src/test/app-routing.test.tsx` checks the root route.

Run `npm run typecheck`, `npm run test`, `npm run lint` and `npm run build` after installing dependencies.
