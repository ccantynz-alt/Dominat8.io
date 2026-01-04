import { kv } from "@vercel/kv";

export async function setUserSubscriptionActive(params: {
  clerkUserId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  await kv.hset(`sub:user:${params.clerkUserId}`, {
    status: "active",
    clerkUserId: params.clerkUserId,
    customerId: params.customerId || null,
    subscriptionId: params.subscriptionId || null,
    updatedAt: Date.now(),
  });
}
