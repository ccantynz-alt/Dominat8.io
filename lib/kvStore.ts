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

export async function kvListProjects(): Promise<Project[] | null> {
  if (!hasKV()) return null;

  // IMPORTANT: generic must be an array type
  const ids = (await kv.smembers<string[]>(INDEX_KEY)) || [];
  if (!ids.length) return [];

  const keys = ids.map((id) => `project:${id}`);

  // mget returns array aligned with keys (some can be null)
  const values = await kv.mget<(string | null)[]>(...keys);

  const projects: Project[] = [];
  for (const raw of values) {
    if (!raw) continue;
    try {
      projects.push(JSON.parse(raw) as Project);
    } catch {
      // ignore bad entries
    }
  }

  projects.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  return projects;
}

export async function kvSaveProject(p: Project): Promise<Project | null> {
  if (!hasKV()) return null;

  await kv.set(`project:${p.id}`, JSON.stringify(p));
  await kv.sadd(INDEX_KEY, p.id);

  return p;
}
