import { kv } from "@/app/lib/kv";

export type SeoSettings = {
  indexing: "on" | "off";
  updatedAt: string;
};

function key(projectId: string) {
  return `seo:settings:${projectId}`;
}

export async function getSeoSettings(projectId: string): Promise<SeoSettings> {
  const existing = (await kv.get(key(projectId))) as SeoSettings | null;

  if (existing?.indexing) return existing;

  // default: ON (indexable) for growth
  return {
    indexing: "on",
    updatedAt: new Date().toISOString(),
  };
}

export async function setSeoSettings(projectId: string, patch: Partial<SeoSettings>) {
  const current = await getSeoSettings(projectId);
  const next: SeoSettings = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await kv.set(key(projectId), next);
  return next;
}
