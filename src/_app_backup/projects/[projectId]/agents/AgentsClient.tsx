"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  projectId: string;
};

export default function AgentsClient({ projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const urls = useMemo(() => {
    const basePublished = `/p/${projectId}`;
    return {
      api: `/api/projects/${projectId}/agents/finish-for-me`,
      publishedHome: basePublished,
      publishedPricing: `${basePublished}/pricing`,
      publishedAbout: `${basePublished}/about`,
      publishedFaq: `${basePublished}/faq`,
      publishedContact: `${basePublished}/contact`,
    };
  }, [projectId]);

  async function runFinishForMe() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch(urls.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const text = await r.text();

      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }

      if (!r.ok) {
        setError(`HTTP ${r.status}`);
      }

      setResult({
        ok: r.ok,
        status: r.status,
        json,
      });
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Finish-for-me
        </h2>

        <p style={{ marginBottom: 12, opacity: 0.85 }}>
          Calls: <code>{urls.api}</code>
        </p>

        <button
          onClick={runFinishForMe}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Running…" : "Run Finish-for-me"}
        </button>

        {error ? (
          <p style={{ marginTop: 10, color: "tomato" }}>Error: {error}</p>
        ) : null}
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Published links
        </h2>

        <ul style={{ display: "grid", gap: 8, margin: 0, paddingLeft: 18 }}>
          <li>
            <Link href={urls.publishedHome}>Published: Home</Link>
          </li>
          <li>
            <Link href={urls.publishedPricing}>Published: Pricing</Link>
          </li>
          <li>
            <Link href={urls.publishedAbout}>Published: About</Link>
          </li>
          <li>
            <Link href={urls.publishedFaq}>Published: FAQ</Link>
          </li>
          <li>
            <Link href={urls.publishedContact}>Published: Contact</Link>
          </li>
        </ul>
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Latest response
        </h2>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0,
            opacity: 0.95,
          }}
        >
          {result ? JSON.stringify(result, null, 2) : "No response yet."}
        </pre>
      </div>
    </section>
  );
}


