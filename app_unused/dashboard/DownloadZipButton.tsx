"use client";

import React from "react";

export function DownloadZipButton({ projectId }: { projectId: string }) {
  const href = `/api/projects/${projectId}/zip`;

  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.18)",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      Download Project ZIP
    </a>
  );
}
