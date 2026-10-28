import "server-only";
import { createHash } from "node:crypto";

export function hashDeviceKey(userId: string, clientDeviceId: string): string {
  return createHash("sha256").update(`${userId}:${clientDeviceId}`).digest("hex");
}
