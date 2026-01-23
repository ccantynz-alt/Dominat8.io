import { kv } from "@vercel/kv";

export type ProjectRecord = {
  id: string;
  name: string;
  templateId?: string | null;

  // Backwards compatibility:
  // Some routes expect project.userId, others use project.ownerId.
  userId?: string | null;
  ownerId?: string | null;

  // Accept both string and number because some routes write timestamps as numbers.
  // We normalize to ISO strings before saving.
  createdAt: string | number;
  updatedAt: string | number;

  status?: "draft" | "generating" | "ready" | "error" | string;

  // Optional fields that some generator routes may attach (routes sometimes send null)
  prompt?: string | null;
  generatedHtml?: string | null;
  lastGeneratedAt?: number | null;

  data?: any;

  // Some routes expect saveProject() to return { mode: "kv" | "memory" }
  mode?: "kv" | "memory";
};

function nowIso() {
  return new Date().toISOString();
}

function toIsoString(value: string | number | undefined | null): string {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    try {
      return new Date(value).toISOString();
    } catch {
      return nowIso();
    }
  }
  return nowIso();
}

function hasKvEnv() {
  return Boolean(
    process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.REDIS_URL
  );
}

// --------- In-memory fallback ----------
const memProjects = new Map<string, ProjectRecord>();
const memIndex = new Set<string>();
const memUserIndex = new Map<string, Set<string>>();

async function kvSafeGet<T>(key: string): Promise<T | null> {
  if (!hasKvEnv()) return null;
  try {
    const v = (await kv.get(key)) as T | null;
    return v ?? null;
  } catch {
    return null;
  }
}

async function kvSafeSet(key: string, value: any): Promise<boolean> {
  if (!hasKvEnv()) return false;
  try {
    await kv.set(key, value);
    return true;
  } catch {
    return false;
  }
}

async function kvSafeSAdd(key: string, member: string): Promise<boolean> {
  if (!hasKvEnv()) return false;
  try {
    await kv.sadd(key, member);
    return true;
  } catch {
    return false;
  }
}

async function kvSafeSMembers(key: string): Promise<string[] | null> {
  if (!hasKvEnv()) return null;
  try {
    const v = (await kv.smembers(key)) as string[] | null;
    return v ?? [];
  } catch {
    return null;
  }
}

// --------- Key helpers ----------
export function projectKey(projectId: string) {
  return `project:${projectId}`;
}

export function projectsIndexKey() {
  return `projects:index`;
}

export function userProjectsIndexKey(userId: string) {
  return `projects:user:${userId}`;
}

// --------- Exports expected by existing routes ----------
export function newProjectId(): string {
  const rand = Math.random().toString(16).slice(2);
  return `proj_${Date.now().toString(16)}${rand}`;
}

export async function saveProject(project: ProjectRecord): Promise<ProjectRecord> {
  return upsertProject(project);
}

// --------- Core API ----------
export async function getProject(projectId: string): Promise<ProjectRecord | null> {
  const fromKv = await kvSafeGet<ProjectRecord>(projectKey(projectId));
  if (fromKv) return fromKv;

  return memProjects.get(projectId) ?? null;
}

export async function upsertProject(project: ProjectRecord): Promise<ProjectRecord> {
  // Normalize timestamps to ISO strings for storage consistency
  const normalizedCreatedAt = toIsoString(project.createdAt);
  const normalizedUpdatedAt = nowIso();

  const p: ProjectRecord = {
    ...project,
    createdAt: normalizedCreatedAt,
    updatedAt: normalizedUpdatedAt,
  };

  // Keep userId/ownerId in sync so older/newer code paths both work
  if (p.ownerId && !p.userId) p.userId = p.ownerId;
  if (p.userId && !p.ownerId) p.ownerId = p.userId;

  const wroteKv = await kvSafeSet(projectKey(p.id), p);
  if (wroteKv) {
    await kvSafeSAdd(projectsIndexKey(), p.id);

    if (p.ownerId) await kvSafeSAdd(userProjectsIndexKey(p.ownerId), p.id);

    return { ...p, mode: "kv" };
  }

  memProjects.set(p.id, p);
  memIndex.add(p.id);

  if (p.ownerId) {
    if (!memUserIndex.has(p.ownerId)) memUserIndex.set(p.ownerId, new Set());
    memUserIndex.get(p.ownerId)!.add(p.id);
  }

  return { ...p, mode: "memory" };
}

export async function registerProject(params: {
  id: string;
  name: string;
  templateId?: string | null;
  ownerId?: string | null;
}): Promise<ProjectRecord> {
  const p: ProjectRecord = {
    id: params.id,
    name: params.name,
    templateId: params.templateId ?? null,

    // Set BOTH for compatibility
    userId: params.ownerId ?? null,
    ownerId: params.ownerId ?? null,

    createdAt: nowIso(),
    updatedAt: nowIso(),
    status: "draft",
    data: null,
  };

  return upsertProject(p);
}

export async function listProjects(ownerId?: string | null): Promise<ProjectRecord[]> {
  if (hasKvEnv()) {
    const ids =
      ownerId
        ? await kvSafeSMembers(userProjectsIndexKey(ownerId))
        : await kvSafeSMembers(projectsIndexKey());

    if (ids && ids.length) {
      const out: ProjectRecord[] = [];
      for (const id of ids) {
        const p = await kvSafeGet<ProjectRecord>(projectKey(id));
        if (p) out.push(p);
      }
      out.sort((a, b) => (String(a.updatedAt) < String(b.updatedAt) ? 1 : -1));
      return out;
    }
  }

  let ids: string[] = [];
  if (ownerId) {
    ids = Array.from(memUserIndex.get(ownerId)?.values() ?? []);
  } else {
    ids = Array.from(memIndex.values());
  }

  const out = ids
    .map((id) => memProjects.get(id))
    .filter(Boolean) as ProjectRecord[];

  out.sort((a, b) => (String(a.updatedAt) < String(b.updatedAt) ? 1 : -1));
  return out;
}

export async function patchProject(
  projectId: string,
  patch: Partial<ProjectRecord>
): Promise<ProjectRecord | null> {
  const existing = await getProject(projectId);
  if (!existing) return null;

  const next: ProjectRecord = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: existing.updatedAt,
  };

  if (next.ownerId && !next.userId) next.userId = next.ownerId;
  if (next.userId && !next.ownerId) next.ownerId = next.userId;

  next.createdAt = toIsoString(next.createdAt);
  next.updatedAt = nowIso();

  const saved = await upsertProject(next);
  return saved;
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectRecord["status"]
): Promise<ProjectRecord | null> {
  return patchProject(projectId, { status });
}
