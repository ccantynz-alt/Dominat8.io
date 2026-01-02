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
    suggestedStatus?: "open" | "pending" | "resolved" | "closed";
    suggestedNextSteps?: string[];
  };
};

const CHECKLIST_DNS_SSL = `Here’s a quick DNS/SSL checklist (no technical jargon, just the key steps):

1) Confirm the exact domain name you added (copy/paste it here).
2) Is it an apex domain (example.com) or a subdomain (www.example.com)?
3) Please share your DNS provider (Cloudflare, GoDaddy, Namecheap, etc).
4) In your DNS settings, confirm the records match what we asked you to set.
5) DNS changes can take time to propagate (often minutes, sometimes up to 24 hours).
6) Please send a screenshot of your DNS records page (blur anything sensitive).

Once I have those, I’ll tell you exactly what to change (if anything).`;

const CHECKLIST_BUILD_DEPLOY = `Let’s narrow down the build/deploy issue:

1) What URL are you trying to open?
2) What exact error do you see (copy/paste the full error message)?
3) If it’s a build error: paste the build log section where it fails.
4) If it’s a 404: confirm which route you visited and your projectId.
5) Tell me what you expected to happen vs what happened.

Reply with those details and I’ll guide you step-by-step.`;

const CHECKLIST_LOGIN_ACCESS = `Let’s fix access/login quickly:

1) Are you trying to log in as an admin or as a regular user?
2) What exact message do you see (copy/paste)?
3) If it’s email-based login: confirm the email you’re using (no passwords needed).
4) Have you tried a private/incognito window?
5) Is this happening on one device or all devices?

Reply with those answers and we’ll get you in.`;

export default function AdminTicketPage({ params }: { params: { ticketId: string } }) {
  const ticketId = params.ticketId;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<Ticket["status"]>("open");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [adminNotes, setAdminNotes] = useState("");

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

  async function draftWithAI() {
    setErr(null);
    setBusy("draft");
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/draft-reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to draft reply");
      setReply(data.draft || "");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function autoTriage() {
    setErr(null);
    setBusy("triage");
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/triage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to triage");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function applySuggestedStatus() {
    if (!ticket?.triage?.suggestedStatus) return;
    await updateStatus(ticket.triage.suggestedStatus);
  }

  function appendToReply(text: string) {
    setReply((prev) => {
      const p = (prev || "").trim();
      if (!p) return text;
      return `${p}\n\n${text}`;
    });
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

        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/support" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Back to Inbox
          </Link>
          <button
            onClick={load}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
            disabled={busy !== null}
          >
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
            <h2 className="text-xl font-semibold">Auto-triage</h2>

            {ticket.triage ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Triaged: {new Date(ticket.triage.triagedAt).toLocaleString()}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs rounded-full border px-2 py-1">{ticket.triage.priority}</span>
                  <span className="text-xs rounded-full border px-2 py-1">{ticket.triage.category}</span>
                  {(ticket.triage.tags || []).map((tag) => (
                    <span key={tag} className="text-xs rounded-full border px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Summary:</span> {ticket.triage.summary}
                </div>

                {ticket.triage.suggestedNextSteps?.length ? (
                  <div className="text-sm">
                    <div className="font-semibold">Suggested next steps</div>
                    <ul className="list-disc pl-5 text-muted-foreground mt-1 space-y-1">
                      {ticket.triage.suggestedNextSteps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {ticket.triage.suggestedStatus ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                      Suggested status: <span className="font-semibold">{ticket.triage.suggestedStatus}</span>
                    </div>
                    <button
                      onClick={applySuggestedStatus}
                      disabled={busy !== null}
                      className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
                    >
                      Apply suggested status
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No triage yet. Click Auto-triage.
              </div>
            )}

            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="border rounded-md px-3 py-2 w-full min-h-[90px]"
              placeholder="Admin notes (optional)…"
              disabled={busy !== null}
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={autoTriage}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {busy === "triage" ? "Triaging..." : "Auto-triage"}
              </button>

              <button
                onClick={draftWithAI}
                disabled={busy !== null}
                className="rounded-md border px-4 py-2 hover:bg-muted transition"
              >
                {busy === "draft" ? "Drafting..." : "Draft reply with AI"}
              </button>
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
            <h2 className="text-xl font-semibold">Canned checklists (1-click)</h2>
            <p className="text-sm text-muted-foreground">
              Click a button to insert a proven checklist into your reply (you can edit it after).
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => appendToReply(CHECKLIST_DNS_SSL)}
                disabled={busy !== null}
                className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
              >
                Insert DNS/SSL checklist
              </button>
              <button
                onClick={() => appendToReply(CHECKLIST_BUILD_DEPLOY)}
                disabled={busy !== null}
                className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
              >
                Insert Build/Deploy checklist
              </button>
              <button
                onClick={() => appendToReply(CHECKLIST_LOGIN_ACCESS)}
                disabled={busy !== null}
                className="rounded-md border px-3 py-2 hover:bg-muted transition text-sm"
              >
                Insert Login/Access checklist
              </button>
            </div>
          </section>

          <section className="rounded-lg border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Reply</h2>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="border rounded-md px-3 py-2 w-full min-h-[160px]"
              placeholder="Write a helpful step-by-step reply (or use AI draft / checklists)..."
              disabled={busy !== null}
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

            <div className="text-xs text-muted-foreground">
              Auto-status rules:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Admin reply sets status to <span className="font-semibold">pending</span>.</li>
                <li>Customer reply sets status back to <span className="font-semibold">open</span> and auto-triages.</li>
              </ul>
            </div>
          </section>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">Loading ticket…</div>
      )}
    </main>
  );
}
