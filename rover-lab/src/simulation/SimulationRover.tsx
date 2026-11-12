import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { computeRoverLayout } from "@/rover/layout";
import { createJointState, type RoverJointState } from "@/rover/joints";
import { computePhysicsProfile } from "@/rover/physicsProfile";
import { computeStats } from "@/rover/stats";
import { RoverAssembly } from "@/rover/model/RoverAssembly";
import { useRoverStore } from "@/state/roverStore";
import { useSimulationStore } from "./simulationStore";
import { chooseAutonomousInput, createInitialSnapshot, resetSimulationPosition, stepSimulation } from "./physics";
import type { SimulationSnapshot, SimulationWorld } from "./types";
import type { HeightFn } from "@/environment/terrainHeight";
import { useMissionStore } from "@/missions/missionStore";
import { evaluateMission, getMission } from "@/missions/definitions";

function FollowCamera({ targetRef }: { targetRef: RefObject<THREE.Group | null> }) {
  const follow = useSimulationStore((s) => s.followCamera);
  useFrame(({ camera }, delta) => {
    if (!follow || !targetRef.current) return;
    const root = targetRef.current;
    const offset = new THREE.Vector3(-6.5, 4.2, 0).applyQuaternion(root.quaternion);
    const desired = root.position.clone().add(offset);
    camera.position.lerp(desired, 1 - Math.exp(-3.6 * delta));
    const look = root.position.clone().add(new THREE.Vector3(3.0, 0.8, 0).applyQuaternion(root.quaternion));
    camera.lookAt(look);
  });
  return null;
}

function syncJoints(target: RoverJointState, source: RoverJointState) {
  target.rocker.left = source.rocker.left;
  target.rocker.right = source.rocker.right;
  target.bogie.left = source.bogie.left;
  target.bogie.right = source.bogie.right;
  for (const key of ["FL", "FR", "RL", "RR"] as const) target.steer[key] = source.steer[key];
  for (const key of Object.keys(target.wheelSpin) as (keyof RoverJointState["wheelSpin"])[]) target.wheelSpin[key] = source.wheelSpin[key];
  target.lidar = source.lidar;
  target.mastPan = source.mastPan;
}

export function SimulationRover({ world, missionId, height }: { world: SimulationWorld; missionId?: string | null; height: HeightFn }) {
  const config = useRoverStore((s) => s.config);
  const layout = useMemo(() => computeRoverLayout(config), [config]);
  const stats = useMemo(() => computeStats(config, layout), [config, layout]);
  const profile = useMemo(() => computePhysicsProfile(config, layout, stats), [config, layout, stats]);
  const root = useRef<THREE.Group>(null);
  const follow = useSimulationStore((s) => s.followCamera);
  const resetToken = useSimulationStore((s) => s.resetToken);
  const joints = useMemo(createJointState, []);
  const snapshotRef = useRef<SimulationSnapshot | null>(null);
  const lastPublish = useRef(0);
  const finishedRef = useRef(false);
  const currentWorldId = useRef(world.id);
  const lastResetToken = useRef(resetToken);

  useEffect(() => {
    const store = useSimulationStore.getState();
    const resetRequested = lastResetToken.current !== resetToken;
    if (store.worldId !== world.id || !store.snapshot) {
      const initial = createInitialSnapshot(profile, stats, world, undefined, height);
      snapshotRef.current = initial;
      syncJoints(joints, initial.joints);
      store.setSnapshot(initial);
      store.setWorldId(world.id);
      store.setPaused(false);
      finishedRef.current = false;
    } else if (resetRequested) {
      const previous = snapshotRef.current ?? store.snapshot;
      const reset = resetSimulationPosition(previous, world, profile, stats, height);
      snapshotRef.current = reset;
      syncJoints(joints, reset.joints);
      store.setSnapshot(reset);
      store.setPaused(false);
      finishedRef.current = false;
    } else {
      snapshotRef.current = store.snapshot;
      syncJoints(joints, store.snapshot.joints);
    }
    lastResetToken.current = resetToken;
    currentWorldId.current = world.id;
  }, [world.id, profile, stats, world, joints, height, resetToken]);

  useFrame((frame, delta) => {
    if (currentWorldId.current !== world.id) return;
    const store = useSimulationStore.getState();
    let snapshot = snapshotRef.current;
    if (!snapshot) {
      snapshot = createInitialSnapshot(profile, stats, world, undefined, height);
      snapshotRef.current = snapshot;
      syncJoints(joints, snapshot.joints);
    }
    const dt = Math.min(delta, 0.05);
    if (!store.paused && !snapshot.missionComplete) {
      let input = store.input;
      if (store.mode === "autonomous") {
        const decision = chooseAutonomousInput(snapshot, profile, world);
        input = decision.input;
        snapshot.autonomousStage = decision.stage;
        snapshot.autonomousTurn = decision.turn;
        if (decision.turnStartYaw !== undefined) snapshot.autonomousTurnStartYaw = decision.turnStartYaw;
        if (decision.resetBypassDistance) snapshot.autonomousBypassDistanceM = 0;
        snapshot.autonomousDecision = decision.message;
      } else {
        snapshot.autonomousDecision = "Manual control active";
        snapshot.autonomousStage = "drive";
      }
      snapshot = stepSimulation(snapshot, input, dt, { profile, stats, world, height });
      if (missionId) {
        const evaluation = evaluateMission(getMission(missionId), snapshot, config);
        snapshot.missionProgress = evaluation.progress;
        snapshot.missionMessage = evaluation.message;
        snapshot.missionComplete = evaluation.complete;
        if (evaluation.complete && !finishedRef.current) {
          finishedRef.current = true;
          useMissionStore.getState().finish(missionId);
          useSimulationStore.getState().setInput({ throttle: 0, steer: 0, brake: true });
        }
      }
      snapshotRef.current = snapshot;
      syncJoints(joints, snapshot.joints);
    }
    const g = root.current;
    if (g && snapshot) {
      g.position.set(snapshot.pose.x, snapshot.pose.y, snapshot.pose.z);
      g.rotation.order = "YXZ";
      g.rotation.set(snapshot.pose.roll, -snapshot.pose.yaw, snapshot.pose.pitch);
    }
    if (snapshot && frame.clock.elapsedTime - lastPublish.current > 0.09) {
      lastPublish.current = frame.clock.elapsedTime;
      store.setSnapshot({ ...snapshot, joints: snapshot.joints, telemetry: { ...snapshot.telemetry } });
    }
  });

  return (
    <>
      <group ref={root}>
        <RoverAssembly config={config} joints={joints} />
      </group>
      <FollowCamera targetRef={root} />
      {!follow && <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3} maxDistance={65} maxPolarAngle={Math.PI * 0.49} />}
    </>
  );
}
