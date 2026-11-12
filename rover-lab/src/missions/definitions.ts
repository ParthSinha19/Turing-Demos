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

export const MISSIONS: MissionDefinition[] = [
  {
    id: "first-contact", number: "01", title: "First Contact", subtitle: "Reach the beacon",
    briefing: "A navigation beacon is transmitting from the edge of the test yard. Drive the rover to the marker and learn how its controls respond.",
    objective: "Reach the blue beacon at the end of the track.",
    learning: ["Differential drive", "Forward and reverse", "Steering and camera control"],
    hints: ["Use W to move forward and S to reverse.", "Turn gently. The left and right wheel groups work at different speeds."],
    kind: "beacon", target: { x: 17, z: 0, radius: 2.1, label: "Navigation beacon" }, obstacles: [],
  },
  {
    id: "rocky-road", number: "02", title: "Rocky Road", subtitle: "Cross the rough ground",
    briefing: "A field of exposed rock blocks the direct route to the survey marker. Find a way through, and pay attention to how the wheel package changes what the rover can cross.",
    objective: "Pass the rock field and reach the survey marker.",
    learning: ["Wheel diameter and ground clearance", "Traction on rough ground", "Rocker-bogie obstacle traversal"],
    hints: ["A rock that is taller than the rover's step capability will stop it.", "Larger wheels raise clearance and improve grip, but they add mass."],
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
    hints: ["Watch the sensor readouts as the rover approaches the barriers.", "The front distance sensor sees ahead, while side sensors or LiDAR help compare escape routes."],
    kind: "sensor-route", target: { x: 26, z: 0, radius: 2.3, label: "Exit marker" },
    requirements: { sensors: ["sensor-distance", "sensor-lidar"] },
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
    hints: ["The sample collector is compact and hangs under the rover.", "The robotic arm can also retrieve the sample, but it adds more mass."],
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
    hints: ["High-torque motors trade top speed for stronger climbing force.", "A heavy chassis needs more force to climb. Larger wheels improve grip but also add mass."],
    kind: "ascent", target: { x: 34, z: 0, radius: 2.7, label: "Research station" },
    environment: ascentEnvironment,
    obstacles: [
      { id: "fa-rock-1", kind: "rock", x: 10, z: -3.2, radius: 0.5, height: 0.48 },
      { id: "fa-rock-2", kind: "boulder", x: 27, z: 3, radius: 0.78, height: 0.85 },
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
  if (!hasRequiredSensor && mission.kind === "sensor-route") return { complete: false, progress: 0, message: "Install a distance sensor or LiDAR scanner before starting this mission." };

  if (mission.kind === "sensor-route" && !snapshot.hasDetectedObstacle) {
    return { complete: false, progress: targetReached ? 0.85 : 0.15, message: "Reach the barriers and let an installed sensor detect an obstacle." };
  }
  if (mission.kind === "sample" && snapshot.collectedSamples < 1) {
    const sampleDistance = mission.sample ? Math.hypot(snapshot.pose.x - mission.sample.x, snapshot.pose.z - mission.sample.z) : Infinity;
    return { complete: false, progress: sampleDistance < 6 ? 0.72 : 0.25, message: "Reach the sample marker with your collection tool installed." };
  }
  if (!targetReached) return { complete: false, progress: Math.max(0.05, 1 - distanceToTarget / Math.max(1, Math.hypot(mission.target.x, mission.target.z))), message: `${mission.target.label} is ${distanceToTarget.toFixed(1)} m away.` };
  if (mission.kind === "sample" && snapshot.collectedSamples < 1) return { complete: false, progress: 0.9, message: "The rover is at the sample site. Move close enough to collect it." };
  if (mission.kind === "route" && mission.checkpoints?.some((point) => !snapshot.checkpointsReached.includes(point.id))) {
    return { complete: false, progress: 0.7, message: "Pass through the marked rock-field checkpoint before finishing." };
  }
  return { complete: true, progress: 1, message: "Mission objective achieved." };
}
