"use client";

import { useEffect, useState } from "react";
import GoldFogPageLayout from "@/components/GoldFogPageLayout";

type Deployment = { domain: string; desc: string; updatedAt: string };

export default function LogsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/tv/deployments", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (alive && data.deployments) setDeployments(data.deployments);
      });
    return () => { alive = false; };
  }, []);

  const logEntries = deployments.slice(0, 10).map((d, i) => ({
    time: d.updatedAt,
    message: `Deployment: ${d.domain}`,
    level: "info",
  }));

  return (
    <GoldFogPageLayout title="Logs">
      <div className="gold-fog-card">
        <p className="gold-fog-muted" style={{ marginBottom: 20 }}>
          Recent deployment activity. Full request and build logs coming soon.
        </p>
        {logEntries.length === 0 ? (
          <p className="gold-fog-muted">No activity yet.</p>
        ) : (
          <ul className="gold-fog-row-list">
            {logEntries.map((entry, i) => (
              <li key={i} style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>
                <span className="gold-fog-muted">{new Date(entry.time).toLocaleString()}</span>
                <span style={{ color: "rgba(212,175,55,0.8)", marginLeft: 12 }}>{entry.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GoldFogPageLayout>
  );
}
