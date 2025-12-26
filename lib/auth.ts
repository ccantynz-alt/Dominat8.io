import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const adminKey = process.env.PLATFORM_ADMIN_KEY;
  if (!adminKey) return; // If unset, allow (dev-friendly)
  const got = req.headers.get("x-admin-key") || "";
  if (got !== adminKey) {
    throw new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}

export function requireCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Response(
      JSON.stringify({ ok: false, error: "CRON_SECRET not set" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
  const got = req.headers.get("x-cron-secret") || "";
  if (got !== secret) {
    throw new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
}
