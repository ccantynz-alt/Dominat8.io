import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { isAdminUser } from "@/lib/agent-credits";
import { classifyAndDraft } from "@/lib/support-classifier";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * Manual Draft Endpoint — Test Classification or Re-draft
 *
 * For admins to:
 *   1. Test the classifier with sample emails
 *   2. Re-draft a response with additional context
 *   3. Preview how the AI would handle an email before going live
 */

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { from, fromName, subject, body } = await req.json();

  if (!from || !subject || !body) {
    return Response.json(
      { error: "from, subject, and body required" },
      { status: 400 },
    );
  }

  const result = await classifyAndDraft(from, fromName ?? null, subject, body);

  return Response.json({
    ok: true,
    classification: result,
  });
}
