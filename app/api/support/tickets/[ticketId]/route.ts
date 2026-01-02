import { NextResponse } from "next/server";
import { z } from "zod";
import { addMessage, getTicket, setStatus, setTriage } from "@/app/lib/supportKV";

const AddMessageSchema = z.object({
  from: z.enum(["customer", "admin"]),
  text: z.string().min(1),
});

const StatusSchema = z.object({
  status: z.enum(["open", "pending", "resolved", "closed"]),
});

const TriageSchema = z.object({
  category: z.enum([
    "domains_ssl",
    "billing",
    "account_access",
    "build_deploy",
    "bug",
    "feature_request",
    "how_to",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  tags: z.array(z.string()).max(12),
  summary: z.string().min(1).max(500),
  suggestedStatus: z.enum(["open", "pending", "resolved", "closed"]).optional(),
  suggestedNextSteps: z.array(z.string()).max(10).optional(),
});

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

function triageInstructions() {
  return `
You are an expert support triage assistant for an AI website builder SaaS (Next.js/Vercel/KV).
Your task: produce a STRICT JSON object that matches the given schema. No prose.

Rules:
- tags must be short lowercase keywords, no spaces if possible (use hyphen), e.g. "dns", "cloudflare", "ssl", "cname", "a-record", "vercel", "404", "billing", "login".
- category must be the best match from the allowed list.
- priority:
  * urgent = site down for many users / security concern / billing lockout
  * high = production broken for one customer / domain/ssl blocking launch
  * medium = important but not blocking
  * low = general questions
- suggestedStatus:
  * resolved only if the customer confirms it's fixed or the request is obviously complete
  * pending if admin already replied and waiting on customer
  * open otherwise
- suggestedNextSteps: short action steps (max 10). If unknown, omit it.

Output ONLY JSON.
`.trim();
}

async function triageTicketBestEffort(ticket: any) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-5.2";

  const context = `
TICKET:
- id: ${ticket.id}
- currentStatus: ${ticket.status}
- projectId: ${ticket.projectId || "(none)"}
- email: ${ticket.email || "(none)"}
- subject: ${ticket.subject}

CONVERSATION (latest last):
${safeJoinMessages(ticket)}

Now produce triage JSON.
`.trim();

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: triageInstructions(),
      input: context,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) return null;

  const text = (data?.output_text as string) || data?.output?.[0]?.content?.[0]?.text || "";
  const raw = (text || "").toString().trim();
  if (!raw) return null;

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    json = JSON.parse(cleaned);
  }

  const parsed = TriageSchema.safeParse(json);
  if (!parsed.success) return null;

  return {
    triagedAt: new Date().toISOString(),
    category: parsed.data.category,
    priority: parsed.data.priority,
    tags: (parsed.data.tags || []).map((t) => t.toLowerCase()).slice(0, 12),
    summary: parsed.data.summary,
    suggestedStatus: parsed.data.suggestedStatus,
    suggestedNextSteps: parsed.data.suggestedNextSteps,
  };
}

export async function GET(_: Request, { params }: { params: { ticketId: string } }) {
  try {
    const t = await getTicket(params.ticketId);
    if (!t) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, ticket: t });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { ticketId: string } }) {
  try {
    const body = await req.json();
    const parsed = AddMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // 1) Add the message (this already applies auto-status rules in supportKV)
    const updated = await addMessage(params.ticketId, parsed.data.from, parsed.data.text);

    // 2) AUTO-TRIAGE if CUSTOMER replied (best-effort)
    if (parsed.data.from === "customer") {
      try {
        const triage = await triageTicketBestEffort(updated);
        if (triage) {
          const withTriage = await setTriage(updated.id, triage as any);
          return NextResponse.json({ ok: true, ticket: withTriage });
        }
      } catch {
        // ignore triage failure; still return ticket
      }
    }

    return NextResponse.json({ ok: true, ticket: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { ticketId: string } }) {
  try {
    const body = await req.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const t = await setStatus(params.ticketId, parsed.data.status);
    return NextResponse.json({ ok: true, ticket: t });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
