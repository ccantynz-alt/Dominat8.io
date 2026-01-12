import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  // Not signed in
  if (!session.userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "No user" }, { status: 401 });
  }

  const role = (user.publicMetadata?.role as string | undefined) ?? "user";
  if (role !== "owner") {
    // Hide existence
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: "Admin API is working",
    userId: user.id,
    role
  });
}
