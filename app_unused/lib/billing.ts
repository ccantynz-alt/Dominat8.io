// app/lib/billing.ts

import { kv } from "@vercel/kv";

export type Plan = "free" | "pro";

const FREE_PROJECT_LIMIT = 1;

/**
 * Returns the plan for a given Clerk user.
 * Defaults to "free" if no plan is found.
 */
export async function getPlanForUser(userId: string): Promise<Plan> {
  const key = `plan:clerk:${userId}`;
  const plan = await kv.get<Plan>(key);
  return plan === "pro" ? "pro" : "free";
}

/**
 * Returns the number of projects created by a user.
 */
export async function getProjectCount(userId: string): Promise<number> {
  const key = `projects:count:${userId}`;
  const count = await kv.get<number>(key);
  return typeof count === "number" ? count : 0;
}

/**
 * Throws an error if the user has exceeded their plan limits.
 */
export async function enforceProjectLimit(userId: string): Promise<void> {
  const plan = await getPlanForUser(userId);

  if (plan === "pro") {
    return; // unlimited
  }

  const count = await getProjectCount(userId);

  if (count >= FREE_PROJECT_LIMIT) {
    throw new Error(
      "Free plan limit reached: 1 project. Upgrade to Pro."
    );
  }
}

/**
 * Increments the project count for a user.
 * Call ONLY after a project is successfully created.
 */
export async function incrementProjectCount(userId: string): Promise<void> {
  const key = `projects:count:${userId}`;
  await kv.incr(key);
}
