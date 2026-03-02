import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { addPurchasedCredits } from "@/lib/agent-credits";
import { sendUpgradeEmail } from "@/lib/email";

export const runtime = "nodejs";

// Stripe requires the raw body for signature verification
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

async function setUserPlan(userId: string, plan: string) {
  await kv.set(`user:${userId}:plan`, plan);
}

async function storeCustomerId(userId: string, customerId: string) {
  await kv.set(`stripe:customer:${userId}`, customerId);
  await kv.set(`stripe:user:${customerId}`, userId);
}

// ── Idempotency: prevent duplicate webhook processing ──────────────────────
async function isEventProcessed(eventId: string): Promise<boolean> {
  const key = `stripe:event:${eventId}`;
  // SET NX returns true if key was set (event NOT seen before)
  const wasSet = await kv.set(key, "1", { nx: true, ex: 60 * 60 * 24 * 3 }); // 3-day TTL
  return !wasSet; // true = already processed
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  // ── Idempotency check ─────────────────────────────────────────────────────
  try {
    if (await isEventProcessed(event.id)) {
      return NextResponse.json({ received: true, deduplicated: true });
    }
  } catch {
    // KV unavailable — continue processing (better to risk duplicate than miss)
    console.warn("[webhook] Idempotency check failed, continuing");
  }

  try {
    switch (event.type) {
      // ── Payment completed ──────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const customerId = session.customer as string;

        if (!userId) {
          console.error("[webhook] checkout.session.completed missing userId", {
            sessionId: session.id,
            clientRefId: session.client_reference_id,
            metadata: session.metadata,
          });
          break;
        }

        if (session.metadata?.type === "credits") {
          // ── Credit pack purchase ─────────────────────────────────────────
          const credits = parseInt(session.metadata?.credits ?? "0", 10);
          if (credits > 0) {
            await addPurchasedCredits(userId, credits);
            console.log(`[webhook] Added ${credits} credits for user ${userId}`);
          }
        } else {
          // ── Subscription purchase → grant plan access ────────────────────
          const plan = session.metadata?.plan;
          if (plan) {
            await setUserPlan(userId, plan);
            console.log(`[webhook] Set plan=${plan} for user ${userId}`);
            // Send upgrade confirmation email
            const email = session.customer_details?.email ?? session.customer_email;
            if (email) {
              await sendUpgradeEmail(email, plan);
            }
          } else {
            console.error("[webhook] checkout.session.completed missing plan", {
              sessionId: session.id,
              metadata: session.metadata,
            });
          }
        }
        if (customerId) {
          await storeCustomerId(userId, customerId);
        }
        break;
      }

      // ── Subscription updated (upgrade/downgrade) ───────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.userId ??
          (await kv.get<string>(`stripe:user:${sub.customer}`));

        if (!userId) {
          console.error("[webhook] subscription.updated missing userId", {
            subId: sub.id,
            customer: sub.customer,
          });
          break;
        }

        const plan = sub.metadata?.plan;
        if (sub.status === "active" && plan) {
          await setUserPlan(userId, plan);
          console.log(`[webhook] Updated plan=${plan} for user ${userId}`);
        } else if (sub.status !== "active") {
          await setUserPlan(userId, "free");
          console.log(`[webhook] Downgraded user ${userId} (status=${sub.status})`);
        }
        break;
      }

      // ── Subscription cancelled → downgrade to free ─────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.userId ??
          (await kv.get<string>(`stripe:user:${sub.customer}`));

        if (!userId) {
          console.error("[webhook] subscription.deleted missing userId", {
            subId: sub.id,
            customer: sub.customer,
          });
          break;
        }

        await setUserPlan(userId, "free");
        console.log(`[webhook] Cancelled → free for user ${userId}`);
        break;
      }

      // ── Payment failed → log and surface for monitoring ────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId = await kv.get<string>(`stripe:user:${customerId}`);
        console.error("[webhook] Payment failed", {
          invoiceId: invoice.id,
          customerId,
          userId: userId ?? "unknown",
          attemptCount: invoice.attempt_count,
          amountDue: invoice.amount_due,
        });
        // Mark the user's account as past-due so the UI can show a warning
        if (userId) {
          await kv.set(`user:${userId}:payment_failed`, "1", { ex: 60 * 60 * 24 * 30 }); // 30-day TTL
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
