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

function prettyNowISO() {
  return new Date().toISOString();
}

function asRecordsText(dns: any) {
  const recs = dns?.recommendedRecords || [];
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

  // If we have recs, include them in a compact table-ish form too
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
  // fallback
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export default function ProjectDomainsPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;

  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [dns, setDns] = useState<DnsResult | null>(null);
  const [domains, setDomains] = useState<ConnectedDomain[]>([]);
  const [info, setInfo] = useState<string | null>(null);

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

  async function checkDns() {
    setErr(null);
    setInfo(null);
    setDns(null);
    setBusy("check");

    try {
      const res = await fetch("/api/dns/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "DNS check failed");

      setDns(data.result);
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

      const message =
        `Hi, I’m trying to connect my domain and I’m stuck.\n\n` +
        `Project: ${projectId}\n` +
        `Domain: ${host}\n` +
        `Provider detected: ${dns?.provider?.detected || "unknown"} (${dns?.provider?.confidence || "low"})\n\n` +
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

      setInfo(`Support ticket created: ${data.ticket?.id || "created"}. Our team will reply inside the ticket.`);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  const canSave = dns?.diagnosis?.status === "ok";
  const showDns = !!dns;

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Connect a Domain</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste your domain, we’ll detect your DNS provider, check DNS + SSL, and tell you exactly what to do.
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

      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="text-xl font-semibold">Step 1 — Paste your domain</h2>

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

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={checkDns}
            disabled={busy !== null || !domain.trim()}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            {busy === "check" ? "Checking..." : "Check DNS"}
          </button>

          <button
            onClick={() => {
              setDns(null);
              setErr(null);
              setInfo(null);
            }}
            disabled={busy !== null}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            Clear
          </button>
        </div>
      </section>

      {showDns ? (
        <section className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">Step 2 — Follow the instructions</h2>
            <span className="text-xs rounded-full border px-2 py-1">
              {dns?.diagnosis?.status} • {dns?.diagnosis?.code}
            </span>
          </div>

          <div className="text-sm">
            <div className="font-semibold">DNS provider detected</div>
            <div className="text-muted-foreground mt-1">
              {dns?.provider?.message}{" "}
              <span className="text-xs">({dns?.provider?.detected} • {dns?.provider?.confidence})</span>
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
            <div className="font-semibold">Recommended DNS records (copy/paste)</div>
            <div className="text-muted-foreground mt-1">
              Add these records in your DNS provider. (If your host shows different values for your project, use the host’s values.)
            </div>

            <div className="mt-2 rounded-lg border p-3 space-y-2">
              {(dns?.recommendedRecords || []).map((r: any, idx: number) => (
                <div key={idx} className="text-sm">
                  <div className="font-semibold">{r.type} — {r.host}</div>
                  <div className="text-muted-foreground">
                    Name/Host: <span className="font-mono">{r.name}</span> • Value: <span className="font-mono">{r.value}</span> • TTL: {r.ttl}
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
                onClick={checkDns}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {busy === "check" ? "Checking..." : "Re-check DNS"}
              </button>
            </div>
          </div>

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
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Technical details (optional)</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs border rounded-md p-3 overflow-auto">
{JSON.stringify(dns, null, 2)}
            </pre>
          </details>
        </section>
      ) : null}

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
