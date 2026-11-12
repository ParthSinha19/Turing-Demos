/**
 * RoverPhysicsProfile is the contract between the configured rover and the simulation runtime.
 * The runtime consumes this derived profile instead of reading catalogue entries directly.
 * Everything is in the rover frame (+X forward, +Y up, +Z right), SI units.
 */
import { getComponent, type AttachmentSpec, type MotorSpec, type SensorSpec, type WheelSpec } from "./catalogue";
import type { RoverConfiguration } from "./configuration";
import { computeRoverLayout, PAYLOAD_MOUNT, type RoverLayout, type Vec3, type WheelId } from "./layout";
import { computeStats, MARS_GRAVITY, MAST_HEIGHT_M, type RoverStats } from "./stats";

export interface BoxCollider { id: string; center: Vec3; halfExtents: Vec3 }

export interface WheelPhysics {
  id: WheelId;
  side: "left" | "right";
  position: Vec3;
  radius: number;
  width: number;
  friction: number;
  steerable: boolean;
  maxTorqueNm: number;
  maxAngularVelocity: number; // rad/s
}

export interface SensorPhysics {
  id: string;
  kind: SensorSpec["variant"];
  position: Vec3;
  direction: Vec3;
  rangeM: number;
  fovDeg: number;
}

export interface RoverPhysicsProfile {
  gravity: number;
  massKg: number;
  centerOfMass: Vec3;
  colliders: BoxCollider[];
  wheels: WheelPhysics[];
  suspension: {
    type: "rocker-bogie";
    rockerPivots: Vec3[];
    bogiePivots: Vec3[];
    /** Max joint swing either way, radians. */
    rockerTravel: number;
    bogieTravel: number;
  };
  drive: { type: "differential"; left: WheelId[]; right: WheelId[] };
  power: { batteryWh: number; idleW: number; drivePerWheelW: number };
  sensors: SensorPhysics[];
  groundClearance: number;
}

export function computePhysicsProfile(
  config: RoverConfiguration,
  layout: RoverLayout = computeRoverLayout(config),
  stats: RoverStats = computeStats(config, layout),
): RoverPhysicsProfile {
  const wheel = getComponent<WheelSpec>(config.wheels);
  const motor = getComponent<MotorSpec>(config.motors);
  const { body, mounts } = layout;

  const colliders: BoxCollider[] = [
    { id: "chassis", center: [0, body.bellyY + body.height / 2, 0], halfExtents: [body.length / 2, body.height / 2, body.width / 2] },
  ];
  for (const id of config.attachments) {
    const a = getComponent<AttachmentSpec>(id);
    const p = mounts[PAYLOAD_MOUNT[a.mount]].position;
    if (a.mount === "front") colliders.push({ id, center: [p[0] + 0.18, body.bellyY + body.height * 0.55, p[2]], halfExtents: [0.2, body.height * 0.45, 0.16] });
    if (a.mount === "belly") colliders.push({ id, center: [p[0], p[1] - a.clearanceLossM / 2, 0], halfExtents: [0.22, a.clearanceLossM / 2, 0.18] });
    if (a.mount === "rear") colliders.push({ id, center: [p[0], p[1] + 0.13, 0], halfExtents: [body.length * 0.18, 0.13, body.width * 0.32] });
  }

  const sensors: SensorPhysics[] = [];
  for (const id of config.sensors) {
    const s = getComponent<SensorSpec>(id);
    if (s.mount === "front") sensors.push({ id, kind: s.variant, position: mounts["sensor.front"].position, direction: [1, 0, 0], rangeM: s.rangeM, fovDeg: s.fovDeg });
    if (s.mount === "sides") {
      sensors.push({ id: `${id}.left`, kind: s.variant, position: mounts["sensor.side.left"].position, direction: [0, 0, -1], rangeM: s.rangeM, fovDeg: s.fovDeg });
      sensors.push({ id: `${id}.right`, kind: s.variant, position: mounts["sensor.side.right"].position, direction: [0, 0, 1], rangeM: s.rangeM, fovDeg: s.fovDeg });
    }
    if (s.mount === "mast") {
      const p = mounts["sensor.mast"].position;
      sensors.push({ id, kind: s.variant, position: [p[0], body.deckY + MAST_HEIGHT_M, p[2]], direction: [1, 0, 0], rangeM: s.rangeM, fovDeg: s.fovDeg });
    }
    if (s.mount === "roof") {
      const p = mounts["sensor.roof"].position;
      sensors.push({ id, kind: s.variant, position: [p[0], body.deckY + 0.2, p[2]], direction: [1, 0, 0], rangeM: s.rangeM, fovDeg: s.fovDeg });
    }
  }

  return {
    gravity: MARS_GRAVITY,
    massKg: stats.massKg,
    centerOfMass: stats.centerOfMass,
    colliders,
    wheels: layout.wheels.map((w) => ({
      id: w.id, side: w.side, position: w.hub, radius: wheel.radiusM, width: wheel.widthM,
      friction: wheel.grip, steerable: w.steerable, maxTorqueNm: motor.torqueNm,
      maxAngularVelocity: (motor.wheelRpm / 60) * 2 * Math.PI,
    })),
    suspension: {
      type: "rocker-bogie",
      rockerPivots: layout.sides.map((s) => s.rockerPivot),
      bogiePivots: layout.sides.map((s) => s.bogiePivot),
      rockerTravel: (20 * Math.PI) / 180,
      bogieTravel: (25 * Math.PI) / 180,
    },
    drive: {
      type: "differential",
      left: layout.wheels.filter((w) => w.side === "left").map((w) => w.id),
      right: layout.wheels.filter((w) => w.side === "right").map((w) => w.id),
    },
    power: { batteryWh: stats.batteryWh, idleW: stats.power.avionicsW + stats.power.sensorsW + stats.power.attachmentsW, drivePerWheelW: motor.powerW },
    sensors,
    groundClearance: layout.groundClearance,
  };
}
