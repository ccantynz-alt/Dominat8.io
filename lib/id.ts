// lib/id.ts
import { randomUUID } from "crypto";

/**
 * Returns a unique id (URL-safe, no dashes).
 * Works in Node on Vercel.
 */
export function uid(prefix = ""): string {
  const id = randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}
