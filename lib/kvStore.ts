import { kv } from "@vercel/kv";

export type Project = {
  id: string;
  name: string;
  templateId?: string;
  templateName?: string;
  seedPrompt?: string;
  createdAt: string;
};

const INDEX_KEY = "projects:index";

function hasKV() {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

function toProject(raw: unknown): Project | null {
  if (!raw) return null;

  // If KV returns an object already
  if (typeof raw === "object") {
    const p = raw as any;
    if (p?.id && p?.name) return p as Project;
    return null;
  }

  // If KV returns a JSON string
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      if (p?.id && p?.name) return p as Project;
      return null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function kvListProjects(): Promise<Project[] | null> {
  if (!hasKV()) return null;

  const ids = (await kv.smembers<string[]>(INDEX_KEY)) || [];
  if (!ids.length) return [];

  const keys = ids.map((id) => `project:${id}`);

  // Values might be strings OR objects depending on KV client behavior
  const values = await kv.mget<any[]>(...keys);

  const projects: Project[] = [];
  for (const v of values) {
    const p = toProject(v);
    if (p) projects.push(p);
  }

  projects.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  return projects;
}

export async function kvSaveProject(p: Project): Promise<Project | null> {
  if (!hasKV()) return null;

  await kv.set(`project:${p.id}`, p);
  await kv.sadd(INDEX_KEY, p.id);

  return p;
}
