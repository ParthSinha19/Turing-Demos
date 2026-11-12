/**
 * Engineering overlays drawn in the rover frame:
 *  - mount points (installed vs empty, and the one a hovered catalogue part would use)
 *  - collision shapes and centre of mass, read straight from the physics profile
 *  - sensor coverage (range + field of view) from the physics profile
 */
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getComponent } from "@/rover/catalogue";
import type { RoverConfiguration } from "@/rover/configuration";
import type { MountId, RoverLayout } from "@/rover/layout";
import { COMPONENT_MOUNTS, mountsForComponent, occupantOf } from "@/rover/mounts";
import { computePhysicsProfile, type RoverPhysicsProfile } from "@/rover/physicsProfile";
import { useLabStore } from "@/state/labStore";

// Overlay colours mirror the UI tokens (--signal, --caution) for consistency between panels and 3D.
const SIGNAL = new THREE.Color("#8fd8e6");
const CAUTION = new THREE.Color("#f0bf5a");
const MUTED = new THREE.Color("#e9e2d8");

const ringGeo = new THREE.RingGeometry(0.055, 0.075, 40);
const dotGeo = new THREE.CircleGeometry(0.026, 24);

function overlayMat(color: THREE.Color, opacity: number) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthTest: false, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
}

function MountMarker({ mount, layout, state, label, sublabel, showLabel }: {
  mount: MountId; layout: RoverLayout; state: "installed" | "empty" | "target"; label: string; sublabel: string; showLabel: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const m = layout.mounts[mount];
  const mats = useMemo(() => {
    const c = state === "target" ? CAUTION : state === "installed" ? SIGNAL : MUTED;
    return { ring: overlayMat(c, state === "empty" ? 0.55 : 0.95), dot: overlayMat(c, state === "empty" ? 0 : 0.9) };
  }, [state]);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...m.normal)), [m.normal]);
  const offset = 0.012;
  useFrame((s) => {
    if (!ref.current) return;
    const k = state === "target" ? 1 + 0.25 * Math.sin(s.clock.elapsedTime * 6) : 1;
    ref.current.scale.setScalar(k);
  });
  return (
    <group position={[m.position[0] + m.normal[0] * offset, m.position[1] + m.normal[1] * offset, m.position[2] + m.normal[2] * offset]}>
      <group ref={ref} quaternion={quat}>
        <mesh geometry={ringGeo} material={mats.ring} renderOrder={10} />
        <mesh geometry={dotGeo} material={mats.dot} renderOrder={10} />
      </group>
      {showLabel && (
        <Html center position={[m.normal[0] * 0.22, (mount.startsWith("payload") ? -0.12 : 0.14) + m.normal[1] * 0.06, m.normal[2] * 0.22]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded border border-border bg-panel-strong px-1.5 py-0.5 text-[10px] leading-tight text-foreground shadow">
            <div className="font-display font-semibold tracking-wide">{label}</div>
            <div className={state === "installed" ? "text-signal" : state === "target" ? "text-caution" : "text-muted-foreground"}>{sublabel}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function MountPoints({ config, layout, show, hovered }: { config: RoverConfiguration; layout: RoverLayout; show: boolean; hovered: string | null }) {
  const installed = [...config.sensors, ...config.attachments];
  let targets: MountId[] = [];
  try { targets = hovered ? mountsForComponent(hovered) : []; } catch { targets = []; }
  const ids = show ? COMPONENT_MOUNTS : targets;
  return (
    <>
      {ids.map((mount) => {
        const occ = occupantOf(mount, installed);
        const isTarget = targets.includes(mount);
        const state = isTarget ? "target" : occ ? "installed" : "empty";
        const sub = isTarget && hovered ? (occ === hovered ? "Installed here" : `Fits: ${getComponent(hovered).name}`) : occ ? getComponent(occ).name : "Empty";
        return <MountMarker key={mount} mount={mount} layout={layout} state={state} label={layout.mounts[mount].label} sublabel={sub} showLabel={show || isTarget} />;
      })}
    </>
  );
}

function CollisionShapes({ profile }: { profile: RoverPhysicsProfile }) {
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({ color: CAUTION, transparent: true, opacity: 0.9, depthTest: false, toneMapped: false }), []);
  const wheelMat = useMemo(() => new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.8, depthTest: false, toneMapped: false }), []);
  const boxEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), []);
  const r = profile.wheels[0]?.radius ?? 0.3;
  const w = profile.wheels[0]?.width ?? 0.2;
  const wheelEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.CylinderGeometry(r, r, w, 20), 1), [r, w]);
  const com = profile.centerOfMass;
  const comMat = useMemo(() => overlayMat(SIGNAL, 1), []);
  return (
    <group>
      {profile.colliders.map((c) => (
        <lineSegments key={c.id} geometry={boxEdges} material={lineMat} position={c.center} scale={c.halfExtents} renderOrder={11} />
      ))}
      {profile.wheels.map((wh) => (
        <lineSegments key={wh.id} geometry={wheelEdges} material={wheelMat} position={wh.position} rotation={[Math.PI / 2, 0, 0]} renderOrder={11} />
      ))}
      <mesh position={com} material={comMat} renderOrder={12}><sphereGeometry args={[0.04, 16, 8]} /></mesh>
      <lineSegments material={lineMat} renderOrder={11}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([com[0], com[1], com[2], com[0], 0.005, com[2]]), 3]} />
        </bufferGeometry>
      </lineSegments>
      <Html position={[com[0], com[1] + 0.12, com[2]]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap rounded border border-border bg-panel-strong px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-wide text-signal">Centre of mass</div>
      </Html>
    </group>
  );
}

function SensorCoverage({ profile }: { profile: RoverPhysicsProfile }) {
  const sectors = useMemo(
    () =>
      profile.sensors.map((s) => {
        const fov = (Math.min(s.fovDeg, 360) * Math.PI) / 180;
        const heading = Math.atan2(s.direction[2], s.direction[0]);
        const geo = new THREE.CircleGeometry(s.rangeM, Math.max(16, Math.round(fov * 24)), -fov / 2, fov);
        geo.rotateX(-Math.PI / 2); // circle in XZ, angle measured from +X toward −Z
        geo.rotateY(-heading);
        const edge = new THREE.EdgesGeometry(geo, 1);
        const color = s.kind === "lidar" ? CAUTION : SIGNAL;
        return { id: s.id, geo, edge, fill: overlayMat(color, s.kind === "camera" ? 0.07 : 0.13), line: new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55, depthTest: false, toneMapped: false }), position: [s.position[0], 0.03, s.position[2]] as [number, number, number] };
      }),
    [profile],
  );
  return (
    <>
      {sectors.map((s) => (
        <group key={s.id} position={s.position}>
          <mesh geometry={s.geo} material={s.fill} renderOrder={9} />
          <lineSegments geometry={s.edge} material={s.line} renderOrder={9} />
        </group>
      ))}
    </>
  );
}

export function RoverOverlays({ config, layout }: { config: RoverConfiguration; layout: RoverLayout }) {
  const overlays = useLabStore((s) => s.overlays);
  const hovered = useLabStore((s) => s.hovered);
  const profile = useMemo(() => computePhysicsProfile(config, layout), [config, layout]);
  return (
    <>
      <MountPoints config={config} layout={layout} show={overlays.mounts} hovered={hovered} />
      {overlays.collision && <CollisionShapes profile={profile} />}
      {overlays.coverage && <SensorCoverage profile={profile} />}
    </>
  );
}
