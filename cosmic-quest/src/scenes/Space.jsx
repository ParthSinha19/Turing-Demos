import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { save } from '../game/save.js';
import { glowTexture, planetTexture, ringGeometry, ringTexture } from './textures.js';

function rand(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function Stars({ count = 1600, radius = 140 }) {
  const low = save.use().low;
  const n = low ? Math.floor(count / 3) : count;
  const ref = useRef();
  const geo = useMemo(() => {
    const r = rand(7);
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const tints = [[1, 1, 1], [0.8, 0.9, 1], [1, 0.9, 0.7], [1, 0.8, 0.9]];
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1;
      const t = r() * Math.PI * 2;
      const rr = radius * (0.8 + r() * 0.3);
      const s = Math.sqrt(1 - u * u);
      pos.set([rr * s * Math.cos(t), rr * u, rr * s * Math.sin(t)], i * 3);
      col.set(tints[Math.floor(r() * 4)].map((v) => v * (0.5 + r() * 0.5)), i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [n, radius]);
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * 0.003));
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={1.4} sizeAttenuation vertexColors transparent depthWrite={false} fog={false} />
    </points>
  );
}

// Floating asteroid belt
export function Asteroids({ count = 70, inner = 12.2, outer = 13.8, spread = 0.7 }) {
  const low = save.use().low;
  const n = low ? Math.floor(count / 2) : count;
  const mesh = useRef();
  const grp = useRef();
  useEffect(() => {
    const r = rand(99);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const rad = inner + r() * (outer - inner);
      const s = 0.08 + r() * 0.2;
      q.setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
      m.compose(new THREE.Vector3(Math.cos(a) * rad, (r() - 0.5) * spread, Math.sin(a) * rad), q, new THREE.Vector3(s, s * (0.7 + r() * 0.5), s));
      mesh.current.setMatrixAt(i, m);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [n, inner, outer, spread]);
  useFrame((_, dt) => grp.current && (grp.current.rotation.y += dt * 0.02));
  return (
    <group ref={grp}>
      <instancedMesh ref={mesh} args={[null, null, n]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8d8478" roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
}

export function Glow({ color = '#ffcc66', size = 6, opacity = 0.8, ...p }) {
  const map = useMemo(() => glowTexture(), []);
  return (
    <sprite scale={[size, size, 1]} {...p}>
      <spriteMaterial map={map} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </sprite>
  );
}

// A textured planet sphere (used in backdrops and the map). Optional rings.
export function PlanetBall({ tex, radius = 1, rings = false, spinSpeed = 0.05, atmosphere, ...p }) {
  const low = save.use().low;
  const map = useMemo(() => planetTexture(tex), [tex]);
  const ref = useRef();
  const rg = useMemo(() => (rings ? ringGeometry(radius * 1.4, radius * 2.4, 96) : null), [rings, radius]);
  const rt = useMemo(() => (rings ? ringTexture() : null), [rings]);
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * spinSpeed));
  const seg = low ? 24 : 48;
  return (
    <group {...p}>
      <mesh ref={ref}>
        <sphereGeometry args={[radius, seg, seg / 2]} />
        <meshStandardMaterial map={map} roughness={0.85} />
      </mesh>
      {atmosphere && (
        <mesh scale={1.07}>
          <sphereGeometry args={[radius, 32, 16]} />
          <meshBasicMaterial color={atmosphere} transparent opacity={0.22} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      {rings && (
        <mesh rotation={[-Math.PI / 2 + 0.4, 0.15, 0]} geometry={rg}>
          <meshBasicMaterial map={rt} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// The little spaceship (nose points along +Z)
export function Ship({ innerRef, scale = 1 }) {
  const flame = useRef();
  useFrame((s) => flame.current && (flame.current.scale.y = 0.8 + Math.sin(s.clock.elapsedTime * 40) * 0.3));
  return (
    <group ref={innerRef} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.13, 0.4, 6, 12]} />
        <meshStandardMaterial color="#f2f5fb" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0.12]} scale={[1, 0.8, 1.6]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#4cc9f0" emissive="#2a9bd0" emissiveIntensity={0.7} roughness={0.1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 0, -0.15]} rotation={[0, 0, s * 0.3]} scale={[1, 0.12, 0.7]}>
          <boxGeometry args={[0.35, 1, 0.35]} />
          <meshStandardMaterial color="#ff6b4a" roughness={0.4} />
        </mesh>
      ))}
      <mesh ref={flame} position={[0, 0, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.3, 8]} />
        <meshBasicMaterial color="#ffb347" />
      </mesh>
    </group>
  );
}

// Soft floating dust for mission scenes
export function Dust({ count = 80, size = 16, color = '#ffffff', y = 4 }) {
  const low = save.use().low;
  const n = low ? count / 2 : count;
  const ref = useRef();
  const geo = useMemo(() => {
    const r = rand(5);
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set([(r() - 0.5) * size * 2, r() * y, (r() - 0.5) * size], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [n, size, y]);
  useFrame((s) => ref.current && (ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.3) * 0.3));
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.08} color={color} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}
