import { kv } from "@vercel/kv";

export type BillingPlan = "free" | "pro";

export type BillingSubscription = {
  status: "active" | "trialing" | "canceled" | "incomplete" | string;
  plan?: BillingPlan;
  current_period_end?: number;
  customerId?: string;
  subscriptionId?: string;
  priceId?: string;
  updatedAt?: string;
};

export function planKey(userId: string) {
  return `plan:clerk:${userId}`;
}

export function subscriptionKey(userId: string) {
  return `billing:subscription:${userId}`;
}

/**
 * Returns the user's plan: "free" | "pro"
 * Default is "free" if not present.
 */
export async function getPlan(userId: string): Promise<BillingPlan> {
  const plan = await kv.get<BillingPlan>(planKey(userId));
  return plan === "pro" ? "pro" : "free";
}

/**
 * Sets plan explicitly.
 */
export async function setPlan(userId: string, plan: BillingPlan) {
  await kv.set(planKey(userId), plan);
}

/**
 * ✅ COMPAT EXPORT: requirePlan.ts expects this name.
 * Returns the saved subscription object (or null).
 */
export async function getSubscription(
  userId: string
): Promise<BillingSubscription | null> {
  const sub = await kv.get<BillingSubscription>(subscriptionKey(userId));
  return sub ?? null;
}

/**
 * Saves the subscription object.
 */
export async function setSubscription(
  userId: string,
  sub: BillingSubscription | null
) {
  if (!sub) {
    await kv.del(subscriptionKey(userId));
    return;
  }
  await kv.set(subscriptionKey(userId), {
    ...sub,
    updatedAt: new Date().toISOString(),
  });
}
