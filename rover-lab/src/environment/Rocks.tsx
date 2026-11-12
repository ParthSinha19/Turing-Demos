import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createNoise2D, mulberry32 } from "@/lib/random";
import { createRockTextures } from "./proceduralTextures";
import type { EnvironmentDefinition } from "./environmentDefinition";
import { placeRocks, type RockClass, type RockInstance } from "./rockPlacement";
import type { HeightFn } from "./terrainHeight";

/** Angular rock: displaced icosahedron with planar fractures and a flattened base. Faceted normals. */
function createRockGeometry(seed: number, detail: number) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const rand = mulberry32(seed);
  const noise = createNoise2D(seed);
  const cuts = Array.from({ length: 4 }, () => {
    const n = new THREE.Vector3(rand() - 0.5, rand() * 0.6, rand() - 0.5).normalize();
    return { n, d: 0.62 + rand() * 0.25 };
  });
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const dir = v.clone().normalize();
    const r = 1 + 0.28 * noise(dir.x * 1.4 + dir.y, dir.z * 1.4 - dir.y) + 0.09 * noise(dir.x * 4 + 7, dir.z * 4 + dir.y * 3);
    v.copy(dir).multiplyScalar(r);
    for (const c of cuts) {
      const k = v.dot(c.n);
      if (k > c.d) v.addScaledVector(c.n, c.d - k);
    }
    if (v.y < -0.3) v.y = -0.3 + (v.y + 0.3) * 0.25;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  // Box-projected UVs per triangle (rock texture has no obvious direction)
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (ay >= ax && ay >= az) uv.setXY(i, x * 0.5, z * 0.5);
    else if (ax >= az) uv.setXY(i, z * 0.5, y * 0.5);
    else uv.setXY(i, x * 0.5, y * 0.5);
  }
  g.computeBoundingSphere();
  return g;
}

// Only boulders cast shadows: the shadow camera covers the work area, and small rocks
// would double their triangle cost for shadows nobody can see.
const CLASS_DETAIL: Record<RockClass, { detail: number; lowDetail: number; variants: number; shadows: boolean }> = {
  boulders: { detail: 3, lowDetail: 2, variants: 3, shadows: true },
  rocks: { detail: 2, lowDetail: 1, variants: 3, shadows: false },
  pebbles: { detail: 0, lowDetail: 0, variants: 2, shadows: false },
};

function RockSet({ instances, geometry, material, shadows }: { instances: RockInstance[]; geometry: THREE.BufferGeometry; material: THREE.Material; shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    instances.forEach((r, i) => {
      q.setFromEuler(e.set(...r.rotation));
      m.compose(new THREE.Vector3(...r.position), q, new THREE.Vector3(...r.scale));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [instances]);
  if (instances.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, instances.length]} castShadow={shadows} receiveShadow />;
}

function RockField({ def, height, density, material }: { def: EnvironmentDefinition; height: HeightFn; density: number; material: THREE.Material }) {
  const sets = useMemo(() => {
    return (Object.keys(CLASS_DETAIL) as RockClass[]).flatMap((cls) => {
      const cfg = CLASS_DETAIL[cls];
      const all = placeRocks(def, height, cls, cfg.variants, cls === "pebbles" ? density : 1);
      return Array.from({ length: cfg.variants }, (_, v) => ({
        key: `${cls}-${v}`,
        geometry: createRockGeometry(def.seed * 13 + v * 7, density < 0.6 ? cfg.lowDetail : cfg.detail),
        instances: all.filter((r) => r.variant === v),
        shadows: cfg.shadows,
      }));
    });
  }, [def, height, density]);
  useEffect(() => () => sets.forEach((s) => s.geometry.dispose()), [sets]);
  return (
    <>
      {sets.map((s) => <RockSet key={s.key} instances={s.instances} geometry={s.geometry} material={material} shadows={s.shadows} />)}
    </>
  );
}

function TexturedRocks(props: { def: EnvironmentDefinition; height: HeightFn; density: number }) {
  const textures = useMemo(() => createRockTextures(), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: textures.diffuse, normalMap: textures.normal, color: "#8a6b55", roughness: 0.93, metalness: 0,
  }), [textures]);
  useEffect(() => () => {
    material.dispose();
    textures.diffuse.dispose();
    textures.normal.dispose();
  }, [material, textures]);
  return <RockField {...props} material={material} />;
}

export function Rocks(props: { def: EnvironmentDefinition; height: HeightFn; density: number }) {
  return <TexturedRocks {...props} />;
}
