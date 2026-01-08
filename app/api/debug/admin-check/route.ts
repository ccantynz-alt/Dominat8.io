// app/api/debug/admin-check/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, signedIn: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const raw = process.env.ADMIN_USER_IDS;
  const list = parseCsvEnv(raw);

  return NextResponse.json({
    ok: true,
    signedIn: true,
    userId,
    envPresent: typeof raw === "string" && raw.length > 0,
    envRawLength: raw ? raw.length : 0,
    envParsedCount: list.length,
    isAdmin: list.includes(userId),
    // helpful for debugging whitespace issues:
    envRawPreview: raw ? raw.slice(0, 80) : null,
  });
}
