"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function SupportPage() {
  const [projectId, setProjectId] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Help with my website");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("projectId");
    if (pid) setProjectId(pid);
  }, []);

  const payload = useMemo(
    () => ({ projectId: projectId.trim() || undefined, email: email.trim() || undefined, subject, message }),
    [projectId, email, subject, message]
  );

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to create ticket");
      setCreatedId(data.ticket.id);
      setMessage("");
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us what you need help with. We’ll respond with step-by-step instructions.
          </p>
        </div>
        <Link href="/" className="rounded-md border px-4 py-2 hover:bg-muted transition">
          Home
        </Link>
      </div>

      {createdId ? (
        <div className="rounded-lg border p-4">
          <div className="font-semibold">Ticket created ✅</div>
          <div className="text-sm text-muted-foreground mt-1">
            Your ticket ID is <span className="font-mono">{createdId}</span>
          </div>
          <div className="mt-3">
            <Link
              href={`/admin/support/${createdId}`}
              className="inline-block rounded-md border px-4 py-2 hover:bg-muted transition"
            >
              (Admin) Open Ticket
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: the link above is for you as the platform owner/admin.
          </p>
        </div>
      ) : null}

      {err ? (
        <div className="rounded-lg border p-4 text-sm">
          <div className="font-semibold">Error</div>
          <div className="text-muted-foreground mt-1">{err}</div>
        </div>
      ) : null}

      <section className="rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <div className="text-sm font-semibold">Project ID (optional)</div>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
              placeholder="proj_..."
            />
          </label>

          <label className="space-y-1">
            <div className="text-sm font-semibold">Email (optional)</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2 w-full"
              placeholder="you@example.com"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <div className="text-sm font-semibold">Subject</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
        </label>

        <label className="space-y-1 block">
          <div className="text-sm font-semibold">Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border rounded-md px-3 py-2 w-full min-h-[140px]"
            placeholder="Describe the issue (domain, DNS, errors, what you expected, what happened)..."
          />
        </label>

        <button
          onClick={submit}
          disabled={busy || !subject.trim() || !message.trim()}
          className="rounded-md border px-4 py-2 hover:bg-muted transition"
        >
          {busy ? "Submitting..." : "Submit Ticket"}
        </button>
      </section>
    </main>
  );
}
