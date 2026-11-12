import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { smoothstep } from "@/lib/random";
import { createTerrainTextures } from "./proceduralTextures";
import type { HeightFn } from "./terrainHeight";

const UV_TILE = 3.4; // metres per detail-texture tile

/** Grid that is dense near the rover and coarse at the horizon. */
function buildTerrainGeometry(height: HeightFn, extent: number, segments: number) {
  const n = segments + 1;
  const pos = new Float32Array(n * n * 3);
  const uv = new Float32Array(n * n * 2);
  const col = new Float32Array(n * n * 3);
  const a = 0.045; // share of linear spacing; the rest is quadratic
  const map = (u: number) => extent * (a * u + (1 - a) * u * Math.abs(u));
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = map((i / segments) * 2 - 1);
      const z = map((j / segments) * 2 - 1);
      const k = j * n + i;
      pos[k * 3] = x; pos[k * 3 + 1] = height(x, z); pos[k * 3 + 2] = z;
      uv[k * 2] = x / UV_TILE; uv[k * 2 + 1] = z / UV_TILE;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a0 = j * n + i, b0 = a0 + 1, c0 = a0 + n, d0 = c0 + 1;
      idx.push(a0, c0, b0, b0, c0, d0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();

  // Vertex colour: pale dust on flat ground, darker rust on slopes, dark basalt in steep places.
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  const dust = new THREE.Color("#d39a6a");
  const rust = new THREE.Color("#a8623d");
  const basalt = new THREE.Color("#5e3d2e");
  const c = new THREE.Color();
  for (let k = 0; k < n * n; k++) {
    const slope = 1 - nrm.getY(k);
    const x = pos[k * 3], y = pos[k * 3 + 1], z = pos[k * 3 + 2];
    const wobble = 0.5 + 0.5 * Math.sin(x * 0.07 + Math.sin(z * 0.05) * 2.0);
    c.copy(dust).lerp(rust, smoothstep(0.01, 0.09, slope) * 0.8 + wobble * 0.25);
    c.lerp(basalt, smoothstep(0.12, 0.4, slope) * 0.85 + smoothstep(-1, -5, y) * 0.3);
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return g;
}

function useTerrainGeometry(height: HeightFn, extent: number, segments: number) {
  const geo = useMemo(() => buildTerrainGeometry(height, extent, segments), [height, extent, segments]);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

function TexturedTerrain({ geometry }: { geometry: THREE.BufferGeometry }) {
  const textures = useMemo(() => createTerrainTextures(), []);
  const material = useMemo(() => {
    const { diffuse: map, normal, sand } = textures;
    const m = new THREE.MeshStandardMaterial({
      map, normalMap: normal, normalScale: new THREE.Vector2(0.85, 0.85),
      vertexColors: true, roughness: 0.96, metalness: 0,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.sandMap = { value: sand };
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <map_pars_fragment>", "#include <map_pars_fragment>\nuniform sampler2D sandMap;")
        .replace(
          "#include <map_fragment>",
          `#ifdef USE_MAP
            vec3 tA = texture2D(map, vMapUv).rgb;
            vec3 tB = texture2D(sandMap, vMapUv * 0.41 + 0.3).rgb;
            vec3 tM = texture2D(sandMap, vMapUv * 0.027).rgb;
            float lA = dot(tA, vec3(0.3333));
            vec3 detail = mix(tB, vec3(lA) * vec3(1.0, 0.92, 0.88), 0.45);
            float dist = length(vViewPosition);
            detail = mix(detail, vec3(1.0), smoothstep(25.0, 140.0, dist) * 0.55);
            float macro = mix(1.0, dot(tM, vec3(0.3333)), 0.55);
            diffuseColor.rgb *= clamp(detail * macro * 1.75, 0.0, 2.5);
          #endif`,
        );
    };
    return m;
  }, [textures]);
  useEffect(() => () => {
    material.dispose();
    textures.diffuse.dispose();
    textures.normal.dispose();
    textures.sand.dispose();
  }, [material, textures]);
  return <mesh geometry={geometry} material={material} receiveShadow />;
}

export function Terrain({ height, extent, segments }: { height: HeightFn; extent: number; segments: number }) {
  const geometry = useTerrainGeometry(height, extent, segments);
  return <TexturedTerrain geometry={geometry} />;
}
