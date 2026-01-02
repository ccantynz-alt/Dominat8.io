import { NextResponse } from "next/server";
import { z } from "zod";
import { getTicket } from "@/app/lib/supportKV";

const BodySchema = z.object({
  adminNotes: z.string().optional(),
});

function buildInstructions() {
  return `
You are an elite customer support agent for an AI website builder SaaS (Next.js/Vercel/KV).
Your job: draft a helpful, calm, step-by-step reply that a novice customer can follow.

Hard rules:
- NEVER ask for passwords, API keys, secret tokens, or private keys.
- If you need diagnostics, ask for safe info only (domain name, DNS provider, screenshots, error messages).
- Keep it structured with numbered steps and short paragraphs.
- If uncertain, ask 1–3 clarifying questions at the end.
- If the user reports domain/DNS/SSL issues, include a DNS checklist:
  * confirm domain spelling
  * confirm whether apex (example.com) vs subdomain (www.example.com)
  * confirm DNS records set
  * mention propagation time
  * ask for screenshot of DNS records
- End with: "Reply here with the answers and I’ll guide you step-by-step."

Tone:
- Friendly, concise, confident, non-technical unless needed.
`.trim();
}

function safeJoinMessages(ticket: any) {
  const msgs = Array.isArray(ticket?.messages) ? ticket.messages : [];
  return msgs
    .map((m: any) => {
      const from = m?.from === "admin" ? "ADMIN" : "CUSTOMER";
      const at = m?.at ? ` (${m.at})` : "";
      const text = (m?.text || "").toString();
      return `${from}${at}: ${text}`;
    })
    .join("\n\n");
}

export async function POST(req: Request, { params }: { params: { ticketId: string } }) {
  try {
    const ticketId = params.ticketId;

    const ticket = await getTicket(ticketId);
    if (!ticket) {
      return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing OPENAI_API_KEY env var" },
        { status: 500 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-5";

    const context = `
TICKET:
- id: ${ticket.id}
- status: ${ticket.status}
- projectId: ${ticket.projectId || "(none provided)"}
- email: ${ticket.email || "(none provided)"}
- subject: ${ticket.subject}

CONVERSATION (latest last):
${safeJoinMessages(ticket)}

ADMIN NOTES (optional):
${parsed.data.adminNotes?.trim() || "(none)"}

Task:
Draft the next best admin reply to send to the customer.
`.trim();

    // OpenAI Responses API (server-side)
    // https://api.openai.com/v1/responses
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: buildInstructions(),
        input: context,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        (data && (data.error?.message || data.message)) ||
        `OpenAI error (HTTP ${res.status})`;
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }

    // Responses API provides output_text convenience in many SDKs;
    // in raw JSON, safest extraction is:
    const draft =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.output?.[0]?.content?.[0]?.content ||
      "";

    const finalDraft = (draft || "").toString().trim();

    if (!finalDraft) {
      return NextResponse.json(
        { ok: false, error: "Draft generation returned empty text" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, draft: finalDraft });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to draft reply" },
      { status: 500 }
    );
  }
}
