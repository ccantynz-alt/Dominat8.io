// src/app/lib/projectPublishStore.ts

import { kv } from "@vercel/kv";
import type { ProjectContentV1 } from "./projectContentStore";

export type PublishedProjectV1 = {
  version: 1;
  publishedAt: string; // ISO
  projectId: string;
  templateId: string | null;
  content: ProjectContentV1;
};

const publishedKey = (projectId: string) => `project:${projectId}:published:v1`;

export async function getPublishedProject(projectId: string): Promise<PublishedProjectV1 | null> {
  const val = await kv.get<PublishedProjectV1>(publishedKey(projectId));
  if (!val || typeof val !== "object") return null;
  if ((val as any).version !== 1) return null;
  return val;
}

export async function setPublishedProject(projectId: string, published: PublishedProjectV1) {
  await kv.set(publishedKey(projectId), published);
}

export async function clearPublishedProject(projectId: string) {
  await kv.del(publishedKey(projectId));
}
