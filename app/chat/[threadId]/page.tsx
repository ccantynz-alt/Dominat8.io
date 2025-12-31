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

  useEffect(
