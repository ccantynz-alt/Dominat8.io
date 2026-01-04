import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdminUserId } from "@/lib/admin";

export async function GET(req: Request) {
  const { userId } = auth();

  if (!isAdminUserId(userId)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);

  // Optional pagination (Clerk supports paginated lists)
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") || "0"), 0);

  try {
    const client = await clerkClient();

    const users = await client.users.getUserList({
      limit,
      offset,
      orderBy: "-created_at",
    });

    const shaped = users.map((u) => {
      const primaryEmail =
        u.emailAddresses?.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ||
        u.emailAddresses?.[0]?.emailAddress ||
        "";

      return {
        id: u.id,
        email: primaryEmail,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        createdAt: u.createdAt,
        lastSignInAt: u.lastSignInAt,
        banned: !!u.banned,
        locked: !!u.locked,
      };
    });

    return NextResponse.json({
      ok: true,
      users: shaped,
      paging: { limit, offset, returned: shaped.length },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to list users" },
      { status: 500 }
    );
  }
}
