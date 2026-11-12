/**
 * Pooled rover materials. Created once and shared by every part so swapping components
 * never recompiles shaders (no hitch when a student installs a part).
 */
import * as THREE from "three";

export type MatKey =
  | "body" | "bodyDouble" | "bodyDark" | "deck" | "alu" | "wheelAlu" | "darkMetal" | "gold" | "black"
  | "glass" | "cable" | "bandStandard" | "bandTorque" | "bandSpeed" | "lens" | "lamp";

let pool: Record<MatKey, THREE.MeshStandardMaterial> | null = null;

function grainTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const img = g.createImageData(128, 128);
  let s = 1234567;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 16807) % 2147483647;
    const v = 200 + ((s / 2147483647) * 55) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

export function getRoverMaterials() {
  if (pool) return pool;
  const grain = grainTexture();
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  pool = {
    body: std({ color: "#d9d5cc", roughness: 0.62, metalness: 0.08, roughnessMap: grain }),
    bodyDouble: std({ color: "#dedad2", roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide }),
    bodyDark: std({ color: "#8d8a84", roughness: 0.6, metalness: 0.15 }),
    deck: std({ color: "#3b3d40", roughness: 0.72, metalness: 0.25, roughnessMap: grain }),
    alu: std({ color: "#b8bbbf", roughness: 0.34, metalness: 0.85 }),
    wheelAlu: std({ color: "#a9adb2", roughness: 0.42, metalness: 0.8, side: THREE.DoubleSide }),
    darkMetal: std({ color: "#2e3033", roughness: 0.45, metalness: 0.6 }),
    gold: std({ color: "#c9973d", roughness: 0.32, metalness: 1, roughnessMap: grain }),
    black: std({ color: "#151617", roughness: 0.55, metalness: 0.2 }),
    glass: std({ color: "#0a121c", roughness: 0.06, metalness: 0.4 }),
    cable: std({ color: "#202020", roughness: 0.85, metalness: 0 }),
    bandStandard: std({ color: "#e8e6e1", roughness: 0.5, metalness: 0.1 }),
    bandTorque: std({ color: "#d9822b", roughness: 0.5, metalness: 0.1 }),
    bandSpeed: std({ color: "#3f7fb5", roughness: 0.5, metalness: 0.1 }),
    lens: std({ color: "#1b2a3a", roughness: 0.04, metalness: 0.6 }),
    lamp: std({ color: "#3a3a3a", emissive: "#ffd9a0", emissiveIntensity: 1.6, roughness: 0.4 }),
  };
  return pool;
}
