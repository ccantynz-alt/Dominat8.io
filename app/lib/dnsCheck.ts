import dns from "dns/promises";

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

  expected: {
    apexA: string; // default Vercel apex IP
    wwwCname: string; // default Vercel CNAME target
    note: string;
  };

  records: {
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
    nextSteps: string[]; // simple bullet steps for novices
  };
};

const DEFAULT_VERCEL_APEX_IP = "76.76.21.21";
const DEFAULT_VERCEL_CNAME = "cname.vercel-dns.com";

function normalizeHost(input: string): string {
  let s = (input || "").trim().toLowerCase();

  // strip scheme
  s = s.replace(/^https?:\/\//, "");

  // strip path/query/hash
  s = s.split("/")[0].split("?")[0].split("#")[0];

  // strip port
  s = s.split(":")[0];

  // remove trailing dot
  s = s.replace(/\.$/, "");

  // remove accidental leading www? keep host as-is, but we compute apex separately
  return s;
}

function computeApex(host: string): string {
  // If host starts with www., use the rest as apex
  if (host.startsWith("www.")) return host.slice(4);
  return host;
}

function safeErr(e: any): string {
  const code = e?.code ? `${e.code}` : "";
  const msg = e?.message ? `${e.message}` : "error";
  return code ? `${code}: ${msg}` : msg;
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
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: true, status: res.status, finalUrl: res.url };
  } catch (e: any) {
    clearTimeout(timeout);
    return { ok: false, error: e?.name === "AbortError" ? "timeout" : safeErr(e) };
  }
}

function includesExpectedCname(values: string[], expected: string) {
  const exp = expected.toLowerCase().replace(/\.$/, "");
  return values.some((v) => v.toLowerCase().replace(/\.$/, "") === exp);
}

export async function runDnsCheck(input: DnsCheckInput): Promise<DnsCheckResult> {
  const raw = input.domain || "";
  const host = normalizeHost(raw);
  const apex = computeApex(host);
  const www = `www.${apex}`;

  // DNS lookups
  const [apexA, apexCname, wwwA, wwwCname] = await Promise.all([
    resolve4Safe(apex),
    resolveCnameSafe(apex),
    resolve4Safe(www),
    resolveCnameSafe(www),
  ]);

  // HTTPS checks (best-effort)
  const [httpsApex, httpsWww] = await Promise.all([
    httpsCheck(`https://${apex}`),
    httpsCheck(`https://${www}`),
  ]);

  // Diagnose
  const hasAny =
    apexA.values.length ||
    apexCname.values.length ||
    wwwA.values.length ||
    wwwCname.values.length;

  const hasConflictApex = apexA.values.length > 0 && apexCname.values.length > 0;
  const hasConflictWww = wwwA.values.length > 0 && wwwCname.values.length > 0;

  const apexAOk = apexA.values.includes(DEFAULT_VERCEL_APEX_IP);
  const wwwCnameOk = includesExpectedCname(wwwCname.values, DEFAULT_VERCEL_CNAME);

  let status: DnsCheckResult["diagnosis"]["status"] = "propagating_or_unknown";
  let code: DnsCheckResult["diagnosis"]["code"] = "unknown";
  let message = "We couldn’t confidently confirm your DNS settings yet.";
  let nextSteps: string[] = [
    "Confirm your domain is registered and you’re editing DNS in the correct provider.",
    "If you just changed DNS, wait a bit and click Re-check.",
    "If it still fails, send a screenshot of your DNS records page (blur anything sensitive).",
  ];

  // Domain not found / no records at all often means NXDOMAIN or wrong nameservers
  if (!hasAny) {
    // If all errors look like ENOTFOUND/NXDOMAIN, classify as domain_not_found
    const errs = [apexA.error, apexCname.error, wwwA.error, wwwCname.error].filter(Boolean).join(" | ");
    const looksNotFound = /ENOTFOUND|NXDOMAIN/i.test(errs);

    if (looksNotFound) {
      status = "domain_not_found";
      code = "domain_not_found";
      message = "Your domain didn’t resolve in DNS (it may be unregistered, using the wrong nameservers, or DNS hasn’t propagated).";
      nextSteps = [
        "Double-check the domain spelling (copy/paste it).",
        "Confirm your domain is active/paid at your registrar.",
        "Confirm where DNS is hosted (registrar DNS vs Cloudflare, etc).",
        "If you recently changed nameservers, wait for propagation and re-check.",
      ];
    } else {
      status = "propagating_or_unknown";
      code = "missing_records";
      message = "We didn’t find the required DNS records yet.";
      nextSteps = [
        "If using apex (example.com): add an A record pointing to 76.76.21.21 (or the exact value Vercel shows for your project).",
        "If using www (www.example.com): add a CNAME record pointing to cname.vercel-dns.com (or the exact value Vercel shows for your project).",
        "Remove old/conflicting records for the same host (extra A/AAAA/CNAME).",
        "Wait for DNS propagation, then re-check.",
      ];
    }
  } else if (hasConflictApex || hasConflictWww) {
    status = "blocked_or_conflicting";
    code = "conflicting_records";
    message = "We detected conflicting DNS records (for the same host you generally should not have both A and CNAME).";
    nextSteps = [
      "For apex (example.com): keep ONE correct A record (commonly 76.76.21.21 for Vercel) and remove any CNAME for apex.",
      "For www (www.example.com): keep ONE correct CNAME (commonly cname.vercel-dns.com for Vercel) and remove any A record for www.",
      "If you’re using Cloudflare, try DNS-only (not proxied) while verifying, then re-check.",
      "Wait a bit and re-check after changes.",
    ];
  } else if (!apexAOk || !wwwCnameOk) {
    status = "needs_action";

    if (!apexAOk) {
      code = "wrong_apex_a";
      message = `Your apex A record doesn’t appear to be set to ${DEFAULT_VERCEL_APEX_IP}.`;
      nextSteps = [
        `Set apex (example.com) A record to ${DEFAULT_VERCEL_APEX_IP} (or use the exact value shown in Vercel’s Domains screen).`,
        "Remove other apex A records that point elsewhere.",
        "If you have an AAAA record for apex and it’s not required, remove it to avoid conflicts.",
        "Wait for propagation and re-check.",
      ];
    } else if (!wwwCnameOk) {
      code = "wrong_www_cname";
      message = `Your www CNAME doesn’t appear to point to ${DEFAULT_VERCEL_CNAME}.`;
      nextSteps = [
        `Set www (www.example.com) CNAME record to ${DEFAULT_VERCEL_CNAME} (or use the exact value shown in Vercel’s Domains screen).`,
        "Remove any www A record (www should usually be CNAME, not A).",
        "Wait for propagation and re-check.",
      ];
    }
  } else {
    // DNS looks OK. Now check HTTPS.
    if (!httpsApex.ok && !httpsWww.ok) {
      status = "propagating_or_unknown";
      code = "https_not_ready";
      message = "DNS looks correct, but HTTPS isn’t ready yet (certificate may still be issuing).";
      nextSteps = [
        "Wait 5–30 minutes and re-check (certificate issuance can take time).",
        "If you are using Cloudflare, set SSL mode to Full (or Full Strict once issued).",
        "If you have CAA records, ensure they allow the certificate authority used by your host.",
        "If it still fails after 1–2 hours, open a support ticket with your domain and a screenshot of DNS records.",
      ];
    } else {
      status = "ok";
      code = "ok";
      message = "DNS looks correct and HTTPS responds. You should be good to go.";
      nextSteps = [
        "If you still see an error in the browser, hard refresh (Ctrl+F5) and try again.",
        "If the site shows the wrong content, confirm the domain is connected to the correct project/site.",
      ];
    }
  }

  return {
    ok: status === "ok",
    input: { raw, host, apex, www },
    expected: {
      apexA: DEFAULT_VERCEL_APEX_IP,
      wwwCname: DEFAULT_VERCEL_CNAME,
      note:
        "These are common Vercel defaults; always prefer the exact values shown in your hosting provider’s domain settings if they differ.",
    },
    records: {
      apexA,
      apexCname,
      wwwA,
      wwwCname,
    },
    https: {
      apex: httpsApex,
      www: httpsWww,
    },
    diagnosis: { status, code, message, nextSteps },
  };
}
