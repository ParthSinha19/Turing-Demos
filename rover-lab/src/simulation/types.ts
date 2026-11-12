import type { RoverJointState } from "@/rover/joints";
import type { EnvironmentDefinition } from "@/environment/environmentDefinition";

export interface RoverPose {
  x: number;
  z: number;
  yaw: number;
  y: number;
  pitch: number;
  roll: number;
}

export interface DriveInput {
  throttle: number;
  steer: number;
  brake: boolean;
}

export interface SensorReading {
  id: string;
  kind: "distance" | "side" | "camera" | "lidar";
  distanceM: number | null;
  maxRangeM: number;
  worldOrigin: [number, number, number];
  worldDirection: [number, number, number];
  hitPoint: [number, number, number] | null;
  angleDeg: number;
}

export type RoverHealth = "ready" | "moving" | "obstructed" | "low-battery" | "stuck" | "tipped";

export interface SimulationTelemetry {
  speedMs: number;
  batteryPercent: number;
  batteryRemainingWh: number;
  energyW: number;
  charging: boolean;
  motorLoadPercent: number;
  frontDistanceM: number | null;
  slopeDeg: number;
  crossSlopeDeg: number;
  stabilityPercent: number;
  terrain: string;
  status: string;
  health: RoverHealth;
  sensors: SensorReading[];
  collision: string | null;
}

export interface SimulationSnapshot {
  pose: RoverPose;
  velocityMs: number;
  yawRate: number;
  batteryRemainingWh: number;
  wheelSpin: RoverJointState["wheelSpin"];
  joints: RoverJointState;
  telemetry: SimulationTelemetry;
  elapsedSeconds: number;
  travelledM: number;
  blockedSeconds: number;
  autonomousDecision: string;
  autonomousStage: "drive" | "stop" | "inspect" | "turn" | "bypass" | "return";
  autonomousTurn: -1 | 0 | 1;
  autonomousTurnStartYaw: number;
  autonomousBypassDistanceM: number;
  missionProgress: number;
  missionComplete: boolean;
  missionMessage: string;
  collectedSamples: number;
  hasDetectedObstacle: boolean;
  checkpointsReached: string[];
}

export interface SimulationObstacle {
  id: string;
  kind: "rock" | "boulder" | "barrier" | "crate" | "sample" | "checkpoint" | "beacon" | "station";
  x: number;
  z: number;
  radius: number;
  height: number;
  width?: number;
  depth?: number;
  color?: string;
}

export interface SimulationWorld {
  id: string;
  name: string;
  environmentId: string;
  environment: EnvironmentDefinition;
  checkpoints?: { id: string; x: number; z: number; radius: number }[];
  obstacles: SimulationObstacle[];
  start: { x: number; z: number; yaw: number };
  target?: { x: number; z: number; radius: number; label: string };
  sample?: { x: number; z: number; radius: number; label: string };
}
