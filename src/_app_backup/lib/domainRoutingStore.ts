import { kv } from "./kv";

const KEY_PREFIX = "domain:route:";
const CLAIM_PREFIX = "domain:claim:";

export function normalizeDomain(input: string) {
  const host = (input || "").trim().toLowerCase();
  if (!host) return "";
  return host.split(":")[0];
}

function routeKey(domain: string) {
  return `${KEY_PREFIX}${normalizeDomain(domain)}`;
}

function claimKey(domain: string) {
  return `${CLAIM_PREFIX}${normalizeDomain(domain)}`;
}

/**
 * Get mapped projectId for a domain (apex only; middleware canonicalizes www -> apex).
 * Empty string is treated as "no mapping".
 */
export async function getDomainProjectMapping(domain: string): Promise<string | null> {
  const d = normalizeDomain(domain);
  if (!d) return null;

  const value = (await kv.get(routeKey(d))) as unknown as string | null;
  const v = (value || "").trim();
  return v ? v : null;
}

/**
 * Set mapped projectId for a domain.
 */
export async function setDomainProjectMapping(domain: string, projectId: string): Promise<void> {
  const d = normalizeDomain(domain);
  if (!d) throw new Error("Missing domain");
  if (!projectId) throw new Error("Missing projectId");
  await kv.set(routeKey(d), projectId);
}

/**
 * "Delete" mapping for a domain.
 * Your kv wrapper has no del(), so we write an empty string.
 */
export async function deleteDomainProjectMapping(domain: string): Promise<void> {
  const d = normalizeDomain(domain);
  if (!d) return;
  await kv.set(routeKey(d), "");
}

/**
 * Compatibility export expected by /api/domains/resolve:
 * getProjectIdForHost(host) -> projectId|null
 */
export async function getProjectIdForHost(host: string): Promise<string | null> {
  const d = normalizeDomain(host);
  if (!d) return null;

  const apex = d.startsWith("www.") ? d.slice(4) : d;
  return await getDomainProjectMapping(apex);
}

/**
 * Claim a domain so only one project can own it.
 * domain -> projectId
 *
 * If domain already claimed by another project, throw.
 * If claimed by same project, allow.
 */
export async function claimDomain(domain: string, projectId: string): Promise<void> {
  const d = normalizeDomain(domain);
  if (!d) throw new Error("Missing domain");
  if (!projectId) throw new Error("Missing projectId");

  const existing = (await kv.get(claimKey(d))) as unknown as string | null;
  const e = (existing || "").trim();

  if (e && e !== projectId) {
    throw new Error("Domain already claimed by another project");
  }

  await kv.set(claimKey(d), projectId);
}

/**
 * Release a claimed domain (only if it belongs to this project).
 * No del() available, so we write empty string.
 */
export async function releaseDomain(domain: string, projectId: string): Promise<void> {
  const d = normalizeDomain(domain);
  if (!d) return;
  if (!projectId) return;

  const existing = (await kv.get(claimKey(d))) as unknown as string | null;
  const e = (existing || "").trim();

  if (e === projectId) {
    await kv.set(claimKey(d), "");
  }
}
