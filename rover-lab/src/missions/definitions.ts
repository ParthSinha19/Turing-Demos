import type { EnvironmentDefinition } from "@/environment/environmentDefinition";
import { ASSEMBLY_YARD } from "@/environment/environmentDefinition";
import type { SimulationObstacle, SimulationSnapshot, SimulationWorld } from "@/simulation/types";
import { createSimulationWorld } from "@/simulation/world";
import type { RoverConfiguration } from "@/rover/configuration";

export type MissionObjectiveKind = "beacon" | "route" | "sensor-route" | "sample" | "ascent";

export interface MissionDefinition {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  briefing: string;
  objective: string;
  learning: string[];
  hints: string[];
  estimatedDuration?: string;
  sensorFocus?: string[];
  activitySteps?: string[];
  kind: MissionObjectiveKind;
  target: { x: number; z: number; radius: number; label: string };
  sample?: { x: number; z: number; radius: number; label: string };
  checkpoints?: { id: string; x: number; z: number; radius: number; label: string }[];
  environment?: EnvironmentDefinition;
  obstacles: SimulationObstacle[];
  requirements?: { attachment?: string[]; sensors?: string[] };
}

function missionEnvironment(definition: EnvironmentDefinition, id: string, name: string): EnvironmentDefinition {
  return {
    ...definition,
    id,
    name,
    flatZones: [{ x: 0, z: 0, radius: 40, height: -0.16 }],
    rocks: {
      ...definition.rocks,
      boulders: { ...definition.rocks.boulders, count: 0 },
      rocks: { ...definition.rocks.rocks, count: 0 },
      pebbles: { ...definition.rocks.pebbles, count: 0 },
    },
  };
}

const missionYard = missionEnvironment(ASSEMBLY_YARD, "mission-yard", "Jezero Mission Yard");
const ascentEnvironment: EnvironmentDefinition = {
  ...missionEnvironment(ASSEMBLY_YARD, "final-ascent", "Final Ascent Ridge"),
  ramps: [{ id: "research-ascent", x: 19, z: 0, length: 15, width: 10, rise: 6.2, heading: 0 }],
};
const craterSurveyEnvironment: EnvironmentDefinition = {
  ...missionEnvironment(ASSEMBLY_YARD, "crater-survey", "Jezero Crater Rim"),
  flatZones: [{ x: 0, z: 0, radius: 5.6, height: -0.16 }],
  craters: [{ x: 19, z: 0, radius: 6.5, depth: 1.2 }],
};
const relayRidgeEnvironment: EnvironmentDefinition = {
  ...missionEnvironment(ASSEMBLY_YARD, "relay-ridge", "Relay Ridge"),
  ramps: [{ id: "relay-ramp", x: 18, z: 0, length: 18, width: 12, rise: 4.8, heading: 0 }],
};

export const MISSIONS: MissionDefinition[] = [
  {
    id: "first-contact", number: "01", title: "First Contact", subtitle: "Reach the beacon",
    briefing: "A navigation beacon is transmitting from the edge of the test yard. Drive the rover to the marker and learn how its controls respond.",
    objective: "Reach the blue beacon at the end of the track.",
    learning: ["Differential drive", "Forward and reverse", "Steering and camera control"],
    hints: ["Use W to move forward and S to reverse.", "Turn gently. The left and right wheel groups work at different speeds.", "A front distance sensor measures the approach ahead. For autonomous driving, pair it with side sensors or LiDAR; the camera can help visually inspect nearby obstacles."],
    sensorFocus: ["Front distance", "LiDAR or side sensors", "Stereo camera"],
    kind: "beacon", target: { x: 17, z: 0, radius: 2.1, label: "Navigation beacon" }, obstacles: [],
  },
  {
    id: "rocky-road", number: "02", title: "Rocky Road", subtitle: "Cross the rough ground",
    briefing: "A field of exposed rock blocks the direct route to the survey marker. Find a way through, and pay attention to how the wheel package changes what the rover can cross.",
    objective: "Pass the rock field and reach the survey marker.",
    learning: ["Wheel diameter and ground clearance", "Traction on rough ground", "Rocker-bogie obstacle traversal"],
    hints: ["A rock that is taller than the rover's step capability will stop it.", "Larger wheels raise clearance and improve grip, but they add mass.", "Use a front distance sensor to detect rocks ahead. LiDAR shows a wider obstacle picture, while side sensors help compare clearance before you steer."],
    sensorFocus: ["Front distance", "LiDAR or side sensors"],
    kind: "route", target: { x: 25, z: 0, radius: 2.4, label: "Survey marker" },
    checkpoints: [{ id: "rock-field", x: 13, z: 0, radius: 2.2, label: "Rock field" }],
    obstacles: [
      { id: "rr-rock-1", kind: "boulder", x: 8.2, z: 0.25, radius: 0.72, height: 0.4 },
      { id: "rr-rock-2", kind: "rock", x: 12.3, z: -1.9, radius: 0.48, height: 0.58 },
      { id: "rr-rock-3", kind: "boulder", x: 15.7, z: 2.4, radius: 0.9, height: 0.46 },
      { id: "rr-rock-4", kind: "rock", x: 19.2, z: -2.4, radius: 0.42, height: 0.5 },
    ],
  },
  {
    id: "blind-spot", number: "03", title: "The Blind Spot", subtitle: "Navigate with sensors",
    briefing: "The route is screened by barriers. The rover cannot rely on the driver's view alone. Use its installed sensors to find obstacles and choose a safe route.",
    objective: "Detect an obstacle with an installed sensor, then reach the far marker.",
    learning: ["Detection range and field of view", "Sensor placement and blind spots", "Sensor input guiding a movement decision"],
    hints: ["A front distance sensor measures the gap ahead. For autonomous driving, use LiDAR on its own or pair the front distance sensor with side sensors.", "LiDAR gives a wide 360° scan; side sensors are lighter but only watch the rover’s flanks. Compare how each option reports the barriers.", "Watch the front distance reading as you approach, then compare left and right clearance before choosing a route."],
    kind: "sensor-route", target: { x: 26, z: 0, radius: 2.3, label: "Exit marker" },
    requirements: { sensors: ["sensor-side", "sensor-lidar"] },
    obstacles: [
      { id: "bs-barrier-a", kind: "barrier", x: 8.5, z: 0, radius: 1.2, height: 0.9, width: 0.75, depth: 3.2 },
      { id: "bs-rock-b", kind: "boulder", x: 14, z: -2.1, radius: 0.75, height: 0.9 },
      { id: "bs-barrier-c", kind: "barrier", x: 19.5, z: 1.9, radius: 1.2, height: 1.1, width: 0.75, depth: 3.6 },
    ],
  },
  {
    id: "sample-recovery", number: "04", title: "Sample Recovery", subtitle: "Collect a Mars sample",
    briefing: "A marked sample is waiting beyond a field of low rocks. Fit a tool that can collect it, then guide the rover to the sample site.",
    objective: "Install a sample collector or robotic arm, reach the marked site and retrieve the sample.",
    learning: ["Attachment choice and payload slots", "Mass and ground-clearance trade-offs", "A tool gives the rover a new capability"],
    hints: ["The sample collector is compact and hangs under the rover.", "The robotic arm can also retrieve the sample, but it adds more mass.", "Use the mast camera preview to inspect the rock corridor, the front distance sensor for the final approach and LiDAR to check clearance around the rover."],
    sensorFocus: ["Stereo camera", "Front distance", "LiDAR or side sensors"],
    kind: "sample", target: { x: 22, z: -1.3, radius: 2.2, label: "Sample site" },
    sample: { x: 21.6, z: -1.2, radius: 1.2, label: "Rock sample" },
    requirements: { attachment: ["attach-collector", "attach-arm"] },
    obstacles: [
      { id: "sr-rock-1", kind: "rock", x: 9, z: 1.6, radius: 0.45, height: 0.48 },
      { id: "sr-rock-2", kind: "boulder", x: 14, z: -2.7, radius: 0.82, height: 0.85 },
    ],
  },
  {
    id: "final-ascent", number: "05", title: "The Final Ascent", subtitle: "Climb to the research station",
    briefing: "The research station sits above a steep ridge. Reach it without running out of energy or losing traction. Review your mass, motor torque, wheel grip and battery before setting off.",
    objective: "Climb the ridge and reach the research station.",
    learning: ["Motor torque versus wheel speed", "Grip and weight distribution", "Mass, centre of mass and battery demand"],
    hints: ["Fit high-torque motors before attempting the ridge. They provide more wheel force at low speed.", "Large terrain wheels improve grip on the slope. Check the maximum-slope and motor-load readings before the climb.", "Use the front distance sensor to watch for rocks and LiDAR to check the route around them. Autonomous mode applies full throttle on a steep uphill section."],
    sensorFocus: ["Front distance", "LiDAR or side sensors"],
    kind: "ascent", target: { x: 34, z: 0, radius: 2.7, label: "Research station" },
    environment: ascentEnvironment,
    obstacles: [
      { id: "fa-rock-1", kind: "rock", x: 10, z: -3.2, radius: 0.5, height: 0.48 },
      { id: "fa-rock-2", kind: "boulder", x: 27, z: 3, radius: 0.78, height: 0.85 },
    ],
  },
  {
    id: "crater-rim-survey", number: "06", title: "Crater Rim Survey", subtitle: "Survey a safe route around the crater",
    briefing: "A shallow crater blocks the direct route to a relay marker. Survey the rim, pass both marked observation points and reach the relay without crossing the unstable crater floor. Plan your sensor setup, inspect the readings and compare a second run with a different sensor combination.",
    objective: "Visit both rim observation points and reach the relay marker.",
    learning: ["Long-range terrain observation", "LiDAR coverage and blind spots", "Waypoint navigation and route planning"],
    hints: ["The mast camera preview shows obstacles in a forward 45° view, which helps you inspect larger rim boulders. It is not an all-round distance scan like LiDAR.", "Use LiDAR to compare clearance around the rover. Side sensors can help check the nearby edge when the rover turns.", "Keep to the two observation markers outside the rim, then continue to the relay. Compare the sensor readings at each marker and try a second run with a different sensor setup."],
    estimatedDuration: "15–20 min",
    sensorFocus: ["LiDAR or front distance + side sensors", "Stereo camera"],
    activitySteps: [
      "At the start pad, compare the sensor rays and note which obstacles each sensor can detect.",
      "Plan a route around the crater and pass both rim observation points without crossing the crater floor.",
      "Repeat the run with a different sensor setup, then compare detection range and left/right clearance.",
      "Explain which sensor combination gave the earliest useful warning and why.",
    ],
    kind: "sensor-route", target: { x: 33, z: 0, radius: 2.6, label: "Rim relay" },
    requirements: { sensors: ["sensor-side", "sensor-lidar"] },
    environment: craterSurveyEnvironment,
    checkpoints: [
      { id: "crater-west-rim", x: 13, z: 9, radius: 2.3, label: "West rim station" },
      { id: "crater-east-rim", x: 24, z: 9, radius: 2.3, label: "East rim station" },
    ],
    obstacles: [
      { id: "crs-rock-a", kind: "boulder", x: 8.5, z: 3.2, radius: 0.75, height: 0.72 },
      { id: "crs-rock-b", kind: "rock", x: 27, z: 5.5, radius: 0.55, height: 0.55 },
    ],
  },
  {
    id: "sample-relay", number: "07", title: "Sample Relay", subtitle: "Collect and deliver a field sample",
    briefing: "A science team has marked a mineral sample beyond a narrow field of rocks. Reach the two survey points, collect the sample and then carry the data to the relay marker. The payload changes the rover's mass and clearance, so compare its handling before and after fitting the tool.",
    objective: "Pass both survey points, collect the mineral sample and reach the relay marker.",
    learning: ["Payload mass and ground clearance", "Close-range distance measurement", "Planning a multi-stage route"],
    hints: ["Install the sample collector or robotic arm before starting. The collector is lighter and hangs below the chassis; the arm is heavier but can reach from the front.", "Use the mast camera preview to inspect the rock corridor, then rely on the front distance sensor for the final approach. LiDAR can help you choose a wider path around obstacles.", "Visit both survey points before approaching the sample. After collection, continue to the relay and compare the rover's motor load with its empty-payload run."],
    estimatedDuration: "15–20 min",
    sensorFocus: ["Front distance", "LiDAR or side sensors", "Stereo camera"],
    activitySteps: [
      "Inspect the rock corridor with the mast camera and sensor rays before choosing a route.",
      "Compare a light collector build with a robotic-arm build and note the change in mass and clearance.",
      "Visit both survey points, collect the sample and deliver it to the science relay.",
      "Repeat with a different sensor setup and compare approach distance, motor load and obstacle clearance.",
    ],
    kind: "sample", target: { x: 32, z: -2, radius: 2.6, label: "Science relay" },
    sample: { x: 25, z: -2, radius: 1.25, label: "Mineral sample" },
    requirements: { attachment: ["attach-collector", "attach-arm"] },
    checkpoints: [
      { id: "sample-approach", x: 11, z: -4, radius: 2.2, label: "Approach survey point" },
      { id: "sample-clearance", x: 19, z: -5, radius: 2.2, label: "Clearance survey point" },
    ],
    obstacles: [
      { id: "srl-rock-a", kind: "boulder", x: 8, z: -4, radius: 0.75, height: 0.68 },
      { id: "srl-rock-b", kind: "rock", x: 16, z: -2.8, radius: 0.5, height: 0.52 },
      { id: "srl-rock-c", kind: "boulder", x: 22, z: -4.2, radius: 0.7, height: 0.7 },
    ],
  },
  {
    id: "relay-ridge-traverse", number: "08", title: "Relay Ridge Traverse", subtitle: "Navigate a ridge-top sensor route",
    briefing: "A communications relay has gone offline on the far side of a low ridge. Follow the marked approach, cross the ramp and pass the two relay checkpoints before reaching the station. Choose a motor and wheel combination that can climb without sacrificing all of the rover's grip.",
    objective: "Detect the ridge obstacles, pass both relay checkpoints and reach the station.",
    learning: ["Torque, wheel grip and slope", "Sensor-guided obstacle avoidance", "Battery and motor-load monitoring"],
    hints: ["Use a front distance sensor for immediate obstacles. LiDAR gives the autonomous controller a wider view; side sensors are a lower-power alternative for checking the left and right sides.", "High-torque motors help maintain wheel force on the ramp. Large terrain wheels add grip, but also increase the mass the motors must move.", "Watch the slope, motor-load and battery readings as you cross the ramp. Compare a high-torque run with a standard-motor run, then review which sensor readings helped you avoid the rocks."],
    estimatedDuration: "15–20 min",
    sensorFocus: ["LiDAR or front distance + side sensors", "Slope and motor-load telemetry"],
    activitySteps: [
      "Compare standard and high-torque motor readings before attempting the ridge.",
      "Choose wheels and sensors, then use the live readings to inspect the approach and ramp.",
      "Run the autonomous route and record where the sensors detect the ridge obstacles.",
      "Repeat with a different motor or sensor setup and compare slope, motor load and battery use.",
    ],
    kind: "sensor-route", target: { x: 34, z: 0, radius: 2.7, label: "Ridge station" },
    requirements: { sensors: ["sensor-side", "sensor-lidar"] },
    environment: relayRidgeEnvironment,
    checkpoints: [
      { id: "relay-approach", x: 12, z: 4, radius: 2.3, label: "Ridge approach" },
      { id: "relay-highpoint", x: 25, z: 4, radius: 2.3, label: "High-point relay" },
    ],
    obstacles: [
      { id: "rrt-rock-a", kind: "boulder", x: 9, z: 0, radius: 0.8, height: 0.78 },
      { id: "rrt-rock-b", kind: "rock", x: 21, z: -4, radius: 0.55, height: 0.56 },
      { id: "rrt-rock-c", kind: "boulder", x: 29, z: 0.8, radius: 0.72, height: 0.75 },
    ],
  },
];

export function getMission(id: string) {
  return MISSIONS.find((mission) => mission.id === id) ?? MISSIONS[0];
}

export function createMissionWorld(mission: MissionDefinition): SimulationWorld {
  return createSimulationWorld({
    id: `mission-${mission.id}`,
    name: mission.title,
    environment: mission.environment ?? missionYard,
    target: mission.target,
    sample: mission.sample,
    obstacles: mission.obstacles,
    checkpoints: mission.checkpoints?.map((point) => ({ id: point.id, x: point.x, z: point.z, radius: point.radius })),
  });
}

export interface MissionEvaluation {
  complete: boolean;
  progress: number;
  message: string;
}

export function evaluateMission(mission: MissionDefinition, snapshot: SimulationSnapshot, config: RoverConfiguration): MissionEvaluation {
  const distanceToTarget = Math.hypot(snapshot.pose.x - mission.target.x, snapshot.pose.z - mission.target.z);
  const targetReached = distanceToTarget <= mission.target.radius;
  const hasRequiredAttachment = mission.requirements?.attachment?.some((id) => config.attachments.includes(id)) ?? true;
  const hasRequiredSensor = mission.requirements?.sensors?.some((id) => config.sensors.includes(id)) ?? true;
  if (!hasRequiredAttachment) return { complete: false, progress: 0, message: "Install a sample collector or robotic arm in the Design Lab before starting this mission." };
  if (!hasRequiredSensor && mission.kind === "sensor-route") return { complete: false, progress: 0, message: "Install LiDAR or side sensors to complete this sensor route. For autonomous mode, use LiDAR on its own or pair a front distance sensor with side sensors." };

  if (mission.kind === "sensor-route" && !snapshot.hasDetectedObstacle) {
    return { complete: false, progress: targetReached ? 0.85 : 0.15, message: "Let an installed sensor detect one of the route obstacles." };
  }

  const checkpoints = mission.checkpoints ?? [];
  const reachedCheckpoints = checkpoints.filter((point) => snapshot.checkpointsReached.includes(point.id)).length;
  const nextCheckpoint = checkpoints.find((point) => !snapshot.checkpointsReached.includes(point.id));
  if (nextCheckpoint) {
    const checkpointDistance = Math.hypot(snapshot.pose.x - nextCheckpoint.x, snapshot.pose.z - nextCheckpoint.z);
    const checkpointProgress = checkpoints.length ? (reachedCheckpoints / checkpoints.length) * 0.55 : 0;
    return {
      complete: false,
      progress: Math.max(0.08, checkpointProgress + Math.min(0.2, 0.2 * (1 - checkpointDistance / 15))),
      message: `Pass through ${nextCheckpoint.label} (${checkpointDistance.toFixed(1)} m away).`,
    };
  }

  if (mission.kind === "sample" && snapshot.collectedSamples < 1) {
    const sampleDistance = mission.sample ? Math.hypot(snapshot.pose.x - mission.sample.x, snapshot.pose.z - mission.sample.z) : Infinity;
    return { complete: false, progress: sampleDistance < 6 ? 0.72 : 0.25, message: "Reach the sample marker with your collection tool installed." };
  }
  if (!targetReached) return { complete: false, progress: Math.max(0.05, 1 - distanceToTarget / Math.max(1, Math.hypot(mission.target.x, mission.target.z))), message: `${mission.target.label} is ${distanceToTarget.toFixed(1)} m away.` };
  return { complete: true, progress: 1, message: "Mission objective achieved." };
}
