/**
 * RoverConfiguration: the one authoritative description of a rover design.
 * Every section (Design Lab, Sandbox, Missions) reads this same object.
 */
import { ATTACHMENTS, SENSORS, getComponent, type AttachmentSpec, type ChassisSpec, type ComponentSpec } from "./catalogue";

export interface RoverConfiguration {
  chassis: string;
  wheels: string;
  motors: string;
  sensors: string[];
  attachments: string[];
}

export const DEFAULT_CONFIGURATION: RoverConfiguration = {
  chassis: "chassis-standard",
  wheels: "wheels-standard",
  motors: "motors-standard",
  sensors: ["sensor-distance", "sensor-camera"],
  attachments: [],
};

export type InstallCheck = { ok: true } | { ok: false; reason: string };

export function isInstalled(config: RoverConfiguration, id: string): boolean {
  const c = getComponent(id);
  switch (c.category) {
    case "chassis": return config.chassis === id;
    case "wheels": return config.wheels === id;
    case "motors": return config.motors === id;
    case "sensors": return config.sensors.includes(id);
    case "attachments": return config.attachments.includes(id);
  }
}

/** Can this component be added right now? Explains why not, in student language. */
export function canInstall(config: RoverConfiguration, id: string): InstallCheck {
  const c = getComponent(id);
  if (c.category !== "attachments") return { ok: true };
  if (config.attachments.includes(id)) return { ok: true };
  const chassis = getComponent<ChassisSpec>(config.chassis);
  if (config.attachments.length >= chassis.payloadSlots) {
    return {
      ok: false,
      reason: `The ${chassis.name} chassis has ${chassis.payloadSlots} payload slot${chassis.payloadSlots === 1 ? "" : "s"}, and ${chassis.payloadSlots === 1 ? "it is" : "they are all"} in use. Remove an attachment or fit a bigger chassis.`,
    };
  }
  return { ok: true };
}

export interface ChangeResult {
  config: RoverConfiguration;
  /** Components removed as a side effect (e.g. a smaller chassis drops payloads). */
  removed: ComponentSpec[];
}

/** Install (or for multi categories, toggle) a component. Pure: returns a new configuration. */
export function applyComponent(config: RoverConfiguration, id: string): ChangeResult {
  const c = getComponent(id);
  switch (c.category) {
    case "chassis": {
      const chassis = c as ChassisSpec;
      const kept = config.attachments.slice(0, chassis.payloadSlots);
      const removed = config.attachments.slice(chassis.payloadSlots).map((a) => getComponent(a));
      return { config: { ...config, chassis: id, attachments: kept }, removed };
    }
    case "wheels": return { config: { ...config, wheels: id }, removed: [] };
    case "motors": return { config: { ...config, motors: id }, removed: [] };
    case "sensors": {
      const has = config.sensors.includes(id);
      const sensors = has ? config.sensors.filter((s) => s !== id) : [...config.sensors, id];
      return { config: { ...config, sensors: sortBy(sensors, SENSORS) }, removed: [] };
    }
    case "attachments": {
      if (config.attachments.includes(id)) {
        return { config: { ...config, attachments: config.attachments.filter((a) => a !== id) }, removed: [] };
      }
      const check = canInstall(config, id);
      if (!check.ok) return { config, removed: [] };
      return { config: { ...config, attachments: sortBy([...config.attachments, id], ATTACHMENTS) }, removed: [] };
    }
  }
}

function sortBy(ids: string[], order: { id: string }[]) {
  return [...ids].sort((a, b) => order.findIndex((o) => o.id === a) - order.findIndex((o) => o.id === b));
}

/** Repair a stored configuration (unknown ids, too many payloads) so old saves never crash. */
export function sanitizeConfiguration(raw: Partial<RoverConfiguration> | undefined): RoverConfiguration {
  const valid = (id: unknown, cat: string, fallback: string) => {
    try { return typeof id === "string" && getComponent(id).category === cat ? id : fallback; } catch { return fallback; }
  };
  const list = (ids: unknown, cat: string) =>
    Array.isArray(ids) ? [...new Set(ids.filter((i) => { try { return getComponent(i).category === cat; } catch { return false; } }))] : [];
  const chassis = valid(raw?.chassis, "chassis", DEFAULT_CONFIGURATION.chassis);
  const slots = getComponent<ChassisSpec>(chassis).payloadSlots;
  return {
    chassis,
    wheels: valid(raw?.wheels, "wheels", DEFAULT_CONFIGURATION.wheels),
    motors: valid(raw?.motors, "motors", DEFAULT_CONFIGURATION.motors),
    sensors: raw?.sensors ? sortBy(list(raw.sensors, "sensors"), SENSORS) : DEFAULT_CONFIGURATION.sensors,
    attachments: sortBy(list(raw?.attachments, "attachments"), ATTACHMENTS).slice(0, slots),
  };
}

export function installedAttachments(config: RoverConfiguration): AttachmentSpec[] {
  return config.attachments.map((a) => getComponent<AttachmentSpec>(a));
}
