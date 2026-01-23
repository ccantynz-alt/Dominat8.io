export type Project = {
  id: string;
  userId: string;
  name?: string;
  html: string | null;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

// ---------- Upstash / Vercel KV REST helpers ----------
// Requires env vars (typical on Vercel KV):
// - KV_REST_API_URL
// - KV_REST_API_TOKEN
//
// If these are not set, we fall back to in-memory storage (dev-only).
const mem = new Map<string, string>();

function kvEnv() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return { url, token };
}

async function kvFetch(path: string) {
  const { url, token } = kvEnv();

  if (!url || !token) return null;

  const res = await fetch(`${url}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`KV REST error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json?.result;
}

async function kvGetString(key: string): Promise<string | null> {
  const { url, token } = kvEnv();

  if (!url || !token) {
    return mem.get(key) ?? null;
  }

  const result = await kvFetch(`/get/${encodeURIComponent(key)}`);
  if (result === null || typeof result === "undefined") return null;
  if (typeof result === "string") return result;
  return JSON.stringify(result);
}

async function kvSetString(key: string, value: string): Promise<void> {
  const { url, token } = kvEnv();

  if (!url || !token) {
    mem.set(key, value);
    return;
  }

  // Upstash REST: /set/<key>/<value>
  await kvFetch(
    `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`
  );
}

async function kvSAdd(setKey: string, member: string): Promise<void> {
  const { url, token } = kvEnv();

  if (!url || !token) {
    // store a JSON list in mem for dev
    const existing = mem.get(setKey);
    const arr = existing ? (JSON.parse(existing) as string[]) : [];
    if (!arr.includes(member)) arr.push(member);
    mem.set(setKey, JSON.stringify(arr));
    return;
  }

  await kvFetch(
    `/sadd/${encodeURIComponent(setKey)}/${encodeURIComponent(member)}`
  );
}

async function kvSMembers(setKey: string): Promise<string[]> {
  const { url, token } = kvEnv();

  if (!url || !token) {
    const existing = mem.get(setKey);
    return existing ? (JSON.parse(existing) as string[]) : [];
  }

  const result = await kvFetch(`/smembers/${encodeURIComponent(setKey)}`);
  if (!result) return [];
  if (Array.isArray(result)) return result.map(String);
  return [];
}

// ---------- Keys ----------
function projectKey(projectId: string) {
  return `project:${projectId}`;
}
function userProjectsKey(userId: string) {
  return `projects:user:${userId}`;
}

// ---------- Public API used by routes ----------
export async function getProjectById(projectId: string): Promise<Project | null> {
  const raw = await kvGetString(projectKey(projectId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<Project> {
  const updated: Project = {
    ...project,
    updatedAt: nowIso(),
  };

  await kvSetString(projectKey(updated.id), JSON.stringify(updated));
  await kvSAdd(userProjectsKey(updated.userId), updated.id);

  return updated;
}

// Optional helpers (useful elsewhere in your app)
export async function createProject(userId: string, name?: string): Promise<Project> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `proj_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

  const project: Project = {
    id,
    userId,
    name: name ?? "Untitled Project",
    html: null,
    isPublished: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  await saveProject(project);
  return project;
}

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const ids = await kvSMembers(userProjectsKey(userId));
  const projects: Project[] = [];

  for (const id of ids) {
    const p = await getProjectById(id);
    if (p) projects.push(p);
  }

  // newest first
  projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return projects;
}
