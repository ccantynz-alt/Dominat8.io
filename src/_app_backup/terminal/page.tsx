// src/app/terminal/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal Probe",
  description: "Confirms the Terminal UI routes are deployed.",
};

export default function TerminalProbePage() {
  return (
    <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Terminal Probe ✅</h1>
      <p style={{ marginTop: 8 }}>
        If you can see this page in production, the <code>/terminal</code> route exists.
      </p>
      <p style={{ marginTop: 8 }}>
        Next: open <code>/projects/&lt;projectId&gt;/terminal</code>.
      </p>
    </div>
  );
}
