/**
 * Hub motor + gearbox housing, centred on the wheel axis and protruding from the wheel's inner face (−Z).
 * Each motor type has its own shape and a colour band so it can be identified on the rover.
 */
import type { MotorSpec, WheelSpec } from "../../catalogue";
import { PartBuilder, type BuiltPart } from "../partBuilder";

const cache = new Map<string, BuiltPart>();

export function buildMotor(motor: MotorSpec, wheel: WheelSpec): BuiltPart {
  const key = `${motor.id}|${wheel.id}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const b = new PartBuilder();
  const inner = -wheel.widthM / 2;
  const band = motor.variant === "torque" ? "bandTorque" : motor.variant === "speed" ? "bandSpeed" : "bandStandard";

  if (motor.variant === "standard") {
    const R = 0.062, len = 0.14;
    b.cylZ("darkMetal", R, len, [0, 0, inner - len / 2 + 0.04], 24);
    b.cylZ(band, R + 0.004, 0.022, [0, 0, inner - 0.02], 24);
    b.cylZ("alu", R * 0.8, 0.02, [0, 0, inner - len + 0.03], 20);
  } else if (motor.variant === "torque") {
    const R = 0.084, len = 0.17;
    b.cylZ("darkMetal", R, len, [0, 0, inner - len / 2 + 0.04], 28);
    // planetary gearbox stages
    for (let i = 0; i < 3; i++) b.cylZ("alu", R + 0.008, 0.012, [0, 0, inner - 0.005 - i * 0.04], 28);
    b.cylZ(band, R + 0.01, 0.026, [0, 0, inner - 0.13], 28);
    // bolt ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.cylZ("black", 0.007, 0.02, [Math.cos(a) * R * 0.75, Math.sin(a) * R * 0.75, inner - len + 0.035], 6);
    }
  } else {
    const R = 0.052, len = 0.19;
    b.cylZ("darkMetal", R, len, [0, 0, inner - len / 2 + 0.04], 24);
    // cooling fins
    for (let i = 0; i < 7; i++) b.cylZ("alu", R + 0.016, 0.005, [0, 0, inner - 0.02 - i * 0.018], 24);
    b.cylZ(band, R + 0.004, 0.02, [0, 0, inner - 0.155], 24);
  }
  // power cable stub
  b.rod("cable", [0, 0.03, inner - 0.08], [0, 0.12, inner - 0.11], 0.008, 6);
  const part = b.build();
  cache.set(key, part);
  return part;
}
