/** Pure, deterministic Mars terrain function shared by the renderer and rover simulation. */
import { createNoise2D, smoothstep } from "@/lib/random";
import type { EnvironmentDefinition } from "./environmentDefinition";

export type HeightFn = (x: number, z: number) => number;

export function createTerrainHeight(def: EnvironmentDefinition): HeightFn {
  const n1 = createNoise2D(def.seed);
  const n2 = createNoise2D(def.seed + 101);
  const n3 = createNoise2D(def.seed + 202);

  const fbm = (x: number, z: number, oct: number) => {
    let a = 1, f = 1, s = 0, norm = 0;
    for (let i = 0; i < oct; i++) { s += a * n1(x * f, z * f); norm += a; a *= 0.5; f *= 2.03; }
    return s / norm;
  };
  const ridged = (x: number, z: number) => {
    let a = 1, f = 1, s = 0, norm = 0;
    for (let i = 0; i < 3; i++) { const v = 1 - Math.abs(n2(x * f, z * f)); s += a * v * v; norm += a; a *= 0.45; f *= 2.0; }
    return s / norm;
  };

  return (x: number, z: number) => {
    const d = Math.hypot(x, z);
    let h = fbm(x / 70, z / 70, 4) * 2.4;
    h += n3(x / 16, z / 16) * 0.45;
    h += n1(x / 4.2 + 50, z / 4.2) * 0.08;
    h += n2(x / 1.3, z / 1.3) * 0.02;

    // Distant ridges and flat-topped mesas frame the horizon
    const far = smoothstep(80, 300, d);
    const ridge = ridged(x / 230, z / 230);
    const mesa = smoothstep(0.5, 0.68, ridge);
    h += far * (ridge * def.ridgeHeight * 0.5 + mesa * def.ridgeHeight * 0.45 + fbm(x / 400 + 9, z / 400, 2) * 10);

    for (const c of def.craters) {
      const dd = Math.hypot(x - c.x, z - c.z) / c.radius;
      if (dd < 2.2) {
        const bowl = dd < 1 ? -c.depth * (1 - dd * dd) : 0;
        const rim = c.depth * 0.38 * Math.exp(-((dd - 1) * (dd - 1)) / 0.045);
        const ejecta = dd > 1 ? c.depth * 0.08 * Math.exp(-(dd - 1) * 2.5) * (0.6 + 0.4 * n3(x / 3, z / 3)) : 0;
        h += bowl + rim + ejecta;
      }
    }

    for (const f of def.flatZones) {
      const t = smoothstep(f.radius, f.radius * 2.6, Math.hypot(x - f.x, z - f.z));
      h = f.height + (h - f.height) * t;
    }

    for (const ramp of def.ramps ?? []) {
      const dx = (x - ramp.x) * Math.cos(ramp.heading) + (z - ramp.z) * Math.sin(ramp.heading);
      const dz = Math.abs(-(x - ramp.x) * Math.sin(ramp.heading) + (z - ramp.z) * Math.cos(ramp.heading));
      const across = 1 - smoothstep(ramp.width * 0.42, ramp.width * 0.5 + 1, dz);
      const along = Math.max(0, Math.min(1, (dx + ramp.length / 2) / ramp.length));
      h += ramp.rise * smoothstep(0, 1, along) * across;
    }
    return h;
  };
}
