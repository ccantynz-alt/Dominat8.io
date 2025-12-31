// app/chat/[threadId]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Msg = {
  role: "system" | "user" | "assistant";
  content: string;
  at: string;
};

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = (params?.threadId as string) || "";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    if (!threadId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`);
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
      else router.push("/chat");
    } catch (err) {
      console.error(err);
      router.push("/chat");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending || !threadId) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    setMessages((m) => [...m, { role: "user", content: text, at: new Date().toISOString() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, message: text }),
      });
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 900,
        margin: "0 auto",
        padding: 16,
      }}
    >
      <header style={{ marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={() => router.push("/chat")}
          style={{ border: "1px solid #ddd", background: "#fff", padding: "8px 10px", borderRadius: 8 }}
        >
          ← Back
        </button>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Thread: {threadId}</div>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          padding: 12,
        }}
      >
        {loading && <p>Loading…</p>}

        {!loading &&
          messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 12,
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: m.role === "user" ? "#000" : "#f3f3f3",
                  color: m.role === "user" ? "#fff" : "#000",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

        <div ref={bottomRef} />
      </div>

      <footer style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {sending ? "…" : "Send"}
        </button>
      </footer>
    </main>
  );
}
