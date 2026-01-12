import { kv } from "@/app/lib/kv";
import { SeoPage } from "@/app/lib/seoGenerator";

function key(projectId: string) {
  return `seo:pages:${projectId}`;
}

export async function saveSeoPages(
  projectId: string,
  pages: SeoPage[]
) {
  await kv.set(key(projectId), pages);
}

export async function getSeoPages(projectId: string): Promise<SeoPage[]> {
  return (await kv.get(key(projectId))) || [];
}

export async function getSeoPageBySlug(
  projectId: string,
  slug: string
): Promise<SeoPage | null> {
  const pages = await getSeoPages(projectId);
  return pages.find((p) => p.slug === slug) || null;
}
