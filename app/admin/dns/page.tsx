"use client";

import { useState } from "react";
import Link from "next/link";

type Result = any;

export default function AdminDnsCheckPage() {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function runCheck() {
    setErr(null);
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
            Paste a domain and we’ll detect common DNS + SSL problems and suggest next steps.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Admin Home
          </Link>
        </div>
      </div>

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
              setResult(null);
            }}
            disabled={busy}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            Clear
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
            <div className="font-semibold">Message</div>
            <div className="text-muted-foreground mt-1">{result?.diagnosis?.message}</div>
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
