export type Project = {
  id: string;
  userId: string;
  name: string;
  templateId?: string | null;
  createdAt: number;
  updatedAt: number;
};

type Store = {
  projects: Map<string, Project>;
  userProjects: Map<string, Set<string>>;
};

function getMemStore(): Store {
  const g = globalThis as any;
  if (!g.__PROJECTS_MEM_STORE__) {
    g.__PROJECTS_MEM_STORE__ = {
      projects: new Map<string, Project>(),
      userProjects: new Map<string, Set<string>>(),
    } as Store;
  }
  return g.__PROJECTS_MEM_STORE__ as Store;
}

function hasKVEnv() {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

async function getKV() {
  if (!hasKVEnv()) return null;
  const mod = await import("@vercel/kv");
  return mod.kv;
}

const projectKey = (projectId: string) => `project:${projectId}`;
const userProjectsKey = (userId: string) => `user:${userId}:projects`;

export function newProjectId() {
  const id = crypto.randomUUID().replace(/-/g, "");
  return `proj_${id}`;
}

export async function saveProject(project: Project) {
  // DEV MEMORY store takes priority if enabled
  if (process.env.DEV_MEMORY_STORE === "1" || !hasKVEnv()) {
    const mem = getMemStore();
    mem.projects.set(project.id, project);
    if (!mem.userProjects.has(project.userId)) mem.userProjects.set(project.userId, new Set());
    mem.userProjects.get(project.userId)!.add(project.id);
    return { ok: true, mode: "memory" as const };
  }

  const kv = await getKV();
  if (!kv) return { ok: false, mode: "none" as const };

  await kv.set(projectKey(project.id), project);
  await kv.sadd(userProjectsKey(project.userId), project.id);
  return { ok: true, mode: "kv" as const };
}

export async function getProject(projectId: string) {
  // Memory path
  if (process.env.DEV_MEMORY_STORE === "1" || !hasKVEnv()) {
    const mem = getMemStore();
    return mem.projects.get(projectId) ?? null;
  }

  const kv = await getKV();
  if (!kv) return null;

  const obj = await kv.get(projectKey(projectId));
  if (!obj || typeof obj !== "object") return null;
  return obj as any as Project;
}

export async function listProjects(userId: string) {
  // Memory path
  if (process.env.DEV_MEMORY_STORE === "1" || !hasKVEnv()) {
    const mem = getMemStore();
    const ids = Array.from(mem.userProjects.get(userId) ?? []);
    const projects = ids.map((id) => mem.projects.get(id)).filter(Boolean) as Project[];
    projects.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    return projects;
  }

  const kv = await getKV();
  if (!kv) return [];

  const ids = (await kv.smembers(userProjectsKey(userId))) as string[];
  const projects: Project[] = [];

  for (const id of ids || []) {
    const obj = await kv.get(projectKey(id));
    if (obj && typeof obj === "object") projects.push(obj as any as Project);
  }

  projects.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  return projects;
}

