/**
 * Component catalogue: the single source of engineering data for every rover part.
 * Pure data — no React, no three.js. The 3D model, stats and (later) physics all read from here.
 */

export type Category = "chassis" | "wheels" | "motors" | "sensors" | "attachments";

interface BaseComponent {
  id: string;
  category: Category;
  name: string;
  /** One-line plain-language summary for students. */
  summary: string;
  /** Mass of ONE unit, kg. Wheels and motors are fitted ×6. */
  massKg: number;
  /** Continuous electrical draw of ONE unit while the rover is working, W. */
  powerW: number;
  /** Short engineering trade-off notes shown in the catalogue. */
  pros: string[];
  cons: string[];
}

export interface ChassisSpec extends BaseComponent {
  category: "chassis";
  lengthM: number;
  widthM: number;
  heightM: number;
  /** Extra height the suspension lifts the body above the wheel tops' reference, m. */
  suspensionLiftM: number;
  /** Mass of the rocker-bogie suspension set for this chassis, kg. */
  suspensionMassKg: number;
  batteryWh: number;
  payloadSlots: number;
  variant: "compact" | "standard" | "heavy";
}

export interface WheelSpec extends BaseComponent {
  category: "wheels";
  radiusM: number;
  widthM: number;
  /** Friction coefficient on Martian regolith (0–1). Higher = better grip. */
  grip: number;
  grousers: number;
  grouserStyle: "straight" | "chevron" | "paddle";
}

export interface MotorSpec extends BaseComponent {
  category: "motors";
  /** Continuous torque at the wheel after gearing, N·m. */
  torqueNm: number;
  /** Top wheel speed after gearing, revolutions per minute. */
  wheelRpm: number;
  variant: "standard" | "torque" | "speed";
}

export type SensorMount = "front" | "sides" | "mast" | "roof";
export interface SensorSpec extends BaseComponent {
  category: "sensors";
  rangeM: number;
  fovDeg: number;
  mount: SensorMount;
  variant: "distance" | "side" | "camera" | "lidar";
}

export type PayloadMount = "front" | "belly" | "rear";
export interface AttachmentSpec extends BaseComponent {
  category: "attachments";
  mount: PayloadMount;
  /** Extra battery the module adds, Wh. */
  batteryWh: number;
  /** How far the part hangs below the belly, reducing ground clearance, m. */
  clearanceLossM: number;
  capability: string;
  variant: "arm" | "collector" | "module";
}

export type ComponentSpec = ChassisSpec | WheelSpec | MotorSpec | SensorSpec | AttachmentSpec;

export const CHASSIS: ChassisSpec[] = [
  {
    id: "chassis-compact", category: "chassis", variant: "compact", name: "Compact",
    summary: "Small and light. Fits through tight gaps but carries little.",
    massKg: 52, powerW: 30, lengthM: 1.15, widthM: 0.78, heightM: 0.3,
    suspensionLiftM: 0.14, suspensionMassKg: 14, batteryWh: 900, payloadSlots: 1,
    pros: ["Lightest body", "Narrow track for tight passages"],
    cons: ["Only 1 payload slot", "Smallest battery"],
  },
  {
    id: "chassis-standard", category: "chassis", variant: "standard", name: "Standard",
    summary: "Balanced body with room for two payloads.",
    massKg: 82, powerW: 35, lengthM: 1.5, widthM: 0.95, heightM: 0.36,
    suspensionLiftM: 0.18, suspensionMassKg: 20, batteryWh: 1500, payloadSlots: 2,
    pros: ["Good balance of size and weight", "2 payload slots"],
    cons: ["Jack of all trades"],
  },
  {
    id: "chassis-heavy", category: "chassis", variant: "heavy", name: "Heavy-duty",
    summary: "Armoured body with a big battery and three payload slots.",
    massKg: 132, powerW: 40, lengthM: 1.85, widthM: 1.15, heightM: 0.42,
    suspensionLiftM: 0.2, suspensionMassKg: 30, batteryWh: 2400, payloadSlots: 3,
    pros: ["Largest battery", "3 payload slots", "Wide, stable stance"],
    cons: ["Heaviest body", "Needs strong motors to climb"],
  },
];

export const WHEELS: WheelSpec[] = [
  {
    id: "wheels-small", category: "wheels", name: "Small wheels",
    summary: "Light wheels with low ground clearance.",
    massKg: 3, powerW: 0, radiusM: 0.2, widthM: 0.16, grip: 0.6, grousers: 16, grouserStyle: "straight",
    pros: ["Lightest", "Easy for motors to turn"],
    cons: ["Low clearance", "Struggles over rocks"],
  },
  {
    id: "wheels-standard", category: "wheels", name: "Standard wheels",
    summary: "All-round wheels with chevron treads.",
    massKg: 5, powerW: 0, radiusM: 0.27, widthM: 0.22, grip: 0.7, grousers: 20, grouserStyle: "chevron",
    pros: ["Balanced clearance and weight"],
    cons: ["Average grip on steep slopes"],
  },
  {
    id: "wheels-large", category: "wheels", name: "Large terrain wheels",
    summary: "Big, wide wheels with deep paddles for rough ground.",
    massKg: 8.5, powerW: 0, radiusM: 0.36, widthM: 0.3, grip: 0.85, grousers: 24, grouserStyle: "paddle",
    pros: ["Most clearance", "Best grip", "Rolls over bigger rocks"],
    cons: ["Heavy", "Needs more torque to turn"],
  },
];

export const MOTORS: MotorSpec[] = [
  {
    id: "motors-standard", category: "motors", variant: "standard", name: "Standard motors",
    summary: "Balanced speed and pulling force.",
    massKg: 2.2, powerW: 40, torqueNm: 10, wheelRpm: 55,
    pros: ["Balanced", "Efficient"], cons: ["Limited on steep climbs"],
  },
  {
    id: "motors-torque", category: "motors", variant: "torque", name: "High-torque motors",
    summary: "Slow but very strong. Built for climbing.",
    massKg: 3.6, powerW: 55, torqueNm: 20, wheelRpm: 30,
    pros: ["Double the turning force", "Climbs steep slopes"], cons: ["Slow", "Heavier, uses more power"],
  },
  {
    id: "motors-speed", category: "motors", variant: "speed", name: "High-speed motors",
    summary: "Fast on flat ground, weak on hills.",
    massKg: 2.0, powerW: 50, torqueNm: 6.5, wheelRpm: 100,
    pros: ["Fastest top speed"], cons: ["Weak on slopes and rocks"],
  },
];

export const SENSORS: SensorSpec[] = [
  {
    id: "sensor-distance", category: "sensors", variant: "distance", mount: "front", name: "Distance sensor",
    summary: "Ultrasonic sensor that measures how far away things are in front.",
    massKg: 0.4, powerW: 2, rangeM: 4, fovDeg: 30,
    pros: ["Cheap on power", "Detects obstacles ahead"], cons: ["Short range", "Front only"],
  },
  {
    id: "sensor-side", category: "sensors", variant: "side", mount: "sides", name: "Side sensors",
    summary: "A pair of short-range sensors watching left and right.",
    massKg: 0.8, powerW: 3, rangeM: 2.5, fovDeg: 60,
    pros: ["Covers the blind spots at the sides"], cons: ["Very short range"],
  },
  {
    id: "sensor-camera", category: "sensors", variant: "camera", mount: "mast", name: "Stereo camera mast",
    summary: "Two cameras on a tall mast, like eyes, judging distance far ahead.",
    massKg: 4, powerW: 8, rangeM: 25, fovDeg: 45,
    pros: ["Long range", "High viewpoint sees over rocks"], cons: ["Raises the centre of mass"],
  },
  {
    id: "sensor-lidar", category: "sensors", variant: "lidar", mount: "roof", name: "LiDAR scanner",
    summary: "Spinning laser that measures distance all the way around.",
    massKg: 2.5, powerW: 18, rangeM: 15, fovDeg: 360,
    pros: ["Sees in every direction"], cons: ["Uses a lot of power"],
  },
];

export const ATTACHMENTS: AttachmentSpec[] = [
  {
    id: "attach-arm", category: "attachments", variant: "arm", mount: "front", name: "Robotic arm",
    summary: "Five-joint arm with a drill and scoop on its turret.",
    massKg: 22, powerW: 8, batteryWh: 0, clearanceLossM: 0,
    capability: "Pick up and examine objects",
    pros: ["Can reach and handle objects"], cons: ["Heavy, mounted at the front"],
  },
  {
    id: "attach-collector", category: "attachments", variant: "collector", mount: "belly", name: "Sample collector",
    summary: "Drill and sample tubes fitted under the body.",
    massKg: 9, powerW: 4, batteryWh: 0, clearanceLossM: 0.1,
    capability: "Drill and store ground samples",
    pros: ["Collects samples without an arm"], cons: ["Hangs below the body: less clearance"],
  },
  {
    id: "attach-module", category: "attachments", variant: "module", mount: "rear", name: "Equipment module",
    summary: "Rear rack with an extra battery and science instruments.",
    massKg: 16, powerW: 10, batteryWh: 600, clearanceLossM: 0,
    capability: "Extra battery and instruments",
    pros: ["+600 Wh battery"], cons: ["Adds weight at the back"],
  },
];

export const CATALOGUE: ComponentSpec[] = [...CHASSIS, ...WHEELS, ...MOTORS, ...SENSORS, ...ATTACHMENTS];

const byId = new Map<string, ComponentSpec>(CATALOGUE.map((c) => [c.id, c]));

export function getComponent<T extends ComponentSpec = ComponentSpec>(id: string): T {
  const c = byId.get(id);
  if (!c) throw new Error(`Unknown component: ${id}`);
  return c as T;
}

export const CATEGORY_INFO: Record<Category, { label: string; blurb: string; multi: boolean }> = {
  chassis: { label: "Chassis", blurb: "The body. Sets size, battery and how many payloads fit.", multi: false },
  wheels: { label: "Wheels", blurb: "Bigger wheels lift the body higher and roll over larger rocks.", multi: false },
  motors: { label: "Motors", blurb: "Torque is turning force for climbing. RPM is how fast the wheels spin.", multi: false },
  sensors: { label: "Sensors", blurb: "How the rover senses the world. Fit as many as you like.", multi: true },
  attachments: { label: "Attachments", blurb: "Tools that give new abilities. Each uses one payload slot.", multi: true },
};
