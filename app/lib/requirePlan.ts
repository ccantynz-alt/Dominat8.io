import { getSubscription } from "@/app/lib/billingKV";

type BillingSubscription = {
  status: "active" | "trialing" | "canceled" | "incomplete" | string;
  priceId?: string;
  currentPeriodEnd?: number;
};

export async function requireActivePlan(userId: string) {
  const sub = (await getSubscription(userId)) as BillingSubscription | null;

  if (!sub || sub.status !== "active") {
    throw new Error("Upgrade required");
  }

  return sub;
}
