import { SiteSpec } from "./siteSpec";
import * as kvMod from "./kv";

/**
 * Build-safe KV accessor:
 * supports:
 * - export const kv = ...
 * - export default kv
 * - module exporting kv-like object directly
 */
function getKvAny(): any {
  return (kvMod as any).kv ?? (kvMod as any).default ?? (kvMod as any);
}

function specKey(projectId: string) {
  return `project:${projectId}:siteSpec:v1`;
}

export async function saveSiteSpec(projectId: string, spec: SiteSpec) {
  const kv = getKvAny();
  if (!kv?.set) throw new Error("KV store not available (kv.set missing)");
  await kv.set(specKey(projectId), JSON.stringify(spec));
  return true;
}

export async function loadSiteSpec(projectId: string): Promise<SiteSpec | null> {
  const kv = getKvAny();
  if (!kv?.get) throw new Error("KV store not available (kv.get missing)");

  const raw = await kv.get(specKey(projectId));
  if (!raw) return null;

  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  return JSON.parse(text) as SiteSpec;
}
