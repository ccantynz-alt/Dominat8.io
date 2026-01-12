"use client";

import { useState, useEffect } from "react";

export default function DomainsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function attach() {
    setLoading(true);
    const res = await fetch(
      `/api/projects/${params.projectId}/domains/attach`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      }
    );
    const data = await res.json();
    setStatus(data.status);
    setLoading(false);
  }

  return (
    <div>
      <h1>Custom Domain</h1>

      <input
        placeholder="example.com"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      <button onClick={attach} disabled={loading}>
        Attach Domain
      </button>

      {status && (
        <pre style={{ marginTop: 16 }}>
          {JSON.stringify(status, null, 2)}
        </pre>
      )}
    </div>
  );
}
