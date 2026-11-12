/**
 * Rover layout: where every part physically sits, derived from the configuration.
 * Coordinates in metres, rover frame: +X forward, +Y up, +Z right. Ground at y = 0, wheels resting on it.
 * The 3D assembly, the engineering stats and the physics profile all use THIS layout,
 * so the model you see and the numbers you read can never disagree.
 */
import { getComponent, type ChassisSpec, type WheelSpec, type AttachmentSpec } from "./catalogue";
import type { RoverConfiguration } from "./configuration";

export type Vec3 = [number, number, number];
export type Side = "left" | "right";
export type WheelStation = "front" | "middle" | "rear";
export type WheelId = "FL" | "ML" | "RL" | "FR" | "MR" | "RR";

export interface WheelLayout {
  id: WheelId;
  side: Side;
  station: WheelStation;
  steerable: boolean;
  /** Wheel centre (hub) in rover frame. */
  hub: Vec3;
  /** Top of the steering/fork assembly directly above the hub. */
  top: Vec3;
}

export interface SideLayout {
  side: Side;
  sign: -1 | 1;
  /** Rocker pivot on the body (joint between body and rocker). */
  rockerPivot: Vec3;
  /** Bogie pivot (joint between rocker and bogie). */
  bogiePivot: Vec3;
  /** z of the suspension arms. */
  armZ: number;
}

export type MountId =
  | "sensor.front" | "sensor.side.left" | "sensor.side.right" | "sensor.mast" | "sensor.roof"
  | "payload.front" | "payload.belly" | "payload.rear"
  | "antenna.hga" | "antenna.lga";

export interface MountPoint {
  id: MountId;
  label: string;
  position: Vec3;
  /** Outward-facing direction of the mount. */
  normal: Vec3;
}

export interface RoverLayout {
  body: { length: number; width: number; height: number; bellyY: number; deckY: number; centerX: number };
  wheel: { radius: number; width: number };
  wheels: WheelLayout[];
  sides: [SideLayout, SideLayout];
  differentialBar: { x: number; y: number };
  mounts: Record<MountId, MountPoint>;
  wheelbase: number;
  trackWidth: number;
  /** Lowest point between the wheels, accounting for parts that hang under the belly. */
  groundClearance: number;
}

export function computeRoverLayout(config: RoverConfiguration): RoverLayout {
  const chassis = getComponent<ChassisSpec>(config.chassis);
  const wheel = getComponent<WheelSpec>(config.wheels);
  const r = wheel.radiusM;
  const L = chassis.lengthM;
  const W = chassis.widthM;
  const H = chassis.heightM;

  const bellyY = r * 1.15 + chassis.suspensionLiftM;
  const deckY = bellyY + H;

  // Wheel stations along X: spacing grows with wheel size so wheels never overlap.
  const middleX = -0.05 * L;
  const frontX = middleX + Math.max(0.6 * L, 2 * r + 0.14);
  const rearX = middleX - Math.max(0.55 * L, 2 * r + 0.14);
  const topY = r + r + 0.1; // hub (r) + wheel radius + bracket gap
  const armOffset = 0.06;
  const wheelOffset = wheel.widthM / 2 + 0.12;

  const rockerX = middleX + 0.22 * (frontX - middleX);
  const rockerY = bellyY + H * 0.45;
  const bogieX = (middleX + rearX) / 2;
  const bogieY = topY + 0.06;

  const sides = (["left", "right"] as const).map((side) => {
    const sign = side === "left" ? -1 : 1;
    const armZ = sign * (W / 2 + armOffset);
    return { side, sign, armZ, rockerPivot: [rockerX, rockerY, armZ] as Vec3, bogiePivot: [bogieX, bogieY, armZ] as Vec3 };
  }) as [SideLayout, SideLayout];

  const wheels: WheelLayout[] = [];
  for (const s of sides) {
    const z = s.sign * (W / 2 + wheelOffset);
    const suffix = s.side === "left" ? "L" : "R";
    const stations: [WheelStation, number, boolean][] = [["front", frontX, true], ["middle", middleX, false], ["rear", rearX, true]];
    for (const [station, x, steerable] of stations) {
      wheels.push({
        id: `${station[0].toUpperCase()}${suffix}` as WheelId,
        side: s.side, station, steerable,
        hub: [x, r, z],
        top: [x, topY, z],
      });
    }
  }

  const attachments = config.attachments.map((a) => getComponent<AttachmentSpec>(a));
  const clearanceLoss = Math.max(0, ...attachments.map((a) => a.clearanceLossM));

  const m = (id: MountId, label: string, position: Vec3, normal: Vec3): MountPoint => ({ id, label, position, normal });
  const mounts: Record<MountId, MountPoint> = {
    "sensor.front": m("sensor.front", "Front sensor bay", [L / 2 + 0.02, bellyY + H * 0.62, 0], [1, 0, 0]),
    "sensor.side.left": m("sensor.side.left", "Left sensor bay", [L * 0.22, bellyY + H * 0.55, -W / 2], [0, 0, -1]),
    "sensor.side.right": m("sensor.side.right", "Right sensor bay", [L * 0.22, bellyY + H * 0.55, W / 2], [0, 0, 1]),
    "sensor.mast": m("sensor.mast", "Mast mount", [L * 0.36, deckY, -W * 0.3], [0, 1, 0]),
    "sensor.roof": m("sensor.roof", "Roof scanner mount", [L * 0.36, deckY, W * 0.24], [0, 1, 0]),
    "payload.front": m("payload.front", "Front payload slot", [L / 2, bellyY + H * 0.22, W * 0.12], [1, 0, 0]),
    "payload.belly": m("payload.belly", "Belly payload slot", [L * 0.08, bellyY, 0], [0, -1, 0]),
    "payload.rear": m("payload.rear", "Rear payload slot", [-L * 0.3, deckY, 0], [0, 1, 0]),
    "antenna.hga": m("antenna.hga", "High-gain antenna", [-L * 0.02, deckY, W * 0.3], [0, 1, 0]),
    "antenna.lga": m("antenna.lga", "Low-gain antenna", [-L * 0.06, deckY, -W * 0.34], [0, 1, 0]),
  };

  return {
    body: { length: L, width: W, height: H, bellyY, deckY, centerX: 0 },
    wheel: { radius: r, width: wheel.widthM },
    wheels,
    sides,
    differentialBar: { x: rockerX, y: deckY + 0.06 },
    mounts,
    wheelbase: frontX - rearX,
    trackWidth: 2 * (W / 2 + wheelOffset),
    groundClearance: bellyY - clearanceLoss,
  };
}

export const PAYLOAD_MOUNT: Record<AttachmentSpec["mount"], MountId> = {
  front: "payload.front", belly: "payload.belly", rear: "payload.rear",
};
