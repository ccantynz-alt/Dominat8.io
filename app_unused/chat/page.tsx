// app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export default function ChatIndexPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/threads", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.ok) setThreads(data.threads || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createThread() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New chat" }),
      });
      const data = await res.json();
      if (data?.ok && data.thread?.id) {
        router.push(`/chat/${data.thread.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Chat</h1>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={createThread}
          disabled={creating}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {creating ? "Creating…" : "+ New chat"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <p>Loading…</p>
        ) : threads.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No chats yet.</p>
        ) : (
          threads.map((t) => (
            <div
              key={t.id}
              onClick={() => router.push(`/chat/${t.id}`)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #e5e5e5",
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600 }}>{t.title || "Untitled chat"}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                Updated {new Date(t.updatedAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
