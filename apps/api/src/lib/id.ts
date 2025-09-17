import { randomUUID } from "node:crypto";

export function createPublicId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}
