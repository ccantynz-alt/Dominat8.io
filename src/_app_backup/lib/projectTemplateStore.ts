// src/app/lib/projectTemplateStore.ts

import { kv } from "@vercel/kv";

const keyFor = (projectId: string) => `project:${projectId}:templateId`;

export async function setProjectTemplateId(projectId: string, templateId: string | null) {
  const key = keyFor(projectId);

  if (!templateId) {
    // remove if null/empty
    await kv.del(key);
    return;
  }

  await kv.set(key, templateId);
}

export async function getProjectTemplateId(projectId: string): Promise<string | null> {
  const key = keyFor(projectId);
  const val = await kv.get<string>(key);
  return typeof val === "string" && val.length > 0 ? val : null;
}
