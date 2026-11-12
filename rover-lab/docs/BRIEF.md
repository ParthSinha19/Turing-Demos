# PROJECT: ROVER LAB
## A 3D Mars Robotics Design & Simulation Environment

### 1. Your role

Act as a senior 3D simulation developer, robotics engineer, game-engine architect and UI/UX designer.

Your task is to build **Rover Lab**, an interactive, browser-based robotics laboratory for students in Years 5–8.

The experience should sit somewhere between a professional robotics simulator, a 3D engineering workbench and an accessible educational sandbox.

The students already have some familiarity with block-based programming. Do not make this another introductory programming game. The focus is robotics: designing a robot, understanding its components, testing its capabilities and improving its performance.

The finished product should feel like a genuine engineering simulator that has been made accessible to younger learners.

---

### 2. Core design philosophy

These principles are non-negotiable.

**A. Graphics and simulation quality are a priority.**

This must be a genuinely 3D experience. Do not substitute 3D models with flat illustrations, 2D sprites, static images or decorative representations.

The rover must be a proper 3D model that students can inspect from every angle. The environment should have convincing depth, terrain, lighting, shadows and physical obstacles.

The 3D environment should be the central focus of the interface. UI panels should support the simulation rather than dominate it.

**B. Customisation must be real.**

Do not create cosmetic customisation that merely changes labels, colours or statistics.

If a student changes the wheels, the actual 3D wheel models must be replaced. If they install a robotic arm, it must appear on the rover. If they change the chassis, the 3D model must reflect that change.

More importantly, these changes must affect the simulation.

For example:
- Larger wheels should improve ground clearance and help with certain terrain.
- High-torque motors should improve climbing and obstacle traversal.
- Heavier components should affect the rover's mass and handling.
- Sensors should have actual detection ranges and fields of view.
- Attachments should introduce new capabilities and, where appropriate, additional weight or energy consumption.

The design choices must have meaningful consequences.

**C. Build a modular application.**

Do not build the entire application inside one enormous component or one tightly coupled file.

Keep the following systems separate:
- Rover configuration and component catalogue.
- 3D rover model and assembly.
- Physics and movement.
- Terrain and environment.
- Sensors and autonomous control.
- Mission logic and objectives.
- UI and navigation.
- Custom level system.

Use clear interfaces between these systems. The same rover configuration must be used throughout the application.

**D. Research existing 3D assets before building from scratch.**

Before creating all the models yourself, investigate suitable open-source Mars rover 3D models, robotics models, component assets and terrain assets.

Prioritise models with suitable licences and sufficient visual quality. Check whether they can be used in a browser-based Three.js environment.

Use high-quality existing assets where appropriate, but integrate them properly. Do not simply place a static rover model in the scene and pretend it is customisable.

Where a model is unsuitable, create or adapt the required geometry.

**E. Prioritise the simulator over game mechanics.**

This is not intended to be a conventional cartoon-style educational game.

Avoid excessive badges, coins, cartoon characters, arbitrary rewards, childish UI and unnecessary gamification.

Use missions and progression to provide structure, but keep the engineering experience at the centre.

---

### 3. The overall experience

The application should have four distinct sections, accessible through a clear navigation system.

1. Design Lab
2. Sandbox
3. Missions
4. Custom Levels

The rover should persist between all sections. A student must not lose their design when moving from the Design Lab to the Sandbox or Missions.

The application should feel like one connected robotics laboratory.

---

### 4. Section One: Design Lab

This is the rover engineering workbench.

Students should be able to build and modify their rover using a component catalogue and a detailed 3D preview.

**3D workbench**

- A large, high-quality 3D viewport.
- Orbit, zoom and pan camera controls.
- Ability to inspect the rover from all sides, including above and below where practical.
- Smooth camera transitions.
- Clear visual distinction between installed and available components.
- A useful default camera angle that shows the complete rover.

**Component catalogue**

Provide a manageable selection of components.

Suggested categories:

| Category | Example options |
|---|---|
| Chassis | Standard, compact, heavy-duty |
| Wheels | Small, standard, large terrain wheels |
| Motors | Standard, high torque, high speed |
| Sensors | Distance sensor, side sensor, camera, LiDAR |
| Attachments | Robotic arm, sample collector, equipment module |

Do not overwhelm students with dozens of options. Start with a small collection of meaningful choices.

**Functional assembly**

Students should be able to select components and attach them to the rover.

Use appropriate connection points and mounting positions. Components should appear in the correct physical locations.

Changing a component must update:
- The actual 3D rover model.
- Its configuration data.
- Its physical properties.
- Its capabilities in the simulation.

**Engineering statistics**

Display a compact, understandable summary:
- Total weight.
- Motor power and torque.
- Maximum speed.
- Battery capacity and estimated consumption.
- Ground clearance.
- Installed sensors.
- Available attachments.

These values must be derived from the actual configuration, not arbitrary decorative numbers.

Include short explanations of what each property means.

---

### 5. Section Two: Sandbox

The Sandbox is an open Mars testing environment.

Students should be able to drive their rover, experiment with its capabilities and discover its weaknesses.

**Environment**

Create a visually impressive Mars landscape with:
- Rocky terrain.
- Large boulders.
- Craters.
- Inclines and slopes.
- Uneven ground.
- Narrow passages.
- Flat testing areas.
- Sample locations.
- A charging station or starting platform.

These objects must be part of the actual environment. Rocks and terrain features must have collision and interact with the rover.

Do not use obstacles as decorative scenery.

**Rover controls**

Provide:
- WASD keyboard controls.
- On-screen directional controls.
- Smooth acceleration and braking.
- Differential steering.
- Camera controls.
- Reset position.
- Manual and autonomous operating modes.

Movement should feel reasonably physical rather than like moving a character across a flat surface.

**Telemetry**

Provide a compact telemetry interface showing relevant information such as:
- Speed.
- Battery level.
- Motor power.
- Front sensor distance.
- Terrain conditions.
- Rover status.

Telemetry should update during the simulation.

**The engineering experimentation loop**

This is one of the most important parts of the entire project.

Students should be able to discover that their rover is not suitable for every environment.

For example:

1. A student builds a rover with small wheels.
2. They attempt to cross a large rock or steep incline.
3. The rover struggles because of insufficient clearance or traction.
4. The interface explains the problem in accessible language.
5. The student returns to the Design Lab.
6. They install larger terrain wheels or improve the motor configuration.
7. They return to the same environment and try again.

The result should be visibly and physically different.

Other possible engineering limitations include:
- Insufficient motor torque.
- Poor ground clearance.
- Excessive weight.
- High energy consumption.
- Limited sensor range.
- Sensor blind spots.

Do not create arbitrary failure messages. Problems should emerge from the rover's actual configuration and simulated environment.

The Sandbox should remain open-ended. Students should be able to experiment without being forced to complete an objective.

---

### 6. Section Three: Missions

Missions provide structured challenges that encourage students to apply what they have learned.

They should use the same rover that students built in the Design Lab.

Each mission should include:
- A short briefing.
- A clear objective.
- A visible destination or target.
- Relevant environmental obstacles.
- Contextual hints.
- A completion condition.
- A short explanation of what the student learned.

Do not give away the entire solution. Students should have room to experiment and make engineering decisions.

Suggested initial missions:

**Mission 01 — First Contact**

Learn basic rover movement, steering and navigation. Reach a designated beacon.

**Mission 02 — Rocky Road**

Navigate a rocky environment. Discover why wheel size, traction and ground clearance matter.

**Mission 03 — The Blind Spot**

Configure sensors and navigate around obstacles. Introduce the relationship between sensor readings and robot decisions.

**Mission 04 — Sample Recovery**

Install an appropriate attachment and retrieve a sample from a designated location.

**Mission 05 — The Final Ascent**

Reach a research station at the top of a steep incline. The rover's weight, wheel configuration, motor torque and battery capacity should all matter.

Make missions accessible to students who have not used the application before. Provide helpful prompts and contextual hints to minimise the need for constant tutor intervention.

Students should be able to return to the Design Lab, modify their rover and retry.

---

### 7. Section Four: Custom Levels

The Custom Levels section is implemented as a lightweight editor for students and teachers. It allows users to:
- Choose an open yard, crater or ridge terrain preset.
- Place and remove rocks, boulders, barriers and ramps.
- Position checkpoints and sample locations.
- Set the rover start and named goal coordinates.
- Create, save, select and reload levels in browser storage.
- Test a level with the same rover, physics and sensor systems used by the Sandbox and Missions.

The editor is intentionally coordinate-based rather than a full 3D professional level-editing tool. Its saved level data is local to the browser profile.

---

### 8. Robotics and simulation architecture

The simulation should be inspired by real robotics systems, without attempting to recreate the complexity of a full professional robotics stack.

Use a clear conceptual architecture:

**Sensors → Robot Brain → Motors and Actuators**

Students should be able to understand that:
- Sensors collect information about the environment.
- The robot's control logic interprets that information.
- Motors and actuators carry out the resulting actions.

**Movement and physics**

Implement a simplified but believable differential-drive rover.

Prioritise:
- Independent left and right wheel movement.
- Forward and reverse motion.
- Turning.
- Acceleration and braking.
- Wheel rotation.
- Collision detection.
- Slopes and uneven terrain.
- Basic traction and ground-clearance effects.
- Basic suspension behaviour where practical.

Use actual component properties when calculating movement and handling.

A simplified physics model is acceptable, but the behaviour should be consistent and understandable.

**Sensors**

Implement basic sensor behaviour:
- Distance detection.
- Sensor range.
- Field of view.
- Obstacle detection.
- Visual indication of sensor coverage.

LiDAR can use a simplified scanning visualisation.

**Autonomous navigation**

Provide a basic autonomous mode that demonstrates how a robot can respond to sensor input.

For example:
1. Move forward.
2. Read the front distance sensor.
3. Stop when an obstacle is detected.
4. Check whether there is space to either side.
5. Turn towards a suitable direction.
6. Continue moving.

Show sensor readings and a simple indication of the robot's current decision.

Do not pretend to implement full ROS or a sophisticated autonomous navigation stack. A ROS-inspired, modular control architecture is sufficient for this educational experience.

---

### 9. Technical architecture

Use a browser-compatible 3D technology stack.

Recommended starting point:
- Three.js for 3D rendering.
- React Three Fiber if the application benefits from React integration.
- Rapier or an equivalent physics engine for collisions and physical interactions.
- JavaScript or TypeScript for rover configuration, simulation and control logic.

You may propose alternatives if they provide a clear technical advantage.

Organise the project into independent modules. A possible structure:

```text
src/
  components/
    navigation/
    panels/
    telemetry/
    controls/

  rover/
    RoverModel
    RoverAssembly
    RoverConfiguration
    ComponentCatalogue
    ComponentProperties

  simulation/
    PhysicsEngine
    MovementController
    CollisionSystem
    TerrainInteraction

  sensors/
    DistanceSensor
    CameraSensor
    LidarSensor
    SensorVisualisation

  environment/
    MarsEnvironment
    Terrain
    Obstacles
    EnvironmentManager

  robotics/
    RobotBrain
    AutonomousController
    DecisionSystem

  missions/
    MissionManager
    MissionDefinitions
    MissionObjectives

  custom-levels/
    LevelManager
    LevelDefinitions

  state/
    RoverStore
    SimulationStore
```

This is a suggested structure, not a requirement to follow every filename exactly. The important requirement is separation of concerns and maintainability.

Maintain one authoritative rover configuration and state. Do not create separate rover implementations for different sections.

---

### 10. Visual design and environment quality

The visual quality is a major acceptance criterion.

Aim for a semi-realistic aerospace engineering aesthetic.

**Rover**

- Realistic Mars rover proportions.
- Detailed chassis and wheel assemblies.
- Visible suspension and mechanical structures.
- Functional component mounting positions.
- Realistic materials and surface finishes.
- Properly modelled attachments and sensors.

**Environment**

- Convincing Mars surface.
- Varied terrain elevation.
- Detailed geological formations.
- Natural lighting and shadows.
- Appropriate surface textures.
- Atmospheric depth.
- Subtle environmental effects where performance allows.

**Interface**

Use a professional, restrained engineering interface.

- Clear typography.
- Compact panels.
- Useful technical information.
- Consistent component icons.
- Subtle borders and visual hierarchy.
- No unnecessary decoration.

Avoid generic dashboard templates, excessive neon, childish graphics and toy-like visual design.

The 3D environment should receive the majority of the screen space.

**Camera**

Implement smooth, useful camera controls:
- Orbit.
- Zoom.
- Pan.
- Rover-follow mode.
- Useful default viewpoints.

Camera movement should feel natural and should not interfere with driving.

---

### 11. Performance and accessibility

The application must run in a normal school browser environment.

Do not assume every student has a high-end graphics card.

Use sensible performance optimisation:
- Efficient lighting.
- Instancing where appropriate.
- Reasonable texture resolutions.
- Level of detail where useful.
- Controlled physics update rates.
- Efficient collision geometry.
- Optional graphics-quality settings.

Prioritise responsiveness and stable interaction over unnecessary visual effects.

The interface should be understandable to students in Years 5–8. Technical terminology should be accompanied by short, accessible explanations.

---

### 12. Development phases — follow this order

Do not attempt to build everything simultaneously.

The first milestone is deliberately small.

**PHASE 1 — The visual foundation**

Build:
- A beautiful Mars environment.
- One detailed, genuinely 3D rover.
- Working orbit, zoom and pan controls.
- A convincing default camera.
- A stable browser-based 3D viewport.

At this stage, the rover does not need a complete mission system.

The objective is to establish a convincing visual foundation.

**PHASE 2 — Functional rover customisation**

Build:
- Component catalogue.
- Component mounting positions.
- Real 3D component replacement.
- Rover configuration state.
- Live updates to the 3D model.
- Engineering statistics.

Test that changing a wheel actually replaces the wheel model and updates the relevant rover properties.

Do not proceed until this works reliably.

**PHASE 3 — The Sandbox**

Build:
- Rover movement.
- Differential steering.
- Physics and collisions.
- Terrain interaction.
- Obstacles.
- Telemetry.
- Reset and camera-follow controls.

The rover should be enjoyable and convincing to control.

**PHASE 4 — Engineering experiments**

Connect the component configuration to the simulation.

Test that different wheels, motors, chassis and attachments create meaningful differences.

Implement the design → test → identify weakness → modify → retest loop.

**PHASE 5 — Sensors and Missions**

Build:
- Sensor visualisations.
- Autonomous navigation.
- Mission framework.
- Initial five missions.
- Contextual guidance and completion conditions.

**PHASE 6 — Custom Levels and expansion**

Prepare the custom-level system and extend the component and environment catalogue.

---

### 13. Acceptance criteria

The project should not be considered complete unless the following are true:

1. The rover is a genuine 3D model, not a flat illustration or static image.
2. Students can inspect the rover from multiple angles.
3. Changing components visibly changes the actual 3D rover assembly.
4. Component changes affect simulation behaviour.
5. The rover can be driven around a 3D environment.
6. Terrain features and obstacles have functional collision.
7. Different rover configurations produce meaningfully different outcomes.
8. Students can encounter a limitation, return to the Design Lab and improve their rover.
9. Rover configuration persists between all sections.
10. The application is modular enough to support future missions, components and custom levels.
11. The interface and simulation are responsive on ordinary school computers.
12. The overall experience feels like an engineering simulator rather than a conventional cartoon game.

---

### 14. First milestone — what to build before anything else

**Your first deliverable must contain only four things:**

1. A visually impressive, detailed Mars environment.
2. One high-quality, genuinely 3D rover.
3. Working camera controls that allow students to inspect the rover from all sides.
4. A functional component customisation system that replaces actual 3D components.

Do not rush into building missions, scoring, progression or autonomous navigation before this milestone is convincing.

Demonstrate that the rover can be customised, that the 3D model updates correctly and that the project architecture can support the remaining systems.

Once this foundation feels convincing, build the rest around it.

**Final instruction:** Build Rover Lab as a modular, visually convincing robotics engineering simulator. The central educational idea is simple: students should be able to design a robot, test it in a physical environment, discover its limitations and improve its engineering. Every major feature should reinforce that experience.