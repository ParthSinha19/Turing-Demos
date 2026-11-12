/** Sensor hardware. Each builder works in its mount frame (origin = mount point). */
import { PartBuilder, type BuiltPart } from "../partBuilder";
import { MAST_HEIGHT_M } from "../../stats";

/** Front ultrasonic distance sensor; faces +X. */
export function buildDistanceSensor(): BuiltPart {
  const b = new PartBuilder();
  b.rbox("darkMetal", [0.03, 0.05, 0.26], [0.0, 0, 0], 0.006);
  b.rbox("black", [0.05, 0.075, 0.22], [0.035, 0, 0], 0.012);
  for (const z of [-0.06, 0.06]) {
    b.cylX("alu", 0.032, 0.012, [0.064, 0, z], 24);
    b.cylX("darkMetal", 0.026, 0.014, [0.068, 0, z], 24);
  }
  b.box("lamp", [0.004, 0.008, 0.008], [0.062, 0.028, 0]);
  return b.build();
}

/** One side sensor; faces +Z (mirrored for the left side). */
export function buildSideSensor(): BuiltPart {
  const b = new PartBuilder();
  b.rbox("black", [0.12, 0.06, 0.04], [0, 0, 0.022], 0.008);
  b.cylZ("alu", 0.022, 0.01, [0.02, 0, 0.045], 20);
  b.cylZ("darkMetal", 0.017, 0.012, [0.02, 0, 0.047], 20);
  b.cylZ("lens", 0.009, 0.008, [-0.035, 0, 0.044], 12);
  return b.build();
}

/** Mast column (static). Head is built separately so it can pan. */
export function buildMast(): BuiltPart {
  const b = new PartBuilder();
  const h = MAST_HEIGHT_M;
  b.cyl("darkMetal", 0.075, 0.085, 0.035, [0, 0.017, 0], undefined, 24);
  b.cyl("body", 0.034, 0.038, h - 0.08, [0, 0.035 + (h - 0.08) / 2, 0], undefined, 20);
  for (const y of [0.2, 0.45, h - 0.12]) b.cyl("alu", 0.042, 0.042, 0.02, [0, y, 0], undefined, 20);
  b.rod("cable", [0.04, 0.04, 0], [0.04, h - 0.1, 0], 0.007, 6);
  b.cyl("darkMetal", 0.05, 0.05, 0.06, [0, h - 0.04, 0], undefined, 20);
  return b.build();
}

/** Mast camera head (pan group, origin at top of mast). Faces +X. */
export function buildMastHead(): BuiltPart {
  const b = new PartBuilder();
  b.rbox("darkMetal", [0.06, 0.07, 0.08], [0, 0.03, 0], 0.01);
  b.cylZ("alu", 0.03, 0.2, [0, 0.07, 0], 16);
  b.rbox("body", [0.13, 0.11, 0.34], [0.02, 0.12, 0], 0.018);
  b.rbox("gold", [0.06, 0.09, 0.3], [-0.035, 0.12, 0], 0.01);
  b.box("black", [0.01, 0.085, 0.31], [0.088, 0.12, 0]);
  // Navcams (outer pair) and science cams (inner pair)
  for (const [z, r] of [[-0.12, 0.018], [0.12, 0.018], [-0.045, 0.024], [0.045, 0.024]] as const) {
    b.cylX("alu", r + 0.006, 0.03, [0.1, 0.12, z], 20);
    b.cylX("lens", r, 0.032, [0.104, 0.12, z], 20);
  }
  b.box("lamp", [0.004, 0.006, 0.006], [0.094, 0.165, 0.15]);
  return b.build();
}

/** LiDAR pedestal (static). */
export function buildLidarBase(): BuiltPart {
  const b = new PartBuilder();
  b.cyl("darkMetal", 0.06, 0.07, 0.03, [0, 0.015, 0], undefined, 24);
  b.cyl("alu", 0.03, 0.035, 0.1, [0, 0.08, 0], undefined, 16);
  b.cyl("black", 0.07, 0.07, 0.03, [0, 0.145, 0], undefined, 28);
  return b.build();
}

/** LiDAR spinning head (origin on pedestal top). */
export function buildLidarHead(): BuiltPart {
  const b = new PartBuilder();
  b.cyl("black", 0.064, 0.066, 0.1, [0, 0.05, 0], undefined, 32);
  b.cyl("glass", 0.067, 0.067, 0.036, [0, 0.055, 0], undefined, 32);
  b.cyl("alu", 0.058, 0.064, 0.016, [0, 0.108, 0], undefined, 32);
  b.box("lens", [0.012, 0.03, 0.04], [0.064, 0.055, 0]);
  return b.build();
}
