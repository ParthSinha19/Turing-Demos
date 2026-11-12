/**
 * Rocker-bogie suspension pieces, built for the RIGHT side (+Z). The left side reuses them mirrored.
 * Each piece is built in its own joint frame so physics can later rotate the joints directly.
 */
import type { RoverLayout, Vec3 } from "../../layout";
import { PartBuilder, type BuiltPart } from "../partBuilder";

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function rightWheels(layout: RoverLayout) {
  const w = layout.wheels.filter((x) => x.side === "right");
  return { front: w.find((x) => x.station === "front")!, middle: w.find((x) => x.station === "middle")!, rear: w.find((x) => x.station === "rear")! };
}

function bracket(b: PartBuilder, armEnd: Vec3, wheelTop: Vec3, tube: number, steerable: boolean) {
  b.beam("alu", armEnd, wheelTop, tube * 1.6, tube * 1.6);
  b.cylZ("darkMetal", tube * 1.5, tube * 3.2, armEnd, 16);
  if (steerable) {
    b.cyl("darkMetal", 0.052, 0.052, 0.085, [wheelTop[0], wheelTop[1] + 0.02, wheelTop[2]], undefined, 24);
    b.cyl("alu", 0.058, 0.058, 0.012, [wheelTop[0], wheelTop[1] + 0.065, wheelTop[2]], undefined, 24);
    b.cyl("bodyDark", 0.03, 0.03, 0.03, [wheelTop[0], wheelTop[1] + 0.085, wheelTop[2]], undefined, 16);
  } else {
    b.rbox("darkMetal", [0.08, 0.05, 0.08], [wheelTop[0], wheelTop[1] + 0.01, wheelTop[2]], 0.01);
  }
}

export function suspensionTube(layout: RoverLayout) {
  return layout.body.width > 1.05 ? 0.034 : layout.body.width < 0.85 ? 0.024 : 0.029;
}

/** Rocker arm, in the rocker-pivot frame. */
export function buildRocker(layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const side = layout.sides[1];
  const P = side.rockerPivot;
  const { front } = rightWheels(layout);
  const tube = suspensionTube(layout);
  const frontArmEnd = sub([front.top[0], front.top[1], side.armZ], P);
  const frontTop = sub(front.top, P);
  const bogie = sub(side.bogiePivot, P);
  const kneeF = lerp([0, 0, 0], frontArmEnd, 0.45);
  kneeF[1] = Math.max(kneeF[1], 0) + 0.05;
  const kneeR = lerp([0, 0, 0], bogie, 0.5);
  kneeR[1] += 0.04;
  b.rod("alu", [0, 0, 0], kneeF, tube);
  b.rod("alu", kneeF, frontArmEnd, tube);
  b.rod("alu", [0, 0, 0], kneeR, tube);
  b.rod("alu", kneeR, bogie, tube);
  b.sphere("darkMetal", tube * 1.4, kneeF, 10);
  b.sphere("darkMetal", tube * 1.4, kneeR, 10);
  b.cylZ("darkMetal", 0.065, 0.06, [0, 0, 0], 24);
  b.cylZ("alu", 0.03, 0.08, [0, 0, 0.01], 16);
  b.rod("cable", [0.02, 0.03, 0.02], lerp(kneeF, frontArmEnd, 0.9), 0.006, 6);
  bracket(b, frontArmEnd, frontTop, tube, true);
  return b.build();
}

/** Bogie arm, in the bogie-pivot frame. */
export function buildBogie(layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const side = layout.sides[1];
  const BP = side.bogiePivot;
  const { middle, rear } = rightWheels(layout);
  const tube = suspensionTube(layout);
  const midEnd = sub([middle.top[0], middle.top[1], side.armZ], BP);
  const rearEnd = sub([rear.top[0], rear.top[1], side.armZ], BP);
  const kM = lerp([0, 0, 0], midEnd, 0.5); kM[1] += 0.03;
  const kR = lerp([0, 0, 0], rearEnd, 0.5); kR[1] += 0.03;
  b.rod("alu", [0, 0, 0], kM, tube);
  b.rod("alu", kM, midEnd, tube);
  b.rod("alu", [0, 0, 0], kR, tube);
  b.rod("alu", kR, rearEnd, tube);
  b.cylZ("darkMetal", 0.055, 0.07, [0, 0, 0], 24);
  b.cylZ("alu", 0.026, 0.09, [0, 0, 0.01], 16);
  bracket(b, midEnd, sub(middle.top, BP), tube, false);
  bracket(b, rearEnd, sub(rear.top, BP), tube, true);
  return b.build();
}

/** Wheel fork: drops from the steering pivot down the wheel's inner side to the axle. Frame = station top. */
export function buildFork(layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const r = layout.wheel.radius;
  const w = layout.wheel.width;
  const tube = suspensionTube(layout);
  const drop = r + 0.1; // station top → hub
  const zi = -(w / 2 + 0.075);
  b.beam("alu", [0, -0.02, 0], [0, -0.02, zi], tube * 1.5, tube * 1.8);
  b.beam("alu", [0, -0.02, zi], [0, -drop + 0.02, zi], tube * 1.8, tube * 1.4);
  b.cylZ("darkMetal", 0.045, 0.05, [0, -drop, zi], 20);
  return b.build();
}
