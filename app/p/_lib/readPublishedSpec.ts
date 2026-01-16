import { kvGetJson } from "@/lib/kv";

export async function readPublishedSpec(projectId: string) {
  // These keys are best-guess; we'll try multiple to avoid "spec not found".
  const candidates = [
    `project:${projectId}:siteSpec`,
    `project:${projectId}:spec`,
    `project:${projectId}:draftSpec`,
    `project:${projectId}:publishedSpec`,
  ];

  for (const key of candidates) {
    const v = await kvGetJson<any>(key);
    if (v) return { keyUsed: key, value: v };
  }

  return { keyUsed: null, value: null };
}
