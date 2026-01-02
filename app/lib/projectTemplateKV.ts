import { kv } from "@/app/lib/kv";

export type ProjectTemplateSelection = {
  templateId: string;
  selectedAt: string;
};

function key(projectId: string) {
  return `project:template:${projectId}`;
}

export async function getProjectTemplate(projectId: string): Promise<ProjectTemplateSelection | null> {
  const v = (await kv.get(key(projectId))) as ProjectTemplateSelection | null;
  return v?.templateId ? v : null;
}

export async function setProjectTemplate(projectId: string, templateId: string) {
  const v: ProjectTemplateSelection = {
    templateId,
    selectedAt: new Date().toISOString(),
  };
  await kv.set(key(projectId), v);
  return v;
}

export async function clearProjectTemplate(projectId: string) {
  await kv.del(key(projectId));
  return { ok: true };
}
