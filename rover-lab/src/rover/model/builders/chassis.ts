/** Chassis body ("warm electronics box"), deck, ribs, thermal blankets, radiators, antennas and variant details. */
import type { ChassisSpec } from "../../catalogue";
import type { RoverLayout } from "../../layout";
import { PartBuilder, type BuiltPart } from "../partBuilder";

export function buildChassis(spec: ChassisSpec, layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const { length: L, width: W, height: H, bellyY, deckY } = layout.body;
  const heavy = spec.variant === "heavy";
  const compact = spec.variant === "compact";

  // Main body sits on a darker belly pan
  b.rbox("body", [L, H - 0.02, W], [0, bellyY + 0.02 + (H - 0.02) / 2, 0], compact ? 0.05 : 0.03);
  b.rbox("darkMetal", [L * 0.94, 0.026, W * 0.92], [0, bellyY + 0.013, 0], 0.008);
  // Underside battery pack + skid strips (flush with belly so they don't change clearance)
  b.box("black", [L * 0.5, 0.012, W * 0.55], [-L * 0.05, bellyY + 0.006 - 0.0005, 0]);
  for (const z of [-W * 0.35, W * 0.35]) b.box("alu", [L * 0.8, 0.008, 0.03], [0, bellyY + 0.004, z]);

  // Deck: base plate + inset panels with visible seams
  b.box("darkMetal", [L * 0.97, 0.014, W * 0.97], [0, deckY + 0.007, 0]);
  const cols = compact ? 3 : 4;
  const rows = 2;
  const pw = (L * 0.95) / cols;
  const pd = (W * 0.95) / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      b.box("deck", [pw - 0.014, 0.01, pd - 0.014], [-L * 0.475 + pw * (i + 0.5), deckY + 0.019, -W * 0.475 + pd * (j + 0.5)]);
    }
  }
  // Cable trays along the deck edges
  for (const z of [-W * 0.46, W * 0.46]) b.rod("cable", [-L * 0.45, deckY + 0.03, z], [L * 0.45, deckY + 0.03, z], 0.009, 6);

  // Deck hardware: navigation computer with sun sensor, umbilical connector, tie-down points
  b.rbox("bodyDark", [0.15, 0.05, 0.2], [L * 0.2, deckY + 0.05, 0], 0.01);
  b.box("gold", [0.13, 0.004, 0.18], [L * 0.2, deckY + 0.077, 0]);
  b.sphere("lens", 0.022, [L * 0.2 + 0.04, deckY + 0.082, 0.05], 12);
  b.cyl("darkMetal", 0.028, 0.028, 0.03, [L * 0.2 - 0.04, deckY + 0.09, -0.05], undefined, 12);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.cyl("alu", 0.018, 0.022, 0.03, [sx * L * 0.46, deckY + 0.04, sz * W * 0.43], undefined, 10);
  }

  // Side ribs and gold thermal blankets
  const ribs = compact ? 5 : heavy ? 9 : 7;
  for (const s of [-1, 1]) {
    for (let i = 0; i < ribs; i++) {
      const x = -L / 2 + 0.08 + ((L - 0.16) * i) / (ribs - 1);
      b.box("alu", [0.016, H * 0.78, 0.012], [x, bellyY + H * 0.5, s * (W / 2 + 0.005)]);
    }
    b.box("gold", [L * 0.34, H * 0.42, 0.006], [-L * 0.12, bellyY + H * 0.36, s * (W / 2 + 0.003)]);
    b.box("bodyDark", [L * 0.9, 0.02, 0.014], [0, deckY - 0.02, s * (W / 2 + 0.006)]);
    // rocker pivot boss
    const [rx, ry] = layout.sides[0].rockerPivot;
    b.cylZ("darkMetal", 0.075, 0.08, [rx, ry, s * (W / 2 + 0.035)], 24);
    b.cylZ("alu", 0.045, 0.1, [rx, ry, s * (W / 2 + 0.045)], 20);
  }

  // Front: bumper + work lights
  b.rbox("darkMetal", [0.05, H * 0.24, W * 0.92], [L / 2 + 0.02, bellyY + H * 0.15, 0], 0.01);
  for (const z of [-W * 0.4, W * 0.4]) {
    b.rbox("black", [0.03, 0.04, 0.07], [L / 2 + 0.012, deckY - 0.04, z], 0.006);
    b.box("lamp", [0.006, 0.026, 0.05], [L / 2 + 0.028, deckY - 0.04, z]);
  }

  // Rear: radiator fin stack
  const fins = compact ? 7 : 10;
  for (let i = 0; i < fins; i++) {
    const z = -W * 0.4 + (W * 0.8 * i) / (fins - 1);
    b.box("alu", [0.07, H * 0.68, 0.008], [-L / 2 - 0.035, bellyY + H * 0.5, z]);
  }
  b.box("darkMetal", [0.02, H * 0.74, W * 0.84], [-L / 2 - 0.005, bellyY + H * 0.5, 0]);

  // High-gain antenna (dish on a gimbal) and low-gain whip
  const hga = layout.mounts["antenna.hga"].position;
  const dishR = compact ? 0.1 : heavy ? 0.17 : 0.14;
  b.cyl("darkMetal", 0.04, 0.05, 0.03, [hga[0], deckY + 0.025, hga[2]], undefined, 16);
  b.rod("alu", [hga[0], deckY + 0.03, hga[2]], [hga[0], deckY + 0.22, hga[2]], 0.016);
  b.rbox("darkMetal", [0.06, 0.05, 0.05], [hga[0], deckY + 0.24, hga[2]], 0.01);
  const dishPts: [number, number][] = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; dishPts.push([0.004 + t * dishR, t * t * dishR * 0.35]); }
  b.lathe("bodyDouble", dishPts, [hga[0] + 0.02, deckY + 0.26, hga[2]], [0, 0, -0.55], 32);
  b.cyl("darkMetal", 0.008, 0.008, dishR * 0.5, [hga[0] + 0.02 + Math.sin(0.55) * dishR * 0.2, deckY + 0.26 + Math.cos(0.55) * dishR * 0.2, hga[2]], [0, 0, -0.55], 8);
  const lga = layout.mounts["antenna.lga"].position;
  b.rod("alu", [lga[0], deckY, lga[2]], [lga[0], deckY + 0.3, lga[2]], 0.008, 8);
  b.cyl("body", 0.022, 0.022, 0.09, [lga[0], deckY + 0.34, lga[2]], undefined, 12);

  if (heavy) {
    for (const s of [-1, 1]) {
      b.box("darkMetal", [L * 0.9, H * 0.36, 0.016], [0, bellyY + H * 0.2, s * (W / 2 + 0.02)], [s * 0.18, 0, 0]);
      b.rod("alu", [-L * 0.48, deckY + 0.07, s * W * 0.48], [L * 0.48, deckY + 0.07, s * W * 0.48], 0.014, 8);
      for (const x of [-L * 0.48, L * 0.48]) b.rod("alu", [x, deckY, s * W * 0.48], [x, deckY + 0.07, s * W * 0.48], 0.014, 8);
    }
    b.rod("alu", [L / 2 + 0.07, bellyY + 0.04, -W * 0.42], [L / 2 + 0.07, bellyY + 0.04, W * 0.42], 0.02, 10);
    for (const z of [-W * 0.42, W * 0.42]) b.rod("alu", [L / 2 + 0.07, bellyY + 0.04, z], [L / 2, bellyY + 0.12, z], 0.018, 8);
  }

  return b.build();
}

/** Differential bar across the deck (links the left and right rockers). Local origin = bar pivot. */
export function buildDifferential(layout: RoverLayout): BuiltPart {
  const b = new PartBuilder();
  const W = layout.body.width;
  const halfSpan = W / 2 + 0.035;
  b.rod("alu", [0, 0, -halfSpan], [0, 0, halfSpan], 0.022, 12);
  b.cyl("darkMetal", 0.05, 0.05, 0.05, [0, -0.01, 0], undefined, 20);
  const drop = layout.differentialBar.y - layout.sides[0].rockerPivot[1] - 0.06;
  for (const s of [-1, 1]) {
    b.sphere("darkMetal", 0.03, [0, 0, s * halfSpan]);
    b.rod("alu", [0, 0, s * halfSpan], [0.06, -drop, s * halfSpan], 0.011, 8);
  }
  return b.build();
}
