// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import {
  audit,
  checkRateLimit,
  clearRateLimit,
  getIpFromHeaders,
  getUaFromHeaders,
  recordFailedAttempt,
} from "../../../lib/adminSecurity";

export async function POST(req: Request) {
  const secret = process.env.ADMIN_ACCESS_CODE;

  const ip = getIpFromHeaders(req.headers);
  const ua = getUaFromHeaders(req.headers);

  // If env var missing, log it (server misconfig)
  if (!secret) {
    await audit({
      action: "admin_login_failed",
      ip,
      ua,
      note: "Missing ADMIN_ACCESS_CODE env var",
    });
    return NextResponse.json(
      { ok: false, error: "Missing ADMIN_ACCESS_CODE env var" },
      { status: 500 }
    );
  }

  // Rate limit check (before reading body)
  const rl = await checkRateLimit(ip);
  if (!rl.ok && rl.locked) {
    await audit({
      action: "admin_login_locked",
      ip,
      ua,
      note: `Locked. retryAfterSec=${rl.retryAfterSec ?? "?"}`,
    });
    const res = NextResponse.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
    if (rl.retryAfterSec) res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const code = String(body?.code ?? "");

  if (code !== secret) {
    const failed = await recordFailedAttempt(ip);

    await audit({
      action: failed.lockedNow ? "admin_login_locked" : "admin_login_failed",
      ip,
      ua,
      note: failed.lockedNow
        ? `Invalid code; locked now. retryAfterSec=${failed.retryAfterSec ?? "?"}`
        : "Invalid code",
    });

    const res = NextResponse.json(
      {
        ok: false,
        error: failed.lockedNow
          ? "Too many attempts. You are locked out temporarily."
          : "Invalid code",
      },
      { status: failed.lockedNow ? 429 : 401 }
    );

    if (failed.lockedNow && failed.retryAfterSec) {
      res.headers.set("Retry-After", String(failed.retryAfterSec));
    }

    return res;
  }

  // Success: set cookie + clear rate limit
  await clearRateLimit(ip);

  await audit({
    action: "admin_login_success",
    ip,
    ua,
    note: "Login success",
  });

  const res = NextResponse.json({ ok: true });

  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
