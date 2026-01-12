// app/lib/programPagesKV.ts
import { storeGet, storeSet } from "./store";

export type KVProgramPage = {
  category: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  bullets: string[];
  faq: { q: string; a: string }[];
};

function key(projectId: string) {
  return `project:programPages:${projectId}`;
}

export async function getProgramPages(projectId: string): Promise<KVProgramPage[]> {
  const v = await storeGet(key(projectId));
  return Array.isArray(v) ? (v as KVProgramPage[]) : [];
}

export async function setProgramPages(projectId: string, pages: KVProgramPage[]) {
  await storeSet(key(projectId), pages);
}
