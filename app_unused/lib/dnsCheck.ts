import dns from "dns/promises";

export type DnsProvider =
  | "cloudflare"
  | "godaddy"
  | "namecheap"
  | "google"
  | "squarespace"
  | "aws_route53"
  | "hover"
  | "other"
  | "unknown";

export type DnsCheckInput = {
  domain: string; // user input, can include scheme/path
};

export type DnsCheckResult = {
  ok: boolean;
  input: {
    raw: string;
    host: string;
    apex: string;
    www: string;
  };

  provider: {
    detected: DnsProvider;
    confidence: "high" | "medium" | "low";
    nameservers: string[];
    message: string;
  };

  expected: {
    apexA: string; // common Vercel apex IP
    wwwCname: string; // common Vercel CNAME target
    note: string;
  };

  recommendedRecords: Array<{
    host: string; // apex or www host
    type: "A" | "CNAME";
    name: string; // "@" or "www"
    value: string; // IP or hostname
    ttl: "auto" | "3600" | "300";
    why: string;
  }>;

  records: {
    ns: { values: string[]; error?: string };
    apexA: { values: string[]; error?: string };
    apexCname: { values: string[]; error?: string };
    wwwA: { values: string[]; error?: string };
    wwwCname: { values: string[]; error?: string };
  };

  https: {
    apex: { ok: boolean; status?: number; finalUrl?: string; error?: string };
    www: { ok: boolean; status?: number; finalUrl?: string; error?: string };
  };

  diagnosis: {
    status: "ok" | "needs_action" | "propagating_or_unknown" | "domain_not_found" | "blocked_or_conflicting";
    code:
      | "ok"
      | "missing_records"
      | "wrong_apex_a"
      | "wrong_www_cname"
      | "conflicting_records"
      | "domain_not_found"
      | "https_not_ready"
      | "unknown";
    message: string;
    nextSteps: string[]; // beginner steps
    providerSteps?: string[]; // tailored provider steps
    warnings?: string[]; // e.g. Cloudflare proxy note
  };
};

const DEFAULT_VERCEL_APEX_IP = "76.76.21.21";
const DEFAULT_VERCEL_CNAME = "cname.vercel-dns.com";

function normalizeHost(input: string): string {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.split("/")[0].split("?")[0].split("#")[0];
  s = s.split(":")[0];
  s = s.replace(/\.$/, "");
  return s;
}

function computeApex(host: string): string {
  if (host.startsWith("www.")) return host.slice(4);
  return host;
}

function safeErr(e: any): string {
  const code = e?.code ? `${e.code}` : "";
  const msg = e?.message ? `${e.message}` : "error";
  return code ? `${code}: ${msg}` : msg;
}

async function resolveNsSafe(name: string): Promise<{ values: string[]; error?: string }> {
  try {
    const values = await dns.resolveNs(name);
    return { values: Array.isArray(values) ? values.map((v) => v.toLowerCase()) : [] };
  } catch (e: any) {
    return { values: [], error: safeErr(e) };
  }
}

async function resolve4Safe(name: string): Promise<{ values: string[]; error?: string }> {
  try {
    const values = await dns.resolve4(name);
    return { values: Array.isArray(values) ? values : [] };
  } catch (e: any) {
    return { values: [], error: safeErr(e) };
  }
}

async function resolveCnameSafe(name: string): Promise<{ values: string[]; error?: string }> {
  try {
    const values = await dns.resolveCname(name);
    return { values: Array.isArray(values) ? values : [] };
  } catch (e: any) {
    return { values: [], error: safeErr(e) };
  }
}

async function httpsCheck(url: string): Promise<{ ok: boolean; status?: number; finalUrl?: string; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    clearTimeout(timeout);
    return { ok: true, status: res.status, finalUrl: res.url };
  } catch (e: any) {
    clearTimeout(timeout);
    return { ok: false, error: e?.name === "AbortError" ? "timeout" : safeErr(e) };
  }
}

function stripDot(s: string) {
  return (s || "").toLowerCase().replace(/\.$/, "");
}

function includesExpectedCname(values: string[], expected: string) {
  const exp = stripDot(expected);
  return values.some((v) => stripDot(v) === exp);
}

function detectProviderFromNs(ns: string[]): { detected: DnsProvider; confidence: "high" | "medium" | "low"; message: string } {
  const joined = ns.map(stripDot);

  if (joined.some((n) => n.endsWith("cloudflare.com"))) {
    return { detected: "cloudflare", confidence: "high", message: "Detected Cloudflare nameservers." };
  }
  if (joined.some((n) => n.endsWith("domaincontrol.com"))) {
    return { detected: "godaddy", confidence: "high", message: "Detected GoDaddy nameservers." };
  }
  if (joined.some((n) => n.endsWith("registrar-servers.com"))) {
    return { detected: "namecheap", confidence: "high", message: "Detected Namecheap (or similar) nameservers." };
  }
  if (joined.some((n) => n.includes("googledomains.com") || n.endsWith("google.com"))) {
    return { detected: "google", confidence: "medium", message: "Detected Google-managed DNS (likely Google Domains / Google Cloud DNS)."};
  }
  if (joined.some((n) => n.includes("awsdns-") || n.endsWith("awsdns.com") || n.endsWith("awsdns.org") || n.endsWith("awsdns.net") || n.endsWith("awsdns.co.uk"))) {
    return { detected: "aws_route53", confidence: "high", message: "Detected AWS Route 53 nameservers." };
  }
  if (joined.some((n) => n.includes("squarespace") || n.endsWith("squarespacedns.com"))) {
    return { detected: "squarespace", confidence: "medium", message: "Detected Squarespace-managed DNS." };
  }
  if (joined.some((n) => n.includes("hover.com"))) {
    return { detected: "hover", confidence: "medium", message: "Detected Hover nameservers." };
  }

  if (joined.length > 0) {
    return { detected: "other", confidence: "low", message: "Nameservers found, but provider is not confidently recognized." };
  }
  return { detected: "unknown", confidence: "low", message: "Could not detect nameservers. Domain may not be resolving yet." };
}

function providerSteps(provider: DnsProvider, apex: string) {
  switch (provider) {
    case "cloudflare":
      return [
        "Open Cloudflare → select your website.",
        "Go to **DNS**.",
        "Add/update the record(s) listed below.",
        "If you have an orange cloud (Proxied) on the new record while verifying, switch it to **DNS only** temporarily.",
        "Click Re-check in this page after saving.",
      ];
    case "godaddy":
      return [
        "Open GoDaddy → Domain → **DNS** / **Manage DNS**.",
        "Add/update the record(s) listed below.",
        "Remove any conflicting records for the same host (extra A/AAAA/CNAME).",
        "Save, then Re-check here (may take a few minutes).",
      ];
    case "namecheap":
      return [
        "Open Namecheap → Domain List → Manage → **Advanced DNS**.",
        "Add/update the record(s) listed below.",
        "Remove conflicts for the same host (extra A/AAAA/CNAME).",
        "Save, then Re-check here (may take a few minutes).",
      ];
    case "aws_route53":
      return [
        "Open AWS Route 53 → Hosted zones → select your zone.",
        "Create/Update the record(s) listed below (use **A** record for apex, **CNAME** for www).",
        "If Route 53 asks for routing policy, use **Simple**.",
        "Save, then Re-check here.",
      ];
    case "google":
      return [
        "Open your Google DNS manager (Cloud DNS or registrar DNS).",
        "Add/update the record(s) listed below.",
        "Remove conflicts for the same host.",
        "Save, then Re-check here.",
      ];
    case "squarespace":
      return [
        "Open Squarespace → Settings → Domains → DNS Settings.",
        "Add/update the record(s) listed below.",
        "Save, then Re-check here.",
      ];
    default:
      return [
        `Open your DNS provider for **${apex}**.`,
        "Add/update the record(s) listed below.",
        "Remove conflicting records for the same host.",
        "Save, then Re-check here.",
      ];
  }
}

export async function runDnsCheck(input: DnsCheckInput): Promise<DnsCheckResult> {
  const raw = input.domain || "";
  const host = normalizeHost(raw);
  const apex = computeApex(host);
  const www = `www.${apex}`;

  const ns = await resolveNsSafe(apex);
  const providerDetect = detectProviderFromNs(ns.values);

  const [apexA, apexCname, wwwA, wwwCname] = await Promise.all([
    resolve4Safe(apex),
    resolveCnameSafe(apex),
    resolve4Safe(www),
    resolveCnameSafe(www),
  ]);

  const [httpsApex, httpsWww] = await Promise.all([
    httpsCheck(`https://${apex}`),
    httpsCheck(`https://${www}`),
  ]);

  const hasAny =
    ns.values.length ||
    apexA.values.length ||
    apexCname.values.length ||
    wwwA.values.length ||
    wwwCname.values.length;

  const hasConflictApex = apexA.values.length > 0 && apexCname.values.length > 0;
  const hasConflictWww = wwwA.values.length > 0 && wwwCname.values.length > 0;

  const apexAOk = apexA.values.includes(DEFAULT_VERCEL_APEX_IP);
  const wwwCnameOk = includesExpectedCname(wwwCname.values, DEFAULT_VERCEL_CNAME);

  const recommendedRecords: DnsCheckResult["recommendedRecords"] = [
    {
      host: apex,
      type: "A",
      name: "@",
      value: DEFAULT_VERCEL_APEX_IP,
      ttl: "auto",
      why: "Connect apex domain to your hosted site (common Vercel default).",
    },
    {
      host: www,
      type: "CNAME",
      name: "www",
      value: DEFAULT_VERCEL_CNAME,
      ttl: "auto",
      why: "Connect www subdomain to your hosted site (common Vercel default).",
    },
  ];

  let status: DnsCheckResult["diagnosis"]["status"] = "propagating_or_unknown";
  let code: DnsCheckResult["diagnosis"]["code"] = "unknown";
  let message = "We couldn’t confidently confirm your DNS settings yet.";
  let nextSteps: string[] = [
    "Confirm your domain is active/paid and you are editing DNS in the correct provider.",
    "If you just changed DNS, wait a bit and click Re-check.",
    "If it still fails, create a support ticket and include a screenshot of your DNS records (blur anything sensitive).",
  ];

  const warnings: string[] = [];
  if (providerDetect.detected === "cloudflare") {
    warnings.push("Cloudflare tip: if you use the orange cloud (Proxied), it can sometimes confuse verification. Use DNS-only while verifying, then switch back if you want.");
  }

  if (!hasAny) {
    const errs = [ns.error, apexA.error, apexCname.error, wwwA.error, wwwCname.error].filter(Boolean).join(" | ");
    const looksNotFound = /ENOTFOUND|NXDOMAIN/i.test(errs);

    if (looksNotFound) {
      status = "domain_not_found";
      code = "domain_not_found";
      message = "Your domain didn’t resolve in DNS (unregistered, wrong nameservers, or DNS hasn’t propagated).";
      nextSteps = [
        "Double-check the domain spelling (copy/paste it).",
        "Confirm the domain is active/paid at your registrar.",
        "If you changed nameservers recently, wait for propagation and re-check.",
      ];
    } else {
      status = "propagating_or_unknown";
      code = "missing_records";
      message = "We didn’t find the required DNS records yet.";
      nextSteps = [
        "Add the recommended DNS records shown below.",
        "Remove old/conflicting records for the same host.",
        "Wait for DNS propagation, then re-check.",
      ];
    }
  } else if (hasConflictApex || hasConflictWww) {
    status = "blocked_or_conflicting";
    code = "conflicting_records";
    message = "We detected conflicting DNS records (for the same host you generally should not have both A and CNAME).";
    nextSteps = [
      "For apex (example.com): keep ONE A record (commonly 76.76.21.21) and remove any CNAME for apex.",
      "For www (www.example.com): keep ONE CNAME (commonly cname.vercel-dns.com) and remove any A record for www.",
      "Save, then re-check here.",
    ];
  } else if (!apexAOk || !wwwCnameOk) {
    status = "needs_action";

    if (!apexAOk) {
      code = "wrong_apex_a";
      message = `Your apex A record doesn’t appear to be set to ${DEFAULT_VERCEL_APEX_IP}.`;
      nextSteps = [
        `Set apex (example.com) A record to ${DEFAULT_VERCEL_APEX_IP}.`,
        "Remove other apex A/AAAA records that point elsewhere (conflicts).",
        "Wait a few minutes, then re-check.",
      ];
    } else {
      code = "wrong_www_cname";
      message = `Your www CNAME doesn’t appear to point to ${DEFAULT_VERCEL_CNAME}.`;
      nextSteps = [
        `Set www (www.example.com) CNAME record to ${DEFAULT_VERCEL_CNAME}.`,
        "Remove any www A record (www should usually be CNAME).",
        "Wait a few minutes, then re-check.",
      ];
    }
  } else {
    if (!httpsApex.ok && !httpsWww.ok) {
      status = "propagating_or_unknown";
      code = "https_not_ready";
      message = "DNS looks correct, but HTTPS isn’t ready yet (certificate may still be issuing).";
      nextSteps = [
        "Wait 5–30 minutes and re-check (certificate issuance can take time).",
        "If you are using Cloudflare, set SSL mode to Full (or Full Strict once issued).",
        "If it still fails after 1–2 hours, create a support ticket.",
      ];
    } else {
      status = "ok";
      code = "ok";
      message = "DNS looks correct and HTTPS responds. You should be good to go.";
      nextSteps = [
        "Click Save Domain to attach it to this project.",
        "If you still see old content, hard refresh (Ctrl+F5) and try again.",
      ];
    }
  }

  const pSteps = providerSteps(providerDetect.detected, apex);

  return {
    ok: status === "ok",
    input: { raw, host, apex, www },
    provider: {
      detected: providerDetect.detected,
      confidence: providerDetect.confidence,
      nameservers: ns.values,
      message: providerDetect.message,
    },
    expected: {
      apexA: DEFAULT_VERCEL_APEX_IP,
      wwwCname: DEFAULT_VERCEL_CNAME,
      note:
        "These are common defaults. If your host shows different values for your specific project, always use the host’s values.",
    },
    recommendedRecords,
    records: {
      ns,
      apexA,
      apexCname,
      wwwA,
      wwwCname,
    },
    https: { apex: httpsApex, www: httpsWww },
    diagnosis: {
      status,
      code,
      message,
      nextSteps,
      providerSteps: pSteps,
      warnings: warnings.length ? warnings : undefined,
    },
  };
}
