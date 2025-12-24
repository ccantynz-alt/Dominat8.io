// lib/ids.ts
import crypto from "crypto";

/**
 * Generates URL-safe IDs (no slashes, no plus).
 * Example: proj_..., run_...
 */
export function makeId(prefix: string) {
  // 16 bytes -> 22 chars base64url
  const raw = crypto.randomBytes(16).toString("base64url");
  return `${prefix}_${raw}`;
}
