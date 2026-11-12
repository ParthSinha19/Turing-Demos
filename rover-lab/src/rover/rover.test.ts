import { describe, expect, it } from "vitest";
import { applyComponent, canInstall, DEFAULT_CONFIGURATION, sanitizeConfiguration, type RoverConfiguration } from "./configuration";
import { computeRoverLayout } from "./layout";
import { computeStats } from "./stats";
import { computePhysicsProfile } from "./physicsProfile";

const base = DEFAULT_CONFIGURATION;
const withWheels = (id: string): RoverConfiguration => applyComponent(base, id).config;

describe("wheel swap", () => {
  it("large terrain wheels raise ground clearance, mass and wheel radius in the physics profile", () => {
    const before = computeStats(base);
    const after = computeStats(withWheels("wheels-large"));
    expect(after.groundClearanceM).toBeGreaterThan(before.groundClearanceM);
    expect(after.massKg - before.massKg).toBeCloseTo(6 * (8.5 - 5), 5);
    expect(computePhysicsProfile(withWheels("wheels-large")).wheels.every((w) => w.radius === 0.36)).toBe(true);
  });

  it("bigger wheels on the same motors increase top speed but reduce climbing force", () => {
    const std = computeStats(base);
    const large = computeStats(withWheels("wheels-large"));
    expect(large.maxSpeedMs).toBeGreaterThan(std.maxSpeedMs);
    expect(large.tractiveForceN).toBeLessThan(std.tractiveForceN);
  });

  it("wheels rest on the ground: every hub sits exactly one radius above y=0", () => {
    for (const id of ["wheels-small", "wheels-standard", "wheels-large"]) {
      const l = computeRoverLayout(withWheels(id));
      for (const w of l.wheels) expect(w.hub[1]).toBeCloseTo(l.wheel.radius, 6);
    }
  });

  it("neighbouring wheels never overlap, even large wheels on the compact chassis", () => {
    const cfg = applyComponent(applyComponent(base, "chassis-compact").config, "wheels-large").config;
    const l = computeRoverLayout(cfg);
    const left = l.wheels.filter((w) => w.side === "left").sort((a, b) => b.hub[0] - a.hub[0]);
    for (let i = 0; i < left.length - 1; i++) expect(left[i].hub[0] - left[i + 1].hub[0]).toBeGreaterThan(2 * l.wheel.radius);
  });
});

describe("motors", () => {
  it("high-torque motors double total torque and climb steeper than standard", () => {
    const std = computeStats(base);
    const ht = computeStats(applyComponent(base, "motors-torque").config);
    expect(ht.totalTorqueNm).toBe(2 * std.totalTorqueNm);
    expect(ht.maxSlopeDeg).toBeGreaterThan(std.maxSlopeDeg);
  });
});

describe("payload slots", () => {
  it("compact chassis allows exactly one attachment", () => {
    const compact = applyComponent(base, "chassis-compact").config;
    const one = applyComponent(compact, "attach-arm").config;
    expect(one.attachments).toEqual(["attach-arm"]);
    expect(canInstall(one, "attach-module").ok).toBe(false);
    expect(applyComponent(one, "attach-module").config.attachments).toEqual(["attach-arm"]);
  });

  it("downsizing the chassis removes attachments that no longer fit", () => {
    const heavy = applyComponent(base, "chassis-heavy").config;
    const full = ["attach-arm", "attach-collector", "attach-module"].reduce((c, id) => applyComponent(c, id).config, heavy);
    const res = applyComponent(full, "chassis-compact");
    expect(res.config.attachments).toHaveLength(1);
    expect(res.removed.map((r) => r.id)).toEqual(["attach-collector", "attach-module"]);
  });

  it("the sample collector hangs under the belly and lowers clearance by 0.1 m", () => {
    const before = computeStats(base).groundClearanceM;
    const after = computeStats(applyComponent(base, "attach-collector").config).groundClearanceM;
    expect(before - after).toBeCloseTo(0.1, 6);
  });

  it("the equipment module adds 600 Wh of battery", () => {
    const before = computeStats(base).batteryWh;
    const after = computeStats(applyComponent(base, "attach-module").config).batteryWh;
    expect(after - before).toBe(600);
  });
});

describe("physics profile matches the 3D layout", () => {
  it("wheel positions in the physics profile equal the model's hub positions", () => {
    const cfg = applyComponent(base, "chassis-heavy").config;
    const layout = computeRoverLayout(cfg);
    const profile = computePhysicsProfile(cfg, layout);
    expect(profile.wheels.map((w) => w.position)).toEqual(layout.wheels.map((w) => w.hub));
    expect(profile.drive.left).toEqual(["FL", "ML", "RL"]);
  });

  it("installed sensors appear with their catalogue range", () => {
    const cfg = applyComponent(base, "sensor-lidar").config;
    const lidar = computePhysicsProfile(cfg).sensors.find((s) => s.kind === "lidar");
    expect(lidar?.rangeM).toBe(15);
    expect(lidar?.fovDeg).toBe(360);
  });
});

describe("saved configurations", () => {
  it("repairs unknown ids and over-full payloads", () => {
    const fixed = sanitizeConfiguration({ chassis: "chassis-compact", wheels: "nope", attachments: ["attach-arm", "attach-module"] } as never);
    expect(fixed.wheels).toBe("wheels-standard");
    expect(fixed.attachments).toEqual(["attach-arm"]);
  });
});
