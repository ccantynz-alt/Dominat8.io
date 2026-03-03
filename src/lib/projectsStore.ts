import { eq, desc } from "drizzle-orm";
import { db, schema } from "./db";

export type ProjectRecord = {
  id: string;
  name: string;
  templateId?: string | null;

  // Backwards compatibility:
  // Some routes expect project.userId, others use project.ownerId.
  userId?: string | null;
  ownerId?: string | null;

  createdAt: string | number;
  updatedAt: string | number;

  status?: "draft" | "generating" | "ready" | "error" | string;

  prompt?: string | null;
  generatedHtml?: string | null;
  lastGeneratedAt?: number | null;

  data?: any;

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

function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

// ── Row → ProjectRecord ─────────────────────────────────────────────────────
function rowToProject(row: typeof schema.projects.$inferSelect): ProjectRecord {
  return {
    id: row.id,
    name: row.name,
    templateId: row.templateId,
    userId: row.ownerId,
    ownerId: row.ownerId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    prompt: row.prompt,
    generatedHtml: row.generatedHtml,
    lastGeneratedAt: row.lastGeneratedAt ? row.lastGeneratedAt.getTime() : null,
    data: row.data,
  };
}

// ── In-memory fallback (when DATABASE_URL is not set) ────────────────────────
const memProjects = new Map<string, ProjectRecord>();
const memIndex = new Set<string>();
const memUserIndex = new Map<string, Set<string>>();

// ── Exports expected by existing routes ──────────────────────────────────────
export function newProjectId(): string {
  const rand = Math.random().toString(16).slice(2);
  return `proj_${Date.now().toString(16)}${rand}`;
}

export async function saveProject(project: ProjectRecord): Promise<ProjectRecord> {
  return upsertProject(project);
}

// ── Core API ─────────────────────────────────────────────────────────────────
export async function getProject(projectId: string): Promise<ProjectRecord | null> {
  if (hasDb()) {
    const rows = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1);
    return rows[0] ? rowToProject(rows[0]) : null;
  }
  return memProjects.get(projectId) ?? null;
}

export async function upsertProject(project: ProjectRecord): Promise<ProjectRecord> {
  const normalizedCreatedAt = toIsoString(project.createdAt);
  const normalizedUpdatedAt = nowIso();

  const p: ProjectRecord = {
    ...project,
    createdAt: normalizedCreatedAt,
    updatedAt: normalizedUpdatedAt,
  };

  if (p.ownerId && !p.userId) p.userId = p.ownerId;
  if (p.userId && !p.ownerId) p.ownerId = p.userId;

  if (hasDb()) {
    const values = {
      id: p.id,
      name: p.name,
      templateId: p.templateId ?? null,
      ownerId: p.ownerId ?? null,
      status: p.status ?? "draft",
      prompt: p.prompt ?? null,
      generatedHtml: p.generatedHtml ?? null,
      lastGeneratedAt: p.lastGeneratedAt ? new Date(p.lastGeneratedAt) : null,
      data: p.data ?? null,
      createdAt: new Date(normalizedCreatedAt),
      updatedAt: new Date(normalizedUpdatedAt),
    };

    await db
      .insert(schema.projects)
      .values(values)
      .onConflictDoUpdate({
        target: schema.projects.id,
        set: {
          name: values.name,
          templateId: values.templateId,
          ownerId: values.ownerId,
          status: values.status,
          prompt: values.prompt,
          generatedHtml: values.generatedHtml,
          lastGeneratedAt: values.lastGeneratedAt,
          data: values.data,
          updatedAt: values.updatedAt,
        },
      });

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
  if (hasDb()) {
    const rows = ownerId
      ? await db.select().from(schema.projects).where(eq(schema.projects.ownerId, ownerId)).orderBy(desc(schema.projects.updatedAt))
      : await db.select().from(schema.projects).orderBy(desc(schema.projects.updatedAt));
    return rows.map(rowToProject);
  }

  let ids: string[] = [];
  if (ownerId) {
    ids = Array.from(memUserIndex.get(ownerId)?.values() ?? []);
  } else {
    ids = Array.from(memIndex.values());
  }
  const out = ids.map((id) => memProjects.get(id)).filter(Boolean) as ProjectRecord[];
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

  return upsertProject(next);
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectRecord["status"]
): Promise<ProjectRecord | null> {
  return patchProject(projectId, { status });
}
