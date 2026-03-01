import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  getInferenceGeo,
  setInferenceGeo,
  getComplianceReport,
  type InferenceGeo,
} from "@/lib/data-residency";
import { isAdminUser } from "@/lib/agent-credits";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

/**
 * Data Residency + Compliance API
 *
 * GET  — view current residency setting + compliance report
 * POST — update residency preference (Agency/Enterprise only)
 */

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const report = await getComplianceReport(userId);

  return Response.json({
    ok: true,
    ...report,
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  // Only Agency plan or admin can change residency
  const planRaw = await kv.get<string>(`user:${userId}:plan`);
  const plan = planRaw ?? "free";
  if (plan !== "agency" && !isAdminUser(userId)) {
    return Response.json(
      { error: "Data residency controls require the Agency plan." },
      { status: 403 },
    );
  }

  const { geo } = await req.json();
  if (geo !== "us" && geo !== "global") {
    return Response.json(
      { error: 'geo must be "us" or "global"' },
      { status: 400 },
    );
  }

  await setInferenceGeo(userId, geo as InferenceGeo);

  const report = await getComplianceReport(userId);

  return Response.json({
    ok: true,
    message: `Inference geo set to "${geo}". All future API calls will process data in ${geo === "us" ? "the United States only" : "the nearest global region"}.`,
    ...report,
  });
}
