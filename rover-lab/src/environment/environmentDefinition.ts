/**
 * Environment definitions are plain data, so future custom levels can be authored, saved and loaded
 * without touching rendering code. The same definition drives terrain rendering, obstacle placement
 * and the simulation height field.
 */
export interface Crater { x: number; z: number; radius: number; depth: number }
export interface FlatZone { x: number; z: number; radius: number; height: number }
export interface RockField { count: number; minDist: number; maxDist: number; minSize: number; maxSize: number; cluster: number }
export interface RampFeature { id: string; x: number; z: number; length: number; width: number; rise: number; heading: number }

export interface EnvironmentDefinition {
  id: string;
  name: string;
  seed: number;
  /** Half-size of the terrain square, m. */
  extent: number;
  craters: Crater[];
  flatZones: FlatZone[];
  /** Height of distant ridges and mesas, m. */
  ridgeHeight: number;
  ramps?: RampFeature[];
  rocks: { boulders: RockField; rocks: RockField; pebbles: RockField; keepClear: { x: number; z: number; radius: number }[] };
}

export const ASSEMBLY_YARD: EnvironmentDefinition = {
  id: "assembly-yard",
  name: "Jezero Test Yard",
  seed: 7,
  extent: 520,
  craters: [
    { x: -34, z: -26, radius: 11, depth: 2.4 },
    { x: 22, z: -48, radius: 7, depth: 1.5 },
    { x: -95, z: 40, radius: 32, depth: 7 },
    { x: 40, z: 30, radius: 5, depth: 1 },
    { x: -14, z: 38, radius: 4, depth: 0.8 },
    { x: 120, z: -90, radius: 45, depth: 9 },
  ],
  flatZones: [{ x: 0, z: 0, radius: 5.6, height: -0.16 }],
  ridgeHeight: 46,
  rocks: {
    boulders: { count: 46, minDist: 11, maxDist: 140, minSize: 0.7, maxSize: 2.6, cluster: 0.6 },
    rocks: { count: 320, minDist: 6.5, maxDist: 160, minSize: 0.16, maxSize: 0.6, cluster: 0.5 },
    pebbles: { count: 700, minDist: 4.3, maxDist: 45, minSize: 0.04, maxSize: 0.13, cluster: 0.3 },
    keepClear: [{ x: 0, z: 0, radius: 4.3 }],
  },
};
