/**
 * Support Ticket System — Persistent Ticket Tracking
 *
 * Stores and manages customer support tickets in KV.
 * Each ticket has: classification, priority, AI draft response,
 * status tracking, and escalation history.
 */

import { kv } from "@vercel/kv";
import type { SupportCategory, SupportPriority } from "./support-kb";

// ── Ticket types ─────────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  /** Clerk userId if sender is a known user, null for unknown */
  userId: string | null;
  senderEmail: string;
  senderName: string | null;
  subject: string;
  body: string;
  /** AI-classified category */
  category: SupportCategory;
  /** AI-assigned priority */
  priority: SupportPriority;
  /** AI-drafted response */
  draftResponse: string;
  /** Confidence score 0-1 for the draft */
  draftConfidence: number;
  /** Whether draft was sent automatically (high confidence) */
  autoSent: boolean;
  /** Whether a human has reviewed the ticket */
  humanReviewed: boolean;
  /** Current status */
  status: "open" | "awaiting-review" | "replied" | "escalated" | "closed";
  /** Tags for filtering */
  tags: string[];
  /** Escalation notes (if escalated) */
  escalationNote: string | null;
  createdAt: string;
  updatedAt: string;
  repliedAt: string | null;
  closedAt: string | null;
}

// ── KV key helpers ───────────────────────────────────────────────────────────

function ticketKey(id: string): string {
  return `support:ticket:${id}`;
}
function ticketListKey(): string {
  return "support:ticket-ids";
}
function ticketsByStatusKey(status: string): string {
  return `support:tickets-by-status:${status}`;
}
function ticketsByUserKey(userId: string): string {
  return `support:tickets-by-user:${userId}`;
}

// ── Generate ticket ID ───────────────────────────────────────────────────────

export function generateTicketId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `TKT-${ts}-${rand}`.toUpperCase();
}

// ── CRUD operations ──────────────────────────────────────────────────────────

export async function createTicket(
  ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "repliedAt" | "closedAt">,
): Promise<SupportTicket> {
  const id = generateTicketId();
  const now = new Date().toISOString();

  const full: SupportTicket = {
    ...ticket,
    id,
    createdAt: now,
    updatedAt: now,
    repliedAt: null,
    closedAt: null,
  };

  // Store the ticket
  await kv.set(ticketKey(id), full);

  // Add to indices
  await kv.lpush(ticketListKey(), id);
  await kv.lpush(ticketsByStatusKey(full.status), id);
  if (full.userId) {
    await kv.lpush(ticketsByUserKey(full.userId), id);
  }

  return full;
}

export async function getTicket(id: string): Promise<SupportTicket | null> {
  return kv.get<SupportTicket>(ticketKey(id));
}

export async function updateTicket(
  id: string,
  updates: Partial<Pick<SupportTicket, "status" | "humanReviewed" | "autoSent" | "draftResponse" | "escalationNote" | "tags" | "repliedAt" | "closedAt">>,
): Promise<SupportTicket | null> {
  const ticket = await getTicket(id);
  if (!ticket) return null;

  const oldStatus = ticket.status;
  const updated: SupportTicket = {
    ...ticket,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(ticketKey(id), updated);

  // Update status index if changed
  if (updates.status && updates.status !== oldStatus) {
    await kv.lrem(ticketsByStatusKey(oldStatus), 1, id);
    await kv.lpush(ticketsByStatusKey(updates.status), id);
  }

  return updated;
}

// ── List tickets ─────────────────────────────────────────────────────────────

export async function listTickets(options: {
  status?: SupportTicket["status"];
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ tickets: SupportTicket[]; total: number }> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  let ids: string[];

  if (options.userId) {
    ids = (await kv.lrange<string>(ticketsByUserKey(options.userId), 0, -1)) ?? [];
  } else if (options.status) {
    ids = (await kv.lrange<string>(ticketsByStatusKey(options.status), 0, -1)) ?? [];
  } else {
    ids = (await kv.lrange<string>(ticketListKey(), 0, -1)) ?? [];
  }

  const total = ids.length;
  const pageIds = ids.slice(offset, offset + limit);

  // Fetch tickets in parallel
  const tickets = (
    await Promise.all(pageIds.map((id) => getTicket(id)))
  ).filter((t): t is SupportTicket => t !== null);

  // Sort by newest first
  tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { tickets, total };
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface SupportStats {
  total: number;
  open: number;
  awaitingReview: number;
  replied: number;
  escalated: number;
  closed: number;
  autoSentCount: number;
  avgConfidence: number;
}

export async function getSupportStats(): Promise<SupportStats> {
  const all = (await kv.lrange<string>(ticketListKey(), 0, -1)) ?? [];
  const tickets = (
    await Promise.all(all.slice(0, 200).map((id) => getTicket(id)))
  ).filter((t): t is SupportTicket => t !== null);

  const stats: SupportStats = {
    total: tickets.length,
    open: 0,
    awaitingReview: 0,
    replied: 0,
    escalated: 0,
    closed: 0,
    autoSentCount: 0,
    avgConfidence: 0,
  };

  let confidenceSum = 0;
  for (const t of tickets) {
    if (t.status === "open") stats.open++;
    else if (t.status === "awaiting-review") stats.awaitingReview++;
    else if (t.status === "replied") stats.replied++;
    else if (t.status === "escalated") stats.escalated++;
    else if (t.status === "closed") stats.closed++;
    if (t.autoSent) stats.autoSentCount++;
    confidenceSum += t.draftConfidence;
  }

  stats.avgConfidence = tickets.length > 0 ? confidenceSum / tickets.length : 0;

  return stats;
}
