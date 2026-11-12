import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";

/** Fine airborne dust drifting on the wind, lit by the sun. Cheap: one draw call. */
export function Dust({ count = 520, area = 40, height = 5 }: { count?: number; area?: number; height?: number }) {
  const { geometry, material, velocity } = useMemo(() => {
    const rand = mulberry32(42);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * area;
      pos[i * 3 + 1] = rand() * height;
      pos[i * 3 + 2] = (rand() - 0.5) * area;
      vel[i] = 0.25 + rand() * 0.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d")!;
    const grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, "rgba(255,235,210,1)");
    grd.addColorStop(1, "rgba(255,235,210,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.PointsMaterial({ size: 0.045, map: tex, transparent: true, opacity: 0.55, depthWrite: false, color: "#f2cfa8", sizeAttenuation: true });
    return { geometry: g, material: m, velocity: vel };
  }, [count, area, height]);

  useEffect(() => () => { geometry.dispose(); material.map?.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = geometry.attributes.position as THREE.BufferAttribute;
    const arr = p.array as Float32Array;
    const t = state.clock.elapsedTime;
    const half = area / 2;
    for (let i = 0; i < count; i++) {
      const v = velocity[i];
      arr[i * 3] += v * dt;
      arr[i * 3 + 1] += Math.sin(t * 0.7 + i) * 0.04 * dt;
      arr[i * 3 + 2] += v * 0.35 * dt;
      if (arr[i * 3] > half) arr[i * 3] -= area;
      if (arr[i * 3 + 2] > half) arr[i * 3 + 2] -= area;
    }
    p.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
