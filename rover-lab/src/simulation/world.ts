import { ASSEMBLY_YARD, type EnvironmentDefinition } from "@/environment/environmentDefinition";
import { placeRocks } from "@/environment/rockPlacement";
import { createTerrainHeight } from "@/environment/terrainHeight";
import type { SimulationObstacle, SimulationWorld } from "./types";

export interface SimulationWorldDefinition {
  id: string;
  name: string;
  environment?: EnvironmentDefinition;
  start?: { x: number; z: number; yaw: number };
  target?: SimulationWorld["target"];
  sample?: SimulationWorld["sample"];
  obstacles?: SimulationObstacle[];
  checkpoints?: SimulationWorld["checkpoints"];
}

export function createSimulationWorld(definition: SimulationWorldDefinition): SimulationWorld {
  const environment = definition.environment ?? ASSEMBLY_YARD;
  const height = createTerrainHeight(environment);
  const boulders = placeRocks(environment, height, "boulders", 3, 1).map((r, i): SimulationObstacle => ({
    id: `${environment.id}-boulder-${i}`,
    kind: "boulder",
    x: r.position[0],
    z: r.position[2],
    radius: r.radius * 0.72,
    height: r.scale[1] * 1.35,
  }));
  const rocks = placeRocks(environment, height, "rocks", 3, 1)
    .filter((r) => r.radius > 0.22)
    .map((r, i): SimulationObstacle => ({
      id: `${environment.id}-rock-${i}`,
      kind: "rock",
      x: r.position[0],
      z: r.position[2],
      radius: r.radius * 0.66,
      height: r.scale[1] * 1.2,
    }));
  return {
    id: definition.id,
    name: definition.name,
    environmentId: environment.id,
    environment,
    ...(definition.checkpoints ? { checkpoints: definition.checkpoints } : {}),
    obstacles: [...boulders, ...rocks, ...(definition.obstacles ?? [])],
    start: definition.start ?? { x: 0, z: 0, yaw: 0 },
    ...(definition.target ? { target: definition.target } : {}),
    ...(definition.sample ? { sample: definition.sample } : {}),
  };
}

export const SANDBOX_WORLD = createSimulationWorld({
  id: "sandbox",
  name: "Jezero Test Yard",
  obstacles: [
    { id: "yard-approach-rock", kind: "boulder", x: 10.5, z: 0.2, radius: 0.95, height: 1.1 },
    { id: "yard-split-rock", kind: "rock", x: 15.5, z: -2.2, radius: 0.55, height: 0.55 },
    { id: "yard-barrier", kind: "barrier", x: 20, z: 1.2, radius: 1.2, height: 0.8, width: 1.2, depth: 2.2 },
  ],
});
