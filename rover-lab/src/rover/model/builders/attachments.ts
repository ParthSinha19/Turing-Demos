/** Attachment hardware, each in its payload-mount frame. */
import type { RoverLayout } from "../../layout";
import { PartBuilder, type BuiltPart } from "../partBuilder";

/** Five-joint robotic arm, stowed across the front. Origin = front payload mount. */
export function buildArm(layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const H = layout.body.height;
  const W = layout.body.width;
  b.rbox("darkMetal", [0.04, 0.16, 0.16], [0.02, 0.05, 0], 0.01);
  // azimuth + shoulder joints
  b.cylX("darkMetal", 0.06, 0.07, [0.07, 0.05, 0], 24);
  const shoulder: [number, number, number] = [0.13, 0.08, 0];
  b.cylZ("darkMetal", 0.065, 0.12, shoulder, 24);
  b.cylZ("alu", 0.04, 0.14, shoulder, 16);
  // upper arm
  const elbow: [number, number, number] = [0.5, 0.08 + H * 0.55, -0.02];
  b.rod("body", shoulder, elbow, 0.035, 16);
  b.cylZ("darkMetal", 0.055, 0.11, elbow, 24);
  // forearm folds back across the front
  const wrist: [number, number, number] = [0.3, 0.06 + H * 0.5, -W * 0.38];
  b.rod("body", elbow, wrist, 0.03, 16);
  b.rod("cable", [shoulder[0], shoulder[1] + 0.04, 0.03], [elbow[0], elbow[1] + 0.04, 0.02], 0.006, 6);
  b.rod("cable", [elbow[0], elbow[1] - 0.04, -0.02], [wrist[0], wrist[1] - 0.03, wrist[2]], 0.006, 6);
  b.cylZ("darkMetal", 0.045, 0.09, wrist, 20);
  // turret with tools
  const t: [number, number, number] = [wrist[0], wrist[1] - 0.1, wrist[2]];
  b.cyl("darkMetal", 0.085, 0.085, 0.1, t, undefined, 28);
  b.cyl("alu", 0.09, 0.09, 0.014, [t[0], t[1] + 0.05, t[2]], undefined, 28);
  // drill
  b.cyl("body", 0.03, 0.03, 0.1, [t[0] + 0.09, t[1] - 0.04, t[2]], undefined, 16);
  b.cyl("alu", 0.012, 0.002, 0.08, [t[0] + 0.09, t[1] - 0.13, t[2]], undefined, 10);
  // scoop
  b.rbox("alu", [0.08, 0.03, 0.06], [t[0] - 0.09, t[1] - 0.04, t[2]], 0.01);
  // contact camera
  b.rbox("black", [0.05, 0.05, 0.05], [t[0], t[1] - 0.02, t[2] + 0.1], 0.008);
  b.cylX("lens", 0.012, 0.01, [t[0] + 0.026, t[1] - 0.02, t[2] + 0.1], 12);
  return b.build();
}

/** Belly-mounted drill and sample cache. Origin = belly mount. Lowest point = −clearanceLoss. */
export function buildCollector(layout: RoverLayout, depth: number): BuiltPart {
  const b = new PartBuilder();
  const W = layout.body.width;
  b.rbox("bodyDark", [0.42, 0.04, W * 0.42], [0, -0.02, 0], 0.01);
  // sample tube rack
  for (let i = 0; i < 6; i++) {
    const z = -W * 0.17 + (W * 0.34 * i) / 5;
    b.cyl("alu", 0.014, 0.014, 0.22, [-0.08, -0.05, z], [0, 0, Math.PI / 2], 12);
    b.cyl("gold", 0.016, 0.016, 0.02, [0.035, -0.05, z], [0, 0, Math.PI / 2], 12);
  }
  // coring drill
  b.cyl("darkMetal", 0.055, 0.055, 0.05, [0.13, -0.045, 0], undefined, 20);
  b.cyl("body", 0.03, 0.03, depth - 0.06, [0.13, -0.07 - (depth - 0.08) / 2, 0], undefined, 16);
  b.cyl("alu", 0.018, 0.002, 0.03, [0.13, -depth + 0.015, 0], undefined, 12);
  return b.build();
}

/** Rear-deck equipment module: battery + instruments. Origin = rear payload mount on the deck. */
export function buildEquipmentModule(layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const L = layout.body.length;
  const W = layout.body.width;
  const l = L * 0.34;
  const w = W * 0.62;
  b.rbox("body", [l, 0.2, w], [0, 0.1, 0], 0.02);
  for (const s of [-1, 1]) b.box("gold", [l * 0.9, 0.15, 0.006], [0, 0.1, s * (w / 2 + 0.003)]);
  // radiator fins on top
  for (let i = 0; i < 7; i++) b.box("alu", [l * 0.8, 0.04, 0.008], [0, 0.22, -w * 0.35 + (w * 0.7 * i) / 6]);
  // instrument pods + status light
  b.rbox("deck", [0.12, 0.08, 0.12], [l / 2 - 0.08, 0.24, w * 0.3], 0.01);
  b.cylX("lens", 0.02, 0.02, [l / 2 - 0.015, 0.24, w * 0.3], 16);
  b.cyl("darkMetal", 0.03, 0.03, 0.12, [-l / 2 + 0.08, 0.26, -w * 0.3], undefined, 16);
  b.box("lamp", [0.03, 0.012, 0.004], [l / 2 - 0.05, 0.14, w / 2 + 0.008]);
  // handles
  for (const s of [-1, 1]) b.rod("alu", [-l * 0.35, 0.21, s * w * 0.45], [l * 0.35, 0.21, s * w * 0.45], 0.008, 8);
  return b.build();
}
