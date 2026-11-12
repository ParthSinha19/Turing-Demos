/**
 * RoverAssembly: turns a RoverConfiguration into the 3D rover.
 * Structure mirrors the real joint tree so physics can drive it later:
 *   body → rocker (L/R) → bogie (L/R) → steering (corners) → wheel spin
 * It reads joint angles from a RoverJointState every frame and never owns motion itself.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type ReactNode } from "react";
import type * as THREE from "three";
import { getComponent, type AttachmentSpec, type ChassisSpec, type MotorSpec, type SensorSpec, type WheelSpec } from "../catalogue";
import type { RoverConfiguration } from "../configuration";
import { computeRoverLayout, PAYLOAD_MOUNT, type RoverLayout, type Side, type Vec3, type WheelId } from "../layout";
import type { RoverJointState } from "../joints";
import { MAST_HEIGHT_M } from "../stats";
import { PartMesh } from "./PartMesh";
import type { BuiltPart } from "./partBuilder";
import { buildChassis, buildDifferential } from "./builders/chassis";
import { buildBogie, buildFork, buildRocker } from "./builders/suspension";
import { buildWheel } from "./builders/wheel";
import { buildMotor } from "./builders/motor";
import { buildDistanceSensor, buildLidarBase, buildLidarHead, buildMast, buildMastHead, buildSideSensor } from "./builders/sensors";
import { buildArm, buildCollector, buildEquipmentModule } from "./builders/attachments";

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** Newly installed parts settle into place, so students see exactly what changed. */
export function Installable({ children, position = [0, 0, 0], scale = [1, 1, 1] }: { children: ReactNode; position?: Vec3; scale?: Vec3 }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame((state) => {
    const g = inner.current;
    if (!g) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = Math.min(1, (state.clock.elapsedTime - start.current) / 0.5);
    const e = 1 - Math.pow(1 - t, 3);
    g.position.y = 0.12 * (1 - e);
    g.scale.setScalar(0.94 + 0.06 * e);
  });
  return (
    <group ref={outer} position={position} scale={scale}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

interface Parts {
  rocker: BuiltPart;
  bogie: BuiltPart;
  fork: BuiltPart;
  wheel: BuiltPart;
  motor: BuiltPart;
}

type JointRefs = {
  rocker: Partial<Record<Side, THREE.Group | null>>;
  bogie: Partial<Record<Side, THREE.Group | null>>;
  steer: Partial<Record<WheelId, THREE.Group | null>>;
  spin: Partial<Record<WheelId, THREE.Group | null>>;
};

function WheelStation({ id, at, parts, refs, steerable, wheelKey, layout }: {
  id: WheelId; at: Vec3; parts: Parts; refs: JointRefs; steerable: boolean; wheelKey: string; layout: RoverLayout;
}) {
  const drop = layout.wheel.radius + 0.1;
  return (
    <group position={at}>
      <group ref={(g) => { if (steerable) refs.steer[id] = g; }}>
        <PartMesh part={parts.fork} />
        <group position={[0, -drop, 0]}>
          <Installable key={`m-${wheelKey}`}>
            <PartMesh part={parts.motor} disposeOnUnmount={false} />
          </Installable>
          <group ref={(g) => { refs.spin[id] = g; }}>
            <Installable key={`w-${wheelKey}`}>
              <PartMesh part={parts.wheel} disposeOnUnmount={false} />
            </Installable>
          </group>
        </group>
      </group>
    </group>
  );
}

/** One side of the suspension, always modelled as the right side; the left is a mirror image. */
function SuspensionSide({ side, layout, parts, refs, wheelKey }: { side: Side; layout: RoverLayout; parts: Parts; refs: JointRefs; wheelKey: string }) {
  const s = layout.sides[1];
  const w = layout.wheels.filter((x) => x.side === "right");
  const front = w.find((x) => x.station === "front")!;
  const middle = w.find((x) => x.station === "middle")!;
  const rear = w.find((x) => x.station === "rear")!;
  const suffix = side === "left" ? "L" : "R";
  const P = s.rockerPivot;
  const BP = s.bogiePivot;
  return (
    <group position={P} ref={(g) => { refs.rocker[side] = g; }}>
      <PartMesh part={parts.rocker} />
      <WheelStation id={`F${suffix}` as WheelId} at={sub(front.top, P)} parts={parts} refs={refs} steerable wheelKey={wheelKey} layout={layout} />
      <group position={sub(BP, P)} ref={(g) => { refs.bogie[side] = g; }}>
        <PartMesh part={parts.bogie} />
        <WheelStation id={`M${suffix}` as WheelId} at={sub(middle.top, BP)} parts={parts} refs={refs} steerable={false} wheelKey={wheelKey} layout={layout} />
        <WheelStation id={`R${suffix}` as WheelId} at={sub(rear.top, BP)} parts={parts} refs={refs} steerable wheelKey={wheelKey} layout={layout} />
      </group>
    </group>
  );
}

function AttachmentPart({ spec, layout }: { spec: AttachmentSpec; layout: RoverLayout }) {
  const part = useMemo(
    () => (spec.variant === "arm" ? buildArm(layout) : spec.variant === "collector" ? buildCollector(layout, spec.clearanceLossM) : buildEquipmentModule(layout)),
    [spec, layout],
  );
  return <PartMesh part={part} />;
}

export function RoverAssembly({ config, joints, children }: { config: RoverConfiguration; joints: RoverJointState; children?: ReactNode }) {
  const layout = useMemo(() => computeRoverLayout(config), [config]);
  const chassis = getComponent<ChassisSpec>(config.chassis);
  const wheel = getComponent<WheelSpec>(config.wheels);
  const motor = getComponent<MotorSpec>(config.motors);

  const chassisPart = useMemo(() => buildChassis(chassis, layout), [chassis, layout]);
  const diffPart = useMemo(() => buildDifferential(layout), [layout]);
  const parts: Parts = useMemo(() => ({
    rocker: buildRocker(layout),
    bogie: buildBogie(layout),
    fork: buildFork(layout),
    wheel: buildWheel(wheel),
    motor: buildMotor(motor, wheel),
  }), [layout, wheel, motor]);

  const refs = useRef<JointRefs>({ rocker: {}, bogie: {}, steer: {}, spin: {} }).current;
  const diffRef = useRef<THREE.Group>(null);
  const mastHead = useRef<THREE.Group>(null);
  const lidarHead = useRef<THREE.Group>(null);

  useFrame(() => {
    for (const side of ["left", "right"] as const) {
      const r = refs.rocker[side]; if (r) r.rotation.z = joints.rocker[side];
      const b = refs.bogie[side]; if (b) b.rotation.z = joints.bogie[side];
    }
    for (const id of ["FL", "FR", "RL", "RR"] as const) {
      const g = refs.steer[id];
      // Left side lives inside a mirrored group, where a Y rotation turns the other way.
      if (g) g.rotation.y = id.endsWith("L") ? -joints.steer[id] : joints.steer[id];
    }
    for (const id of Object.keys(joints.wheelSpin) as WheelId[]) {
      const g = refs.spin[id]; if (g) g.rotation.z = -joints.wheelSpin[id];
    }
    if (diffRef.current) diffRef.current.rotation.y = (joints.rocker.left - joints.rocker.right) * 0.5;
    if (mastHead.current) mastHead.current.rotation.y = joints.mastPan;
    if (lidarHead.current) lidarHead.current.rotation.y = joints.lidar;
  });

  const m = layout.mounts;
  const sensors = config.sensors.map((id) => getComponent<SensorSpec>(id));
  const attachments = config.attachments.map((id) => getComponent<AttachmentSpec>(id));
  // Sensor hardware never changes shape, so it is built once and kept.
  const sensorParts = useMemo(() => ({
    distance: buildDistanceSensor(), side: buildSideSensor(), mast: buildMast(), head: buildMastHead(),
    lidarBase: buildLidarBase(), lidarHead: buildLidarHead(),
  }), []);

  return (
    <group>
      <Installable key={config.chassis}>
        <PartMesh part={chassisPart} />
        <group position={[layout.differentialBar.x, layout.differentialBar.y, 0]} ref={diffRef}>
          <PartMesh part={diffPart} />
        </group>
      </Installable>

      <SuspensionSide side="right" layout={layout} parts={parts} refs={refs} wheelKey={`${config.wheels}|${config.motors}`} />
      <group scale={[1, 1, -1]}>
        <SuspensionSide side="left" layout={layout} parts={parts} refs={refs} wheelKey={`${config.wheels}|${config.motors}`} />
      </group>

      {sensors.map((s) => {
        switch (s.variant) {
          case "distance":
            return <Installable key={s.id} position={m["sensor.front"].position}><PartMesh part={sensorParts.distance} disposeOnUnmount={false} /></Installable>;
          case "side":
            return (
              <group key={s.id}>
                <Installable position={m["sensor.side.right"].position}><PartMesh part={sensorParts.side} disposeOnUnmount={false} /></Installable>
                <Installable position={m["sensor.side.left"].position} scale={[1, 1, -1]}><PartMesh part={sensorParts.side} disposeOnUnmount={false} /></Installable>
              </group>
            );
          case "camera":
            return (
              <Installable key={s.id} position={m["sensor.mast"].position}>
                <PartMesh part={sensorParts.mast} disposeOnUnmount={false} />
                <group position={[0, MAST_HEIGHT_M, 0]} ref={mastHead}><PartMesh part={sensorParts.head} disposeOnUnmount={false} /></group>
              </Installable>
            );
          case "lidar":
            return (
              <Installable key={s.id} position={m["sensor.roof"].position}>
                <PartMesh part={sensorParts.lidarBase} disposeOnUnmount={false} />
                <group position={[0, 0.16, 0]} ref={lidarHead}><PartMesh part={sensorParts.lidarHead} disposeOnUnmount={false} /></group>
              </Installable>
            );
        }
      })}

      {attachments.map((a) => (
        <Installable key={a.id} position={m[PAYLOAD_MOUNT[a.mount]].position}>
          <AttachmentPart spec={a} layout={layout} />
        </Installable>
      ))}

      {children}
    </group>
  );
}
