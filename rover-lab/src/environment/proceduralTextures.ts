import * as THREE from "three";
import { createNoise2D, mulberry32 } from "@/lib/random";

function makeTexture(seed: number, base: [number, number, number], roughness: number, size = 256) {
  const pixels = new Uint8Array(size * size * 4);
  const noise = createNoise2D(seed);
  const rand = mulberry32(seed * 17 + 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const broad = noise(u * 7, v * 7) * 0.5;
      const grain = noise(u * 43, v * 43) * 0.3;
      const fine = (rand() - 0.5) * 0.2;
      const n = 1 + (broad + grain + fine) * roughness;
      const i = (y * size + x) * 4;
      pixels[i] = Math.max(0, Math.min(255, base[0] * n));
      pixels[i + 1] = Math.max(0, Math.min(255, base[1] * n));
      pixels[i + 2] = Math.max(0, Math.min(255, base[2] * n));
      pixels[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function makeNormal(seed: number, size = 256) {
  const pixels = new Uint8Array(size * size * 4);
  const noise = createNoise2D(seed);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = noise(x / 23, y / 23);
      const ny = noise(x / 23 + 9, y / 23 - 7);
      const i = (y * size + x) * 4;
      pixels[i] = 128 + nx * 28;
      pixels[i + 1] = 128 + ny * 28;
      pixels[i + 2] = 248;
      pixels[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function createTerrainTextures() {
  return {
    diffuse: makeTexture(9, [111, 65, 45], 0.65),
    normal: makeNormal(17),
    sand: makeTexture(23, [166, 113, 77], 0.38),
  };
}

export function createRockTextures() {
  return {
    diffuse: makeTexture(31, [119, 92, 73], 0.85),
    normal: makeNormal(37),
  };
}
