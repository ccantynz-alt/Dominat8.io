"use client";

import { useState } from "react";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I’m your site AI. What are we building?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;

    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Error talking to AI." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Chat</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          minHeight: 320,
          marginTop: 16,
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <strong>{m.role === "user" ? "You" : "AI"}</strong>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && <div>Thinking…</div>}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          style={{ padding: "12px 16px", borderRadius: 10 }}
        >
          Send
        </button>
      </div>
    </main>
  );
}
