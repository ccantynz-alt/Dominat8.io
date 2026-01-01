"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  agent?: AgentPersona;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
};

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const router = useRouter();
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
  const [runAgent, setRunAgent] = useState<AgentPersona>("general");

  const [creatingRun, setCreatingRun] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runErr, setRunErr] = useState<string | null>(null);

  // Manual cron tick UI
  const [tickInfo, setTickInfo] = useState<string | null>(null);
  const [ticking, setTicking] = useState(false);

  // New thread UI
  const [creatingThread, setCreatingThread] = useState(false);

  // Live log streaming
  const streamRef = useRef<EventSource | null>(null);

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
    setTickInfo(null);

    try {
      const res = await fetch(`/api/threads/${threadId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, agent: runAgent }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Failed to create run");

      await loadRuns();
      const newRunId = data.run?.id as string | undefined;
      if (newRunId) setSelectedRunId(newRunId);
    } catch (e: any) {
      setRunErr(e?.message ?? "Failed to create run");
    } finally {
      setCreatingRun(false);
    }
  }

  async function loadRunDetails(runId: string) {
    setRunErr(null);
    const res = await fetch(`/api/runs/${runId}`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      setRunErr(data?.error ?? "Failed to load run");
      return;
    }
    setSelectedRun(data.run ?? null);
    setRunLogs(data.logs ?? []);
  }

  async function tickNow() {
    if (ticking) return;
    setTicking(true);
    setRunErr(null);
    setTickInfo(null);

    try {
      const res = await fetch("/api/cron/tick", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Tick failed");

      setTickInfo(`Run now OK — processed: ${data.processed ?? 0}`);

      await loadRuns();
      if (selectedRunId) await loadRunDetails(selectedRunId);
      await loadMessages();
    } catch (e: any) {
      setRunErr(e?.message ?? "Tick failed");
    } finally {
      setTicking(false);
    }
  }

  async function createNewThread() {
    if (creatingThread) return;
    setCreatingThread(true);
    setChatErr(null);

    try {
      const res = await fetch("/api/threads", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Failed to create thread");

      const newId = data.threadId as string | undefined;
      if (!newId) throw new Error("No threadId returned");
      router.push(`/threads/${newId}`);
    } catch (e: any) {
      setChatErr(e?.message ?? "Failed to create thread");
    } finally {
      setCreatingThread(false);
    }
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.close();
      streamRef.current = null;
    }
  }

  function startStream(runId: string) {
    stopStream();
    setRunErr(null);

    const es = new EventSource(`/api/runs/${runId}/stream`);
    streamRef.current = es;

    es.addEventListener("hello", () => {
      // optional
    });

    es.addEventListener("update", (evt) => {
      try {
        const payload = JSON.parse((evt as MessageEvent).data);
        if (payload?.run) setSelectedRun(payload.run);
        if (Array.isArray(payload?.delta) && payload.delta.length > 0) {
          setRunLogs((prev) => [...prev, ...payload.delta]);
        }
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener("done", async () => {
      stopStream();
      // Refresh messages in case agent wrote back at the end
      await loadMessages();
      await loadRuns();
    });

    es.addEventListener("error", async () => {
      // If stream fails (proxy, browser, etc), fall back to polling once
      stopStream();
      await loadRunDetails(runId);
    });
  }

  // Initial load
  useEffect(() => {
    loadMessages();
    loadRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // When selecting run, load details + start streaming
  useEffect(() => {
    if (!selectedRunId) {
      stopStream();
      setSelectedRun(null);
      setRunLogs([]);
      return;
    }
    // Get initial snapshot (run + full logs), then stream deltas
    (async () => {
      await loadRunDetails(selectedRunId);
      startStream(selectedRunId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRunId]);

  // Poll runs list occasionally (status updates)
  useEffect(() => {
    const t = setInterval(() => {
      loadRuns();
    }, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => stopStream();
  }, []);

  function statusBadge(s: RunStatus) {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
    if (s === "done") return `${base} border-green-600/30 text-green-700`;
    if (s === "failed") return `${base} border-red-600/30 text-red-700`;
    if (s === "running") return `${base} border-blue-600/30 text-blue-700`;
    return `${base} border-zinc-400/40 text-zinc-700`;
  }

  function agentLabel(a?: AgentPersona) {
    const v = a ?? "general";
    if (v === "planner") return "Planner";
    if (v === "coder") return "Coder";
    if (v === "reviewer") return "Reviewer";
    if (v === "researcher") return "Researcher";
    return "General";
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm text-zinc-500">Thread</div>
              <div className="font-semibold break-all">{threadId}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="text-sm border rounded-lg px-3 py-2 hover:bg-zinc-50 disabled:opacity-60"
                onClick={createNewThread}
                disabled={creatingThread}
                title="Create a brand new thread"
              >
                {creatingThread ? "Creating..." : "New Thread"}
              </button>

              <button
                className="text-sm border rounded-lg px-3 py-2 hover:bg-zinc-50"
                onClick={() => {
                  loadMessages();
                  loadRuns();
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {chatErr && (
            <div className="mb-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3">
              {chatErr}
            </div>
          )}

          <div className="h-[58vh] overflow-auto border rounded-lg p-3 bg-white">
            {messages.length === 0 ? (
              <div className="text-sm text-zinc-500">No messages yet.</div>
            ) : (
              <div className="space-y-3">
                {messages.map((m, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-20 shrink-0 text-xs uppercase tracking-wide text-zinc-500">
                      {m.role}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={sending}
            />
            <button
              className="border rounded-lg px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
              onClick={sendMessage}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Runs Panel */}
        <div className="border rounded-xl p-4">
          <div className="font-semibold mb-2">Runs (Background Agents)</div>
          <div className="text-xs text-zinc-500 mb-3">
            Create a run to process this thread in the background (queued → running → done).
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              className="border rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
              onClick={tickNow}
              disabled={ticking}
              title="Trigger background processing now"
            >
              {ticking ? "Running..." : "Run now"}
            </button>
            {tickInfo && <div className="text-xs text-zinc-600">{tickInfo}</div>}
          </div>

          {runErr && (
            <div className="mb-3 text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3">
              {runErr}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-600 w-16">Persona</label>
              <select
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white"
                value={runAgent}
                onChange={(e) => setRunAgent(e.target.value as AgentPersona)}
              >
                <option value="general">General</option>
                <option value="planner">Planner</option>
                <option value="coder">Coder</option>
                <option value="reviewer">Reviewer</option>
                <option value="researcher">Researcher</option>
              </select>
            </div>

            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[110px]"
              value={runPrompt}
              onChange={(e) => setRunPrompt(e.target.value)}
            />
            <button
              className="w-full border rounded-lg px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
              onClick={createThreadRun}
              disabled={creatingRun}
            >
              {creatingRun ? "Creating..." : `Create ${agentLabel(runAgent)} Run`}
            </button>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Recent Runs</div>
            <div className="border rounded-lg overflow-hidden">
              {runs.length === 0 ? (
                <div className="p-3 text-sm text-zinc-500">No runs yet.</div>
              ) : (
                <div className="divide-y">
                  {runs.map((r) => (
                    <button
                      key={r.id}
                      className={`w-full text-left p-3 hover:bg-zinc-50 ${
                        selectedRunId === r.id ? "bg-zinc-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedRunId(r.id);
                        setRunLogs([]); // logs will fill from snapshot + stream
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium break-all">{r.id}</div>
                        <span className={statusBadge(r.status)}>{r.status}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] rounded-full border px-2 py-0.5 text-zinc-700">
                          {agentLabel(r.agent)}
                        </span>
                        <div className="text-xs text-zinc-500 line-clamp-2">{r.prompt}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Run details */}
          {selectedRun && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Run Details</div>
              <div className="text-xs text-zinc-500 mb-2 break-all">
                {selectedRun.id} • {agentLabel(selectedRun.agent)} • {selectedRun.status}
                {selectedRun.error ? ` • ERROR: ${selectedRun.error}` : ""}
                {selectedRunIsActive ? " • streaming..." : ""}
              </div>

              <div className="h-56 overflow-auto border rounded-lg p-2 bg-white">
                {runLogs.length === 0 ? (
                  <div className="text-sm text-zinc-500">No logs yet.</div>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap">{runLogs.join("\n")}</pre>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  className="flex-1 border rounded-lg px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => loadRunDetails(selectedRun.id)}
                >
                  Refresh Snapshot
                </button>
                <button
                  className="flex-1 border rounded-lg px-3 py-2 text-sm hover:bg-zinc-50"
                  onClick={() => {
                    stopStream();
                    setSelectedRunId(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
