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
};

export default function AdminTicketPage({ params }: { params: { ticketId: string } }) {
  const ticketId = params.ticketId;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<Ticket["status"]>("open");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to load ticket");
      setTicket(data.ticket);
      setStatus(data.ticket.status);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    }
  }

  async function sendReply() {
    setErr(null);
    setBusy("reply");
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: "admin", text: reply }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to reply");
      setReply("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function updateStatus(next: Ticket["status"]) {
    setErr(null);
    setBusy("status");
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to update status");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Ticket</h1>
          <div className="text-sm text-muted-foreground mt-1">
            ID: <span className="font-mono">{ticketId}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/support" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Back to Inbox
          </Link>
          <button onClick={load} className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Refresh
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Error</div>
          <div className="text-muted-foreground mt-1">{err}</div>
        </div>
      ) : null}

      {ticket ? (
        <>
          <section className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="font-semibold">{ticket.subject}</div>
              <span className="text-xs rounded-full border px-2 py-1">{ticket.status}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Created: {new Date(ticket.createdAt).toLocaleString()} • Updated:{" "}
              {new Date(ticket.updatedAt).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {ticket.projectId ? (
                <>
                  Project: <span className="font-mono">{ticket.projectId}</span> •{" "}
                </>
              ) : null}
              {ticket.email ? <>Email: {ticket.email}</> : <>Email: (not provided)</>}
            </div>
          </section>

          <section className="rounded-lg border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Conversation</h2>
            <div className="space-y-3">
              {ticket.messages.map((m) => (
                <div key={m.id} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">{m.from}</span> •{" "}
                    {new Date(m.at).toLocaleString()}
                  </div>
                  <div className="text-sm mt-2 whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Reply</h2>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="border rounded-md px-3 py-2 w-full min-h-[120px]"
              placeholder="Write a helpful step-by-step reply..."
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={sendReply}
                disabled={!reply.trim() || busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {busy === "reply" ? "Sending..." : "Send Reply"}
              </button>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Ticket["status"])}
                className="border rounded-md px-3 py-2"
                disabled={busy !== null}
              >
                <option value="open">open</option>
                <option value="pending">pending</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>

              <button
                onClick={() => updateStatus(status)}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {busy === "status" ? "Updating..." : "Update Status"}
              </button>
            </div>
          </section>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">Loading ticket…</div>
      )}
    </main>
  );
}
