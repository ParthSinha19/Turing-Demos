/**
 * PartBuilder: accumulates primitive shapes per material and merges them into one geometry
 * per material. A detailed part costs only a few draw calls, which keeps school laptops smooth.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { MatKey } from "./materials";
import type { Vec3 } from "../layout";

export type BuiltPart = Partial<Record<MatKey, THREE.BufferGeometry>>;

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);

export class PartBuilder {
  private groups = new Map<MatKey, THREE.BufferGeometry[]>();
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();

  add(mat: MatKey, g: THREE.BufferGeometry, pos: Vec3 = [0, 0, 0], rot: Vec3 = [0, 0, 0], quat?: THREE.Quaternion) {
    if (quat) this.q.copy(quat); else this.q.setFromEuler(this.e.set(rot[0], rot[1], rot[2]));
    this.m.compose(new THREE.Vector3(...pos), this.q, new THREE.Vector3(1, 1, 1));
    const geo = g.index ? g.toNonIndexed() : g;
    if (geo !== g) g.dispose();
    for (const name of Object.keys(geo.attributes)) if (!["position", "normal", "uv"].includes(name)) geo.deleteAttribute(name);
    if (!geo.attributes.uv) geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((geo.attributes.position.count) * 2), 2));
    geo.applyMatrix4(this.m);
    const list = this.groups.get(mat) ?? [];
    list.push(geo);
    this.groups.set(mat, list);
    return this;
  }

  box(mat: MatKey, size: Vec3, pos: Vec3, rot?: Vec3) {
    return this.add(mat, new THREE.BoxGeometry(size[0], size[1], size[2]), pos, rot);
  }

  rbox(mat: MatKey, size: Vec3, pos: Vec3, radius = 0.02, rot?: Vec3) {
    return this.add(mat, new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(radius, Math.min(...size) / 2.01)), pos, rot);
  }

  /** Cylinder along Y. */
  cyl(mat: MatKey, rTop: number, rBot: number, h: number, pos: Vec3, rot?: Vec3, seg = 20, open = false) {
    return this.add(mat, new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, open), pos, rot);
  }

  /** Cylinder along Z (axles, joints, lenses facing sideways). */
  cylZ(mat: MatKey, r: number, h: number, pos: Vec3, seg = 20) {
    return this.cyl(mat, r, r, h, pos, [Math.PI / 2, 0, 0], seg);
  }

  /** Cylinder along X (lenses facing forward). */
  cylX(mat: MatKey, r: number, h: number, pos: Vec3, seg = 20) {
    return this.cyl(mat, r, r, h, pos, [0, 0, Math.PI / 2], seg);
  }

  sphere(mat: MatKey, r: number, pos: Vec3, seg = 12) {
    return this.add(mat, new THREE.SphereGeometry(r, seg, Math.max(6, seg / 2)), pos);
  }

  torus(mat: MatKey, R: number, r: number, pos: Vec3, rot?: Vec3, seg = 40) {
    return this.add(mat, new THREE.TorusGeometry(R, r, 8, seg), pos, rot);
  }

  /** Round tube between two points. */
  rod(mat: MatKey, a: Vec3, b: Vec3, r: number, seg = 12) {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    if (len < 1e-5) return this;
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize());
    const mid = va.add(vb).multiplyScalar(0.5);
    return this.add(mat, new THREE.CylinderGeometry(r, r, len, seg), [mid.x, mid.y, mid.z], undefined, q);
  }

  /** Rectangular beam between two points (thickness in the vertical plane, depth along Z). */
  beam(mat: MatKey, a: Vec3, b: Vec3, thickness: number, depth: number, rounded = true) {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    if (len < 1e-5) return this;
    const q = new THREE.Quaternion().setFromUnitVectors(X, dir.normalize());
    const mid = va.add(vb).multiplyScalar(0.5);
    const geo = rounded ? new RoundedBoxGeometry(len, thickness, depth, 2, Math.min(thickness, depth) * 0.3) : new THREE.BoxGeometry(len, thickness, depth);
    return this.add(mat, geo, [mid.x, mid.y, mid.z], undefined, q);
  }

  lathe(mat: MatKey, points: [number, number][], pos: Vec3, rot?: Vec3, seg = 32) {
    return this.add(mat, new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg), pos, rot);
  }

  build(): BuiltPart {
    const out: BuiltPart = {};
    for (const [mat, list] of this.groups) {
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (merged) {
        merged.computeBoundingSphere();
        out[mat] = merged;
      }
    }
    this.groups.clear();
    return out;
  }
}

export function disposePart(part: BuiltPart) {
  for (const g of Object.values(part)) g?.dispose();
}
