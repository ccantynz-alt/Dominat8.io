import { kv } from "@vercel/kv";

export type Plan = "free" | "pro";

export async function setUserPlan(clerkUserId: string, plan: Plan) {
  // This matches the key style you’ve been using already: plan:clerk:<userId>
  const key = `plan:clerk:${clerkUserId}`;
  await kv.set(key, plan);
  return { ok: true, key, plan };
}

export async function getUserPlan(clerkUserId: string): Promise<Plan> {
  const key = `plan:clerk:${clerkUserId}`;
  const value = (await kv.get(key)) as Plan | null;
  return value ?? "free";
}
