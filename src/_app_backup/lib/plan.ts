import { auth } from "@clerk/nextjs/server";
import { kv } from "@/app/lib/kv";

export type Plan = "free" | "pro";

/**
 * Single source of truth for plan:
 * 1) debug:global:plan = "pro" overrides everything (useful for dev)
 * 2) user:{userId}:plan = "pro"
 * Otherwise "free"
 */
export async function getPlanForUserId(userId: string): Promise<Plan> {
  const debugGlobal = (await kv.get("debug:global:plan")) as string | null;
  if (debugGlobal === "pro") return "pro";

  const userPlan = (await kv.get(`user:${userId}:plan`)) as string | null;
  if (userPlan === "pro") return "pro";

  return "free";
}

/**
 * Convenience helper if you ever want to call it without passing userId.
 * Not required by the SEO route, but handy and harmless.
 */
export async function getPlanForCurrentUser(): Promise<Plan> {
  const { userId } = auth();
  if (!userId) return "free";
  return getPlanForUserId(userId);
}
