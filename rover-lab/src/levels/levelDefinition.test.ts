import { describe, expect, it } from "vitest";
import { createTerrainHeight } from "@/environment/terrainHeight";
import type { CustomLevel } from "./levelStore";
import { buildCustomLevelWorld, buildLevelEnvironment } from "./levelDefinition";

const level: CustomLevel = {
  id: "test-level",
  name: "Test Ridge",
  terrain: "ridge",
  start: { x: 0, z: 0, yaw: 0 },
  target: { x: 22, z: 0, radius: 2, label: "Goal" },
  obstacles: [
    { id: "test-rock", kind: "rock", x: 6, z: 1, radius: 0.5, height: 0.4 },
    { id: "test-sample", kind: "sample", x: 12, z: 0, radius: 0.7, height: 0.3 },
  ],
  ramps: [{ id: "test-ramp", x: 13, z: 0, length: 10, width: 8, rise: 4, heading: 0 }],
  checkpoints: [{ id: "cp-1", x: 8, z: 2, radius: 1.6 }],
};

describe("custom level world", () => {
  it("keeps placed obstacles, samples, targets and checkpoints in the shared world", () => {
    const world = buildCustomLevelWorld(level);
    expect(world.obstacles.some((item) => item.id === "test-rock")).toBe(true);
    expect(world.sample?.x).toBe(12);
    expect(world.target?.label).toBe("Goal");
    expect(world.checkpoints?.[0].id).toBe("cp-1");
  });

  it("adds authored ramps to the rendered and physical terrain definition", () => {
    const terrain = buildLevelEnvironment(level);
    const height = createTerrainHeight(terrain);
    expect(height(18, 0)).toBeGreaterThan(height(8, 0));
  });
});
