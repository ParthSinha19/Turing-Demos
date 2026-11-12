/**
 * Joint state: the live articulation of the rover's moving parts.
 * The 3D assembly only READS this every frame. In the Design Lab an articulation test drives it;
 * the Sandbox physics runtime writes the same fields, so the model is shared across both sections.
 */
import type { WheelId } from "./layout";

export interface RoverJointState {
  /** Rocker swing about the lateral axis, radians (+ lifts the front wheel). */
  rocker: { left: number; right: number };
  /** Bogie swing about the lateral axis, radians (+ lifts the middle wheel). */
  bogie: { left: number; right: number };
  /** Steering angle of corner wheels about the vertical axis, radians (+ turns left). */
  steer: Record<"FL" | "FR" | "RL" | "RR", number>;
  /** Accumulated wheel rotation, radians (+ rolls forward). */
  wheelSpin: Record<WheelId, number>;
  /** LiDAR head rotation, radians. */
  lidar: number;
  /** Mast head pan, radians. */
  mastPan: number;
}

export function createJointState(): RoverJointState {
  return {
    rocker: { left: 0, right: 0 },
    bogie: { left: 0, right: 0 },
    steer: { FL: 0, FR: 0, RL: 0, RR: 0 },
    wheelSpin: { FL: 0, ML: 0, RL: 0, FR: 0, MR: 0, RR: 0 },
    lidar: 0,
    mastPan: 0,
  };
}
