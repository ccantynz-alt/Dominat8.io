"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Msg = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

type RunStatus = "queued" | "running" | "done" | "failed";

type AgentPersona = "general" | "planner" | "coder" | "reviewer" | "researcher";

type Run = {
  id: string;
  threadId?: string;
  projectId?: string;
  prompt: string;
  status: RunStatus;
  agent?: AgentPersona; // ← NEW (older runs may not have this)
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
};

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const threadId = params.threadId;

  // Chat
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatErr, setChatErr] = useState<string | null>(null);

  // Runs
  const [runs, setRuns] = useState<Run[]>([]);
  const [runPrompt, setRunPrompt] = useState(
    "Continue this thread as a background agent. Summarize progress and propose next actions."
  );

  // ✅ NEW: persona selection
  const [runAgent, setRunAgent] = useState<AgentPersona>("general");

  const [creatingRun, setCreatingRun] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runErr, setRunErr] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const selectedRunIsActive = useMemo(() => {
    if (!selectedRun) return false;
    return selectedRun.status === "queued" || selectedRun.status === "running";
  }, [selectedRun]);

  async function loadMessages() {
    setChatErr(null);
    const res = await fetch(`/api/threads/${threadId}/messages`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setChatErr(data?.error ?? "Failed to load messages");
      return;
    }
    setMessages(data.messages ?? []);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setChatErr(null);

    // optimistic
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, message: text }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Chat failed");

      // Prefer server truth if returned
      if (Array.isArray(data.messages)) setMessages(data.messages);
      else await loadMessages();
    } catch (e: any) {
      setChatErr(e?.message ?? "Chat failed");
    } finally {
      setSending(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  async function loadRuns() {
    setRunErr(null);
    const res = await fetch(`/api/threads/${threadId}/runs`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setRunErr(data?.error ?? "Failed to load runs");
      return;
    }
    setRuns(data.runs ?? []);
  }

  async function createThreadRun() {
    const text = runPrompt.trim();
    if (!text || creatingRun) return;

    setCreatingRun(true);
    setRunErr(null);

    try {
      const res = await fetch(`/api/threads/${threadId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "appl
