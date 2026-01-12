"use client";

import { useState } from "react";

export default function AdminActionsPanel({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [body, setBody] = useState("");
  const [confirmText, setConfirmText] = useState("");

  async function doAction(action: "unpublish" | "delete") {
    setLoading(true);
    setStatus("");
    setBody("");

    try {
      const res = await fetch(`/api/projects/${projectId}/admin`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const text = await res.text();
      setStatus(String(res.status));
      setBody(text);

      if (res.ok && action === "delete") {
        // send user back to projects list
        window.location.href = "/projects";
      }
    } catch (e: any) {
      setStatus("ERROR");
      setBody(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        border: "1px solid #ffdddd",
        background: "#fff7f7",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        maxWidth: 900,
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 10 }}>Danger Zone</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          disabled={loading}
          onClick={() => doAction("unpublish")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ffb3b3",
            background: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Working..." : "Unpublish"}
        </button>

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Delete project (type DELETE to confirm)
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ffb3b3",
                width: 160,
              }}
            />
            <button
              disabled={loading || confirmText !== "DELETE"}
              onClick={() => doAction("delete")}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ffb3b3",
                background: confirmText === "DELETE" ? "#ffe5e5" : "white",
                cursor:
                  loading || confirmText !== "DELETE" ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              {loading ? "Working..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {status ? (
        <div style={{ marginTop: 12 }}>
          <b>Status:</b> {status}
          {body ? (
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                background: "#fff",
                overflowX: "auto",
                maxWidth: 900,
              }}
            >
              {body}
            </pre>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
