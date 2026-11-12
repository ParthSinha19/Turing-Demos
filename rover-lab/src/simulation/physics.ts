import type { RoverJointState } from "@/rover/joints";
import type { RoverPhysicsProfile } from "@/rover/physicsProfile";
import type { RoverStats } from "@/rover/stats";
import { createTerrainHeight, type HeightFn } from "@/environment/terrainHeight";
import { ASSEMBLY_YARD, type EnvironmentDefinition } from "@/environment/environmentDefinition";
import type { DriveInput, RoverPose, SimulationObstacle, SimulationSnapshot, SimulationTelemetry, SimulationWorld, SensorReading } from "./types";
import { createJointState } from "@/rover/joints";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const deg = (radians: number) => (radians * 180) / Math.PI;
const rad = (degrees: number) => (degrees * Math.PI) / 180;
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export function getTerrainFunction(environment: EnvironmentDefinition = ASSEMBLY_YARD): HeightFn {
  return createTerrainHeight(environment);
}

export function createWorldHeight(world: SimulationWorld): HeightFn {
  const terrain = createTerrainHeight(world.environment);
  return (x, z) => {
    const distance = Math.hypot(x, z);
    if (distance <= 3.9) return 0;
    const blend = clamp((distance - 3.9) / 1.2, 0, 1);
    const smooth = blend * blend * (3 - 2 * blend);
    return terrain(x, z) * smooth;
  };
}

export function createInitialSnapshot(
  profile: RoverPhysicsProfile,
  stats: RoverStats,
  world: SimulationWorld,
  previous?: SimulationSnapshot,
  height: HeightFn = createWorldHeight(world),
): SimulationSnapshot {
  const pose: RoverPose = previous?.pose ?? {
    x: world.start.x,
    z: world.start.z,
    yaw: world.start.yaw,
    y: height(world.start.x, world.start.z),
    pitch: 0,
    roll: 0,
  };
  const joints = previous?.joints ?? createJointState();
  const battery = previous ? clamp(previous.batteryRemainingWh, 0, stats.batteryWh) : stats.batteryWh;
  const telemetry: SimulationTelemetry = previous?.telemetry ?? {
    speedMs: 0,
    batteryPercent: 100,
    batteryRemainingWh: battery,
    energyW: profile.power.idleW,
    charging: false,
    motorLoadPercent: 0,
    frontDistanceM: null,
    slopeDeg: 0,
    crossSlopeDeg: 0,
    stabilityPercent: 100,
    terrain: "Regolith",
    status: "Ready for driving",
    health: "ready",
    sensors: [],
    collision: null,
  };
  return {
    pose,
    velocityMs: previous?.velocityMs ?? 0,
    yawRate: previous?.yawRate ?? 0,
    batteryRemainingWh: battery,
    wheelSpin: previous?.wheelSpin ?? { FL: 0, ML: 0, RL: 0, FR: 0, MR: 0, RR: 0 },
    joints,
    telemetry,
    elapsedSeconds: previous?.elapsedSeconds ?? 0,
    travelledM: previous?.travelledM ?? 0,
    blockedSeconds: previous?.blockedSeconds ?? 0,
    autonomousDecision: previous?.autonomousDecision ?? "Manual control active",
    autonomousStage: previous?.autonomousStage ?? "drive",
    autonomousTurn: previous?.autonomousTurn ?? 0,
    autonomousTurnStartYaw: previous?.autonomousTurnStartYaw ?? pose.yaw,
    autonomousBypassDistanceM: previous?.autonomousBypassDistanceM ?? 0,
    missionProgress: previous?.missionProgress ?? 0,
    missionComplete: previous?.missionComplete ?? false,
    missionMessage: previous?.missionMessage ?? "",
    collectedSamples: previous?.collectedSamples ?? 0,
    hasDetectedObstacle: previous?.hasDetectedObstacle ?? false,
    checkpointsReached: previous ? [...previous.checkpointsReached] : [],
  };
}

function transformLocal(x: number, z: number, pose: RoverPose): [number, number] {
  const c = Math.cos(pose.yaw);
  const s = Math.sin(pose.yaw);
  return [pose.x + x * c - z * s, pose.z + x * s + z * c];
}

function rayCircleDistance(
  ox: number,
  oz: number,
  dx: number,
  dz: number,
  obstacle: SimulationObstacle,
): number | null {
  const rx = obstacle.x - ox;
  const rz = obstacle.z - oz;
  const projection = rx * dx + rz * dz;
  if (projection <= 0) return null;
  const perpendicularSq = rx * rx + rz * rz - projection * projection;
  const radiusSq = obstacle.radius * obstacle.radius;
  if (perpendicularSq > radiusSq) return null;
  const hit = projection - Math.sqrt(Math.max(0, radiusSq - perpendicularSq));
  return hit >= 0 ? hit : projection + Math.sqrt(Math.max(0, radiusSq - perpendicularSq));
}

export function castSensorReadings(
  pose: RoverPose,
  profile: RoverPhysicsProfile,
  obstacles: SimulationObstacle[],
): SensorReading[] {
  const readings: SensorReading[] = [];
  for (const sensor of profile.sensors) {
    const [ox, oz] = transformLocal(sensor.position[0], sensor.position[2], pose);
    const baseAngle = Math.atan2(sensor.direction[2], sensor.direction[0]) + pose.yaw;
    const rayCount = sensor.kind === "lidar" ? 48 : sensor.kind === "camera" ? 9 : sensor.kind === "side" ? 3 : 5;
    for (let i = 0; i < rayCount; i++) {
      const offset = sensor.kind === "lidar"
        ? (i / rayCount) * Math.PI * 2
        : ((i / (rayCount - 1)) - 0.5) * rad(sensor.fovDeg);
      const angle = baseAngle + offset;
      const dx = Math.cos(angle);
      const dz = Math.sin(angle);
      let closest = sensor.rangeM;
      let target: SimulationObstacle | null = null;
      for (const obstacle of obstacles) {
        if (["sample", "checkpoint", "beacon", "station"].includes(obstacle.kind)) continue;
        const d = rayCircleDistance(ox, oz, dx, dz, obstacle);
        if (d !== null && d < closest) {
          closest = d;
          target = obstacle;
        }
      }
      const isWithinFov = sensor.kind === "lidar" || Math.abs(wrapAngle(angle - baseAngle)) <= rad(sensor.fovDeg / 2);
      if (!isWithinFov) continue;
      const measured = target ? closest : null;
      readings.push({
        id: `${sensor.id}.${i}`,
        kind: sensor.kind,
        distanceM: measured,
        maxRangeM: sensor.rangeM,
        worldOrigin: [ox, pose.y + sensor.position[1], oz],
        worldDirection: [dx, 0, dz],
        hitPoint: target ? [ox + dx * closest, pose.y + sensor.position[1], oz + dz * closest] : null,
        angleDeg: deg(wrapAngle(angle - pose.yaw)),
      });
    }
  }
  return readings;
}

function terrainInclination(height: HeightFn, pose: RoverPose) {
  const d = 0.55;
  const gx = (height(pose.x + d, pose.z) - height(pose.x - d, pose.z)) / (2 * d);
  const gz = (height(pose.x, pose.z + d) - height(pose.x, pose.z - d)) / (2 * d);
  const forward = gx * Math.cos(pose.yaw) + gz * Math.sin(pose.yaw);
  const lateral = -gx * Math.sin(pose.yaw) + gz * Math.cos(pose.yaw);
  return { slope: Math.atan(forward), crossSlope: Math.atan(lateral), gx, gz };
}

function sensorSummary(readings: SensorReading[]) {
  const front = readings.filter((r) => ["distance", "camera"].includes(r.kind) && Math.abs(r.angleDeg) <= 35 && r.distanceM !== null);
  const lidarFront = readings.filter((r) => r.kind === "lidar" && Math.abs(r.angleDeg) <= 15 && r.distanceM !== null);
  const distances = [...front, ...lidarFront].map((r) => r.distanceM as number);
  return distances.length ? Math.min(...distances) : null;
}

function getCollision(
  x: number,
  z: number,
  yaw: number,
  profile: RoverPhysicsProfile,
  stats: RoverStats,
  obstacles: SimulationObstacle[],
): SimulationObstacle | null {
  const colliders = profile.colliders.length ? profile.colliders : [{ id: "chassis", center: [0, 0, 0] as [number, number, number], halfExtents: [0.65, 0.4, 0.5] as [number, number, number] }];
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  for (const obstacle of obstacles) {
    if (["sample", "checkpoint", "beacon", "station"].includes(obstacle.kind) || obstacle.height <= stats.stepHeightM) continue;
    for (const collider of colliders) {
      const cx = x + collider.center[0] * c - collider.center[2] * s;
      const cz = z + collider.center[0] * s + collider.center[2] * c;
      const footprint = Math.hypot(collider.halfExtents[0], collider.halfExtents[2]) * 0.82;
      if (Math.hypot(cx - obstacle.x, cz - obstacle.z) < footprint + obstacle.radius) return obstacle;
    }
  }
  return null;
}

function createObstacleSurface(
  height: HeightFn,
  profile: RoverPhysicsProfile,
  stats: RoverStats,
  obstacles: SimulationObstacle[],
): HeightFn {
  const wheelRadius = profile.wheels.reduce((sum, wheel) => sum + wheel.radius, 0) / Math.max(1, profile.wheels.length);
  const climbable = obstacles.filter((obstacle) =>
    !["sample", "checkpoint", "beacon", "station"].includes(obstacle.kind) && obstacle.height <= stats.stepHeightM,
  );
  if (!climbable.length) return height;
  return (x, z) => {
    const base = height(x, z);
    let lift = 0;
    for (const obstacle of climbable) {
      const distance = Math.hypot(x - obstacle.x, z - obstacle.z);
      const reach = obstacle.radius + wheelRadius;
      const t = clamp((reach - distance) / Math.max(0.1, wheelRadius * 1.35), 0, 1);
      const eased = t * t * (3 - 2 * t);
      lift = Math.max(lift, obstacle.height * eased);
    }
    return base + lift;
  };
}

function updateSuspension(snapshot: SimulationSnapshot, profile: RoverPhysicsProfile, height: HeightFn) {
  const samples = profile.wheels.map((wheel) => {
    const [x, z] = transformLocal(wheel.position[0], wheel.position[2], snapshot.pose);
    return { ...wheel, ground: height(x, z) };
  });
  const wheel = (id: string) => samples.find((s) => s.id === id)?.ground ?? snapshot.pose.y;
  const max = profile.suspension.rockerTravel;
  const bogieMax = profile.suspension.bogieTravel;
  const target = (v: number, limit: number) => clamp(v, -limit, limit);
  snapshot.joints.rocker.left = target((wheel("FL") + wheel("ML") + wheel("RL") - wheel("FR") - wheel("MR") - wheel("RR")) / 3, max);
  snapshot.joints.rocker.right = -snapshot.joints.rocker.left;
  snapshot.joints.bogie.left = target((wheel("ML") - wheel("RL")) * 0.55, bogieMax);
  snapshot.joints.bogie.right = target((wheel("MR") - wheel("RR")) * 0.55, bogieMax);
}

export interface StepContext {
  profile: RoverPhysicsProfile;
  stats: RoverStats;
  world: SimulationWorld;
  height?: HeightFn;
}

export function stepSimulation(
  current: SimulationSnapshot,
  input: DriveInput,
  dt: number,
  context: StepContext,
): SimulationSnapshot {
  const { profile, stats, world } = context;
  const terrainHeight = context.height ?? createWorldHeight(world);
  const height = createObstacleSurface(terrainHeight, profile, stats, world.obstacles);
  const step = clamp(dt, 0, 0.05);
  if (step <= 0) return current;
  const next: SimulationSnapshot = {
    ...current,
    checkpointsReached: [...current.checkpointsReached],
    pose: { ...current.pose },
    wheelSpin: { ...current.wheelSpin },
    joints: {
      ...current.joints,
      rocker: { ...current.joints.rocker },
      bogie: { ...current.joints.bogie },
      steer: { ...current.joints.steer },
      wheelSpin: { ...current.joints.wheelSpin },
    },
    telemetry: { ...current.telemetry, sensors: [...current.telemetry.sensors] },
  };
  const throttle = current.batteryRemainingWh > 0 ? clamp(input.throttle, -1, 1) : 0;
  const steer = clamp(input.steer, -1, 1);
  const incline = terrainInclination(height, next.pose);
  const slopeDeg = deg(incline.slope);
  const crossSlopeDeg = deg(incline.crossSlope);
  const averageRadius = profile.wheels.reduce((sum, w) => sum + w.radius, 0) / Math.max(1, profile.wheels.length);
  const trackWidth = profile.wheels.reduce((sum, w) => sum + Math.abs(w.position[2]) * 2, 0) / Math.max(1, profile.wheels.length);
  const maxWheelSpeed = profile.wheels.reduce((max, w) => Math.max(max, w.radius * w.maxAngularVelocity), 0);
  const leftCmd = clamp(throttle + steer * 0.58, -1, 1);
  const rightCmd = clamp(throttle - steer * 0.58, -1, 1);
  const leftTarget = leftCmd * maxWheelSpeed;
  const rightTarget = rightCmd * maxWheelSpeed;
  const driveTarget = (leftTarget + rightTarget) * 0.5;
  const motorForce = profile.wheels.reduce((sum, w) => sum + w.maxTorqueNm / w.radius, 0);
  const normalForce = stats.massKg * profile.gravity * Math.max(0.12, Math.cos(incline.slope) * Math.cos(incline.crossSlope));
  const gripForce = normalForce * stats.grip;
  const powerLimitedForce = (profile.wheels.length * profile.power.drivePerWheelW) / Math.max(0.45, Math.abs(next.velocityMs));
  const availableForce = Math.min(motorForce, gripForce, powerLimitedForce);
  const gravityAlong = stats.massKg * profile.gravity * Math.sin(incline.slope);
  const desiredDirection = Math.sign(driveTarget || next.velocityMs);
  const driveForce = desiredDirection * Math.min(availableForce, Math.abs(throttle) * availableForce);
  const gradeLimit = rad(stats.maxSlopeDeg);
  const slopeFactor = Math.abs(incline.slope) <= gradeLimit ? 1 : clamp(gradeLimit / Math.abs(incline.slope), 0.04, 0.72);
  const rollingResistance = stats.massKg * profile.gravity * 0.025 * Math.sign(next.velocityMs || driveTarget);
  const aerodynamicDrag = 0.22 * next.velocityMs * Math.abs(next.velocityMs);
  const tractionForce = driveForce * slopeFactor;
  const acceleration = (tractionForce - gravityAlong - rollingResistance - aerodynamicDrag) / stats.massKg;
  const maxAcceleration = Math.max(0.12, availableForce / stats.massKg);
  const boundedAcceleration = clamp(acceleration, -maxAcceleration, maxAcceleration);
  let velocity = next.velocityMs + boundedAcceleration * step;
  if (input.brake) velocity *= Math.exp(-7.5 * step);
  else if (Math.abs(throttle) < 0.03 && Math.abs(incline.slope) < 0.025) velocity *= Math.exp(-0.55 * step);
  velocity = clamp(velocity, -maxWheelSpeed, maxWheelSpeed);

  const yawRateTarget = trackWidth > 0.1 ? (leftTarget - rightTarget) / trackWidth : 0;
  next.yawRate += (yawRateTarget - next.yawRate) * (1 - Math.exp(-4.5 * step));
  next.pose.yaw = wrapAngle(next.pose.yaw + next.yawRate * step);

  const dx = Math.cos(next.pose.yaw) * velocity * step;
  const dz = Math.sin(next.pose.yaw) * velocity * step;
  const candidateX = next.pose.x + dx;
  const candidateZ = next.pose.z + dz;
  const collision = getCollision(candidateX, candidateZ, next.pose.yaw, profile, stats, world.obstacles);
  let blocked = false;
  if (collision) {
    blocked = true;
    velocity *= Math.exp(-9 * step);
    next.blockedSeconds += step;
  } else {
    next.pose.x = candidateX;
    next.pose.z = candidateZ;
    const distanceTravelled = Math.hypot(dx, dz);
    next.travelledM += distanceTravelled;
    if (current.autonomousStage === "bypass") next.autonomousBypassDistanceM += distanceTravelled;
    next.blockedSeconds = Math.max(0, next.blockedSeconds - step * 0.5);
  }
  next.velocityMs = velocity;
  next.pose.y = height(next.pose.x, next.pose.z);
  for (const checkpoint of world.checkpoints ?? []) {
    if (!next.checkpointsReached.includes(checkpoint.id) && Math.hypot(next.pose.x - checkpoint.x, next.pose.z - checkpoint.z) <= checkpoint.radius) {
      next.checkpointsReached.push(checkpoint.id);
    }
  }
  if (world.sample && next.collectedSamples === 0) {
    const hasTool = profile.colliders.some((collider) => collider.id === "attach-collector" || collider.id === "attach-arm");
    if (hasTool && Math.hypot(next.pose.x - world.sample.x, next.pose.z - world.sample.z) <= world.sample.radius + 0.45) next.collectedSamples = 1;
  }
  next.pose.pitch = incline.slope;
  next.pose.roll = -incline.crossSlope;
  next.elapsedSeconds += step;

  for (const id of ["FL", "FR"] as const) next.joints.steer[id] = steer * 0.38;
  for (const id of ["RL", "RR"] as const) next.joints.steer[id] = -steer * 0.16;
  for (const w of profile.wheels) {
    const wheelCmd = w.side === "left" ? leftCmd : rightCmd;
    const groundSpeed = velocity + next.yawRate * w.position[2];
    const wheelSpeed = blocked ? wheelCmd * maxWheelSpeed * (Math.abs(throttle) > 0.1 ? 0.28 : 0) : groundSpeed;
    const spin = wheelSpeed / Math.max(0.05, w.radius) * step;
    next.wheelSpin[w.id] += spin;
    next.joints.wheelSpin[w.id] = next.wheelSpin[w.id];
  }
  next.joints.lidar += step * 2.6;
  next.joints.mastPan = Math.sin(next.elapsedSeconds * 0.25) * 0.16;
  updateSuspension(next, profile, height);

  const sensors = castSensorReadings(next.pose, profile, world.obstacles);
  next.hasDetectedObstacle = next.hasDetectedObstacle || sensors.some((reading) => reading.distanceM !== null);
  const frontDistanceM = sensorSummary(sensors);
  const idleW = profile.power.idleW;
  const driveW = profile.wheels.length * profile.power.drivePerWheelW * Math.min(1.8, Math.abs(throttle) * (0.2 + Math.abs(velocity) / Math.max(0.2, maxWheelSpeed)));
  const climbFactor = Math.max(1, Math.abs(gravityAlong) / Math.max(1, availableForce));
  const onChargingPad = Math.hypot(next.pose.x, next.pose.z) <= 3.65;
  const charging = onChargingPad && Math.abs(velocity) < 0.08 && Math.abs(throttle) < 0.03 && next.batteryRemainingWh < stats.batteryWh;
  const energyW = charging ? -720 : idleW + driveW * climbFactor;
  next.batteryRemainingWh = clamp(next.batteryRemainingWh - (energyW * step) / 3600, 0, stats.batteryWh);
  const batteryPercent = (next.batteryRemainingWh / Math.max(1, stats.batteryWh)) * 100;
  const motorLoadPercent = clamp((Math.abs(gravityAlong) + Math.abs(tractionForce)) / Math.max(1, availableForce) * 100, 0, 160);
  const slopeLimited = Math.abs(slopeDeg) > stats.maxSlopeDeg;
  const wheelSpanX = Math.max(...profile.wheels.map((wheel) => wheel.position[0])) - Math.min(...profile.wheels.map((wheel) => wheel.position[0]));
  const wheelSpanZ = Math.max(...profile.wheels.map((wheel) => wheel.position[2])) - Math.min(...profile.wheels.map((wheel) => wheel.position[2]));
  const comHeight = Math.max(0.1, profile.centerOfMass[1]);
  const lateralTip = deg(Math.atan(Math.max(0.05, wheelSpanZ / 2 - Math.abs(profile.centerOfMass[2])) / comHeight));
  const longitudinalTip = deg(Math.atan(Math.max(0.05, wheelSpanX / 2 - Math.abs(profile.centerOfMass[0])) / comHeight));
  const tipLimit = Math.min(stats.tipAngleDeg, lateralTip, longitudinalTip);
  const stabilityPercent = clamp(100 - Math.max(0, Math.abs(crossSlopeDeg) - tipLimit * 0.55) * 1.4 - Math.max(0, Math.abs(slopeDeg) - tipLimit * 0.7) * 1.1, 0, 100);
  const health = charging ? "ready" : batteryPercent <= 8 ? "low-battery" : stabilityPercent < 15 ? "tipped" : blocked && next.blockedSeconds > 1.1 ? "stuck" : blocked ? "obstructed" : Math.abs(velocity) > 0.03 ? "moving" : "ready";
  let terrain = Math.abs(slopeDeg) > 14 ? "Steep slope" : Math.abs(slopeDeg) > 5 ? "Uneven incline" : "Regolith";
  if (slopeLimited) terrain += " · low traction";
  const status = charging ? "Charging at the assembly pad. Battery energy is being restored." : health === "low-battery" ? "Battery is running low. Return to the charging pad." :
    health === "tipped" ? "The rover is unstable. Stop and choose a safer route." :
    health === "stuck" ? "The rover is obstructed. Try a different route or improve its clearance." :
    blocked ? `${collision?.kind === "boulder" ? "Boulder" : "Obstacle"} blocking the rover. Reverse or steer around it.` :
    slopeLimited ? "The rover is struggling on this slope. More torque or grip may help." :
    Math.abs(velocity) > 0.03 ? "Rover moving." : "Ready for driving";
  next.telemetry = {
    speedMs: Math.abs(velocity),
    batteryPercent,
    batteryRemainingWh: next.batteryRemainingWh,
    energyW: Math.abs(energyW),
    charging,
    motorLoadPercent,
    frontDistanceM,
    slopeDeg,
    crossSlopeDeg,
    stabilityPercent,
    terrain,
    status,
    health,
    sensors,
    collision: collision ? collision.id : null,
  };
  if (next.batteryRemainingWh <= 0) next.velocityMs = 0;
  return next;
}

export interface AutonomyDecision {
  input: DriveInput;
  stage: SimulationSnapshot["autonomousStage"];
  turn: -1 | 0 | 1;
  message: string;
  turnStartYaw?: number;
  resetBypassDistance?: boolean;
}

export function chooseAutonomousInput(
  snapshot: SimulationSnapshot,
  profile: RoverPhysicsProfile,
  world: SimulationWorld,
): AutonomyDecision {
  const hasLidar = profile.sensors.some((sensor) => sensor.kind === "lidar");
  const hasFront = profile.sensors.some((sensor) => sensor.kind === "distance" || sensor.kind === "lidar");
  const hasSide = profile.sensors.some((sensor) => sensor.kind === "side");
  if (!hasFront || (!hasLidar && !hasSide)) {
    return { input: { throttle: 0, steer: 0, brake: true }, stage: "stop", turn: 0, message: "Autonomy needs a front distance sensor and either side sensors or LiDAR. Install the missing sensor hardware in the Design Lab." };
  }

  const front = snapshot.telemetry.frontDistanceM;
  const readings = snapshot.telemetry.sensors;
  const leftReading = readings.filter((reading) =>
    (reading.kind === "side" && reading.angleDeg < 0) || (reading.kind === "lidar" && reading.angleDeg < -25 && reading.angleDeg > -100),
  );
  const rightReading = readings.filter((reading) =>
    (reading.kind === "side" && reading.angleDeg > 0) || (reading.kind === "lidar" && reading.angleDeg > 25 && reading.angleDeg < 100),
  );
  const clearance = (items: SensorReading[]) => items.length
    ? Math.min(...items.map((reading) => reading.distanceM ?? reading.maxRangeM))
    : 0;
  const leftClearance = clearance(leftReading);
  const rightClearance = clearance(rightReading);
  const stopDistance = Math.max(1.4, snapshot.telemetry.speedMs * 1.8);
  const headingError = wrapAngle(snapshot.pose.yaw - snapshot.autonomousTurnStartYaw);

  if (snapshot.autonomousStage === "drive" && front !== null && front < stopDistance) {
    return { input: { throttle: 0, steer: 0, brake: true }, stage: "stop", turn: 0, message: `Obstacle detected at ${front.toFixed(1)} m. Stopping.` };
  }
  if (snapshot.autonomousStage === "stop") {
    return { input: { throttle: 0, steer: 0, brake: true }, stage: "inspect", turn: 0, message: "Stopped. Checking the left and right sensor readings." };
  }
  if (snapshot.autonomousStage === "inspect") {
    const turn: -1 | 1 = leftClearance >= rightClearance ? -1 : 1;
    return {
      input: { throttle: 0, steer: turn, brake: true },
      stage: "turn",
      turn,
      turnStartYaw: snapshot.pose.yaw,
      message: `${turn < 0 ? "Left" : "Right"} side has more clear space (${Math.max(leftClearance, rightClearance).toFixed(1)} m). Turning away from the obstacle.`,
    };
  }
  if (snapshot.autonomousStage === "turn") {
    if (Math.abs(headingError) < 0.52) {
      return { input: { throttle: 0, steer: snapshot.autonomousTurn, brake: true }, stage: "turn", turn: snapshot.autonomousTurn, message: "Turning in place to line up a path around the obstacle." };
    }
    return {
      input: { throttle: 0.55, steer: 0, brake: false },
      stage: "bypass",
      turn: snapshot.autonomousTurn,
      resetBypassDistance: true,
      message: "Turn complete. Moving around the obstacle while keeping the sensors active.",
    };
  }
  if (snapshot.autonomousStage === "bypass") {
    const nearestDetection = readings.reduce((nearest, reading) =>
      reading.distanceM === null ? nearest : Math.min(nearest, reading.distanceM), Infinity,
    );
    const clearOfObstacle = nearestDetection > 5.5 && snapshot.autonomousBypassDistanceM >= 1.6;
    const maximumBypass = snapshot.autonomousBypassDistanceM >= 4.5;
    if (clearOfObstacle || maximumBypass) {
      const targetHeading = world.target
        ? Math.atan2(world.target.z - snapshot.pose.z, world.target.x - snapshot.pose.x)
        : snapshot.autonomousTurnStartYaw;
      return {
        input: { throttle: 0, steer: 0, brake: true },
        stage: "return",
        turn: snapshot.autonomousTurn,
        turnStartYaw: targetHeading,
        message: "Obstacle passed. Aligning with the route to the destination.",
      };
    }
    return { input: { throttle: 0.55, steer: 0, brake: false }, stage: "bypass", turn: snapshot.autonomousTurn, message: "Moving past the obstacle. Checking that the rover has enough clearance." };
  }
  if (snapshot.autonomousStage === "return") {
    if (Math.abs(headingError) > 0.08) {
      const steer: -1 | 1 = headingError > 0 ? -1 : 1;
      return { input: { throttle: 0, steer, brake: true }, stage: "return", turn: snapshot.autonomousTurn, message: "Aligning with the route to the destination." };
    }
    return { input: { throttle: 0.65, steer: 0, brake: false }, stage: "drive", turn: 0, message: "Path clear. Resuming movement towards the destination." };
  }
  const targetHeading = world.target
    ? Math.atan2(world.target.z - snapshot.pose.z, world.target.x - snapshot.pose.x)
    : snapshot.pose.yaw;
  const targetHeadingError = wrapAngle(targetHeading - snapshot.pose.yaw);
  const targetSteer = clamp(targetHeadingError * 1.8, -0.7, 0.7);
  return {
    input: { throttle: 0.65, steer: targetSteer, brake: false },
    stage: "drive",
    turn: 0,
    message: Math.abs(targetHeadingError) > 0.12 ? "Path clear. Adjusting heading towards the destination." : "Path clear. Moving forward.",
  };
}

export function resetSimulationPosition(
  snapshot: SimulationSnapshot,
  world: SimulationWorld,
  profile: RoverPhysicsProfile,
  stats: RoverStats,
  height: HeightFn = createWorldHeight(world),
): SimulationSnapshot {
  const reset = createInitialSnapshot(profile, stats, world, undefined, height);
  const battery = clamp(snapshot.batteryRemainingWh, 0, stats.batteryWh);
  reset.batteryRemainingWh = battery;
  reset.telemetry = {
    ...reset.telemetry,
    batteryRemainingWh: battery,
    batteryPercent: (battery / Math.max(1, stats.batteryWh)) * 100,
    energyW: profile.power.idleW,
    health: battery <= 0 ? "low-battery" : "ready",
    status: "Position reset. Battery charge retained.",
  };
  return reset;
}
