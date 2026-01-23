// src/app/lib/projectContentStore.ts

import { kv } from "@vercel/kv";
import type { TemplateScaffoldSection } from "./templateScaffolds";

export type ProjectContentV1 = {
  version: 1;
  updatedAt: string; // ISO
  templateId: string | null;
  sections: TemplateScaffoldSection[];
};

const contentKey = (projectId: string) => `project:${projectId}:content:v1`;

export async function getProjectContent(projectId: string): Promise<ProjectContentV1 | null> {
  const val = await kv.get<ProjectContentV1>(contentKey(projectId));
  if (!val || typeof val !== "object") return null;
  if ((val as any).version !== 1) return null;
  return val;
}

export async function setProjectContent(projectId: string, content: ProjectContentV1) {
  await kv.set(contentKey(projectId), content);
}

export async function clearProjectContent(projectId: string) {
  await kv.del(contentKey(projectId));
}

