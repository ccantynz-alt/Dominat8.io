// src/app/lib/publishedSpecStore.ts

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [k: string]: JsonValue };

type PublishedSpec = Record<string, any>;

type KvLike = {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<any>;
  del?: (key: string) => Promise<any>;
};

const memory = (() => {
  const g = globalThis as any;
  g.__PUBLISHED_STORE__ = g.__PUBLISHED_STORE__ ?? new Map<string, any>();
  return g.__PUBLISHED_STORE__ as Map<string, any>;
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

// Published spec keys (try multiple so we DON'T break existing live data)
function publishedKeys(projectId: string) {
  return [
    `published:${projectId}`,
    `publish:${projectId}`,
    `project:${projectId}:published`,
    `projects:${projectId}:published`,
    `site:published:${projectId}`,
    `site:${projectId}:published`,
    `spec:published:${projectId}`,
    `spec:${projectId}:published`,
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
export async function getPublishedSpec(projectId: string): Promise<PublishedSpec | null> {
  const kv = await getKv();
  const keys = publishedKeys(projectId);

  if (kv) {
    for (const key of keys) {
      try {
        const v = normalizeMaybeJson(await kv.get(key));
        if (v && typeof v === "object") return v as PublishedSpec;
      } catch {
        // keep trying
      }
    }
    return null;
  }

  // Memory fallback
  for (const key of keys) {
    if (memory.has(key)) return memory.get(key) as PublishedSpec;
  }
  return null;
}

export async function setPublishedSpec(projectId: string, spec: PublishedSpec): Promise<void> {
  const kv = await getKv();
  const keys = publishedKeys(projectId);

  if (kv) {
    // Write primary + a couple legacy keys for compatibility
    await kv.set(keys[0], spec as unknown as JsonValue);
    await kv.set(keys[2], spec as unknown as JsonValue);
    await kv.set(keys[3], spec as unknown as JsonValue);
    return;
  }

  // Memory fallback
  memory.set(keys[0], spec);
  memory.set(keys[2], spec);
  memory.set(keys[3], spec);
}

export async function deletePublishedSpec(projectId: string): Promise<void> {
  const kv = await getKv();
  const keys = publishedKeys(projectId);

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
 * Old name used by publish endpoint.
 */
export async function publishSiteSpec(projectId: string, spec: PublishedSpec): Promise<void> {
  return setPublishedSpec(projectId, spec);
}
