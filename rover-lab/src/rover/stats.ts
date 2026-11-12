/**
 * Engineering statistics derived from the configuration + layout. Pure functions:
 * every number here comes from component data, never from hand-typed display values.
 */
import { getComponent, type AttachmentSpec, type ChassisSpec, type MotorSpec, type SensorSpec, type WheelSpec } from "./catalogue";
import type { RoverConfiguration } from "./configuration";
import { computeRoverLayout, PAYLOAD_MOUNT, type RoverLayout, type Vec3 } from "./layout";

export const MARS_GRAVITY = 3.71; // m/s²
export const WHEEL_COUNT = 6;
/** Share of motor rated power used while cruising on flat ground. */
export const CRUISE_LOAD = 0.6;
/** Cruise speed as a share of top speed, used for range estimates. */
export const CRUISE_SPEED_SHARE = 0.7;
export const MAST_HEIGHT_M = 0.85;

export interface MassItem { label: string; massKg: number; position: Vec3 }

export interface PowerBreakdown { avionicsW: number; driveW: number; sensorsW: number; attachmentsW: number; totalW: number }

export interface RoverStats {
  massKg: number;
  weightN: number;
  massItems: MassItem[];
  centerOfMass: Vec3;
  torquePerWheelNm: number;
  totalTorqueNm: number;
  tractiveForceN: number;
  wheelRpm: number;
  maxSpeedMs: number;
  maxSlopeDeg: number;
  slopeLimitedBy: "torque" | "grip";
  stepHeightM: number;
  groundClearanceM: number;
  grip: number;
  batteryWh: number;
  power: PowerBreakdown;
  runtimeH: number;
  rangeKm: number;
  tipAngleDeg: number;
  payloadUsed: number;
  payloadSlots: number;
  sensors: SensorSpec[];
  attachments: AttachmentSpec[];
  capabilities: string[];
}

export function computeMassItems(config: RoverConfiguration, layout: RoverLayout): MassItem[] {
  const chassis = getComponent<ChassisSpec>(config.chassis);
  const wheel = getComponent<WheelSpec>(config.wheels);
  const motor = getComponent<MotorSpec>(config.motors);
  const { body, mounts } = layout;
  const items: MassItem[] = [
    { label: `${chassis.name} chassis`, massKg: chassis.massKg, position: [0, body.bellyY + body.height / 2, 0] },
    { label: "Rocker-bogie suspension", massKg: chassis.suspensionMassKg, position: [layout.sides[0].rockerPivot[0], (layout.sides[0].rockerPivot[1] + layout.wheels[0].top[1]) / 2, 0] },
  ];
  for (const w of layout.wheels) {
    items.push({ label: `Wheel ${w.id}`, massKg: wheel.massKg, position: w.hub });
    items.push({ label: `Motor ${w.id}`, massKg: motor.massKg, position: w.hub });
  }
  for (const id of config.sensors) {
    const s = getComponent<SensorSpec>(id);
    const pos: Vec3 =
      s.mount === "front" ? mounts["sensor.front"].position
      : s.mount === "sides" ? [mounts["sensor.side.left"].position[0], mounts["sensor.side.left"].position[1], 0]
      : s.mount === "mast" ? [mounts["sensor.mast"].position[0], body.deckY + MAST_HEIGHT_M * 0.6, mounts["sensor.mast"].position[2]]
      : [mounts["sensor.roof"].position[0], body.deckY + 0.15, mounts["sensor.roof"].position[2]];
    items.push({ label: s.name, massKg: s.massKg, position: pos });
  }
  for (const id of config.attachments) {
    const a = getComponent<AttachmentSpec>(id);
    const p = mounts[PAYLOAD_MOUNT[a.mount]].position;
    const pos: Vec3 = a.mount === "front" ? [p[0] + 0.2, body.bellyY + body.height * 0.7, p[2]] : a.mount === "belly" ? [p[0], p[1] - 0.05, p[2]] : [p[0], p[1] + 0.14, p[2]];
    items.push({ label: a.name, massKg: a.massKg, position: pos });
  }
  return items;
}

export function computeStats(config: RoverConfiguration, layout: RoverLayout = computeRoverLayout(config)): RoverStats {
  const chassis = getComponent<ChassisSpec>(config.chassis);
  const wheel = getComponent<WheelSpec>(config.wheels);
  const motor = getComponent<MotorSpec>(config.motors);
  const sensors = config.sensors.map((s) => getComponent<SensorSpec>(s));
  const attachments = config.attachments.map((a) => getComponent<AttachmentSpec>(a));

  const massItems = computeMassItems(config, layout);
  const massKg = massItems.reduce((s, i) => s + i.massKg, 0);
  const com = massItems.reduce<Vec3>((acc, i) => [acc[0] + i.position[0] * i.massKg, acc[1] + i.position[1] * i.massKg, acc[2] + i.position[2] * i.massKg], [0, 0, 0]);
  const centerOfMass: Vec3 = [com[0] / massKg, com[1] / massKg, com[2] / massKg];
  const weightN = massKg * MARS_GRAVITY;

  const r = wheel.radiusM;
  const totalTorqueNm = motor.torqueNm * WHEEL_COUNT;
  const tractiveForceN = totalTorqueNm / r;
  const maxSpeedMs = (motor.wheelRpm / 60) * 2 * Math.PI * r;

  // Steepest slope: motors must out-pull gravity along the slope (F ≥ m·g·sinθ),
  // and wheels must not slip (tanθ ≤ grip).
  const torqueSlope = Math.asin(Math.min(1, tractiveForceN / weightN));
  const gripSlope = Math.atan(wheel.grip);
  const maxSlopeDeg = (Math.min(torqueSlope, gripSlope) * 180) / Math.PI;
  const slopeLimitedBy = torqueSlope <= gripSlope ? "torque" : "grip";

  // Rocker-bogie can lift a wheel up a step ~1.5× its radius when the motors have enough force.
  const torqueFactor = Math.min(1, Math.max(0.65, tractiveForceN / (0.5 * weightN)));
  const stepHeightM = 1.5 * r * torqueFactor;

  const batteryWh = chassis.batteryWh + attachments.reduce((s, a) => s + a.batteryWh, 0);
  const power: PowerBreakdown = {
    avionicsW: chassis.powerW,
    driveW: WHEEL_COUNT * motor.powerW * CRUISE_LOAD,
    sensorsW: sensors.reduce((s, x) => s + x.powerW, 0),
    attachmentsW: attachments.reduce((s, x) => s + x.powerW, 0),
    totalW: 0,
  };
  power.totalW = power.avionicsW + power.driveW + power.sensorsW + power.attachmentsW;
  const runtimeH = batteryWh / power.totalW;
  const rangeKm = (runtimeH * 3600 * maxSpeedMs * CRUISE_SPEED_SHARE) / 1000;

  const tipAngleDeg = (Math.atan(layout.trackWidth / 2 / centerOfMass[1]) * 180) / Math.PI;

  return {
    massKg, weightN, massItems, centerOfMass,
    torquePerWheelNm: motor.torqueNm, totalTorqueNm, tractiveForceN,
    wheelRpm: motor.wheelRpm, maxSpeedMs, maxSlopeDeg, slopeLimitedBy, stepHeightM,
    groundClearanceM: layout.groundClearance, grip: wheel.grip,
    batteryWh, power, runtimeH, rangeKm, tipAngleDeg,
    payloadUsed: attachments.length, payloadSlots: chassis.payloadSlots,
    sensors, attachments,
    capabilities: ["Drive", ...sensors.map((s) => `Sense: ${s.name.toLowerCase()}`), ...attachments.map((a) => a.capability)],
  };
}
