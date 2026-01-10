// lib/entitlements.ts
import { kv } from "@vercel/kv";

export type Plan = "free" | "pro";
export const MAX_FREE_PROJECTS = 3;

const planKey = (clerkUserId: string) => `plan:clerk:${clerkUserId}`;
const projectCountKey = (clerkUserId: string) => `projects:count:${clerkUserId}`;

export async function getUserPlan(clerkUserId: string): Promise<Plan> {
  const raw = await kv.get(planKey(clerkUserId));
  const plan = typeof raw === "string" ? raw : null;
  return plan === "pro" ? "pro" : "free";
}

export async function getProjectCount(clerkUserId: string): Promise<number> {
  const v = await kv.get(projectCountKey(clerkUserId));
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function assertCanCreateProject(clerkUserId: string) {
  const plan = await getUserPlan(clerkUserId);
  if (plan === "pro") return;

  const count = await getProjectCount(clerkUserId);
  if (count >= MAX_FREE_PROJECTS) {
    const err = new Error(
      `Free plan limit reached. Max ${MAX_FREE_PROJECTS} projects. Upgrade to Pro to create more.`
    );
    // attach status for route handler
    // @ts-ignore
    err.status = 402;
    throw err;
  }
}

export async function incrementProjectCount(clerkUserId: string) {
  await kv.incr(projectCountKey(clerkUserId));
}
