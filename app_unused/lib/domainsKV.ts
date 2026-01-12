import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";

export type ConnectedDomain = {
  domain: string;          // normalized host (example.com or www.example.com)
  createdAt: string;
  lastCheckedAt?: string;
  lastStatus?: "ok" | "needs_action" | "propagating_or_unknown" | "domain_not_found" | "blocked_or_conflicting";
  lastCode?: string;       // diagnosis code like wrong_www_cname
};

function key(projectId: string) {
  return `project:domains:${projectId}`;
}

function normalizeHost(input: string): string {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.split("/")[0].split("?")[0].split("#")[0];
  s = s.split(":")[0];
  s = s.replace(/\.$/, "");
  return s;
}

export async function getDomains(projectId: string): Promise<ConnectedDomain[]> {
  const list = await kvJsonGet<ConnectedDomain[]>(key(projectId));
  return Array.isArray(list) ? list : [];
}

export async function addDomain(projectId: string, domain: string, meta?: Partial<ConnectedDomain>) {
  const now = kvNowISO();
  const host = normalizeHost(domain);

  const list = await getDomains(projectId);
  const exists = list.some((d) => d.domain === host);

  const next: ConnectedDomain[] = exists
    ? list.map((d) => (d.domain === host ? { ...d, ...meta, domain: host } : d))
    : [{ domain: host, createdAt: now, ...meta }, ...list];

  await kvJsonSet(key(projectId), next);
  return next;
}

export async function removeDomain(projectId: string, domain: string) {
  const host = normalizeHost(domain);
  const list = await getDomains(projectId);
  const next = list.filter((d) => d.domain !== host);
  await kvJsonSet(key(projectId), next);
  return next;
}
