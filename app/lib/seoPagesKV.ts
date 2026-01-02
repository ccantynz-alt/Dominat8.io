import { kv } from "@/app/lib/kv";

export type SeoSection = {
  heading: string;
  content: string;
};

export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  sections: SeoSection[];
  keyword: string;
  createdAt: string;
  ai: {
    model: string;
    version: string;
  };
};

function key(projectId: string) {
  return `seo:pages:${projectId}`;
}

export async function getSeoPages(projectId: string): Promise<SeoPage[]> {
  const pages = (await kv.get(key(projectId))) as SeoPage[] | null;
  return Array.isArray(pages) ? pages : [];
}

export async function getSeoPageBySlug(projectId: string, slug: string): Promise<SeoPage | null> {
  const pages = await getSeoPages(projectId);
  return pages.find((p) => p.slug === slug) || null;
}

export async function upsertSeoPages(projectId: string, newPages: SeoPage[]) {
  const existing = await getSeoPages(projectId);
  const bySlug = new Map(existing.map((p) => [p.slug, p]));

  for (const p of newPages) bySlug.set(p.slug, p);

  const merged = Array.from(bySlug.values()).sort((a, b) =>
    a.slug.localeCompare(b.slug)
  );

  await kv.set(key(projectId), merged);
  return merged;
}
