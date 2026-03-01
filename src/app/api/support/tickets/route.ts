import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/agent-credits";
import {
  listTickets,
  getTicket,
  updateTicket,
  getSupportStats,
} from "@/lib/support-tickets";

export const runtime = "nodejs";

/**
 * Support Dashboard API — Admin-Only Ticket Management
 *
 * GET    — List tickets (with filters) or get stats
 * PATCH  — Update ticket (approve draft, escalate, close)
 *
 * Only admin users can access this endpoint.
 */

// GET — list tickets or get a single ticket
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;

  // ?stats=true — return dashboard stats
  if (params.get("stats") === "true") {
    const stats = await getSupportStats();
    return Response.json({ ok: true, stats });
  }

  // ?id=TKT-xxx — get a single ticket
  const ticketId = params.get("id");
  if (ticketId) {
    const ticket = await getTicket(ticketId);
    if (!ticket) {
      return Response.json({ error: "Ticket not found" }, { status: 404 });
    }
    return Response.json({ ok: true, ticket });
  }

  // List tickets with optional filters
  const status = params.get("status") as "open" | "awaiting-review" | "replied" | "escalated" | "closed" | undefined;
  const filterUserId = params.get("userId") ?? undefined;
  const limit = parseInt(params.get("limit") ?? "20", 10);
  const offset = parseInt(params.get("offset") ?? "0", 10);

  const result = await listTickets({
    status: status || undefined,
    userId: filterUserId,
    limit,
    offset,
  });

  return Response.json({
    ok: true,
    ...result,
    limit,
    offset,
  });
}

// PATCH — update a ticket (approve, escalate, close, edit draft)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { ticketId, action, ...data } = await req.json();

  if (!ticketId) {
    return Response.json({ error: "ticketId required" }, { status: 400 });
  }

  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return Response.json({ error: "Ticket not found" }, { status: 404 });
  }

  switch (action) {
    case "approve": {
      // Approve and send the AI draft
      const now = new Date().toISOString();

      // Send the reply
      const { Resend } = await import("resend");
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const resend = new Resend(apiKey);
        const subject = ticket.subject.startsWith("Re:")
          ? ticket.subject
          : `Re: ${ticket.subject}`;

        try {
          await resend.emails.send({
            from: "Dominat8.io Support <support@dominat8.io>",
            to: ticket.senderEmail,
            subject,
            text: data.editedResponse ?? ticket.draftResponse,
          });
        } catch {
          return Response.json({ error: "Failed to send email" }, { status: 500 });
        }
      }

      const updated = await updateTicket(ticketId, {
        status: "replied",
        humanReviewed: true,
        draftResponse: data.editedResponse ?? ticket.draftResponse,
        repliedAt: now,
      });

      return Response.json({ ok: true, ticket: updated, sent: true });
    }

    case "escalate": {
      const updated = await updateTicket(ticketId, {
        status: "escalated",
        humanReviewed: true,
        escalationNote: data.note ?? "Escalated by admin",
      });

      return Response.json({ ok: true, ticket: updated });
    }

    case "close": {
      const updated = await updateTicket(ticketId, {
        status: "closed",
        humanReviewed: true,
        closedAt: new Date().toISOString(),
      });

      return Response.json({ ok: true, ticket: updated });
    }

    case "edit-draft": {
      if (!data.draftResponse) {
        return Response.json({ error: "draftResponse required" }, { status: 400 });
      }

      const updated = await updateTicket(ticketId, {
        draftResponse: data.draftResponse,
      });

      return Response.json({ ok: true, ticket: updated });
    }

    default:
      return Response.json(
        { error: "action must be: approve, escalate, close, or edit-draft" },
        { status: 400 },
      );
  }
}
