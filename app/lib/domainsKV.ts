import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { randomUUID } from "crypto";

export type DomainStatus =
  | "pending_dns"
  | "verifying"
  | "verified"
  | "ssl_active"
  | "error";

export type ProjectDomain = {
  id: string;
  projectId: string;
  domain: string;
  status: DomainStatus;
  createdAt: string;
  lastCheckedAt?: string;
  notes?: string;
  dnsInstructions: {
    type: "apex" | "subdomain";
    records: Array<{ type: "A" | "CNAME" | "TXT"; name: string; value: string }>;
  };
};

function domainsKey(projectId: string) {
  return `project:domains:${projectId}`;
}

function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

function isApex(domain: string) {
  // rough rule: apex like example.com (2 labels) vs www.example.com (3+)
  // not perfect for co.nz, but good enough for initial UX; you can refine later.
  const parts = domain.split(".").filter(Boolean);
  return parts.length <= 2;
}

export async function getProjectDomains(projectId: string): Promise<ProjectDomain[]> {
  const v = await kvJsonGet<ProjectDomain[]>(domainsKey(projectId));
  return Array.isArray(v) ? v : [];
}

export async function addProjectDomain(projectId: string, domainInput: string) {
  const domain = normalizeDomain(domainInput);
  if (!domain || domain.length < 3 || !domain.includes(".")) {
    throw new Error("Invalid domain");
  }

  const existing = await getProjectDomains(projectId);
  if (existing.some((d) => d.domain === domain)) {
    return existing;
  }

  const apex = isApex(domain);

  // Generic DNS guidance for Vercel-style hosting.
  // Later you can tailor per provider, and/or integrate real Vercel domain verification.
  const dnsInstructions: ProjectDomain["dnsInstructions"] = apex
    ? {
        type: "apex",
        records: [
          { type: "A", name: "@", value: "76.76.21.21" },
          { type: "TXT", name: "@", value: "vercel-domain-verify=<add-later>" },
        ],
      }
    : {
        type: "subdomain",
        records: [{ type: "CNAME", name: domain.split(".")[0], value: "cname.vercel-dns.com" }],
      };

  const next: ProjectDomain[] = [
    ...existing,
    {
      id: `dom_${randomUUID().replace(/-/g, "")}`,
      projectId,
      domain,
      status: "pending_dns",
      createdAt: kvNowISO(),
      dnsInstructions,
    },
  ];

  await kvJsonSet(domainsKey(projectId), next);
  return next;
}

export async function checkProjectDomain(projectId: string, domainId: string) {
  const all = await getProjectDomains(projectId);
  const idx = all.findIndex((d) => d.id === domainId);
  if (idx === -1) throw new Error("Domain not found");

  const d = all[idx];

  // This is a SAFE placeholder check.
  // Real implementation later:
  // - call Vercel Domains API OR use webhooks
  // - verify DNS + cert status for real
  //
  // For now: move status along for demo/testing flows.
  const nextStatus: DomainStatus =
    d.status === "pending_dns"
      ? "verifying"
      : d.status === "verifying"
      ? "verified"
      : d.status === "verified"
      ? "ssl_active"
      : d.status;

  const updated = { ...d, status: nextStatus, lastCheckedAt: kvNowISO() };
  const next = [...all];
  next[idx] = updated;

  await kvJsonSet(domainsKey(projectId), next);
  return updated;
}

export async function removeProjectDomain(projectId: string, domainId: string) {
  const all = await getProjectDomains(projectId);
  const next = all.filter((d) => d.id !== domainId);
  await kvJsonSet(domainsKey(projectId), next);
  return next;
}
