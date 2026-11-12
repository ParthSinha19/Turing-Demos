/** Which mount points a component occupies. Shared by the 3D overlays and the catalogue. */
import { getComponent, type AttachmentSpec, type SensorSpec } from "./catalogue";
import { PAYLOAD_MOUNT, type MountId } from "./layout";

export const SENSOR_MOUNTS: Record<SensorSpec["mount"], MountId[]> = {
  front: ["sensor.front"],
  sides: ["sensor.side.left", "sensor.side.right"],
  mast: ["sensor.mast"],
  roof: ["sensor.roof"],
};

export const COMPONENT_MOUNTS: MountId[] = [
  "sensor.front", "sensor.side.left", "sensor.side.right", "sensor.mast", "sensor.roof",
  "payload.front", "payload.belly", "payload.rear",
];

/** Mount ids for sensors/attachments; chassis, wheels and motors are structural (empty list). */
export function mountsForComponent(id: string): MountId[] {
  const c = getComponent(id);
  if (c.category === "sensors") return SENSOR_MOUNTS[(c as SensorSpec).mount];
  if (c.category === "attachments") return [PAYLOAD_MOUNT[(c as AttachmentSpec).mount]];
  return [];
}

/** The installed component occupying a mount, if any. */
export function occupantOf(mount: MountId, installed: string[]): string | null {
  return installed.find((id) => mountsForComponent(id).includes(mount)) ?? null;
}
