import { describe, expect, it } from "vitest";
import { ASSEMBLY_YARD, type EnvironmentDefinition } from "@/environment/environmentDefinition";
import { DEFAULT_CONFIGURATION, applyComponent } from "@/rover/configuration";
import { computeRoverLayout } from "@/rover/layout";
import { computePhysicsProfile } from "@/rover/physicsProfile";
import { computeStats } from "@/rover/stats";
import { castSensorReadings, chooseAutonomousInput, createInitialSnapshot, resetSimulationPosition, stepSimulation } from "./physics";
import { createSimulationWorld } from "./world";
import type { SimulationObstacle } from "./types";

const flatEnvironment: EnvironmentDefinition = {
  ...ASSEMBLY_YARD,
  id: "physics-test-flat",
  extent: 80,
  craters: [],
  flatZones: [{ x: 0, z: 0, radius: 100, height: 0 }],
  ramps: [],
  rocks: {
    boulders: { count: 0, minDist: 0, maxDist: 0, minSize: 0, maxSize: 0, cluster: 0 },
    rocks: { count: 0, minDist: 0, maxDist: 0, minSize: 0, maxSize: 0, cluster: 0 },
    pebbles: { count: 0, minDist: 0, maxDist: 0, minSize: 0, maxSize: 0, cluster: 0 },
    keepClear: [],
  },
};

function worldWith(obstacles: SimulationObstacle[] = []) {
  return createSimulationWorld({ id: `test-${obstacles.length}`, name: "Physics test yard", environment: flatEnvironment, obstacles });
}

function model(config = DEFAULT_CONFIGURATION) {
  const layout = computeRoverLayout(config);
  const stats = computeStats(config, layout);
  const profile = computePhysicsProfile(config, layout, stats);
  return { config, layout, stats, profile };
}

describe("Sandbox differential-drive physics", () => {
  it("accelerates smoothly and accumulates wheel rotation", () => {
    const { stats, profile } = model();
    const world = worldWith();
    let snapshot = createInitialSnapshot(profile, stats, world);
    const initialSpeed = snapshot.velocityMs;
    for (let i = 0; i < 24; i++) snapshot = stepSimulation(snapshot, { throttle: 1, steer: 0, brake: false }, 0.04, { profile, stats, world });
    expect(snapshot.velocityMs).toBeGreaterThan(initialSpeed);
    expect(snapshot.pose.x).toBeGreaterThan(0);
    expect(snapshot.wheelSpin.FL).toBeGreaterThan(0);
    expect(snapshot.travelledM).toBeGreaterThan(0);
  });

  it("uses wheel radius and motor data to change top speed", () => {
    const small = model(applyComponent(DEFAULT_CONFIGURATION, "wheels-small").config);
    const large = model(applyComponent(DEFAULT_CONFIGURATION, "wheels-large").config);
    const smallWorld = worldWith();
    const largeWorld = worldWith();
    let a = createInitialSnapshot(small.profile, small.stats, smallWorld);
    let b = createInitialSnapshot(large.profile, large.stats, largeWorld);
    for (let i = 0; i < 70; i++) {
      a = stepSimulation(a, { throttle: 1, steer: 0, brake: false }, 0.04, { profile: small.profile, stats: small.stats, world: smallWorld });
      b = stepSimulation(b, { throttle: 1, steer: 0, brake: false }, 0.04, { profile: large.profile, stats: large.stats, world: largeWorld });
    }
    expect(b.velocityMs).toBeGreaterThan(a.velocityMs);
  });

  it("uses the raised assembly pad as the rover's initial ground surface", () => {
    const { stats, profile } = model();
    const world = worldWith();
    const snapshot = createInitialSnapshot(profile, stats, world);
    expect(snapshot.pose.y).toBe(0);
  });

  it("recharges a stopped rover on the assembly pad", () => {
    const { stats, profile } = model();
    const world = worldWith();
    const snapshot = createInitialSnapshot(profile, stats, world);
    snapshot.batteryRemainingWh = stats.batteryWh * 0.5;
    const before = snapshot.batteryRemainingWh;
    const next = stepSimulation(snapshot, { throttle: 0, steer: 0, brake: false }, 0.05, { profile, stats, world });
    expect(next.batteryRemainingWh).toBeGreaterThan(before);
    expect(next.telemetry.charging).toBe(true);
  });

  it("raises the rover over a rock within its step capability", () => {
    const { stats, profile } = model();
    const obstacle = { id: "low-step", kind: "rock" as const, x: 2.2, z: 0, radius: 0.34, height: Math.min(0.2, stats.stepHeightM * 0.7) };
    const world = worldWith([obstacle]);
    let snapshot = createInitialSnapshot(profile, stats, world);
    let maxHeight = snapshot.pose.y;
    for (let i = 0; i < 150; i++) {
      snapshot = stepSimulation(snapshot, { throttle: 0.65, steer: 0, brake: false }, 0.04, { profile, stats, world });
      maxHeight = Math.max(maxHeight, snapshot.pose.y);
    }
    expect(maxHeight).toBeGreaterThan(obstacle.height * 0.35);
    expect(snapshot.pose.x).toBeGreaterThan(2.2);
  });

  it("blocks the rover at an obstacle taller than its step capability", () => {
    const { stats, profile } = model();
    const world = worldWith([{ id: "wall-rock", kind: "boulder", x: 2, z: 0, radius: 0.7, height: 1.2 }]);
    let snapshot = createInitialSnapshot(profile, stats, world);
    for (let i = 0; i < 90; i++) snapshot = stepSimulation(snapshot, { throttle: 1, steer: 0, brake: false }, 0.04, { profile, stats, world });
    expect(snapshot.telemetry.collision).toBe("wall-rock");
    expect(snapshot.pose.x).toBeLessThan(2);
    expect(["obstructed", "stuck"]).toContain(snapshot.telemetry.health);
  });

  it("detects an obstacle only inside the installed sensor range", () => {
    const { stats, profile } = model();
    const closeWorld = worldWith([{ id: "near", kind: "rock", x: 3.5, z: 0, radius: 0.45, height: 0.3 }]);
    const farWorld = worldWith([{ id: "far", kind: "rock", x: 9, z: 0, radius: 0.45, height: 0.3 }]);
    const close = castSensorReadings(createInitialSnapshot(profile, stats, closeWorld).pose, profile, closeWorld.obstacles);
    const far = castSensorReadings(createInitialSnapshot(profile, stats, farWorld).pose, profile, farWorld.obstacles);
    expect(close.some((reading) => reading.distanceM !== null)).toBe(true);
    expect(far.some((reading) => reading.distanceM !== null)).toBe(false);
  });

  it("refuses autonomous driving when the design has no side or 360-degree sensor", () => {
    const { stats, profile } = model();
    const world = worldWith();
    const snapshot = createInitialSnapshot(profile, stats, world);
    const decision = chooseAutonomousInput(snapshot, profile, world);
    expect(decision.input.brake).toBe(true);
    expect(decision.message).toContain("side sensors or LiDAR");
  });

  it("allows the autonomy controller when front and side sensors are installed", () => {
    const config = applyComponent(DEFAULT_CONFIGURATION, "sensor-side").config;
    const { stats, profile } = model(config);
    const world = worldWith();
    const snapshot = createInitialSnapshot(profile, stats, world);
    const decision = chooseAutonomousInput(snapshot, profile, world);
    expect(decision.input.throttle).toBeGreaterThan(0);
    expect(decision.stage).toBe("drive");
  });

  it("resets pose and attempt progress while retaining the remaining battery", () => {
    const { stats, profile } = model();
    const world = worldWith();
    const snapshot = createInitialSnapshot(profile, stats, world);
    snapshot.pose.x = 12;
    snapshot.velocityMs = 1.2;
    snapshot.travelledM = 12;
    snapshot.missionProgress = 0.6;
    snapshot.missionComplete = true;
    snapshot.collectedSamples = 1;
    snapshot.batteryRemainingWh = stats.batteryWh * 0.42;

    const reset = resetSimulationPosition(snapshot, world, profile, stats);
    expect(reset.pose.x).toBe(world.start.x);
    expect(reset.pose.z).toBe(world.start.z);
    expect(reset.velocityMs).toBe(0);
    expect(reset.travelledM).toBe(0);
    expect(reset.missionProgress).toBe(0);
    expect(reset.missionComplete).toBe(false);
    expect(reset.collectedSamples).toBe(0);
    expect(reset.batteryRemainingWh).toBeCloseTo(stats.batteryWh * 0.42, 6);
  });

  it("changes an autonomous forward decision to a stop when a front obstacle enters stopping distance", () => {
    const { stats, profile } = model();
    const world = worldWith([{ id: "autonomy-rock", kind: "rock", x: 2.4, z: 0, radius: 0.4, height: 0.3 }]);
    const initial = createInitialSnapshot(profile, stats, world);
    const moving = stepSimulation(initial, { throttle: 0.7, steer: 0, brake: false }, 0.04, { profile, stats, world });
    const decision = chooseAutonomousInput(moving, profile, world);
    expect(decision.stage).toBe("stop");
    expect(decision.input.brake).toBe(true);
    expect(decision.message).toContain("Obstacle detected");
  });
});
