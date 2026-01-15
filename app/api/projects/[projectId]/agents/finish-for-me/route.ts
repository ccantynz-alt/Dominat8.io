import { NextResponse } from "next/server";
import { kv } from "@/app/lib/kv";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

async function getPlan(): Promise<"pro" | "free"> {
  const { userId, sessionClaims } = auth();

  if (!userId) return "free";

  // Try Clerk claims first (optional)
  const claimPlan =
    (sessionClaims as any)?.publicMetadata?.plan ||
    (sessionClaims as any)?.metadata?.plan ||
    (sessionClaims as any)?.plan;

  if (claimPlan === "pro") return "pro";

  // KV fallback (kv.get is NOT generic in your project)
  const kvPlan = (await kv.get(`user:${userId}:plan`)) as string | null;
  if (kvPlan === "pro") return "pro";

  return "free";
}

function payload(projectId: string) {
  // Keep current finish-for-me behavior stable
  const pages = ["", "about", "pricing", "faq", "contact"];
  return {
    ok: true,
    projectId,
    updatedAt: new Date().toISOString(),
    pages,
  };
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const plan = await getPlan();

  if (plan !== "pro") {
    return NextResponse.json(
      { ok: false, error: "PRO_REQUIRED", agent: "finish-for-me" },
      { status: 402 }
    );
  }

  return NextResponse.json(payload(params.projectId));
}
