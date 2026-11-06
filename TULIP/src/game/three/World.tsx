import { useMemo, useRef } from "react";
import type React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "../state";
import { find } from "../maze";

export const ENV = [
  { name: "lab", bg: "#cfe9ec", floor: "#e9eef0", accent: "#2bb5a8", fog: [8, 26] },
  { name: "decision", bg: "#ffe1c2", floor: "#f6e3cf", accent: "#ff8a4c", fog: [8, 26] },
  { name: "garden", bg: "#bfe6ff", floor: "#8fd16a", accent: "#5fae5a", fog: [10, 30] },
  { name: "vision", bg: "#e2dcff", floor: "#ece8fb", accent: "#8a7dff", fog: [8, 26] },
  { name: "town", bg: "#ffd9c9", floor: "#efd6c2", accent: "#ff7a8a", fog: [10, 32] },
  { name: "studio", bg: "#2b2f4a", floor: "#3a3f63", accent: "#ffd27f", fog: [6, 22] },
  { name: "festival", bg: "#ffcfa3", floor: "#f3c48d", accent: "#ff7a8a", fog: [12, 36] },
] as const;

const CAM: Record<"default" | "menu" | "maze", [number, number, number, number, number, number]> = {
  default: [-1.4, 2.0, 4.6, 1.15, 1.0, 0],
  menu: [-0.2, 1.7, 4.2, 0.9, 1.05, 0],
  maze: [5.0, 13.5, 7.4, 5.0, 0, 0.2],
};

export function CameraRig({ mode }: { mode: "menu" | "default" | "maze" }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1, 0));
  useFrame((st, dt) => {
    const d = Math.min(dt, 0.05);
    const c = CAM[mode];
    const sway = Math.sin(st.clock.elapsedTime * 0.2) * 0.15;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, c[0] + sway, 2, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, c[1], 2, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, c[2], 2, d);
    look.current.x = THREE.MathUtils.damp(look.current.x, c[3], 2, d);
    look.current.y = THREE.MathUtils.damp(look.current.y, c[4], 2, d);
    look.current.z = THREE.MathUtils.damp(look.current.z, c[5], 2, d);
    camera.lookAt(look.current);
  });
  return null;
}

function Tree({ p, s = 1, c = "#4f9e4a" }: { p: [number, number, number]; s?: number; c?: string }) {
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#8a5a3b" />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color={c} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.25, 1.45, 0.1]} castShadow>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color={c} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

export function Person({ p, shirt, skin = "#e0a882", hair = "#3b2a20", r = 0, wave = false }: { p: [number, number, number]; shirt: string; skin?: string; hair?: string; r?: number; wave?: boolean }) {
  const arm = useRef<THREE.Group>(null);
  const g = useRef<THREE.Group>(null);
  const off = useMemo(() => Math.random() * 10, []);
  useFrame((st) => {
    const t = st.clock.elapsedTime + off;
    if (!g.current) return;
    g.current.position.y = Math.abs(Math.sin(t * 2)) * 0.04;
    if (arm.current) arm.current.rotation.z = wave ? 2.4 + Math.sin(t * 8) * 0.4 : 0.15;
  });
  return (
    <group position={p} rotation={[0, r, 0]}>
      <group ref={g}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.5, 6, 14]} />
          <meshStandardMaterial color={shirt} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <sphereGeometry args={[0.2, 20, 16]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.27, -0.03]} scale={[1.05, 0.75, 1.05]}>
          <sphereGeometry args={[0.2, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 1.2, 0.18]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#1d2a3a" />
          </mesh>
        ))}
        <group ref={arm} position={[0.24, 0.8, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.06, 0.28, 4, 8]} />
            <meshStandardMaterial color={shirt} roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function MiniBot({ p, c = "#f2b33d" }: { p: [number, number, number]; c?: string }) {
  return (
    <Float speed={3} floatIntensity={0.4} rotationIntensity={0.2}>
      <group position={p}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.28, 20, 16]} />
          <meshPhysicalMaterial color={c} roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.38, 0.24]}>
          <boxGeometry args={[0.28, 0.1, 0.05]} />
          <meshBasicMaterial color="#14202e" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ff7a8a" emissive="#ff7a8a" emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
}

function Lab() {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.08, 48]} />
        <meshStandardMaterial color="#d5dde0" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.85, 48]} />
        <meshStandardMaterial color="#2bb5a8" emissive="#2bb5a8" emissiveIntensity={1.2} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 3.2, 0, -2.5]}>
          <RoundedBox args={[1.6, 2.6, 0.5]} radius={0.15} position={[0, 1.3, 0]} castShadow>
            <meshStandardMaterial color="#f4f1ea" />
          </RoundedBox>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.7 + i * 0.6, 0.26]}>
              <planeGeometry args={[1.2, 0.35]} />
              <meshStandardMaterial color="#1d2a3a" emissive={i === 1 ? "#2bb5a8" : "#355"} emissiveIntensity={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {[-1.6, 0, 1.6].map((x, i) => (
        <mesh key={x} position={[x, 1.8, -3.4]}>
          <cylinderGeometry args={[0.25, 0.25, 3.6, 20]} />
          <meshPhysicalMaterial color={(["#9ffff1", "#ffd27f", "#ff9aa8"][i] ?? ENV[0].accent)} transmission={0.6} roughness={0.1} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Decision() {
  const rings = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (rings.current) rings.current.rotation.y += Math.min(dt, 0.05) * 0.4; });
  return (
    <group>
      <group ref={rings} position={[0, 2.6, -1.5]}>
        {[1.2, 1.6, 2].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2 + i * 0.4, i * 0.6, 0]}>
            <torusGeometry args={[r, 0.02, 8, 64]} />
            <meshStandardMaterial color="#ff8a4c" emissive="#ff8a4c" emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, 0, -1.6]}>
          <RoundedBox args={[1.4, 1, 0.9]} radius={0.12} position={[0, 0.5, 0]} castShadow>
            <meshStandardMaterial color="#f4f1ea" />
          </RoundedBox>
          <mesh position={[0, 1.02, 0.1]} rotation={[-0.7, 0, 0]}>
            <planeGeometry args={[1.1, 0.6]} />
            <meshStandardMaterial color="#1d2a3a" emissive="#ff8a4c" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
      <Float speed={2} position={[1.8, 1.4, -0.6]}>
        <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.06} castShadow>
          <meshStandardMaterial color="#ff7a8a" />
        </RoundedBox>
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.12, 0.04, 8, 20]} />
          <meshStandardMaterial color="#ffd27f" />
        </mesh>
      </Float>
    </group>
  );
}

function Garden() {
  const maze = useGame((s) => s.maze);
  const map = maze?.map;
  const tiles = useMemo(() => {
    if (!map) return [];
    const w = (map[0]?.length ?? 1),
      h = map.length;
    const out: { x: number; z: number; ch: string }[] = [];
    map.forEach((row, y) => row.split("").forEach((ch, x) => out.push({ x: x - (w - 1) / 2, z: y - (h - 1) / 2, ch })));
    return out;
  }, [map]);
  const goal = map ? find(map, "G") : null;
  const w = map?.[0]?.length ?? 1,
    h = map?.length ?? 1;
  return (
    <group>
      {tiles.map((t, i) => {
        const revealed = maze?.revealed;
        if (t.ch === "#") {
          return revealed ? (
            <group key={i} position={[t.x, 0, t.z]}>
              <mesh position={[0, 0.35, 0]} castShadow>
                <icosahedronGeometry args={[0.48, 1]} />
                <meshStandardMaterial color="#3f8a46" flatShading roughness={0.8} />
              </mesh>
            </group>
          ) : (
            <mesh key={i} position={[t.x, 0.25, t.z]}>
              <boxGeometry args={[0.98, 0.5, 0.98]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
            </mesh>
          );
        }
        const special = t.ch === "S" || t.ch === "G";
        if (!revealed && !special)
          return (
            <mesh key={i} position={[t.x, 0.25, t.z]}>
              <boxGeometry args={[0.98, 0.5, 0.98]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.55} />
            </mesh>
          );
        return (
          <mesh key={i} position={[t.x, 0.03, t.z]} receiveShadow>
            <boxGeometry args={[0.94, 0.06, 0.94]} />
            <meshStandardMaterial color={t.ch === "G" ? "#ffd27f" : t.ch === "S" ? "#9ffff1" : "#e9d3a6"} roughness={0.9} />
          </mesh>
        );
      })}
      {maze?.ghost.map(([gx, gy], i) => (
        <mesh key={"g" + i} position={[gx - (w - 1) / 2, 0.1, gy - (h - 1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 20]} />
          <meshBasicMaterial color="#2bb5a8" transparent opacity={0.8} />
        </mesh>
      ))}
      {goal && <MiniBot p={[goal.x - (w - 1) / 2, 0.1, goal.y - (h - 1) / 2 - 0.05]} />}
      <Tree p={[-4.5, 0, -2.5]} s={1.3} />
      <Tree p={[4.6, 0, -2.2]} s={1.1} c="#6bb84f" />
      <Tree p={[-5.2, 0, 1.2]} />
      <Tree p={[5.3, 0, 1.8]} s={1.2} c="#3f8a46" />
      <Tree p={[0.5, 0, -4.2]} s={1.5} c="#6bb84f" />
      {Array.from({ length: 30 }).map((_, i) => {
        const a = i * 2.4,
          r = 4 + (i % 5) * 0.7;
        return (
          <mesh key={"f" + i} position={[Math.cos(a) * r, 0.12, Math.sin(a) * r * 0.6]}>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshStandardMaterial color={(["#ff7a8a", "#ffd27f", "#ffffff", "#8a7dff"][i % 4] ?? ENV[0].accent)} />
          </mesh>
        );
      })}
    </group>
  );
}

function Vision() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += Math.min(dt, 0.05) * 0.3; });
  const objs: [string, React.ReactElement][] = [
    ["#e8443a", <sphereGeometry key="a" args={[0.22, 20, 16]} />],
    ["#ffffff", <icosahedronGeometry key="b" args={[0.22, 1]} />],
    ["#2b7bd6", <boxGeometry key="c" args={[0.4, 0.2, 0.25]} />],
    ["#ffd27f", <torusKnotGeometry key="d" args={[0.14, 0.05, 60, 8]} />],
    ["#5fae5a", <coneGeometry key="e" args={[0.18, 0.4, 16]} />],
  ];
  return (
    <group>
      <group ref={g} position={[0.3, 2.2, -1.6]}>
        {objs.map(([c, geo], i) => {
          const a = (i / objs.length) * Math.PI * 2;
          return (
            <Float key={i} speed={2} floatIntensity={0.6}>
              <mesh position={[Math.cos(a) * 1.8, Math.sin(i) * 0.3, Math.sin(a) * 1.8]} castShadow>
                {geo}
                <meshStandardMaterial color={c} roughness={0.4} />
              </mesh>
            </Float>
          );
        })}
      </group>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.95, 48]} />
        <meshStandardMaterial color="#8a7dff" emissive="#8a7dff" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 2.4, 40, 1, true]} />
        <meshBasicMaterial color="#8a7dff" transparent opacity={0.07} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function House({ p, c, h = 2.2 }: { p: [number, number, number]; c: string; h?: number }) {
  return (
    <group position={p}>
      <RoundedBox args={[1.8, h, 1.6]} radius={0.12} position={[0, h / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={c} roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, h + 0.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.35, 0.8, 4]} />
        <meshStandardMaterial color="#c85a4a" roughness={0.8} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, h * 0.62, 0.81]}>
          <planeGeometry args={[0.4, 0.45]} />
          <meshStandardMaterial color="#ffe9a8" emissive="#ffd27f" emissiveIntensity={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.4, 0.81]}>
        <planeGeometry args={[0.45, 0.8]} />
        <meshStandardMaterial color="#6b4a3a" />
      </mesh>
    </group>
  );
}

function Town() {
  return (
    <group>
      <House p={[-3.8, 0, -3]} c="#ffe3b3" />
      <House p={[-1.5, 0, -4]} c="#bfe6e0" h={2.8} />
      <House p={[1.2, 0, -4.2]} c="#ffd0d6" h={2.4} />
      <House p={[3.8, 0, -3]} c="#d9d2ff" />
      <group position={[2.6, 0, -0.8]}>
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[0.8, 0.9, 0.4, 32]} />
          <meshStandardMaterial color="#d8cfc4" />
        </mesh>
        <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 32]} />
          <meshStandardMaterial color="#6ec6e6" roughness={0.1} />
        </mesh>
        <Sparkles count={20} scale={[1, 1.2, 1]} position={[0, 0.9, 0]} color="#bfefff" size={3} />
      </group>
      <Person p={[1.6, 0, 0.6]} shirt="#ff8a4c" r={-0.6} />
      <Person p={[-2.4, 0, -1]} shirt="#5a7bd6" hair="#d9a441" skin="#f1c7a5" r={0.5} />
    </group>
  );
}

function Studio() {
  const g = useRef<THREE.Group>(null);
  useFrame((st) => { if (g.current) g.current.position.y = Math.sin(st.clock.elapsedTime) * 0.1; });
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.2, 48]} />
        <meshStandardMaterial color="#4a4f7a" />
      </mesh>
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.25, 1.35, 48]} />
        <meshStandardMaterial color="#ffd27f" emissive="#ffd27f" emissiveIntensity={1.5} />
      </mesh>
      <group ref={g}>
        {[
          [-2.4, 2.4, -1.5, "#ff7a8a"],
          [2.8, 2.8, -1.8, "#2bb5a8"],
          [0.6, 3.2, -2.6, "#ffd27f"],
        ].map(([x, y, z, c], i) => (
          <Float key={i} speed={2} rotationIntensity={0.3}>
            <group position={[x as number, y as number, z as number]}>
              <RoundedBox args={[1.2, 0.7, 0.15]} radius={0.07}>
                <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.4} />
              </RoundedBox>
              <mesh position={[-0.3, -0.45, 0]} rotation={[0, 0, 0.6]}>
                <coneGeometry args={[0.12, 0.3, 3]} />
                <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.4} />
              </mesh>
            </group>
          </Float>
        ))}
      </group>
      <spotLight position={[0, 6, 2]} angle={0.4} penumbra={0.6} intensity={60} color="#fff2d0" castShadow />
    </group>
  );
}

function Balloon({ p, c }: { p: [number, number, number]; c: string }) {
  return (
    <Float speed={1.5} floatIntensity={1.2}>
      <group position={p}>
        <mesh scale={[1, 1.2, 1]} castShadow>
          <sphereGeometry args={[0.28, 20, 16]} />
          <meshPhysicalMaterial color={c} roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 1, 4]} />
          <meshBasicMaterial color="#555" />
        </mesh>
      </group>
    </Float>
  );
}

function Stall({ p, c, label }: { p: [number, number, number]; c: string; label: string }) {
  return (
    <group position={p}>
      <RoundedBox args={[1.4, 0.9, 0.8]} radius={0.08} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#f4f1ea" />
      </RoundedBox>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 1.2, 0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} />
          <meshStandardMaterial color="#8a5a3b" />
        </mesh>
      ))}
      <mesh position={[0, 1.95, 0.2]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 1.1]} />
        <meshStandardMaterial color={c} />
      </mesh>
      <mesh position={[0, 0.55, 0.41]}>
        <planeGeometry args={[1, 0.35]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Festival() {
  const memories = useGame((s) => s.memories);
  const raining = memories.includes("festival-rain-now");
  return (
    <group>
      <Stall p={[-3.4, 0, -2.6]} c="#ff7a8a" label="FOOD" />
      <Stall p={[-1.2, 0, -3.4]} c="#2bb5a8" label="GAMES" />
      <Stall p={[1.3, 0, -3.4]} c="#ffd27f" label="MUSIC" />
      <Stall p={[3.6, 0, -2.6]} c="#8a7dff" label="BOOKS" />
      {Array.from({ length: 14 }).map((_, i) => (
        <Balloon key={i} p={[-5 + (i % 7) * 1.7, 2.6 + (i % 3) * 0.5, -1.5 - Math.floor(i / 7) * 2.5]} c={(["#ff7a8a", "#ffd27f", "#2bb5a8", "#8a7dff", "#ff8a4c"][i % 5] ?? ENV[0].accent)} />
      ))}
      {/* bunting */}
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={"b" + i} position={[-4 + i * 0.55, 3.3 - Math.sin((i / 15) * Math.PI) * 0.4, -1.2]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.14, 0.32, 3]} />
          <meshStandardMaterial color={(["#ff7a8a", "#ffd27f", "#2bb5a8", "#8a7dff"][i % 4] ?? ENV[0].accent)} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Person p={[2.2, 0, 0.3]} shirt="#ff8a4c" r={-0.7} wave />
      <Person p={[-2.8, 0, -0.6]} shirt="#5a7bd6" hair="#d9a441" skin="#f1c7a5" r={0.6} />
      <Person p={[3.4, 0, -1.2]} shirt="#5fae5a" skin="#8d5a3b" hair="#1a1a1a" r={-0.4} wave />
      <MiniBot p={[-1.6, 0, 0.4]} c="#8a7dff" />
      <MiniBot p={[1.2, 0, -1.4]} c="#ff7a8a" />
      <Sparkles count={60} scale={[12, 5, 6]} position={[0, 2.5, -1]} color="#fff3c4" size={4} speed={0.3} />
      {raining && <Sparkles count={300} scale={[12, 6, 6]} position={[0, 3, 0]} color="#9fd4ff" size={2} speed={3} noise={0} />}
    </group>
  );
}

export function World({ env }: { env: number }) {
  const e = ENV[env] ?? ENV[0];
  return (
    <>
      <color attach="background" args={[e.bg]} />
      <fog attach="fog" args={[e.bg, e.fog[0], e.fog[1]]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color={e.floor} roughness={0.9} />
      </mesh>
      {env === 0 && <Lab />}
      {env === 1 && <Decision />}
      {env === 2 && <Garden />}
      {env === 3 && <Vision />}
      {env === 4 && <Town />}
      {env === 5 && <Studio />}
      {env === 6 && <Festival />}
      <Sparkles count={30} scale={[10, 4, 6]} position={[0, 2, -1]} color={e.accent} size={3} speed={0.2} />
    </>
  );
}
