/**
 * projectSpecStore (Pages Router safe)
 *
 * Replacement for: "@/app/lib/projectSpecStore"
 *
 * We store "seed spec" in KV under:
 *   generated:project:<projectId>:latest
 *
 * If your previous store used different keys, we can adjust later — but this makes build green now.
 */

import { kv } from "./kv";

const KEY_PREFIX = "generated:project:";

export async function readProjectSpec(projectId: string): Promise<any | null> {
  const key = KEY_PREFIX + projectId + ":latest";
  const v = (await kv.get(key)) as any;
  return v || null;
}

export async function writeProjectSpec(projectId: string, spec: any): Promise<void> {
  const key = KEY_PREFIX + projectId + ":latest";
  await kv.set(key, spec);
}
export async function saveSiteSpec(projectId: string, spec: any) {
  const key = `project:${projectId}:siteSpec`;
  // Lazy import to avoid cycles if this file already has other deps
  const mod = await import("./kv");
  await mod.kvJsonSet(key, spec);
  return { ok: true, key };
}

