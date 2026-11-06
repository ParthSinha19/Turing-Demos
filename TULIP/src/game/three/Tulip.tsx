import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "../state";

const WHITE = "#f4f1ea";
const TEAL = "#2bb5a8";
const DEEP = "#1d2a3a";
const PETAL = "#ff7a8a";

/** TULIP: procedural robot. Reads mood/upgrades/maze from the store each frame. */
export function Tulip({ tile = 1 }: { tile?: number }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const chest = useRef<THREE.MeshStandardMaterial>(null);
  const bud = useRef<THREE.MeshStandardMaterial>(null);
  const eyeMat = useRef<THREE.MeshBasicMaterial>(null);
  const upgrades = useGame((s) => s.upgrades);
  const has = (u: string) => upgrades.includes(u as never);

  useFrame((st, rawDt) => {
    if (!root.current || !body.current || !head.current || !eyeL.current || !eyeR.current || !lidL.current || !lidR.current || !mouth.current || !armL.current || !armR.current || !legL.current || !legR.current || !chest.current || !bud.current || !eyeMat.current) return;
    const dt = Math.min(rawDt, 0.05);
    const t = st.clock.elapsedTime;
    const g = useGame.getState();
    let mood = g.mood;
    if (g.moodUntil && Date.now() > g.moodUntil) mood = "idle";

    // Position: follow maze tile if a maze is active
    const maze = g.maze;
    let tx = 0,
      tz = 0,
      ry = 0;
    if (maze) {
      const w = (maze.map[0]?.length ?? 1);
      const h = maze.map.length;
      tx = (maze.x - (w - 1) / 2) * tile;
      tz = (maze.y - (h - 1) / 2) * tile;
      ry = -maze.dir * (Math.PI / 2) + Math.PI / 2;
    }
    const moving = maze && Math.hypot(root.current.position.x - tx, root.current.position.z - tz) > 0.05;
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, tx, 8, dt);
    root.current.position.z = THREE.MathUtils.damp(root.current.position.z, tz, 8, dt);
    // shortest-angle damp
    let d = ry - root.current.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    root.current.rotation.y += d * (1 - Math.exp(-10 * dt));
    if (!maze) root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, 0.25, 4, dt);

    const bumpAge = maze ? (Date.now() - maze.bump) / 1000 : 9;
    const walk = moving || mood === "walking";

    // Body motion by mood
    let bob = Math.sin(t * 2) * 0.03;
    let headTilt = 0,
      headLook = Math.sin(t * 0.7) * 0.25,
      headUp = 0,
      armSwing = Math.sin(t * 1.5) * 0.1,
      armUp = 0,
      spin = 0;
    if (mood === "asleep") {
      bob = Math.sin(t * 0.8) * 0.01 - 0.05;
      headUp = 0.35;
      headLook = 0;
    } else if (mood === "thinking") {
      headUp = -0.35;
      headLook = 0.2;
      armUp = 0.9;
    } else if (mood === "confused") {
      headTilt = 0.35 + Math.sin(t * 3) * 0.05;
      headLook = 0;
    } else if (mood === "happy") {
      bob = Math.abs(Math.sin(t * 7)) * 0.35;
      armUp = 2.4;
      armSwing = Math.sin(t * 14) * 0.3;
    } else if (mood === "victory") {
      bob = Math.abs(Math.sin(t * 6)) * 0.3;
      spin = t * 3;
      armUp = 2.6;
      armSwing = Math.sin(t * 12) * 0.5;
    } else if (mood === "sad") {
      bob = -0.06;
      headUp = 0.3;
      headLook = 0;
      armSwing = 0;
    } else if (mood === "learning") {
      bob = Math.sin(t * 4) * 0.05 + 0.08;
      headUp = -0.15;
    } else if (mood === "speaking") {
      headLook = Math.sin(t * 2) * 0.12;
      armSwing = Math.sin(t * 4) * 0.35;
      armUp = 0.4;
    }
    if (walk) {
      bob = Math.abs(Math.sin(t * 12)) * 0.08;
      armSwing = Math.sin(t * 12) * 0.6;
      headLook = 0;
    }
    if (bumpAge < 0.5) {
      body.current.position.z = -Math.sin(bumpAge * Math.PI * 2) * 0.15;
      headTilt = 0.4;
    } else body.current.position.z = 0;

    body.current.position.y = THREE.MathUtils.damp(body.current.position.y, bob, 12, dt);
    body.current.rotation.y = spin ? spin : THREE.MathUtils.damp(body.current.rotation.y % (Math.PI * 2), 0, 6, dt);
    head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, headTilt, 6, dt);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, headLook, 4, dt);
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, headUp, 5, dt);
    armL.current.rotation.z = THREE.MathUtils.damp(armL.current.rotation.z, -0.2 - armUp, 8, dt);
    armR.current.rotation.z = THREE.MathUtils.damp(armR.current.rotation.z, 0.2 + armUp, 8, dt);
    armL.current.rotation.x = armSwing;
    armR.current.rotation.x = -armSwing;
    const legSwing = walk ? Math.sin(t * 12) * 0.5 : 0;
    legL.current.rotation.x = legSwing;
    legR.current.rotation.x = -legSwing;

    // Eyes
    const blink = Math.sin(t * 1.3) > 0.985 ? 0.1 : 1;
    let ey = 1,
      ex = 1,
      lid = 0,
      eyeL_s = 1;
    if (mood === "asleep") ey = 0.12;
    else if (mood === "happy" || mood === "victory") {
      ey = 0.55;
      ex = 1.15;
    } else if (mood === "sad") lid = 0.5;
    else if (mood === "confused") eyeL_s = 0.65;
    else if (mood === "thinking") ey = 0.8;
    eyeL.current.scale.set(ex * eyeL_s, ey * blink * eyeL_s, 1);
    eyeR.current.scale.set(ex, ey * blink, 1);
    eyeL.current.position.y = mood === "thinking" ? 0.06 : 0.02;
    eyeR.current.position.y = eyeL.current.position.y;
    lidL.current.scale.y = THREE.MathUtils.damp(lidL.current.scale.y, lid + 0.001, 8, dt);
    lidR.current.scale.y = lidL.current.scale.y;
    lidL.current.rotation.z = 0.35;
    lidR.current.rotation.z = -0.35;
    const talk = mood === "speaking" ? 0.3 + Math.abs(Math.sin(t * 16)) * 0.9 : mood === "happy" || mood === "victory" ? 1 : 0.3;
    mouth.current.scale.y = THREE.MathUtils.damp(mouth.current.scale.y, talk, 20, dt);
    const asleep = mood === "asleep";
    eyeMat.current.color.set(asleep ? "#4b6b78" : mood === "sad" ? "#7fc8ff" : "#7ff7e8");

    // Glows
    const pulse = 0.5 + Math.sin(t * 3) * 0.5;
    chest.current.emissiveIntensity = asleep ? 0.1 : (mood === "learning" ? 2 + pulse * 2 : 0.8 + pulse * 0.6) * (has("energy") ? 1.5 : 0.7);
    bud.current.emissiveIntensity = asleep ? 0 : has("thinking") ? 0.8 + pulse * (mood === "thinking" || mood === "learning" ? 2 : 0.5) : 0.15;
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* legs */}
        <mesh ref={legL} position={[-0.17, 0.22, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 6, 12]} />
          <meshStandardMaterial color={DEEP} roughness={0.5} />
        </mesh>
        <mesh ref={legR} position={[0.17, 0.22, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 6, 12]} />
          <meshStandardMaterial color={DEEP} roughness={0.5} />
        </mesh>
        {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.06, 0.05]} castShadow>
            <sphereGeometry args={[0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={TEAL} roughness={0.35} />
          </mesh>
        ))}
        {/* body: egg shape */}
        <mesh position={[0, 0.72, 0]} scale={[1, 1.1, 0.9]} castShadow>
          <sphereGeometry args={[0.42, 32, 24]} />
          <meshPhysicalMaterial color={WHITE} roughness={0.25} clearcoat={1} clearcoatRoughness={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.37, 0.035, 12, 40]} />
          <meshStandardMaterial color={TEAL} roughness={0.3} />
        </mesh>
        {/* chest light */}
        <mesh position={[0, 0.74, 0.37]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial ref={chest} color="#9ffff1" emissive={TEAL} emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, 0.74, 0.365]}>
          <ringGeometry args={[0.1, 0.13, 32]} />
          <meshStandardMaterial color={DEEP} />
        </mesh>
        {/* backpack (navigation) */}
        {upgrades.includes("navigation") && (
          <group position={[0, 0.78, -0.38]}>
            <RoundedBox args={[0.34, 0.36, 0.14]} radius={0.06} castShadow>
              <meshStandardMaterial color="#f2b33d" roughness={0.4} />
            </RoundedBox>
            <mesh position={[0, 0.05, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.03, 20]} />
              <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.6} />
            </mesh>
          </group>
        )}
        {/* scarf (festival) */}
        {upgrades.includes("festival") && (
          <mesh position={[0, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.27, 0.07, 12, 32]} />
            <meshStandardMaterial color={PETAL} roughness={0.8} />
          </mesh>
        )}
        {/* arms */}
        <group ref={armL} position={[-0.42, 0.85, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.22, 6, 12]} />
            <meshStandardMaterial color={WHITE} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.36, 0]}>
            <sphereGeometry args={[0.085, 16, 12]} />
            <meshStandardMaterial color={TEAL} roughness={0.35} />
          </mesh>
        </group>
        <group ref={armR} position={[0.42, 0.85, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.22, 6, 12]} />
            <meshStandardMaterial color={WHITE} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.36, 0]}>
            <sphereGeometry args={[0.085, 16, 12]} />
            <meshStandardMaterial color={TEAL} roughness={0.35} />
          </mesh>
        </group>
        {/* head */}
        <group ref={head} position={[0, 1.38, 0]}>
          <RoundedBox args={[0.92, 0.7, 0.72]} radius={0.28} smoothness={6} castShadow>
            <meshPhysicalMaterial color={WHITE} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
          </RoundedBox>
          {/* face screen */}
          <RoundedBox args={[0.74, 0.48, 0.1]} radius={0.2} smoothness={6} position={[0, 0, 0.32]}>
            <meshPhysicalMaterial color="#14202e" roughness={0.1} clearcoat={1} />
          </RoundedBox>
          <group position={[0, 0, 0.385]}>
            <mesh ref={eyeL} position={[-0.16, 0.02, 0]}>
              <circleGeometry args={[0.085, 32]} />
              <meshBasicMaterial ref={eyeMat} color="#7ff7e8" toneMapped={false} />
            </mesh>
            <mesh ref={eyeR} position={[0.16, 0.02, 0]}>
              <circleGeometry args={[0.085, 32]} />
              <meshBasicMaterial color="#7ff7e8" toneMapped={false} />
            </mesh>
            <mesh ref={lidL} position={[-0.16, 0.1, 0.002]} scale={[1, 0.001, 1]}>
              <planeGeometry args={[0.24, 0.2]} />
              <meshBasicMaterial color="#14202e" />
            </mesh>
            <mesh ref={lidR} position={[0.16, 0.1, 0.002]} scale={[1, 0.001, 1]}>
              <planeGeometry args={[0.24, 0.2]} />
              <meshBasicMaterial color="#14202e" />
            </mesh>
            <mesh ref={mouth} position={[0, -0.13, 0]}>
              <planeGeometry args={[0.14, 0.04]} />
              <meshBasicMaterial color={upgrades.includes("voice") ? "#ffd27f" : "#7ff7e8"} toneMapped={false} />
            </mesh>
            {/* cheeks */}
            {[-0.27, 0.27].map((x) => (
              <mesh key={x} position={[x, -0.08, 0]}>
                <circleGeometry args={[0.035, 16]} />
                <meshBasicMaterial color={PETAL} transparent opacity={0.7} />
              </mesh>
            ))}
          </group>
          {/* vision visor */}
          {upgrades.includes("vision") && (
            <mesh position={[0, 0.28, 0.2]} rotation={[0.3, 0, 0]}>
              <torusGeometry args={[0.3, 0.025, 8, 40, Math.PI]} />
              <meshStandardMaterial color="#8a7dff" emissive="#8a7dff" emissiveIntensity={0.8} />
            </mesh>
          )}
          {/* ears / language dishes */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.47, 0, 0]} rotation={[0, 0, (s * Math.PI) / 2]}>
              <mesh>
                <cylinderGeometry args={[0.12, 0.12, 0.06, 24]} />
                <meshStandardMaterial color={TEAL} roughness={0.3} />
              </mesh>
              {upgrades.includes("language") && (
                <mesh position={[0, -s * 0.06, 0]}>
                  <coneGeometry args={[0.16, 0.08, 24, 1, true]} />
                  <meshStandardMaterial color="#f2b33d" side={THREE.DoubleSide} metalness={0.3} roughness={0.3} />
                </mesh>
              )}
            </group>
          ))}
          {/* antenna with tulip bud: signature silhouette */}
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.28, 8]} />
            <meshStandardMaterial color="#5fae5a" />
          </mesh>
          <mesh position={[0.07, 0.45, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.4, 0.6]}>
            <sphereGeometry args={[0.07, 12, 8]} />
            <meshStandardMaterial color="#5fae5a" />
          </mesh>
          <group position={[0, 0.66, 0]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[Math.cos((i * Math.PI * 2) / 3) * 0.35, 0, Math.sin((i * Math.PI * 2) / 3) * 0.35]} position={[Math.sin((i * Math.PI * 2) / 3) * 0.04, 0, Math.cos((i * Math.PI * 2) / 3) * 0.04]} scale={[0.75, 1.25, 0.75]}>
                <sphereGeometry args={[0.085, 16, 12]} />
                <meshStandardMaterial {...(i === 0 ? { ref: bud } : {})} color={PETAL} emissive={PETAL} emissiveIntensity={0.3} roughness={0.4} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
