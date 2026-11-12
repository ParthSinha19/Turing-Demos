/** Deterministic rock scatter. The same list will become collision shapes in the Sandbox. */
import { createNoise2D, mulberry32 } from "@/lib/random";
import type { EnvironmentDefinition, RockField } from "./environmentDefinition";
import type { HeightFn } from "./terrainHeight";

export interface RockInstance {
  variant: number;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  /** Approximate bounding radius, m (for collision later). */
  radius: number;
}

export type RockClass = "boulders" | "rocks" | "pebbles";

export function placeRocks(def: EnvironmentDefinition, height: HeightFn, cls: RockClass, variants: number, density = 1): RockInstance[] {
  const field: RockField = def.rocks[cls];
  const rand = mulberry32(def.seed * 31 + (cls === "boulders" ? 1 : cls === "rocks" ? 2 : 3));
  const clusterNoise = createNoise2D(def.seed + 999);
  const out: RockInstance[] = [];
  const target = Math.round(field.count * density);
  let guard = 0;
  while (out.length < target && guard++ < target * 30) {
    const a = rand() * Math.PI * 2;
    // bias toward the near field so the work area feels detailed
    const t = Math.pow(rand(), 1.6);
    const d = field.minDist + (field.maxDist - field.minDist) * t;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (def.rocks.keepClear.some((k) => Math.hypot(x - k.x, z - k.z) < k.radius)) continue;
    const c = (clusterNoise(x / 22, z / 22) + 1) / 2;
    if (rand() > (1 - field.cluster) + field.cluster * c) continue;
    const sizeT = Math.pow(rand(), 2.2);
    const s = field.minSize + (field.maxSize - field.minSize) * sizeT;
    const sx = s * (0.8 + rand() * 0.5);
    const sy = s * (0.5 + rand() * 0.4);
    const sz = s * (0.8 + rand() * 0.5);
    const y = height(x, z) - sy * 0.28;
    out.push({
      variant: Math.floor(rand() * variants),
      position: [x, y, z],
      scale: [sx, sy, sz],
      rotation: [(rand() - 0.5) * 0.3, rand() * Math.PI * 2, (rand() - 0.5) * 0.3],
      radius: Math.max(sx, sz),
    });
  }
  return out;
}
