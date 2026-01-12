import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { getUserPlan } from "./plan";

/**
 * Backend-enforced plan limits.
 */
export const LIMITS = {
  free: {
    maxProjects: 1,
    canPublish: false,
    canCustomDomain: false,
  },
  pro: {
    maxProjects: Infinity,
    canPublish: true,
    canCustomDomain: true,
  },
} as const;

export type PlanName = "free" | "pro";

/**
 * Throws .status=401 if user not signed in.
 */
export function requireSignedInUserId(): string {
  const { userId } = auth();
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return userId;
}

export async function getEffectivePlan(clerkUserId: string): Promise<PlanName> {
  const plan = await getUserPlan(clerkUserId);
  return plan === "pro" ? "pro" : "free";
}

/**
 * Throws .status=403 if not Pro.
 */
export async function requirePro(clerkUserId: string): Promise<void> {
  const plan = await getEffectivePlan(clerkUserId);
  if (plan !== "pro") {
    throw Object.assign(new Error("Pro plan required"), { status: 403 });
  }
}

/**
 * KV set of project IDs owned by a user:
 * projects:byUser:<clerkUserId>
 */
function userProjectsKey(clerkUserId: string) {
  return `projects:byUser:${clerkUserId}`;
}

export async function getProjectCount(clerkUserId: string): Promise<number> {
  const count = await kv.scard(userProjectsKey(clerkUserId));
  return typeof count === "number" ? count : 0;
}

export async function trackProjectForUser(
  clerkUserId: string,
  projectId: string
): Promise<void> {
  await kv.sadd(userProjectsKey(clerkUserId), projectId);
}

/**
 * Throws .status=403 if free user hit maxProjects.
 */
export async function ensureCanCreateProject(
  clerkUserId: string
): Promise<void> {
  const plan = await getEffectivePlan(clerkUserId);
  const limit = LIMITS[plan].maxProjects;

  if (limit === Infinity) return;

  const count = await getProjectCount(clerkUserId);
  if (count >= limit) {
    throw Object.assign(
      new Error(`Free plan limit reached (max ${limit} project). Upgrade to Pro.`),
      { status: 403 }
    );
  }
}

/**
 * Convert thrown errors into consistent JSON.
 */
export function toJsonError(err: any) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message =
    typeof err?.message === "string" ? err.message : "Internal server error";
  return { status, body: { ok: false, error: message } };
}
