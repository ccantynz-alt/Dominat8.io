"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "open" | "pending" | "resolved" | "closed";
  projectId?: string;
  email?: string;
  subject: string;
  messages: Array<{ id: string; at: string; from: "customer" | "admin"; text: string }>;
  triage?: {
    triagedAt: string;
    category: string;
    priority: string;
    tags: string[];
    summary: string;
    suggestedStatus?: string;
    suggestedNextSteps?: string[];
  };
};

export default function AdminSupportInboxPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets", { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load tickets");
      setTickets(data.tickets || []);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function autoTriage(ticketId: string) {
    setErr(null);
    setInfo(null);
    setBusy(ticketId);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/triage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to triage");
      await refresh();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function triageAll() {
    setErr(null);
    setInfo(null);
    setBusy("triage-all");
    try {
      const res = await fetch("/api/support/tickets/triage-all", {
        method: "POST",
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to triage all");
      setInfo(`Triaged ${data.triaged} ticket(s). Skipped ${data.skipped}. Total ${data.total}.`);
      await refresh();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  function priorityBadge(priority?: string) {
    if (!priority) return null;
    const isUrgent = priority === "urgent";
    const isHigh = priority === "high";
    const cls = isUrgent
      ? "border-red-500 text-red-600"
      : isHigh
      ? "border-orange-500 text-orange-600"
      : "border";

    return <span className={`text-xs rounded-full px-2 py-1 border ${cls}`}>{priority}</span>;
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Support Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Auto-triage suggests category, priority, tags, and summary.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href="/admin" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Admin Home
          </Link>

          <button
            onClick={refresh}
            disabled={loading || busy !== null}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            Refresh
          </button>

          <button
            onClick={triageAll}
            disabled={loading || busy !== null}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
          >
            {busy === "triage-all" ? "Triaging ALL..." : "Triage ALL (missing only)"}
          </button>
        </div>
      </div>

      {info ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Info</div>
          <div className="text-muted-foreground mt-1">{info}</div>
        </div>
      ) : null}

      {err ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Error</div>
          <div className="text-muted-foreground mt-1">{err}</div>
        </div>
      ) : null}

      <section className="rounded-lg border p-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tickets yet.</div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const last = t.messages?.[t.messages.length - 1];
              const tags = t.triage?.tags || [];
              const priority = t.triage?.priority;
              const isUrgent = priority === "urgent";
              const isHigh = priority === "high";

              const cardBorder = isUrgent
                ? "border-red-500"
                : isHigh
                ? "border-orange-500"
                : "border";

              return (
                <div key={t.id} className={`rounded-lg ${cardBorder} p-4 border`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link href={`/admin/support/${t.id}`} className="font-semibold hover:underline">
                      {t.subject}
                    </Link>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs rounded-full border px-2 py-1">{t.status}</span>
                      {priorityBadge(priority)}
                      {t.triage?.category ? (
                        <span className="text-xs rounded-full border px-2 py-1">
                          {t.triage.category}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    Ticket: <span className="font-mono">{t.id}</span>
                    {t.projectId ? (
                      <>
                        {" "}• Project: <span className="font-mono">{t.projectId}</span>
                      </>
                    ) : null}
                    {t.email ? <> • {t.email}</> : null}
                  </div>

                  {tags.length ? (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {tags.map((tag) => (
                        <span key={tag} className="text-xs rounded-full border px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-muted-foreground">No triage yet.</div>
                  )}

                  {t.triage?.summary ? (
                    <div className="text-sm mt-2 text-muted-foreground">
                      <span className="font-semibold">Summary:</span> {t.triage.summary}
                    </div>
                  ) : last ? (
                    <div className="text-sm mt-2 text-muted-foreground">
                      <span className="font-semibold">{last.from}:</span> {last.text.slice(0, 140)}
                      {last.text.length > 140 ? "…" : ""}
                    </div>
                  ) : null}

                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Link
                      href={`/admin/support/${t.id}`}
                      className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
                    >
                      Open
                    </Link>

                    <button
                      onClick={() => autoTriage(t.id)}
                      disabled={busy !== null}
                      className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
                    >
                      {busy === t.id ? "Triaging..." : "Auto-triage"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
