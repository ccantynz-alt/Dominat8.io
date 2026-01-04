import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * TEMP STUB:
 * Original depended on seoAiOnePage/openaiResponses alias chain.
 */
export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; slug: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(
    {
      ok: false,
      status: "not_implemented",
      projectId: params.projectId,
      slug: params.slug,
      message: "SEO page regenerate not implemented yet.",
    },
    { status: 501 }
  );
}
