// app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  role: "system" | "user" | "assistant";
  content: string;
  at: string;
};

export default function ChatPage() {
  const threadId = "debug-thread";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`);
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    setMessages((m) => [
      ...m,
      { role: "user", content: text, at: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, message: text }),
      });
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Chat (Safe Mode)</h1>

      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        {loading && <p>Loading…</p>}

        {!loading &&
          messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <b>{m.role}:</b> {m.content}
            </div>
          ))}

        <div ref={bottomRef} />
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message…"
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />
    </main>
  );
}
