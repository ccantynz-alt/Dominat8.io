import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({
      ok: true,
      signedIn: false,
      plan: "free",
      note: "Not signed in, so plan is always free.",
    });
  }

  const key = `plan:clerk:${userId}`;
  const plan = (await kv.get<string>(key)) || "free";

  return Response.json({
    ok: true,
    signedIn: true,
    userId,
    key,
    plan,
  });
}
