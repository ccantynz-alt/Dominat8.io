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

export default function AdminSupportInboxPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
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

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Support Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and respond to customer tickets.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin" className="rounded-md border px-4 py-2 hover:bg-muted transition">
            Admin Home
          </Link>
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-md border px-4 py-2 hover:bg-muted transition"
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

      <section className="rounded-lg border p-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-sm text-muted-foreground">No tickets yet.</div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const last = t.messages?.[t.messages.length - 1];
              return (
                <Link
                  key={t.id}
                  href={`/admin/support/${t.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted transition"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="font-semibold">{t.subject}</div>
                    <span className="text-xs rounded-full border px-2 py-1">{t.status}</span>
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
                  {last ? (
                    <div className="text-sm mt-2 text-muted-foreground">
                      <span className="font-semibold">{last.from}:</span> {last.text.slice(0, 140)}
                      {last.text.length > 140 ? "…" : ""}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
