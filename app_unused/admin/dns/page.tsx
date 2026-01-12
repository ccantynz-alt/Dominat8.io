"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Result = any;

function asRecordsText(dns: any) {
  const apex = dns?.input?.apex || "example.com";
  const www = dns?.input?.www || `www.${apex}`;

  return [
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
  ].join("\n");
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

export default function AdminDnsCheckPage() {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const copyText = useMemo(() => (result ? asRecordsText(result) : ""), [result]);

  async function runCheck() {
    setErr(null);
    setInfo(null);
    setResult(null);
    setBusy(true);

    try {
      const res = await fetch("/api/dns/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed");

      setResult(data.result);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">AutoDetectDNS Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a domain and we’ll detect provider + common DNS + SSL issues and suggest next steps.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Admin Home
          </Link>
        </div>
      </div>

      {info ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Info</div>
          <div className="text-muted-foreground mt-1">{info}</div>
        </div>
      ) : null}

      <section className="rounded-lg border p-4 space-y-3">
        <label className="text-sm font-semibold">Domain</label>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com or www.example.com"
          className="border rounded-md px-3 py-2 w-full"
          disabled={busy}
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={runCheck}
            disabled={busy || !domain.trim()}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            {busy ? "Checking..." : "Run AutoDetectDNS"}
          </button>

          <button
            onClick={() => {
              setDomain("");
              setErr(null);
              setInfo(null);
              setResult(null);
            }}
            disabled={busy}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            Clear
          </button>

          <button
            onClick={async () => {
              if (!copyText) return;
              try {
                await copyToClipboard(copyText);
                setInfo("Copied DNS records to clipboard.");
              } catch {
                setErr("Could not copy to clipboard.");
              }
            }}
            disabled={busy || !copyText}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            Copy DNS records
          </button>
        </div>

        {err ? (
          <div className="rounded-lg border p-3 text-sm">
            <div className="font-semibold">Error</div>
            <div className="text-muted-foreground mt-1">{err}</div>
          </div>
        ) : null}
      </section>

      {result ? (
        <section className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Diagnosis</h2>
            <span className="text-xs rounded-full border px-2 py-1">
              {result?.diagnosis?.status} • {result?.diagnosis?.code}
            </span>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Provider</div>
            <div className="text-muted-foreground mt-1">
              {result?.provider?.message} ({result?.provider?.detected} • {result?.provider?.confidence})
            </div>
          </div>

          {result?.diagnosis?.warnings?.length ? (
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-semibold">Warnings</div>
              <ul className="list-disc pl-5 text-muted-foreground mt-1 space-y-1">
                {result.diagnosis.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="text-sm">
            <div className="font-semibold">Message</div>
            <div className="text-muted-foreground mt-1">{result?.diagnosis?.message}</div>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Provider steps</div>
            <ol className="list-decimal pl-5 text-muted-foreground mt-1 space-y-1">
              {(result?.diagnosis?.providerSteps || []).map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="text-sm">
            <div className="font-semibold">Next steps</div>
            <ul className="list-disc pl-5 text-muted-foreground mt-1 space-y-1">
              {(result?.diagnosis?.nextSteps || []).map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Technical details (optional)</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs border rounded-md p-3 overflow-auto">
{JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </section>
      ) : null}
    </main>
  );
}
