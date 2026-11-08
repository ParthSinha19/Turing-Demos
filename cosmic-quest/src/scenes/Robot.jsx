import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTES, save } from '../game/save.js';
import { createStore } from '../game/mini.js';

// Shared "mood" so any screen can make the player's robot wave, cheer or wobble.
export const mood = createStore({ kind: 'idle' });
let moodTimer;
export function react(kind, ms = 1800) {
  mood.set({ kind });
  clearTimeout(moodTimer);
  if (kind !== 'idle') moodTimer = setTimeout(() => mood.set({ kind: 'idle' }), ms);
}

const DIM = {
  round: { w: 0.62, h: 1.2 },
  square: { w: 0.58, h: 1.0 },
  compact: { w: 0.74, h: 0.85 },
  tall: { w: 0.44, h: 1.55 },
};
const HEAD_H = { dome: 0.54, visor: 0.43, antenna: 0.52, screen: 0.48 };
const FACE_Z = { dome: 0.63, visor: 0.54, antenna: 0.6, screen: 0.35 };
const lerp = (a, b, t) => a + (b - a) * Math.min(1, t);

const eyeMat = new THREE.MeshStandardMaterial({ color: '#c9f6ff', emissive: '#7ae7ff', emissiveIntensity: 1.6, toneMapped: false });
const darkMat = new THREE.MeshStandardMaterial({ color: '#0d1830', roughness: 0.25, metalness: 0.4 });
const glowBlue = new THREE.MeshStandardMaterial({ color: '#58c8ff', emissive: '#2fb4ff', emissiveIntensity: 1.8, toneMapped: false });
const glowAmber = new THREE.MeshStandardMaterial({ color: '#ffd166', emissive: '#ffb703', emissiveIntensity: 1.6, toneMapped: false });
const glowTeal = new THREE.MeshStandardMaterial({ color: '#7dfcd8', emissive: '#2ee6b6', emissiveIntensity: 1.8, toneMapped: false, transparent: true, opacity: 0.85 });
const glowPurple = new THREE.MeshStandardMaterial({ color: '#c9a6ff', emissive: '#9b5de5', emissiveIntensity: 1.8, toneMapped: false });
const flameMat = new THREE.MeshBasicMaterial({ color: '#ffb347' });

function Eye({ style }) {
  if (style === 'square') return <mesh material={eyeMat}><boxGeometry args={[0.17, 0.17, 0.05]} /></mesh>;
  if (style === 'wide') return <mesh material={eyeMat} scale={[1, 1.5, 0.5]}><sphereGeometry args={[0.085, 16, 12]} /></mesh>;
  if (style === 'happy')
    return (
      <mesh material={eyeMat} position={[0, -0.03, 0]}>
        <torusGeometry args={[0.085, 0.03, 8, 16, Math.PI]} />
      </mesh>
    );
  return <mesh material={eyeMat} scale={[1, 1, 0.55]}><sphereGeometry args={[0.095, 16, 12]} /></mesh>;
}

function Head({ type, matA, matB }) {
  if (type === 'visor')
    return (
      <>
        <RoundedBox args={[1.15, 0.85, 0.9]} radius={0.25} smoothness={4} material={matA} />
        <RoundedBox args={[1.0, 0.42, 0.12]} radius={0.08} position={[0, 0.02, 0.46]} material={darkMat} />
        <mesh position={[0, 0.5, 0]} material={matB}><boxGeometry args={[0.5, 0.06, 0.5]} /></mesh>
      </>
    );
  if (type === 'screen')
    return (
      <>
        <RoundedBox args={[1.2, 0.95, 0.6]} radius={0.12} smoothness={4} material={matA} />
        <RoundedBox args={[1.0, 0.72, 0.06]} radius={0.04} position={[0, 0, 0.3]} material={darkMat} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.63, 0, 0]} material={matB}><cylinderGeometry args={[0.1, 0.1, 0.12, 12]} /><meshStandardMaterial color={matB.color} /></mesh>
        ))}
      </>
    );
  if (type === 'antenna')
    return (
      <>
        <mesh scale={[1, 0.95, 1]} material={matA}><sphereGeometry args={[0.55, 24, 18]} /></mesh>
        <mesh position={[0, 0.02, 0.4]} scale={[0.85, 0.58, 0.32]} material={darkMat}><sphereGeometry args={[0.55, 20, 14]} /></mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.5, 0.2, 0]} rotation={[0, 0, -s * 0.5]}>
            <mesh position={[0, 0.2, 0]} material={matB}><cylinderGeometry args={[0.025, 0.025, 0.4, 8]} /></mesh>
            <mesh position={[0, 0.42, 0]} material={glowAmber}><sphereGeometry args={[0.06, 10, 8]} /></mesh>
          </group>
        ))}
      </>
    );
  return (
    <>
      <mesh scale={[1, 0.9, 0.95]} material={matA}><sphereGeometry args={[0.6, 24, 18]} /></mesh>
      <mesh position={[0, 0.02, 0.43]} scale={[0.95, 0.5, 0.36]} material={darkMat}><sphereGeometry args={[0.6, 20, 14]} /></mesh>
    </>
  );
}

function TopAntenna({ type, matB }) {
  if (type === 'none') return null;
  return (
    <group>
      <mesh position={[0, 0.17, 0]} material={matB}><cylinderGeometry args={[0.03, 0.03, 0.34, 8]} /></mesh>
      {type === 'stick' && <mesh position={[0, 0.36, 0]} material={glowAmber}><sphereGeometry args={[0.07, 12, 10]} /></mesh>}
      {type === 'bulb' && <mesh position={[0, 0.42, 0]} material={glowTeal}><sphereGeometry args={[0.15, 16, 12]} /></mesh>}
      {type === 'dish' && (
        <mesh position={[0, 0.4, 0]} rotation={[-0.5, 0, 0]} material={matB}>
          <coneGeometry args={[0.2, 0.14, 16, 1, true]} />
          <meshStandardMaterial color={matB.color} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function Robot({ cfg, done = {}, force, ...rest }) {
  const pal = PALETTES[cfg.palette] || PALETTES[0];
  const matA = useMemo(() => new THREE.MeshStandardMaterial({ color: pal.c1, roughness: 0.35, metalness: 0.25 }), [pal.c1]);
  const matB = useMemo(() => new THREE.MeshStandardMaterial({ color: pal.c2, roughness: 0.4, metalness: 0.3 }), [pal.c2]);
  const d = DIM[cfg.body] || DIM.round;
  const hh = HEAD_H[cfg.head] || 0.54;
  const faceZ = FACE_Z[cfg.head] || 0.6;
  const wheels = !!done.mars;
  const footH = wheels ? 0.3 : 0.22;
  const bodyY = footH + d.h / 2;
  const headY = footH + d.h + hh * 0.78;
  const acc = cfg.accessories || [];

  const root = useRef();
  const spin = useRef();
  const head = useRef();
  const eyes = useRef();
  const armL = useRef();
  const armR = useRef();
  const wingL = useRef();
  const wingR = useRef();
  const flame = useRef();
  const radar = useRef();
  const decision = useRef();
  const holo = useRef();
  const lens = useRef();
  const wheelRefs = useRef([]);

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    const m = force || mood.get().kind;
    if (!root.current) return;
    root.current.position.y = m === 'celebrate' ? Math.abs(Math.sin(t * 7)) * 0.45 : Math.sin(t * 2) * 0.035;
    spin.current.rotation.y = lerp(spin.current.rotation.y, m === 'celebrate' ? Math.sin(t * 4) * 0.7 : 0, dt * 6);
    spin.current.rotation.z = lerp(spin.current.rotation.z, m === 'oops' ? Math.sin(t * 22) * 0.06 : 0, dt * 10);
    const look = m === 'oops' ? Math.sin(t * 26) * 0.35 : Math.sin(t * 0.7) * 0.45 * Math.max(0, Math.sin(t * 0.23));
    head.current.rotation.y = lerp(head.current.rotation.y, look, dt * 8);
    head.current.rotation.z = lerp(head.current.rotation.z, m === 'oops' ? 0.12 : 0, dt * 6);
    const aL = m === 'celebrate' ? -2.6 + Math.sin(t * 12) * 0.25 : -0.18 + Math.sin(t * 2) * 0.04;
    const aR = m === 'wave' ? 2.3 + Math.sin(t * 11) * 0.45 : m === 'celebrate' ? 2.6 - Math.sin(t * 12) * 0.25 : 0.18 - Math.sin(t * 2) * 0.04;
    armL.current.rotation.z = lerp(armL.current.rotation.z, aL, dt * 10);
    armR.current.rotation.z = lerp(armR.current.rotation.z, aR, dt * 10);
    const blink = t % 3.6 < 0.13 ? 0.08 : 1;
    eyes.current.scale.y = lerp(eyes.current.scale.y, m === 'oops' ? 0.55 : blink, dt * 30);
    if (wingL.current) {
      const f = Math.sin(t * (m === 'celebrate' ? 14 : 3)) * 0.25;
      wingL.current.rotation.y = 0.7 + f;
      wingR.current.rotation.y = -0.7 - f;
    }
    if (flame.current) flame.current.scale.y = 0.8 + Math.sin(t * 40) * 0.3;
    if (radar.current) radar.current.rotation.y += dt * 2;
    if (decision.current) {
      decision.current.rotation.y += dt * 1.6;
      decision.current.rotation.x += dt * 0.9;
    }
    if (holo.current) holo.current.rotation.z += dt * 2.2;
    if (lens.current) lens.current.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
    wheelRefs.current.forEach((w) => w && (w.rotation.x = t * 1.5));
  });

  const bodyMesh =
    cfg.body === 'square' ? (
      <RoundedBox args={[1.12, 1.0, 0.9]} radius={0.16} smoothness={4} position={[0, bodyY, 0]} material={matA} />
    ) : cfg.body === 'compact' ? (
      <mesh position={[0, bodyY, 0]} scale={[0.74, 0.5, 0.66]} material={matA}><sphereGeometry args={[1, 24, 18]} /></mesh>
    ) : cfg.body === 'tall' ? (
      <mesh position={[0, bodyY, 0]} material={matA}><capsuleGeometry args={[0.42, 0.7, 8, 16]} /></mesh>
    ) : (
      <mesh position={[0, bodyY, 0]} scale={[1, 1.05, 0.95]} material={matA}><sphereGeometry args={[0.62, 24, 18]} /></mesh>
    );
  const armY = footH + d.h * 0.72;
  const armX = d.w + 0.1;
  const backZ = -(d.w * 0.9 + 0.12);

  return (
    <group ref={root} {...rest}>
      <group ref={spin}>
        {/* feet or wheels */}
        {wheels ? (
          [-1, 1].map((s) => (
            <group key={s} position={[s * d.w * 0.7, 0.3, 0]}>
              <mesh ref={(r) => (wheelRefs.current[s > 0 ? 1 : 0] = r)} rotation={[0, 0, Math.PI / 2]} material={darkMat}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 20]} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]} material={matB}><cylinderGeometry args={[0.16, 0.16, 0.24, 14]} /></mesh>
            </group>
          ))
        ) : (
          [-1, 1].map((s) => (
            <mesh key={s} position={[s * d.w * 0.45, 0.12, 0.08]} scale={[1, 0.55, 1.35]} material={matB}>
              <sphereGeometry args={[0.2, 14, 10]} />
            </mesh>
          ))
        )}
        {bodyMesh}
        {/* belly panel */}
        <mesh position={[0, bodyY - d.h * 0.12, d.w * 0.86]} scale={[1, 1, 0.3]} material={darkMat}>
          <sphereGeometry args={[0.17, 12, 10]} />
        </mesh>
        {/* arms */}
        {[
          [-1, armL],
          [1, armR],
        ].map(([s, ref]) => (
          <group key={s} ref={ref} position={[s * armX, armY, 0]}>
            <mesh position={[0, -0.3, 0]} material={matB}><capsuleGeometry args={[0.09, 0.34, 6, 10]} /></mesh>
            <mesh position={[0, -0.6, 0]} material={matA}><sphereGeometry args={[0.12, 12, 10]} /></mesh>
            {s === 1 && done.earth && (
              <group position={[0.02, -0.6, 0.12]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={matB}><cylinderGeometry args={[0.04, 0.04, 0.4, 8]} /></mesh>
                <mesh ref={lens} position={[0, 0, 0.24]} material={glowBlue}><sphereGeometry args={[0.09, 12, 10]} /></mesh>
              </group>
            )}
          </group>
        ))}
        {/* head */}
        <group ref={head} position={[0, headY, 0]}>
          <Head type={cfg.head} matA={matA} matB={matB} />
          <group ref={eyes} position={[0, 0.03, faceZ]}>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.2, 0, 0]}>
                <Eye style={cfg.eyes} />
                {done.saturn && (
                  <mesh material={glowPurple} position={[0, 0, -0.02]}>
                    <torusGeometry args={[0.15, 0.025, 8, 24]} />
                  </mesh>
                )}
              </group>
            ))}
          </group>
          <group position={[0, hh * 0.92, 0]}>
            <TopAntenna type={cfg.antenna} matB={matB} />
          </group>
          {done.neptune && (
            <group position={[0, hh + 0.55, 0]}>
              <mesh ref={holo} rotation={[Math.PI / 2.4, 0, 0]} material={glowTeal}><torusGeometry args={[0.22, 0.02, 8, 32]} /></mesh>
              <mesh material={glowTeal} position={[0, -0.12, 0]}><coneGeometry args={[0.1, 0.22, 12, 1, true]} /></mesh>
              <mesh material={glowTeal}><octahedronGeometry args={[0.07]} /></mesh>
            </group>
          )}
        </group>
        {/* accessories */}
        {acc.includes('jetpack') && (
          <group position={[0, footH + d.h * 0.55, backZ]}>
            <RoundedBox args={[0.5, 0.5, 0.18]} radius={0.05} material={matB} />
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.18, -0.05, -0.15]}>
                <mesh material={darkMat}><cylinderGeometry args={[0.1, 0.12, 0.5, 12]} /></mesh>
                <mesh ref={s > 0 ? flame : null} position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]} material={flameMat}>
                  <coneGeometry args={[0.09, 0.32, 10]} />
                </mesh>
              </group>
            ))}
          </group>
        )}
        {acc.includes('wings') && (
          <>
            {[
              [-1, wingL],
              [1, wingR],
            ].map(([s, ref]) => (
              <group key={s} ref={ref} position={[s * 0.2, footH + d.h * 0.7, backZ + 0.02]}>
                <mesh position={[s * 0.45, 0.1, 0]} rotation={[0, 0, s * 0.35]} scale={[1, 0.3, 0.05]} material={matB}>
                  <sphereGeometry args={[0.5, 14, 10]} />
                </mesh>
                <mesh position={[s * 0.35, -0.1, 0]} rotation={[0, 0, s * 0.2]} scale={[0.75, 0.22, 0.05]} material={matA}>
                  <sphereGeometry args={[0.5, 14, 10]} />
                </mesh>
              </group>
            ))}
          </>
        )}
        {acc.includes('toolarms') &&
          [-1, 1].map((s) => (
            <group key={s} position={[s * (d.w * 0.85), footH + d.h * 0.3, 0.1]} rotation={[-0.9, 0, s * 0.35]}>
              <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]} material={matB}><cylinderGeometry args={[0.06, 0.06, 0.5, 8]} /></mesh>
              <mesh position={[-0.05, 0, 0.55]} material={darkMat}><boxGeometry args={[0.04, 0.05, 0.18]} /></mesh>
              <mesh position={[0.05, 0, 0.55]} material={darkMat}><boxGeometry args={[0.04, 0.05, 0.18]} /></mesh>
            </group>
          ))}
        {acc.includes('scanner') && (
          <group position={[-d.w * 0.55, footH + d.h + 0.05, 0.05]}>
            <mesh position={[0, 0.12, 0]} material={matB}><cylinderGeometry args={[0.025, 0.025, 0.24, 8]} /></mesh>
            <group ref={radar} position={[0, 0.28, 0]}>
              <mesh rotation={[-0.7, 0, 0]} material={matA}>
                <coneGeometry args={[0.2, 0.12, 16, 1, true]} />
                <meshStandardMaterial color={matA.color} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        )}
        {acc.includes('badge') && (
          <mesh position={[-d.w * 0.4, footH + d.h * 0.62, d.w * 0.9]} rotation={[Math.PI / 2, 0, 0]} material={glowAmber}>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 5]} />
          </mesh>
        )}
        {/* upgrades */}
        {done.mars && (
          <mesh position={[0, footH + d.h * 0.4, backZ + 0.02]} material={glowTeal}>
            <coneGeometry args={[0.1, 0.24, 10]} />
          </mesh>
        )}
        {done.jupiter && (
          <mesh ref={decision} position={[0, footH + d.h * 0.52, d.w * 0.95]} material={glowAmber}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// The player's own robot, read from the saved game
export function PlayerRobot(props) {
  const s = save.use();
  return <Robot cfg={s.robot} done={s.completed} {...props} />;
}
