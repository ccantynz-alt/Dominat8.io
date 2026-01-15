import { SiteSpec } from "./siteSpec";
import * as kvMod from "./kv";

function getKvAny(): any {
  return (kvMod as any).kv ?? (kvMod as any).default ?? kvMod;
}

function publishedKey(projectId: string) {
  return `project:${projectId}:published:siteSpec:v1`;
}

function publishedFlagKey(projectId: string) {
  return `project:${projectId}:published`;
}

export async function publishSiteSpec(projectId: string, spec: SiteSpec) {
  const kv = getKvAny();
  if (!kv?.set) throw new Error("KV store not available");

  await kv.set(publishedKey(projectId), JSON.stringify(spec));
  await kv.set(publishedFlagKey(projectId), "true");

  return true;
}

export async function loadPublishedSiteSpec(
  projectId: string
): Promise<SiteSpec | null> {
  const kv = getKvAny();
  if (!kv?.get) throw new Error("KV store not available");

  const raw = await kv.get(publishedKey(projectId));
  if (!raw) return null;

  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  return JSON.parse(text) as SiteSpec;
}

export async function isProjectPublished(projectId: string): Promise<boolean> {
  const kv = getKvAny();
  if (!kv?.get) return false;

  const flag = await kv.get(publishedFlagKey(projectId));
  return flag === "true";
}
