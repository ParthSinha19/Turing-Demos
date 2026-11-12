/** Wheel geometry: open aluminium drum, grousers (tread), rims, curved flexure spokes and hub. Axis = Z, outer face = +Z. */
import * as THREE from "three";
import type { WheelSpec } from "../../catalogue";
import { PartBuilder, type BuiltPart } from "../partBuilder";

const cache = new Map<string, BuiltPart>();

export function buildWheel(spec: WheelSpec): BuiltPart {
  const hit = cache.get(spec.id);
  if (hit) return hit;
  const b = new PartBuilder();
  const r = spec.radiusM;
  const w = spec.widthM;
  const drumR = r * 0.94;
  const seg = 56;

  b.cyl("wheelAlu", drumR, drumR, w, [0, 0, 0], [Math.PI / 2, 0, 0], seg, true);
  b.torus("alu", drumR, 0.011, [0, 0, w / 2], undefined, seg);
  b.torus("alu", drumR, 0.011, [0, 0, -w / 2], undefined, seg);
  // inner stiffening ring
  b.torus("wheelAlu", drumR * 0.985, 0.006, [0, 0, 0], undefined, seg);

  const gh = spec.grouserStyle === "paddle" ? r * 0.06 : spec.grouserStyle === "chevron" ? r * 0.045 : r * 0.04;
  const gt = spec.grouserStyle === "paddle" ? 0.016 : 0.011;
  const qz = new THREE.Quaternion();
  const qx = new THREE.Quaternion();
  const Z = new THREE.Vector3(0, 0, 1);
  const XA = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < spec.grousers; i++) {
    const a = (i / spec.grousers) * Math.PI * 2;
    const rr = drumR + gh / 2;
    const radial: [number, number] = [Math.cos(a), Math.sin(a)];
    const tangent: [number, number] = [-Math.sin(a), Math.cos(a)];
    qz.setFromAxisAngle(Z, a);
    if (spec.grouserStyle === "chevron") {
      const half = w / 2;
      const tilt = 0.42;
      for (const s of [-1, 1]) {
        qx.setFromAxisAngle(XA, s * tilt);
        const q = qz.clone().multiply(qx);
        const shift = (half / 2) * Math.sin(tilt);
        const pos: [number, number, number] = [radial[0] * rr - tangent[0] * shift, radial[1] * rr - tangent[1] * shift, (s * half) / 2];
        b.add("alu", new THREE.BoxGeometry(gh, gt, half * 1.06), pos, undefined, q);
      }
    } else {
      b.add("alu", new THREE.BoxGeometry(gh, gt, w * 0.98), [radial[0] * rr, radial[1] * rr, 0], undefined, qz.clone());
    }
  }

  // Curved flexure spokes on the outer face (like titanium Curiosity spokes)
  const spokes = 6;
  const hubR = r * 0.2;
  const zFace = w * 0.32;
  for (let i = 0; i < spokes; i++) {
    const a0 = (i / spokes) * Math.PI * 2;
    const steps = 4;
    for (let k = 0; k < steps; k++) {
      const t0 = k / steps;
      const t1 = (k + 1) / steps;
      const p = (t: number): [number, number, number] => {
        const rad = hubR + (drumR - 0.01 - hubR) * t;
        const ang = a0 + Math.sin(t * Math.PI) * 0.45;
        return [Math.cos(ang) * rad, Math.sin(ang) * rad, zFace * (1 - t * 0.25)];
      };
      b.beam("alu", p(t0), p(t1), 0.012, 0.03, false);
    }
  }
  b.cylZ("darkMetal", hubR, 0.06, [0, 0, zFace], 24);
  b.cylZ("alu", hubR * 0.55, 0.075, [0, 0, zFace + 0.008], 20);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.cylZ("black", 0.008, 0.08, [Math.cos(a) * hubR * 0.75, Math.sin(a) * hubR * 0.75, zFace + 0.01], 6);
  }
  const part = b.build();
  cache.set(spec.id, part);
  return part;
}
