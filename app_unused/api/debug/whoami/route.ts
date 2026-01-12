// app/api/debug/whoami/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, signedIn: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    signedIn: true,
    userId,
    note: "Copy this userId into Vercel ENV var ADMIN_USER_IDS",
  });
}
