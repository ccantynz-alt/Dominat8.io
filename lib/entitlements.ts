// lib/entitlements.ts
import { kv } from "@vercel/kv";

export type Plan = "free" | "pro";

export const MAX_FREE_PROJECTS = 3;

function planKey(clerkUserId: string) {
  return `plan:clerk:${clerkUserId}`;
}

function projectCountKey(clerkUserId: string) {
  return `projects:count:${clerkUserId}`;
}

export async function getUserPlan(clerkUserId: string): Promise<Plan> {
  const raw = await kv.get(planKey(clerkUserId));
  const plan = typeof raw === "string" ? raw : null;
  return plan === "pro" ? "pro" : "free";
}

export async function getProjectCount(clerkUserId: string): Promise<number> {
  const n = await kv.get(projectCountKey(clerkUserId));
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
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
    // @ts-ignore - attach a status code for our route handler to use
    err.status = 402;
    throw err;
  }
}

export async function incrementProjectCount(clerkUserId: string) {
  await kv.incr(projectCountKey(clerkUserId));
}
