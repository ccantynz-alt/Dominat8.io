// src/app/lib/projectScaffoldStore.ts

import { kv } from "@vercel/kv";
import type { TemplateScaffold } from "./templateScaffolds";

const scaffoldKey = (projectId: string) => `project:${projectId}:scaffold:v1`;
const appliedKey = (projectId: string) => `project:${projectId}:scaffoldApplied:v1`;

export async function getProjectScaffold(projectId: string): Promise<TemplateScaffold | null> {
  const val = await kv.get<TemplateScaffold>(scaffoldKey(projectId));
  if (!val || typeof val !== "object") return null;
  return val;
}

export async function hasScaffoldApplied(projectId: string): Promise<boolean> {
  const val = await kv.get<boolean>(appliedKey(projectId));
  return val === true;
}

export async function setProjectScaffold(projectId: string, scaffold: TemplateScaffold) {
  await kv.set(scaffoldKey(projectId), scaffold);
  await kv.set(appliedKey(projectId), true);
}
