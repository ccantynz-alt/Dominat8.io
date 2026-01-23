// src/app/lib/projectSpecStore.ts

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

type SiteSpec = Record<string, any>;

type KvLike = {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<any>;
  del?: (key: string) => Promise<any>;
};

const memory = (() => {
  const g = globalThis as any;
  g.__SPEC_STORE__ = g.__SPEC_STORE__ ?? new Map<string, any>();
  return g.__SPEC_STORE__ as Map<string, any>;
})();

async function getKv(): Promise<KvLike | null> {
  try {
    const mod: any = await import("@vercel/kv");
    const kv = mod?.kv ?? mod?.default?.kv ?? mod?.default ?? null;
    if (kv && typeof kv.get === "function" && typeof kv.set === "function") return kv as KvLike;
  } catch {
    // ignore
  }
  return null;
}

function canonicalGeneratedKey(projectId: string) {
  // ✅ Canonical key used by debug/spec, preview, and newer API routes
  return `generated:project:${projectId}:latest`;
}

// Draft spec keys (try multiple to stay compatible with older code)
function draftKeys(projectId: string) {
  return [
    // ✅ NEW PRIMARY (canonical)
    canonicalGeneratedKey(projectId),

    // ✅ Legacy keys still supported (read + write)
    `draft:${projectId}`,
    `spec:draft:${projectId}`,
    `project:${projectId}:draft`,
    `projects:${projectId}:draft`,
    `site:draft:${projectId}`,
    `site:${projectId}:draft`,
  ];
}

function normalizeMaybeJson(val: any): any {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

/**
 * New canonical API
 */
export async function getDraftSpec(projectId: string): Promise<SiteSpec | null> {
  const kv = await getKv();
  const keys = draftKeys(projectId);

  if (kv) {
    for (const key of keys) {
      try {
        const v = normalizeMaybeJson(await kv.get(key));
        if (v && typeof v === "object") return v as SiteSpec;
      } catch {
        // keep trying other keys
      }
    }
    return null;
  }

  // Memory fallback
  for (const key of keys) {
    if (memory.has(key)) return memory.get(key) as SiteSpec;
  }
  return null;
}

export async function setDraftSpec(projectId: string, spec: SiteSpec): Promise<void> {
  const kv = await getKv();
  const keys = draftKeys(projectId);

  if (kv) {
    // ✅ Write canonical key + a few legacy keys for compatibility
    await kv.set(keys[0], spec as unknown as JsonValue); // generated:project:<id>:latest
    await kv.set(keys[1], spec as unknown as JsonValue); // draft:<id>
    await kv.set(keys[2], spec as unknown as JsonValue); // spec:draft:<id>
    await kv.set(keys[3], spec as unknown as JsonValue); // project:<id>:draft
    return;
  }

  // Memory fallback
  memory.set(keys[0], spec);
  memory.set(keys[1], spec);
  memory.set(keys[2], spec);
  memory.set(keys[3], spec);
}

export async function deleteDraftSpec(projectId: string): Promise<void> {
  const kv = await getKv();
  const keys = draftKeys(projectId);

  if (kv && typeof kv.del === "function") {
    for (const key of keys) {
      try {
        await kv.del(key);
      } catch {
        // ignore
      }
    }
    return;
  }

  for (const key of keys) memory.delete(key);
}

/**
 * ✅ Compatibility exports (so existing Pages API code keeps working)
 * Old names used by seed-spec/publish endpoints.
 */
export async function loadSiteSpec(projectId: string): Promise<SiteSpec | null> {
  return getDraftSpec(projectId);
}

export async function saveSiteSpec(projectId: string, spec: SiteSpec): Promise<void> {
  return setDraftSpec(projectId, spec);
}
