import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import type * as THREE from "three";
import type { RoverConfiguration } from "@/rover/configuration";
import { createJointState, type RoverJointState } from "@/rover/joints";
import type { RoverLayout } from "@/rover/layout";
import { RoverAssembly } from "@/rover/model/RoverAssembly";
import { getRoverMaterials } from "@/rover/model/materials";
import { LIFT_HEIGHT } from "./CameraRig";
import { registerJoints } from "./devHooks";

/**
 * Drives the rover's joints while it sits in the lab: idle sensor motion, plus an optional
 * articulation test that exercises every suspension, steering and wheel joint.
 * In the Sandbox the physics engine will write the same joint state instead.
 */
function driveJoints(j: RoverJointState, t: number, dt: number, test: boolean) {
  j.lidar += dt * 2.4;
  j.mastPan = Math.sin(t * 0.25) * 0.5;
  const k = Math.min(1, dt * 3);
  const target = (v: number) => (test ? v : 0);
  j.rocker.left += (target(Math.sin(t * 0.9) * 0.16) - j.rocker.left) * k;
  j.rocker.right += (target(-Math.sin(t * 0.9) * 0.16) - j.rocker.right) * k;
  j.bogie.left += (target(Math.sin(t * 1.3 + 1) * 0.2) - j.bogie.left) * k;
  j.bogie.right += (target(Math.sin(t * 1.3 + 2.4) * 0.2) - j.bogie.right) * k;
  const steer = target(Math.sin(t * 0.7) * 0.45);
  for (const id of ["FL", "FR"] as const) j.steer[id] += (steer - j.steer[id]) * k;
  for (const id of ["RL", "RR"] as const) j.steer[id] += (-steer - j.steer[id]) * k;
  if (test) for (const id of Object.keys(j.wheelSpin) as (keyof typeof j.wheelSpin)[]) j.wheelSpin[id] += dt * 1.6;
}

function JackStands({ layout, liftRef }: { layout: RoverLayout; liftRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const mats = getRoverMaterials();
  const { length: L, width: W } = layout.body;
  const spots = useMemo(() => [[L * 0.32, W * 0.28], [L * 0.32, -W * 0.28], [-L * 0.32, W * 0.28], [-L * 0.32, -W * 0.28]] as const, [L, W]);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const h = liftRef.current;
    g.visible = h > 0.02;
    g.scale.set(1, Math.max(0.001, h + layout.body.bellyY), 1);
  });
  return (
    <group ref={group}>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={mats.alu} position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.035, 0.05, 1, 12]} /></mesh>
          <mesh material={mats.darkMetal} position={[0, 0.98, 0]}><boxGeometry args={[0.14, 0.04, 0.14]} /></mesh>
        </group>
      ))}
    </group>
  );
}

export function RoverRig({ config, layout, lifted, articulation, children }: {
  config: RoverConfiguration; layout: RoverLayout; lifted: boolean; articulation: boolean; children?: ReactNode;
}) {
  const joints = useMemo(createJointState, []);
  registerJoints(joints);
  const root = useRef<THREE.Group>(null);
  const lift = useRef(0);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    driveJoints(joints, state.clock.elapsedTime, dt, articulation);
    const target = lifted ? LIFT_HEIGHT : 0;
    lift.current += (target - lift.current) * (1 - Math.exp(-4 * dt));
    if (Math.abs(target - lift.current) < 0.001) lift.current = target;
    if (root.current) root.current.position.y = lift.current;
  });
  return (
    <>
      <group ref={root}>
        <RoverAssembly config={config} joints={joints}>{children}</RoverAssembly>
      </group>
      <JackStands layout={layout} liftRef={lift} />
    </>
  );
}
