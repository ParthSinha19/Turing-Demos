import { ASSEMBLY_YARD, type EnvironmentDefinition } from "@/environment/environmentDefinition";
import { createSimulationWorld } from "@/simulation/world";
import type { CustomLevel } from "./levelStore";

export function buildLevelEnvironment(level: CustomLevel): EnvironmentDefinition {
  const seed = level.terrain === "crater" ? 17 : level.terrain === "ridge" ? 29 : 7;
  const craters = level.terrain === "crater"
    ? [...ASSEMBLY_YARD.craters, { x: 14, z: -1, radius: 5.5, depth: 1.7 }]
    : ASSEMBLY_YARD.craters;
  const flatZones = level.terrain === "yard"
    ? ASSEMBLY_YARD.flatZones
    : ASSEMBLY_YARD.flatZones.filter((zone) => Math.hypot(zone.x - 0, zone.z - 0) < 0.1);
  return {
    ...ASSEMBLY_YARD,
    id: `custom-${level.id}`,
    name: level.name,
    seed,
    craters,
    flatZones,
    ridgeHeight: level.terrain === "ridge" ? 58 : ASSEMBLY_YARD.ridgeHeight,
    ramps: level.ramps,
  };
}

export function buildCustomLevelWorld(level: CustomLevel) {
  const sampleObject = level.obstacles.find((obstacle) => obstacle.kind === "sample");
  return createSimulationWorld({
    id: `custom-${level.id}`,
    name: level.name,
    environment: buildLevelEnvironment(level),
    start: level.start,
    target: level.target,
    ...(sampleObject ? { sample: { x: sampleObject.x, z: sampleObject.z, radius: sampleObject.radius, label: "Custom sample" } } : {}),
    obstacles: level.obstacles,
    checkpoints: level.checkpoints,
  });
}
