import { describe, expect, it } from "vitest";
import { MISSIONS, createMissionWorld, evaluateMission } from "./definitions";
import { DEFAULT_CONFIGURATION, applyComponent } from "@/rover/configuration";
import { computeRoverLayout } from "@/rover/layout";
import { computeStats } from "@/rover/stats";
import { computePhysicsProfile } from "@/rover/physicsProfile";
import { chooseAutonomousInput, createInitialSnapshot, stepSimulation } from "@/simulation/physics";

describe("mission definitions and objectives", () => {
  it("defines the five required missions", () => {
    expect(MISSIONS.map((mission) => mission.number)).toEqual(["01", "02", "03", "04", "05"]);
  });

  it("completes First Contact when the rover reaches the beacon", () => {
    const mission = MISSIONS[0];
    const world = createMissionWorld(mission);
    const layout = computeRoverLayout(DEFAULT_CONFIGURATION);
    const stats = computeStats(DEFAULT_CONFIGURATION, layout);
    const profile = computePhysicsProfile(DEFAULT_CONFIGURATION, layout, stats);
    const snapshot = createInitialSnapshot(profile, stats, world);
    snapshot.pose.x = mission.target.x;
    snapshot.pose.z = mission.target.z;
    expect(evaluateMission(mission, snapshot, DEFAULT_CONFIGURATION).complete).toBe(true);
  });

  it("does not complete Sample Recovery without a suitable attachment", () => {
    const mission = MISSIONS.find((item) => item.kind === "sample")!;
    const world = createMissionWorld(mission);
    const layout = computeRoverLayout(DEFAULT_CONFIGURATION);
    const stats = computeStats(DEFAULT_CONFIGURATION, layout);
    const profile = computePhysicsProfile(DEFAULT_CONFIGURATION, layout, stats);
    const snapshot = createInitialSnapshot(profile, stats, world);
    expect(evaluateMission(mission, snapshot, DEFAULT_CONFIGURATION).message).toContain("sample collector");
  });

  it("collects a sample only when an installed tool is within the sample radius", () => {
    const mission = MISSIONS.find((item) => item.kind === "sample")!;
    const config = applyComponent(DEFAULT_CONFIGURATION, "attach-collector").config;
    const layout = computeRoverLayout(config);
    const stats = computeStats(config, layout);
    const profile = computePhysicsProfile(config, layout, stats);
    const world = createMissionWorld(mission);
    const snapshot = createInitialSnapshot(profile, stats, world);
    snapshot.pose.x = mission.sample!.x;
    snapshot.pose.z = mission.sample!.z;
    const next = stepSimulation(snapshot, { throttle: 0, steer: 0, brake: true }, 0.04, { profile, stats, world });
    expect(next.collectedSamples).toBe(1);
  });
});

function missionContext(missionId: string, config = DEFAULT_CONFIGURATION) {
  const mission = MISSIONS.find((item) => item.id === missionId)!;
  const world = createMissionWorld(mission);
  const layout = computeRoverLayout(config);
  const stats = computeStats(config, layout);
  const profile = computePhysicsProfile(config, layout, stats);
  return { mission, world, config, profile, stats };
}

function simulateMission(missionId: string, config = DEFAULT_CONFIGURATION, maxSteps = 2400) {
  const context = missionContext(missionId, config);
  let snapshot = createInitialSnapshot(context.profile, context.stats, context.world);
  for (let i = 0; i < maxSteps && !evaluateMission(context.mission, snapshot, config).complete; i++) {
    snapshot = stepSimulation(snapshot, { throttle: 1, steer: 0, brake: false }, 1 / 30, context);
  }
  return { ...context, snapshot };
}

describe("mission simulation integration", () => {
  it("drives from the assembly pad to the First Contact beacon", () => {
    const result = simulateMission("first-contact");
    expect(evaluateMission(result.mission, result.snapshot, result.config).complete).toBe(true);
  });

  it("allows a rover to steer around the Rocky Road field and reach its checkpoint", () => {
    const { mission, world, profile, stats, config } = missionContext("rocky-road");
    const points: [number, number][] = [[4, 2.5], [10, 2.5], [13, 0], [25, 0]];
    let snapshot = createInitialSnapshot(profile, stats, world);
    let waypoint = 0;
    for (let i = 0; i < 6000 && !evaluateMission(mission, snapshot, config).complete; i++) {
      const [tx, tz] = points[waypoint];
      if (Math.hypot(tx - snapshot.pose.x, tz - snapshot.pose.z) < 0.9 && waypoint < points.length - 1) waypoint++;
      const [nextX, nextZ] = points[waypoint];
      const heading = Math.atan2(nextZ - snapshot.pose.z, nextX - snapshot.pose.x);
      const error = Math.atan2(Math.sin(heading - snapshot.pose.yaw), Math.cos(heading - snapshot.pose.yaw));
      const steer = Math.max(-0.65, Math.min(0.65, error * 1.4));
      snapshot = stepSimulation(snapshot, { throttle: 0.58, steer, brake: false }, 1 / 30, { profile, stats, world });
    }
    expect(snapshot.checkpointsReached).toContain("rock-field");
    expect(evaluateMission(mission, snapshot, config).complete).toBe(true);
  });

  it("lets installed LiDAR detect barriers and guides an autonomous rover to the Blind Spot exit", () => {
    const config = applyComponent(DEFAULT_CONFIGURATION, "sensor-lidar").config;
    const { mission, world, profile, stats } = missionContext("blind-spot", config);
    let snapshot = createInitialSnapshot(profile, stats, world);
    for (let i = 0; i < 9000 && !evaluateMission(mission, snapshot, config).complete; i++) {
      const decision = chooseAutonomousInput(snapshot, profile, world);
      snapshot.autonomousStage = decision.stage;
      snapshot.autonomousTurn = decision.turn;
      if (decision.turnStartYaw !== undefined) snapshot.autonomousTurnStartYaw = decision.turnStartYaw;
      if (decision.resetBypassDistance) snapshot.autonomousBypassDistanceM = 0;
      snapshot.autonomousDecision = decision.message;
      snapshot = stepSimulation(snapshot, decision.input, 1 / 30, { profile, stats, world });
    }
    expect(snapshot.hasDetectedObstacle).toBe(true);
    expect(evaluateMission(mission, snapshot, config).complete).toBe(true);
  });

  it("collects a sample while driving with a sample collector installed", () => {
    const config = applyComponent(DEFAULT_CONFIGURATION, "attach-collector").config;
    const result = simulateMission("sample-recovery", config);
    expect(result.snapshot.collectedSamples).toBe(1);
    expect(evaluateMission(result.mission, result.snapshot, config).complete).toBe(true);
  });

  it("completes the final ascent with the high-torque motor configuration", () => {
    const config = applyComponent(DEFAULT_CONFIGURATION, "motors-torque").config;
    const result = simulateMission("final-ascent", config, 3600);
    expect(result.stats.maxSlopeDeg).toBeGreaterThan(30);
    expect(evaluateMission(result.mission, result.snapshot, config).complete).toBe(true);
  });
});
