"use client";

import { useEffect, useState } from "react";

export default function TicketPage({ params }: { params: { ticketId: string } }) {
  const [ticket, setTicket] = useState<any>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetch(`/api/support/tickets/${params.ticketId}`)
      .then((r) => r.json())
      .then((d) => setTicket(d.ticket));
  }, []);

  async function send() {
    await fetch(`/api/support/tickets/${params.ticketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author: "admin",
        message: reply,
      }),
    });
    location.reload();
  }

  if (!ticket) return null;

  return (
    <div>
      <h1>{ticket.subject}</h1>
      {ticket.messages.map((m: any) => (
        <div key={m.id}>
          <strong>{m.author}</strong>: {m.body}
        </div>
      ))}
      <textarea
        placeholder="Reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <button onClick={send}>Reply</button>
    </div>
  );
}
