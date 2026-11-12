/**
 * The engineering readouts shown to students, each with a plain-language explanation.
 * `better` says which direction is an improvement, so changes can be coloured honestly.
 */
import type { RoverStats } from "@/rover/stats";
import { kmh } from "./format";

export interface StatDef {
  id: string;
  label: string;
  unit: string;
  digits: number;
  value: (s: RoverStats) => number;
  better: "higher" | "lower" | "neutral";
  explain: string;
}

export const STAT_GROUPS: { title: string; stats: StatDef[] }[] = [
  {
    title: "Mass & stability",
    stats: [
      { id: "mass", label: "Total mass", unit: "kg", digits: 1, value: (s) => s.massKg, better: "lower", explain: "How much material the rover is made of. More mass needs more motor force to speed up and climb." },
      { id: "weight", label: "Weight on Mars", unit: "N", digits: 0, value: (s) => s.weightN, better: "lower", explain: "How hard the rover presses on the ground. Mars gravity is only about 38% of Earth's, so it weighs much less here." },
      { id: "tip", label: "Side tip angle", unit: "°", digits: 0, value: (s) => s.tipAngleDeg, better: "higher", explain: "How far the rover can lean sideways before it would roll over. Tall parts like a mast raise the centre of mass and lower this." },
    ],
  },
  {
    title: "Drive & terrain",
    stats: [
      { id: "torque", label: "Motor torque", unit: "N·m", digits: 0, value: (s) => s.totalTorqueNm, better: "higher", explain: "Turning force from all six motors added together. More torque helps the rover climb and push over rocks." },
      { id: "speed", label: "Top speed", unit: "km/h", digits: 1, value: (s) => kmh(s.maxSpeedMs), better: "higher", explain: "How fast the wheels spin multiplied by how far one turn rolls. Bigger wheels and faster motors go quicker." },
      { id: "slope", label: "Steepest climb", unit: "°", digits: 0, value: (s) => s.maxSlopeDeg, better: "higher", explain: "The steepest hill the rover can drive up. It is limited by motor force or by wheel grip, whichever runs out first." },
      { id: "step", label: "Max step", unit: "m", digits: 2, value: (s) => s.stepHeightM, better: "higher", explain: "The tallest ledge a wheel can climb onto. Bigger wheels help, but only if the motors are strong enough to lift the rover." },
      { id: "clearance", label: "Ground clearance", unit: "m", digits: 2, value: (s) => s.groundClearanceM, better: "higher", explain: "The gap between the ground and the lowest part of the body. Rocks taller than this will hit the rover's belly." },
      { id: "grip", label: "Wheel grip", unit: "μ", digits: 2, value: (s) => s.grip, better: "higher", explain: "How well the wheels hold on to dusty ground (0 is ice, 1 is very grippy). Deeper treads grip better." },
    ],
  },
  {
    title: "Energy",
    stats: [
      { id: "battery", label: "Battery", unit: "Wh", digits: 0, value: (s) => s.batteryWh, better: "higher", explain: "Stored energy. 1 watt-hour powers a 1 watt device for one hour." },
      { id: "power", label: "Power use", unit: "W", digits: 0, value: (s) => s.power.totalW, better: "lower", explain: "Energy used every second while driving. Motors use the most; every sensor and tool adds a little." },
      { id: "runtime", label: "Driving time", unit: "h", digits: 1, value: (s) => s.runtimeH, better: "higher", explain: "Battery divided by power use: how long the rover can drive before it needs charging." },
      { id: "range", label: "Range", unit: "km", digits: 1, value: (s) => s.rangeKm, better: "higher", explain: "Estimated distance on one charge, driving at 70% of top speed on flat ground." },
    ],
  },
];

export const ALL_STATS = STAT_GROUPS.flatMap((g) => g.stats);
