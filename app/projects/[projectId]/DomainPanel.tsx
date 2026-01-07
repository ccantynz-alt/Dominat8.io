"use client";

import { useState } from "react";

export default function DomainPanel({ projectId }: { projectId: string }) {
  const [domain, setDomain] = useState("");
  const [record, setRecord] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function startVerification() {
    setStatus("Starting verification…");

    const res = await fetch(`/api/projects/${projectId}/domain/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    const data = await res.json();

    if (!data.ok) {
      setStatus("Failed to start verification");
      return;
    }

    setRecord(data.record);
    setStatus("Add the DNS record, then click Verify");
  }

  async function checkVerification() {
    setStatus("Checking DNS…");

    const res = await fetch(
      `/api/projects/${projectId}/domain/check`,
      { method: "POST" }
    );

    const data = await res.json();

    if (data.verified) {
      setStatus("✅ Domain verified!");
    } else {
      setStatus("❌ Not verified yet. Try again in 1–2 minutes.");
    }
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h3>Domain verification</h3>

      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="example.com"
        style={{ width: 300, marginRight: 8 }}
      />

      <button onClick={startVerification}>Start</button>

      {record && (
        <pre style={{ marginTop: 16 }}>
{`DNS RECORD TO ADD:

Type: ${record.type}
Host: ${record.host}
Value: ${record.value}`}
        </pre>
      )}

      {record && (
        <button onClick={checkVerification} style={{ marginTop: 8 }}>
          Verify
        </button>
      )}

      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </section>
  );
}
