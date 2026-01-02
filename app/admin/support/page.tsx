"use client";

import { useEffect, useState } from "react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/support/tickets")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []));
  }, []);

  return (
    <div>
      <h1>Support Tickets</h1>
      {tickets.map((t) => (
        <a key={t.id} href={`/admin/support/${t.id}`}>
          <div>
            <strong>{t.subject}</strong>
            <div>Status: {t.status}</div>
            <div>Tags: {t.tags.join(", ")}</div>
            <div>Priority: {t.priority}</div>
          </div>
        </a>
      ))}
    </div>
  );
}
