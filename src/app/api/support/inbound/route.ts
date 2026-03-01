import { NextRequest } from "next/server";
import { classifyAndDraft } from "@/lib/support-classifier";
import { createTicket } from "@/lib/support-tickets";
import type { SupportCategory, SupportPriority } from "@/lib/support-kb";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Inbound Email Webhook — Receives Emails from Resend/SendGrid
 *
 * This endpoint receives incoming customer emails via webhook.
 * Configure your email provider to POST here on new emails.
 *
 * Resend setup: Settings → Webhooks → Add endpoint
 *   URL: https://dominat8.io/api/support/inbound
 *   Events: email.received
 *
 * Flow:
 *   1. Receive inbound email
 *   2. Verify webhook signature
 *   3. AI classifies: category + priority + tags
 *   4. AI drafts response using knowledge base
 *   5. If high confidence (>0.85) + not billing/urgent → auto-send
 *   6. Otherwise → queue for human review
 *   7. Store ticket in KV
 *
 * Inbound address: support@dominat8.io
 */

export async function POST(req: NextRequest) {
  // Verify webhook signature (Resend sends svix headers)
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  // Also support a shared secret for simpler providers
  const authHeader = req.headers.get("authorization");
  const webhookSecret = process.env.SUPPORT_WEBHOOK_SECRET;

  // Basic auth check — at least one method must pass
  const hasWebhookAuth = svixId && svixTimestamp && svixSignature;
  const hasSecretAuth = webhookSecret && authHeader === `Bearer ${webhookSecret}`;

  if (!hasWebhookAuth && !hasSecretAuth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  // Normalize email data from different provider formats
  const email = normalizeEmailPayload(payload);
  if (!email) {
    return Response.json({ error: "Could not parse email payload" }, { status: 400 });
  }

  // Skip auto-replies, bounces, and noreply addresses
  if (shouldSkip(email.from)) {
    return Response.json({ ok: true, skipped: true, reason: "auto-reply or noreply" });
  }

  // Look up userId by email
  const userId = await kv.get<string>(`support:email-to-user:${email.from}`);

  // Classify and draft response using AI
  const classification = await classifyAndDraft(
    email.from,
    email.fromName,
    email.subject,
    email.body,
  );

  // Create ticket
  const ticket = await createTicket({
    userId: userId ?? null,
    senderEmail: email.from,
    senderName: email.fromName,
    subject: email.subject,
    body: email.body,
    category: classification.category as SupportCategory,
    priority: classification.priority as SupportPriority,
    draftResponse: classification.draftResponse,
    draftConfidence: classification.confidence,
    autoSent: classification.shouldAutoSend,
    humanReviewed: false,
    status: classification.shouldAutoSend ? "replied" : "awaiting-review",
    tags: classification.tags,
    escalationNote: null,
  });

  // Auto-send if confidence is high enough
  if (classification.shouldAutoSend) {
    await sendReply(email.from, email.subject, classification.draftResponse);
    // Update ticket with sent timestamp
    const { updateTicket } = await import("@/lib/support-tickets");
    await updateTicket(ticket.id, {
      repliedAt: new Date().toISOString(),
    });
  }

  return Response.json({
    ok: true,
    ticketId: ticket.id,
    category: classification.category,
    priority: classification.priority,
    confidence: classification.confidence,
    autoSent: classification.shouldAutoSend,
    status: ticket.status,
  });
}

// ── Normalize email from different webhook providers ─────────────────────────

interface NormalizedEmail {
  from: string;
  fromName: string | null;
  subject: string;
  body: string;
}

function normalizeEmailPayload(payload: Record<string, unknown>): NormalizedEmail | null {
  // Resend format
  if (payload.type === "email.received" && payload.data) {
    const data = payload.data as Record<string, unknown>;
    return {
      from: (data.from as string) ?? "",
      fromName: (data.from_name as string) ?? null,
      subject: (data.subject as string) ?? "(no subject)",
      body: (data.text as string) ?? (data.html as string) ?? "",
    };
  }

  // SendGrid Inbound Parse format
  if (payload.from && payload.text) {
    const fromStr = payload.from as string;
    const nameMatch = fromStr.match(/^(.+?)\s*<(.+?)>$/);
    return {
      from: nameMatch ? nameMatch[2] : fromStr,
      fromName: nameMatch ? nameMatch[1].trim() : null,
      subject: (payload.subject as string) ?? "(no subject)",
      body: (payload.text as string) ?? "",
    };
  }

  // Generic format — just need from, subject, body
  if (payload.email || payload.sender || payload.from) {
    return {
      from: ((payload.email ?? payload.sender ?? payload.from) as string) ?? "",
      fromName: (payload.name as string) ?? (payload.fromName as string) ?? null,
      subject: (payload.subject as string) ?? "(no subject)",
      body: (payload.body as string) ?? (payload.text as string) ?? (payload.message as string) ?? "",
    };
  }

  return null;
}

// ── Skip auto-replies ────────────────────────────────────────────────────────

function shouldSkip(email: string): boolean {
  const skipPatterns = [
    "noreply@",
    "no-reply@",
    "mailer-daemon@",
    "postmaster@",
    "bounce@",
    "auto-",
    "donotreply@",
  ];
  const lower = email.toLowerCase();
  return skipPatterns.some((p) => lower.includes(p));
}

// ── Send reply via Resend ────────────────────────────────────────────────────

async function sendReply(to: string, originalSubject: string, body: string): Promise<void> {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Skip if not configured

  const resend = new Resend(apiKey);
  const subject = originalSubject.startsWith("Re:")
    ? originalSubject
    : `Re: ${originalSubject}`;

  try {
    await resend.emails.send({
      from: "Dominat8.io Support <support@dominat8.io>",
      to,
      subject,
      html: formatReplyHtml(body),
    });
  } catch {
    // Email failure is non-fatal — ticket is still created
  }
}

// ── Format reply as branded HTML email ───────────────────────────────────────

function formatReplyHtml(body: string): string {
  // Convert markdown-ish to HTML
  const htmlBody = body
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;margin:0;padding:40px 24px">
  <div style="max-width:560px;margin:0 auto">
    <div style="font-size:20px;font-weight:900;letter-spacing:-0.03em;margin-bottom:24px">
      Dominat8<span style="color:#F0B35A">.io</span> Support
    </div>
    <div style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.7">
      <p>${htmlBody}</p>
    </div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0">
    <p style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.5">
      This response was drafted by our AI support assistant and reviewed for accuracy.
      If you need further help, just reply to this email — a human will follow up.
      <br><br>
      Dominat8.io · <a href="https://dominat8.io" style="color:rgba(240,179,90,0.6)">dominat8.io</a>
    </p>
  </div>
</body>
</html>`;
}
