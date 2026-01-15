import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// ✅ Correct imports — these files actually exist
import { kv } from "@/src/app/lib/kv";
import { getPlanForUserId } from "@/src/app/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildSeoRecommendations(input: any) {
  const brandName = String(input?.brandName ?? "Your Company");
  const service = String(input?.service ?? "your services");
  const location = String(input?.location ?? "your area");

  return {
    title: `${brandName} | ${service} in ${location}`,
    description: `Trusted ${service} in ${location}. Fast, friendly service and transparent pricing.`,
    keywords: [
      brandName,
      service,
      location,
      `${service} ${location}`,
      `${brandName} ${location}`,
    ],
    pages: [
      { slug: "/", title: "Home", note: "Add a clear hero + primary CTA above the fold." },
      { slug: "/pricing", title: "Pricing", note: "Show simple tiers and include trust signals." },
      { slug: "/contact", title: "Contact", note: "Include a short form and response-time promise." },
    ],
  };
}

export async function POST(
  req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const plan = await getPlanForUserId(userId);
    if (plan !== "pro") {
      return NextResponse.json(
        {
          ok: false,
          error: "pro_required",
          message: "SEO agent is available on Pro.",
        },
        { status: 402 }
      );
    }

    // ✅ No kv.get<string>()
    const kvPlan = (await kv.get(`user:${userId}:plan`)) as string | null;

    const input = await req.json().catch(() => ({}));
    const seo = buildSeoRecommendations(input);

    return NextResponse.json({
      ok: true,
      agent: "seo",
      projectId: ctx.params.projectId,
      plan,
      kvPlan,
      seo,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "exception",
        message: String(e?.message ?? e),
      },
      { status: 500 }
    );
  }
}
