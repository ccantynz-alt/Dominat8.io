import { kvJsonGet, kvJsonSet, kvNowISO } from "@/app/lib/kv";
import { randomUUID } from "crypto";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
  | "domains_ssl"
  | "billing"
  | "account_access"
  | "build_deploy"
  | "bug"
  | "feature_request"
  | "how_to"
  | "other";

export type SupportMessage = {
  id: string;
  at: string;
  from: "customer" | "admin";
  text: string;
};

export type TicketTriage = {
  triagedAt: string;
  category: TicketCategory;
  priority: TicketPriority;
  tags: string[]; // suggested tags like ["dns", "cloudflare", "cname", "ssl"]
  summary: string; // 1–2 sentences
  suggestedStatus?: TicketStatus; // optional: open/pending/resolved/closed
  suggestedNextSteps?: string[]; // bullet steps
};

export type SupportTicket = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  projectId?: string;
  email?: string;
  subject: string;
  messages: SupportMessage[];

  // NEW:
  triage?: TicketTriage;
};

function ticketKey(ticketId: string) {
  return `support:ticket:${ticketId}`;
}

function indexKey() {
  return `support:tickets:index`;
}

export async function listTicketIds(): Promise<string[]> {
  const ids = await kvJsonGet<string[]>(indexKey());
  return Array.isArray(ids) ? ids : [];
}

export async function getTicket(ticketId: string): Promise<SupportTicket | null> {
  const t = await kvJsonGet<SupportTicket>(ticketKey(ticketId));
  return t && typeof t === "object" ? t : null;
}

export async function listTickets(): Promise<SupportTicket[]> {
  const ids = await listTicketIds();
  const tickets: SupportTicket[] = [];
  for (const id of ids) {
    const t = await getTicket(id);
    if (t) tickets.push(t);
  }
  // newest first
  tickets.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return tickets;
}

export async function createTicket(input: {
  projectId?: string;
  email?: string;
  subject: string;
  message: string;
}) {
  const now = kvNowISO();
  const id = `tkt_${randomUUID().replace(/-/g, "")}`;

  const ticket: SupportTicket = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "open",
    projectId: input.projectId?.trim() || undefined,
    email: input.email?.trim() || undefined,
    subject: input.subject.trim() || "Support request",
    messages: [
      {
        id: `msg_${randomUUID().replace(/-/g, "")}`,
        at: now,
        from: "customer",
        text: input.message.trim(),
      },
    ],
  };

  const ids = await listTicketIds();
  await kvJsonSet(indexKey(), [id, ...ids]);
  await kvJsonSet(ticketKey(id), ticket);
  return ticket;
}

export async function addMessage(ticketId: string, from: "customer" | "admin", text: string) {
  const t = await getTicket(ticketId);
  if (!t) throw new Error("Ticket not found");

  const now = kvNowISO();
  const next: SupportTicket = {
    ...t,
    updatedAt: now,
    messages: [
      ...t.messages,
      { id: `msg_${randomUUID().replace(/-/g, "")}`, at: now, from, text: text.trim() },
    ],
  };

  // AUTO-STATUS CHANGES:
  // - Admin reply means we're waiting on customer (pending), unless already resolved/closed.
  if (from === "admin" && next.status === "open") next.status = "pending";

  // - Customer reply re-opens the ticket (open) if it was pending or resolved.
  if (from === "customer" && (next.status === "pending" || next.status === "resolved"))
    next.status = "open";

  await kvJsonSet(ticketKey(ticketId), next);
  return next;
}

export async function setStatus(ticketId: string, status: TicketStatus) {
  const t = await getTicket(ticketId);
  if (!t) throw new Error("Ticket not found");
  const now = kvNowISO();
  const next: SupportTicket = { ...t, status, updatedAt: now };
  await kvJsonSet(ticketKey(ticketId), next);
  return next;
}

export async function setTriage(ticketId: string, triage: TicketTriage) {
  const t = await getTicket(ticketId);
  if (!t) throw new Error("Ticket not found");
  const now = kvNowISO();
  const next: SupportTicket = { ...t, triage, updatedAt: now };
  await kvJsonSet(ticketKey(ticketId), next);
  return next;
}
