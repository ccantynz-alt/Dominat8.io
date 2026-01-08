import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { ok: false, error: "Not signed in" },
      { status: 401 }
    );
  }

  await kv.set(`plan:clerk:${userId}`, "pro");

  return Response.json({
    ok: true,
    set: `plan:clerk:${userId}`,
    value: "pro",
  });
}
