/**
 * DNS helpers for Domain Wizard v1
 * Marker: DOMAIN_WIZARD_V1
 *
 * Uses DNS-over-HTTPS to query public DNS (Google) without server dependencies.
 */

export type DnsAnswer = { name: string; type: number; TTL?: number; data: string };

type DnsResponse = {
  Status?: number;
  Answer?: Array<{ name: string; type: number; TTL?: number; data: string }>;
};

export function normalizeDomain(input: string): string {
  const d = (input || "").trim().toLowerCase();
  return d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
}

export function safeDomain(input: string): string {
  const d = normalizeDomain(input);
  // Very light validation (we keep it permissive)
  if (!d || d.length > 253) throw new Error("Invalid domain.");
  if (!/^[a-z0-9.-]+$/.test(d)) throw new Error("Invalid domain.");
  if (d.startsWith(".") || d.endsWith(".") || d.includes("..")) throw new Error("Invalid domain.");
  return d;
}

export function apexOf(domain: string): string {
  return safeDomain(domain);
}

export function hostFor(domain: string): string {
  // Suggest user set up "www" as primary host
  const d = safeDomain(domain);
  if (d.startsWith("www.")) return d;
  return `www.${d}`;
}

export async function dohQuery(name: string, rrtype: "A" | "AAAA" | "CNAME" | "TXT"): Promise<DnsAnswer[]> {
  const qn = safeDomain(name);
  const url = `https://dns.google/resolve?name=${encodeURIComponent(qn)}&type=${encodeURIComponent(rrtype)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`DNS query failed (${res.status}).`);

  const json = (await res.json()) as DnsResponse;
  const ans = json.Answer || [];
  return ans.map((a) => ({ name: a.name, type: a.type, TTL: a.TTL, data: a.data }));
}

export function summarizeAnswers(ans: DnsAnswer[]): string[] {
  const out: string[] = [];
  for (const a of ans) {
    const data = String(a.data || "").trim();
    if (data) out.push(data);
  }
  return out;
}

export function looksLikeIp(s: string): boolean {
  return /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(s);
}

export function stripQuotes(s: string): string {
  return (s || "").replace(/^"+|"+$/g, "");
}