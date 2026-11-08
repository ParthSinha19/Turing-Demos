import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLOURS } from '../game/cluster.js';

const M = ({ c, r = 0.55, m = 0.05, e, ei = 0.8, ...p }) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e || '#000'} emissiveIntensity={e ? ei : 0} {...p} />
);

// Everyday objects for Earth. Drawn from simple shapes, kept friendly and recognisable.
export function ObjectModel({ kind, ...p }) {
  const b = (children) => <group {...p}>{children}</group>;
  switch (kind) {
    case 'apple':
      return b(
        <>
          <mesh position={[0, 0.35, 0]} scale={[1, 0.92, 1]}><sphereGeometry args={[0.36, 20, 16]} /><M c="#e63946" r={0.3} /></mesh>
          <mesh position={[0, 0.74, 0]}><cylinderGeometry args={[0.025, 0.03, 0.18, 6]} /><M c="#6b4226" /></mesh>
          <mesh position={[0.12, 0.76, 0]} rotation={[0, 0, -0.6]} scale={[1, 0.4, 0.6]}><sphereGeometry args={[0.13, 10, 8]} /><M c="#4caf50" /></mesh>
        </>
      );
    case 'banana':
      return b(
        <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI * 0.1]}><torusGeometry args={[0.42, 0.11, 10, 20, Math.PI * 0.8]} /><M c="#ffd23f" /></mesh>
      );
    case 'carrot':
      return b(
        <>
          <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.15, 0.8, 12]} /><M c="#ff8c1a" /></mesh>
          {[-0.06, 0, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.9, 0]} rotation={[0, 0, x * 3]}><coneGeometry args={[0.04, 0.3, 6]} /><M c="#3fae4a" /></mesh>
          ))}
        </>
      );
    case 'pear':
      return b(
        <>
          <mesh position={[0, 0.28, 0]}><sphereGeometry args={[0.3, 16, 12]} /><M c="#9acd32" /></mesh>
          <mesh position={[0, 0.58, 0]}><sphereGeometry args={[0.19, 14, 10]} /><M c="#9acd32" /></mesh>
          <mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.02, 0.02, 0.14, 6]} /><M c="#6b4226" /></mesh>
        </>
      );
    case 'cat':
    case 'dog': {
      const col = kind === 'cat' ? '#ff9a3c' : '#a0693d';
      return b(
        <>
          <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.24, 0.45, 6, 12]} /><M c={col} /></mesh>
          <mesh position={[0.5, 0.65, 0]}><sphereGeometry args={[0.24, 14, 12]} /><M c={col} /></mesh>
          {kind === 'cat' ? (
            [-1, 1].map((s) => <mesh key={s} position={[0.52, 0.9, s * 0.14]}><coneGeometry args={[0.08, 0.15, 4]} /><M c={col} /></mesh>)
          ) : (
            [-1, 1].map((s) => <mesh key={s} position={[0.48, 0.66, s * 0.25]} scale={[0.6, 1.2, 0.5]}><sphereGeometry args={[0.1, 10, 8]} /><M c="#6e4524" /></mesh>)
          )}
          {kind === 'dog' && <mesh position={[0.73, 0.6, 0]}><boxGeometry args={[0.15, 0.12, 0.14]} /><M c="#c58a58" /></mesh>}
          {[-1, 1].map((s) => <mesh key={s} position={[0.68, 0.7, s * 0.1]}><sphereGeometry args={[0.035, 8, 6]} /><M c="#111" /></mesh>)}
          {[-0.3, 0.3].flatMap((x) => [-0.12, 0.12].map((z) => <mesh key={x + '' + z} position={[x, 0.12, z]}><cylinderGeometry args={[0.06, 0.06, 0.25, 8]} /><M c={col} /></mesh>))}
          <mesh position={[-0.55, 0.62, 0]} rotation={[0, 0, 0.9]}><capsuleGeometry args={[0.04, 0.35, 4, 8]} /><M c={col} /></mesh>
        </>
      );
    }
    case 'bird':
      return b(
        <>
          <mesh position={[0, 0.5, 0]} scale={[1.2, 1, 1]}><sphereGeometry args={[0.28, 16, 12]} /><M c="#3a86ff" /></mesh>
          <mesh position={[0.34, 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.07, 0.2, 8]} /><M c="#ffb703" /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[-0.02, 0.55, s * 0.26]} rotation={[s * 0.5, 0, 0]} scale={[1, 0.3, 0.7]}><sphereGeometry args={[0.24, 10, 8]} /><M c="#2667d9" /></mesh>)}
          {[-1, 1].map((s) => <mesh key={s} position={[0.2, 0.58, s * 0.14]}><sphereGeometry args={[0.04, 8, 6]} /><M c="#fff" /></mesh>)}
        </>
      );
    case 'ball':
      return b(
        <>
          <mesh position={[0, 0.34, 0]}><sphereGeometry args={[0.34, 20, 16]} /><M c="#e63946" r={0.25} /></mesh>
          <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.345, 0.035, 8, 28]} /><M c="#fff" /></mesh>
        </>
      );
    case 'block':
      return b(
        <>
          <mesh position={[0, 0.3, 0]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.6, 0.6, 0.6]} /><M c="#3a86ff" r={0.4} /></mesh>
          <mesh position={[0, 0.66, 0]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.25, 0.14, 0.25]} /><M c="#ffd23f" /></mesh>
        </>
      );
    case 'teddy':
      return b(
        <>
          <mesh position={[0, 0.38, 0]}><sphereGeometry args={[0.33, 16, 12]} /><M c="#9b6a3c" r={0.9} /></mesh>
          <mesh position={[0, 0.82, 0]}><sphereGeometry args={[0.24, 16, 12]} /><M c="#9b6a3c" r={0.9} /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * 0.18, 1.0, 0]}><sphereGeometry args={[0.09, 10, 8]} /><M c="#9b6a3c" /></mesh>)}
          <mesh position={[0, 0.78, 0.2]}><sphereGeometry args={[0.1, 10, 8]} /><M c="#e8c9a0" /></mesh>
          {[-1, 1].map((s) => <mesh key={s} position={[s * 0.09, 0.88, 0.2]}><sphereGeometry args={[0.025, 8, 6]} /><M c="#111" /></mesh>)}
        </>
      );
    case 'tree':
      return b(
        <>
          <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.17, 1, 8]} /><M c="#7a4f2a" /></mesh>
          {[0, 1, 2].map((i) => <mesh key={i} position={[0, 1.15 + i * 0.5, 0]}><coneGeometry args={[0.7 - i * 0.18, 0.8, 9]} /><M c={['#2e9a4a', '#3fb55a', '#58c96b'][i]} /></mesh>)}
        </>
      );
    case 'balloon':
      return b(
        <>
          <mesh position={[0, 0.6, 0]} scale={[1, 1.15, 1]}><sphereGeometry args={[0.38, 18, 14]} /><M c="#ffd23f" r={0.2} /></mesh>
          <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.008, 0.008, 0.6, 4]} /><M c="#eee" /></mesh>
        </>
      );
    case 'house':
      return b(
        <>
          <mesh position={[0, 0.4, 0]}><boxGeometry args={[1, 0.8, 0.9]} /><M c="#f4e3c1" /></mesh>
          <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.85, 0.5, 4]} /><M c="#d1553d" /></mesh>
          <mesh position={[0, 0.25, 0.46]}><boxGeometry args={[0.22, 0.4, 0.02]} /><M c="#6b4226" /></mesh>
        </>
      );
    default:
      return null;
  }
}

const SPACE_COL = { blue: '#3a9dff', pink: '#ff6fb5', green: '#43d17a', grey: '#8c93a3', brown: '#8a5a3a', purple: '#a66bff', orange: '#ff9a3c', silver: '#cfd6e4', white: '#f4f6fb', red: '#ee4b4b' };
export const spaceColour = (n) => SPACE_COL[n] || '#aaa';

// A Saturn item: its shape, colour, shine and glow are what the robot learns from
export function SpaceItem({ f, spin = true, ...p }) {
  const ref = useRef();
  useFrame((s, dt) => spin && ref.current && (ref.current.rotation.y += dt * 0.7));
  const col = spaceColour(f.colour);
  const shiny = f.shine === 'shiny';
  const glow = f.glow === 'glows';
  const mat = <meshStandardMaterial color={col} roughness={shiny ? 0.12 : 0.9} metalness={shiny ? 0.7 : 0.05} emissive={glow ? col : '#000'} emissiveIntensity={glow ? 0.9 : 0} flatShading />;
  let body;
  if (f.shape === 'pointy')
    body = (
      <>
        <mesh position={[0, 0.5, 0]}><coneGeometry args={[0.28, 1, 6]} />{mat}</mesh>
        <mesh position={[0.28, 0.3, 0.05]} rotation={[0, 0, -0.5]}><coneGeometry args={[0.16, 0.6, 6]} />{mat}</mesh>
        <mesh position={[-0.26, 0.28, -0.05]} rotation={[0, 0, 0.5]}><coneGeometry args={[0.15, 0.55, 6]} />{mat}</mesh>
      </>
    );
  else if (f.shape === 'lumpy')
    body = (
      <>
        <mesh position={[0, 0.4, 0]} scale={[1.1, 0.8, 0.95]}><dodecahedronGeometry args={[0.45, 0]} />{mat}</mesh>
        <mesh position={[0.3, 0.2, 0.2]}><dodecahedronGeometry args={[0.2, 0]} />{mat}</mesh>
      </>
    );
  else if (f.shape === 'leafy')
    body = (
      <>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.04, 0.06, 0.6, 6]} /><meshStandardMaterial color="#5c8a4a" /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.57) * 0.22, 0.55 + (i % 2) * 0.1, Math.sin(i * 1.57) * 0.22]} rotation={[Math.sin(i * 1.57) * 0.9, 0, -Math.cos(i * 1.57) * 0.9]} scale={[0.5, 1.4, 0.2]}>
            <sphereGeometry args={[0.22, 10, 8]} />{mat}
          </mesh>
        ))}
        <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.12, 10, 8]} />{mat}</mesh>
      </>
    );
  else
    body = (
      <>
        <mesh position={[0, 0.35, 0]}><boxGeometry args={[0.7, 0.55, 0.6]} />{mat}</mesh>
        <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4, 6]} /><meshStandardMaterial color="#99a" /></mesh>
        <mesh position={[0, 1.0, 0]}><sphereGeometry args={[0.06, 8, 6]} /><meshStandardMaterial color={glow ? '#ffe066' : '#556'} emissive={glow ? '#ffd23f' : '#000'} emissiveIntensity={1.4} /></mesh>
        <mesh position={[0.2, 0.35, 0.31]}><boxGeometry args={[0.16, 0.12, 0.02]} /><meshStandardMaterial color="#17223d" /></mesh>
      </>
    );
  return (
    <group {...p}>
      <group ref={ref}>{body}</group>
    </group>
  );
}

// Neptune creatures: colour, size, eyes, legs, antennae and shape all really show.
export function Creature({ c, ...p }) {
  const col = COLOURS[c.colour];
  const sc = c.size === 'big' ? 1.0 : 0.68;
  const shape = c.shape;
  const sy = shape === 'tall' ? 1.45 : shape === 'flat' ? 0.6 : 1;
  const sx = shape === 'tall' ? 0.75 : shape === 'flat' ? 1.3 : 1;
  const bodyH = 0.5 * sy;
  const legsY = 0.34;
  const legCount = c.legs;
  const eyeSpread = c.eyes === 1 ? [0] : c.eyes === 2 ? [-0.14, 0.14] : [-0.2, 0, 0.2];
  return (
    <group {...p} scale={sc * (p.scale || 1)}>
      {Array.from({ length: legCount }).map((_, i) => {
        const a = (i / legCount) * Math.PI * 2 + 0.3;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3 * sx, legsY / 2, Math.sin(a) * 0.3]}>
            <cylinderGeometry args={[0.035, 0.045, legsY, 6]} />
            <meshStandardMaterial color={col} roughness={0.6} />
          </mesh>
        );
      })}
      <mesh position={[0, legsY + bodyH * 0.8, 0]} scale={[sx, sy, 1]}>
        <sphereGeometry args={[0.5, 22, 16]} />
        <meshStandardMaterial color={col} roughness={0.4} emissive={col} emissiveIntensity={0.12} />
      </mesh>
      {eyeSpread.map((x, i) => (
        <group key={i} position={[x * sx * 1.3, legsY + bodyH * 0.95, 0.43 * (shape === 'flat' ? 1.0 : 0.95)]}>
          <mesh><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#fff" /></mesh>
          <mesh position={[0, 0, 0.07]}><sphereGeometry args={[0.05, 8, 6]} /><meshStandardMaterial color="#111" /></mesh>
        </group>
      ))}
      {Array.from({ length: c.antennae }).map((_, i) => {
        const x = c.antennae === 1 ? 0 : (i === 0 ? -1 : 1) * 0.2;
        const top = legsY + bodyH * 0.8 + 0.5 * sy;
        return (
          <group key={i} position={[x * sx, top - 0.06, 0]}>
            <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.014, 0.014, 0.3, 5]} /><meshStandardMaterial color="#ddd" /></mesh>
            <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.055, 8, 6]} /><meshStandardMaterial color="#fff6a8" emissive="#ffe066" emissiveIntensity={1.2} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

// Astronaut / alien visitors for Jupiter
export function Visitor({ kind, tint = '#ffffff', ...p }) {
  if (kind === 'alien')
    return (
      <group {...p}>
        <mesh position={[0, 0.55, 0]} scale={[1, 1.1, 1]}><sphereGeometry args={[0.45, 18, 14]} /><meshStandardMaterial color="#6ee06e" roughness={0.4} emissive="#2a8a2a" emissiveIntensity={0.25} /></mesh>
        {[-0.18, 0, 0.18].map((x) => (
          <group key={x} position={[x, 0.7, 0.38]}>
            <mesh><sphereGeometry args={[0.08, 10, 8]} /><meshStandardMaterial color="#fff" /></mesh>
            <mesh position={[0, 0, 0.06]}><sphereGeometry args={[0.04, 8, 6]} /><meshStandardMaterial color="#111" /></mesh>
          </group>
        ))}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.2, 1.0, 0]} rotation={[0, 0, -s * 0.4]}>
            <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.015, 0.015, 0.3, 5]} /><meshStandardMaterial color="#9f9" /></mesh>
            <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.06, 8, 6]} /><meshStandardMaterial color="#ffe066" emissive="#ffd23f" emissiveIntensity={1} /></mesh>
          </group>
        ))}
      </group>
    );
  return (
    <group {...p}>
      <mesh position={[0, 0.45, 0]}><capsuleGeometry args={[0.28, 0.4, 6, 12]} /><meshStandardMaterial color={tint} roughness={0.5} /></mesh>
      <mesh position={[0, 1.0, 0]}><sphereGeometry args={[0.28, 16, 12]} /><meshStandardMaterial color="#f4f6fb" roughness={0.4} /></mesh>
      <mesh position={[0, 1.0, 0.17]} scale={[1, 0.85, 0.8]}><sphereGeometry args={[0.22, 16, 12]} /><meshStandardMaterial color="#27477a" roughness={0.1} metalness={0.5} /></mesh>
      <mesh position={[0, 0.5, -0.3]}><boxGeometry args={[0.36, 0.5, 0.2]} /><meshStandardMaterial color="#9aa4b8" /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.34, 0.45, 0]} rotation={[0, 0, s * 0.2]}><capsuleGeometry args={[0.07, 0.3, 4, 8]} /><meshStandardMaterial color={tint} /></mesh>)}
    </group>
  );
}
