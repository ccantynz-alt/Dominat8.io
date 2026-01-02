import { kv } from "@/app/lib/kv";

export type Template = {
  id: string;
  name: string;
  description: string;
  category: string; // e.g. "Landing", "Business", "Portfolio"
  previewImage?: string;
  seedPrompt: string; // prompt used by your agent to generate pages
  createdAt: string;
  updatedAt: string;
  published: boolean;
};

const KEY = "templates:all";

function uid() {
  return `tpl_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export async function listTemplates(): Promise<Template[]> {
  const items = (await kv.get(KEY)) as Template[] | null;
  return Array.isArray(items) ? items : [];
}

export async function getTemplate(id: string): Promise<Template | null> {
  const all = await listTemplates();
  return all.find((t) => t.id === id) || null;
}

export async function upsertTemplate(input: Partial<Template> & { id?: string }): Promise<Template> {
  const all = await listTemplates();
  const now = new Date().toISOString();

  const id = input.id || uid();

  const next: Template = {
    id,
    name: String(input.name || "Untitled Template"),
    description: String(input.description || ""),
    category: String(input.category || "General"),
    previewImage: input.previewImage ? String(input.previewImage) : undefined,
    seedPrompt: String(
      input.seedPrompt ||
        "Build a modern landing page with a hero, benefits, testimonials, pricing, and a contact form."
    ),
    createdAt: input.createdAt ? String(input.createdAt) : now,
    updatedAt: now,
    published: Boolean(input.published),
  };

  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);

  await kv.set(KEY, all);
  return next;
}

export async function deleteTemplate(id: string) {
  const all = await listTemplates();
  const next = all.filter((t) => t.id !== id);
  await kv.set(KEY, next);
  return { deleted: all.length - next.length };
}
