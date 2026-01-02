"use client";

import { useState } from "react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        userId: "demo-user",
      }),
    });
    setSent(true);
  }

  if (sent) return <p>✅ Ticket submitted. Support will reply here.</p>;

  return (
    <div>
      <h1>Support</h1>
      <input
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        placeholder="Describe your issue"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={submit}>Create Ticket</button>
    </div>
  );
}
