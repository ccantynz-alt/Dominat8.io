"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DnsResult = any;

type ConnectedDomain = {
  domain: string;
  createdAt: string;
  lastCheckedAt?: string;
  lastStatus?: string;
  lastCode?: string;
};

type ProviderChoice =
  | "auto"
  | "cloudflare"
  | "godaddy"
  | "namecheap"
  | "google"
  | "aws_route53"
  | "squarespace"
  | "other";

function prettyNowISO() {
  return new Date().toISOString();
}

function normalizeHost(input: string): string {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.split("/")[0].split("?")[0].split("#")[0];
  s = s.split(":")[0];
  s = s.replace(/\.$/, "");
  return s;
}

function isLikelyApex(host: string) {
  return host && !host.startsWith("www.");
}

function asRecordsText(dns: any) {
  const apex = dns?.input?.apex || "example.com";
  const www = dns?.input?.www || `www.${apex}`;

  const lines = [
    `DNS records to add (recommended):`,
    ``,
    `Apex (${apex})`,
    `- Type: A`,
    `- Name/Host: @`,
    `- Value: ${dns?.expected?.apexA || "76.76.21.21"}`,
    `- TTL: Auto`,
    ``,
    `WWW (${www})`,
    `- Type: CNAME`,
    `- Name/Host: www`,
    `- Value: ${dns?.expected?.wwwCname || "cname.vercel-dns.com"}`,
    `- TTL: Auto`,
    ``,
    `If your hosting provider shows different values for your project, use those exact values instead.`,
  ];

  const recs = dns?.recommendedRecords || [];
  if (recs.length) {
    lines.push(``, `Compact list:`);
    for (const r of recs) {
      lines.push(`- ${r.type}  ${r.name}  →  ${r.value} (TTL: ${r.ttl})`);
    }
  }

  return lines.join("\n");
}

async function copyToClipboard(text: string) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export default function ProjectDomainsPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  // Wizard
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [providerChoice, setProviderChoice] = useState<ProviderChoice>("auto");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [dns, setDns] = useState<DnsResult | null>(null);
  const [domains, setDomains] = useState<ConnectedDomain[]>([]);

  const copyText = useMemo(() => (dns ? asRecordsText(dns) : ""), [dns]);

  async function loadDomains() {
    try {
      const res = await fetch(`/api/projects/${projectId}/domains`, { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) setDomains(data.domains || []);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function resetFlow() {
    setStep(1);
    setProviderChoice("auto");
    setDns(null);
    setErr(null);
    setInfo(null);
  }

  async function checkDns(forcedDomain?: string) {
    setErr(null);
    setInfo(null);
    setDns(null);
    setBusy("check");

    const d = normalizeHost(forcedDomain ?? domain);

    try {
      const res = await fetch("/api/dns/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "DNS check failed");

      const result = data.result;

      // If user chose a provider manually, we just show their choice as a hint message.
      // (We do not currently override backend detection; it’s for UX.)
      if (providerChoice !== "auto") {
        result.provider = result.provider || {};
        result.provider.userChoice = providerChoice;
      }

      setDns(result);
      setStep(3);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveDomain() {
    if (!dns) return;

    setErr(null);
    setInfo(null);
    setBusy("save");

    try {
      const host = dns?.input?.host || domain;

      const res = await fetch(`/api/projects/${projectId}/domains`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          domain: host,
          lastCheckedAt: prettyNowISO(),
          lastStatus: dns?.diagnosis?.status,
          lastCode: dns?.diagnosis?.code,
        }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to save domain");

      setDomains(data.domains || []);
      setInfo("Saved domain to your project.");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteDomain(d: string) {
    setErr(null);
    setInfo(null);
    setBusy(`delete:${d}`);

    try {
      const res = await fetch(`/api/projects/${projectId}/domains`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to delete domain");

      setDomains(data.domains || []);
      setInfo("Removed domain.");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function createSupportTicketWithDnsSnapshot() {
    if (!dns) return;

    setErr(null);
    setInfo(null);
    setBusy("ticket");

    try {
      const host = dns?.input?.host || domain;
      const subject = `Domain connection help: ${host}`;

      const providerDetected = dns?.provider?.detected || "unknown";
      const providerConfidence = dns?.provider?.confidence || "low";
      const providerUserChoice = dns?.provider?.userChoice || providerChoice;

      const message =
        `Hi, I’m trying to connect my domain and I’m stuck.\n\n` +
        `Project: ${projectId}\n` +
        `Domain: ${host}\n` +
        `Provider detected: ${providerDetected} (${providerConfidence})\n` +
        `Provider chosen by user: ${providerUserChoice}\n\n` +
        `AutoDetectDNS diagnosis:\n` +
        `- status: ${dns?.diagnosis?.status}\n` +
        `- code: ${dns?.diagnosis?.code}\n` +
        `- message: ${dns?.diagnosis?.message}\n\n` +
        `Suggested next steps:\n` +
        `${(dns?.diagnosis?.nextSteps || []).map((s: string) => `- ${s}`).join("\n")}\n\n` +
        `Recommended records:\n` +
        `${asRecordsText(dns)}\n\n` +
        `DNS snapshot JSON (for support):\n` +
        `${JSON.stringify(dns, null, 2)}`;

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId,
          email: email.trim() || undefined,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to create support ticket");

      setInfo(`Support ticket created: ${data.ticket?.id || "created"}. We’ll reply inside the ticket.`);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  const canSave = dns?.diagnosis?.status === "ok";

  // Smart suggestion: if user typed apex and it’s failing, suggest trying www (and vice versa)
  const suggestion = useMemo(() => {
    const host = normalizeHost(domain);
    const apex = host.startsWith("www.") ? host.slice(4) : host;
    const www = `www.${apex}`;

    if (!dns) return null;

    const status = dns?.diagnosis?.status;
    const code = dns?.diagnosis?.code;

    // If user typed apex and we see apex wrong/missing, offer www.
    if (isLikelyApex(host) && status !== "ok" && (code === "wrong_apex_a" || code === "missing_records" || code === "domain_not_found")) {
      return {
        label: `Try www instead (${www})`,
        nextDomain: www,
        reason: "Many people connect the www subdomain first because it’s usually a simple CNAME record.",
      };
    }

    // If user typed www and www cname wrong/missing, offer apex.
    if (host.startsWith("www.") && status !== "ok" && (code === "wrong_www_cname" || code === "missing_records")) {
      return {
        label: `Try apex instead (${apex})`,
        nextDomain: apex,
        reason: "Sometimes the apex domain is already set up; we can check it too.",
      };
    }

    return null;
  }, [domain, dns]);

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Connect a Domain</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A simple wizard for beginners: tell us your DNS provider (optional), paste your domain, then follow the steps.
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            Project: <span className="font-mono">{projectId}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href={`/projects/${projectId}`} className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Back to Project
          </Link>
          <Link href="/support" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Support
          </Link>
        </div>
      </div>

      {info ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Info</div>
          <div className="text-muted-foreground mt-1">{info}</div>
        </div>
      ) : null}

      {err ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Error</div>
          <div className="text-muted-foreground mt-1">{err}</div>
        </div>
      ) : null}

      {/* Wizard Step 1 */}
      {step === 1 ? (
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="text-xl font-semibold">Step 1 — Where is your DNS hosted?</h2>
          <p className="text-sm text-muted-foreground">
            If you’re not sure, choose “Auto-detect”. We’ll try to detect it from nameservers.
          </p>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setProviderChoice("auto")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "auto" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Auto-detect
            </button>
            <button onClick={() => setProviderChoice("cloudflare")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "cloudflare" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Cloudflare
            </button>
            <button onClick={() => setProviderChoice("godaddy")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "godaddy" ? "font-semibold" : ""}`} disabled={busy !== null}>
              GoDaddy
            </button>
            <button onClick={() => setProviderChoice("namecheap")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "namecheap" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Namecheap
            </button>
            <button onClick={() => setProviderChoice("google")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "google" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Google
            </button>
            <button onClick={() => setProviderChoice("aws_route53")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "aws_route53" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Route 53
            </button>
            <button onClick={() => setProviderChoice("squarespace")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "squarespace" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Squarespace
            </button>
            <button onClick={() => setProviderChoice("other")} className={`rounded-md border px-4 py-2 hover:bg-muted transition ${providerChoice === "other" ? "font-semibold" : ""}`} disabled={busy !== null}>
              Other
            </button>
          </div>

          <div className="flex gap-2 flex-wrap pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={busy !== null}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              Continue
            </button>

            <button
              onClick={resetFlow}
              disabled={busy !== null}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              Reset
            </button>
          </div>
        </section>
      ) : null}

      {/* Wizard Step 2 */}
      {step === 2 ? (
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="text-xl font-semibold">Step 2 — Paste your domain</h2>
          <p className="text-sm text-muted-foreground">
            Example: <span className="font-mono">example.com</span> or <span className="font-mono">www.example.com</span>
          </p>

          <label className="text-sm font-semibold">Domain</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com or www.example.com"
            className="border rounded-md px-3 py-2 w-full"
            disabled={busy !== null}
          />

          <label className="text-sm font-semibold">Email (optional)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com (optional, for support replies)"
            className="border rounded-md px-3 py-2 w-full"
            disabled={busy !== null}
          />

          <div className="flex gap-2 flex-wrap pt-2">
            <button
              onClick={() => checkDns()}
              disabled={busy !== null || !domain.trim()}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              {busy === "check" ? "Checking..." : "Check DNS"}
            </button>

            <button
              onClick={() => setStep(1)}
              disabled={busy !== null}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              Back
            </button>

            <button
              onClick={resetFlow}
              disabled={busy !== null}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              Reset
            </button>
          </div>
        </section>
      ) : null}

      {/* Wizard Step 3 */}
      {step === 3 && dns ? (
        <section className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Step 3 — Follow the steps</h2>
            <span className="text-xs rounded-full border px-2 py-1">
              {dns?.diagnosis?.status} • {dns?.diagnosis?.code}
            </span>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Provider</div>
            <div className="text-muted-foreground mt-1">
              {dns?.provider?.message}{" "}
              <span className="text-xs">({dns?.provider?.detected} • {dns?.provider?.confidence})</span>
              {providerChoice !== "auto" ? (
                <span className="text-xs"> • you selected: {providerChoice}</span>
              ) : null}
            </div>
          </div>

          {dns?.diagnosis?.warnings?.length ? (
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-semibold">Warnings</div>
              <ul className="list-disc pl-5 text-muted-foreground mt-1 space-y-1">
                {dns.diagnosis.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="text-sm">
            <div className="font-semibold">What we found</div>
            <div className="text-muted-foreground mt-1">{dns?.diagnosis?.message}</div>
          </div>

          <div className="text-sm">
            <div className="font-semibold">DNS records to add (copy/paste)</div>

            <div className="mt-2 rounded-lg border p-3 space-y-2">
              {(dns?.recommendedRecords || []).map((r: any, idx: number) => (
                <div key={idx} className="text-sm">
                  <div className="font-semibold">{r.type} — {r.host}</div>
                  <div className="text-muted-foreground">
                    Name/Host: <span className="font-mono">{r.name}</span> • Value:{" "}
                    <span className="font-mono">{r.value}</span> • TTL: {r.ttl}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{r.why}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap mt-3">
              <button
                onClick={async () => {
                  try {
                    await copyToClipboard(copyText);
                    setInfo("Copied DNS records to clipboard.");
                  } catch {
                    setErr("Could not copy to clipboard.");
                  }
                }}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                Copy DNS records
              </button>

              <button
                onClick={() => checkDns()}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {busy === "check" ? "Checking..." : "Re-check DNS"}
              </button>

              <button
                onClick={() => {
                  setDns(null);
                  setStep(2);
                }}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                Change domain
              </button>
            </div>
          </div>

          {suggestion ? (
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-semibold">Tip</div>
              <div className="text-muted-foreground mt-1">{suggestion.reason}</div>
              <button
                onClick={() => {
                  setDomain(suggestion.nextDomain);
                  checkDns(suggestion.nextDomain);
                }}
                disabled={busy !== null}
                className="mt-2 rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {suggestion.label}
              </button>
            </div>
          ) : null}

          <div className="text-sm">
            <div className="font-semibold">Provider-specific steps</div>
            <ol className="list-decimal pl-5 text-muted-foreground mt-1 space-y-1">
              {(dns?.diagnosis?.providerSteps || []).map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="text-sm">
            <div className="font-semibold">General next steps</div>
            <ul className="list-disc pl-5 text-muted-foreground mt-1 space-y-1">
              {(dns?.diagnosis?.nextSteps || []).map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={saveDomain}
              disabled={busy !== null || !canSave}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
              title={!canSave ? "Save is enabled when DNS status is ok." : ""}
            >
              {busy === "save" ? "Saving..." : "Save Domain"}
            </button>

            <button
              onClick={createSupportTicketWithDnsSnapshot}
              disabled={busy !== null}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              {busy === "ticket" ? "Creating ticket..." : "I’m stuck — create support ticket"}
            </button>

            <button
              onClick={resetFlow}
              disabled={busy !== null}
              className="rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              Start over
            </button>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Technical details (optional)</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs border rounded-md p-3 overflow-auto">
{JSON.stringify(dns, null, 2)}
            </pre>
          </details>
        </section>
      ) : null}

      {/* Saved domains */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-xl font-semibold">Connected domains (saved)</h2>

        {domains.length === 0 ? (
          <div className="text-sm text-muted-foreground">No saved domains yet.</div>
        ) : (
          <div className="space-y-2">
            {domains.map((d) => (
              <div key={d.domain} className="rounded-lg border p-3 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{d.domain}</div>
                  <div className="text-xs text-muted-foreground">
                    Added: {new Date(d.createdAt).toLocaleString()}
                    {d.lastCheckedAt ? ` • Last check: ${new Date(d.lastCheckedAt).toLocaleString()}` : ""}
                  </div>
                  {d.lastStatus ? (
                    <div className="text-xs text-muted-foreground">
                      Status: <span className="font-semibold">{d.lastStatus}</span>
                      {d.lastCode ? ` • Code: ${d.lastCode}` : ""}
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => deleteDomain(d.domain)}
                  disabled={busy !== null}
                  className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
                >
                  {busy === `delete:${d.domain}` ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
