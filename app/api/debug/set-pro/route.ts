import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@/src/app/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEV_TOKEN = "dev-pro-unlock";

async function setPlanForUser(userId: string, plan: "free" | "pro") {
  await kv.set(`user:${userId}:plan`, plan);
}

async function setGlobalPlan(plan: "free" | "pro") {
  await kv.set("debug:global:plan", plan);
}

export async function GET() {
  const { userId } = auth();
  const globalPlan = (await kv.get("debug:global:plan")) as string | null;
  const userPlan = userId ? ((await kv.get(`user:${userId}:plan`)) as string | null) : null;

  return NextResponse.json({
    ok: true,
    userId: userId ?? null,
    globalPlan,
    userPlan,
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const token = String(body?.token ?? "");
    const scope = String(body?.scope ?? "user");
    const plan = (String(body?.plan ?? "pro") as "free" | "pro") || "pro";

    if (token !== DEV_TOKEN) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    if (scope === "global") {
      await setGlobalPlan(plan);
      return NextResponse.json({ ok: true, scope: "global", plan });
    }

    await setPlanForUser(userId, plan);
    return NextResponse.json({ ok: true, scope: "user", userId, plan });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "exception", message: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
