// app/lib/publicMode.ts
import { storeGet, storeSet } from "./store";

export type PublicMode = "on" | "off";

/**
 * Public Mode:
 * - "on"  => hide admin UI + block admin routes unless admin
 * - "off" => show admin UI (builder mode)
 *
 * Default is "on" if unset.
 */
export async function getPublicMode(): Promise<PublicMode> {
  const v = await storeGet("public:mode");
  if (v === "off") return "off";
  return "on";
}

export async function setPublicMode(mode: PublicMode) {
  await storeSet("public:mode", mode);
}
