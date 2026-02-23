"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

type Deployment = { domain: string; desc: string; status: string; updatedAt: string };

export default function DeployPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/tv/deployments", { cache: "no-store" });
        const data = await res.json();
        if (alive && data.deployments) setDeployments(data.deployments);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <GoldFogPageLayout title="Deploy">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 20 }}>
          Deploy your generated sites to a live URL. Build from the home page, then save or share.
        </p>
        <Link href="/" className="gold-fog-btn">Build new site</Link>
      </div>
      <div className="gold-fog-card">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: "rgba(255,255,255,0.9)" }}>
          Recent deployments
        </h2>
        {loading ? (
          <p className="gold-fog-muted">Loading…</p>
        ) : deployments.length === 0 ? (
          <p className="gold-fog-muted">No deployments yet. Build a site from the home page.</p>
        ) : (
          <ul className="gold-fog-row-list">
            {deployments.map((d, i) => (
              <li key={i}>
                <div>
                  <a href={d.domain} target="_blank" rel="noopener noreferrer">{d.domain.replace(/^https?:\/\//, "")}</a>
                  <div className="gold-fog-muted" style={{ marginTop: 4 }}>{d.desc}</div>
                </div>
                <span style={{ fontSize: 12, color: "rgba(212,175,55,0.8)" }}>{d.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GoldFogPageLayout>
  );
}
