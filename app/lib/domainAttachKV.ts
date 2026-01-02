import { kv } from "@/app/lib/kv";

function key(projectId: string) {
  return `project:domains:attached:${projectId}`;
}

export async function saveDomainStatus(
  projectId: string,
  domain: string,
  status: any
) {
  const current = (await kv.get(key(projectId))) || {};
  await kv.set(key(projectId), {
    ...current,
    [domain]: status,
  });
}

export async function getDomainStatuses(projectId: string) {
  return (await kv.get(key(projectId))) || {};
}
