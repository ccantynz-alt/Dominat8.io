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

const indexKey = "support:tickets";

function ticketKey(id: string) {
  return `support:ticket:${id}`;
}

export async function createTicket(data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">) {
  const id = `ticket_${randomUUID()}`;
  const now = new Date().toISOString();

  const ticket: SupportTicket = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kv.hset(ticketKey(id), ticket as any);
  await kv.sadd(indexKey, id);

  return ticket;
}

export async function getTicket(id: string): Promise<SupportTicket | null> {
  const ticket = await kv.hgetall<SupportTicket>(ticketKey(id));
  return ticket && ticket.id ? ticket : null;
}

export async function listTickets(): Promise<SupportTicket[]> {
  const ids = await kv.smembers(indexKey);
  const tickets: SupportTicket[] = [];

  for (const id of ids) {
    const t = await getTicket(id);
    if (t) tickets.push(t);
  }

  return tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

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

  await kv.hset(ticketKey(ticketId), ticket as any);
}
