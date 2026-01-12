import { kv } from "@/app/lib/kv";
import { randomUUID } from "crypto";

export type SupportMessage = {
  id: string;
  author: "user" | "admin" | "system";
  body: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  userId: string;
  projectId?: string;
  email?: string;
  subject: string;
  status: "open" | "in_progress" | "waiting_on_customer" | "resolved";
  tags: string[];
  priority: "low" | "medium" | "high";
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
};

const INDEX_KEY = "support:tickets:index";

function ticketKey(id: string) {
  return `support:ticket:${id}`;
}

/* ---------------- CREATE ---------------- */

export async function createTicket(
  data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">
) {
  const id = `ticket_${randomUUID()}`;
  const now = new Date().toISOString();

  const ticket: SupportTicket = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(ticketKey(id), ticket);
  await kv.sadd(INDEX_KEY, id);

  return ticket;
}

/* ---------------- READ ---------------- */

export async function getTicket(id: string): Promise<SupportTicket | null> {
  return (await kv.get(ticketKey(id))) as SupportTicket | null;
}

export async function listTickets(): Promise<SupportTicket[]> {
  const ids = (await kv.smembers(INDEX_KEY)) as string[];
  const tickets: SupportTicket[] = [];

  for (const id of ids) {
    const ticket = await getTicket(id);
    if (ticket) tickets.push(ticket);
  }

  return tickets.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

/* ---------------- UPDATE ---------------- */

export async function addMessage(
  ticketId: string,
  message: SupportMessage,
  newStatus?: SupportTicket["status"]
) {
  const ticket = await getTicket(ticketId);
  if (!ticket) throw new Error("Ticket not found");

  ticket.messages.push(message);
  ticket.updatedAt = new Date().toISOString();

  if (newStatus) ticket.status = newStatus;

  await kv.set(ticketKey(ticketId), ticket);
}
