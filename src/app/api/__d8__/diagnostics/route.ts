export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

function hasValue(val: string | undefined): boolean {
  return !!val;
}

type Result = {
  name: string;
  status: "pass" | "fail" | "skip";
  present?: boolean;
  detail?: string;
  latencyMs?: number;
};

async function testOpenAI(): Promise<Result> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { name: "OpenAI", status: "fail", present: false, detail: "OPENAI_API_KEY not configured" };
  const start = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { name: "OpenAI", status: "pass", present: true, detail: `API reachable (${res.status})`, latencyMs };
    }
    const body = await res.text().catch(() => "");
    return { name: "OpenAI", status: "fail", present: true, detail: `HTTP ${res.status}: ${body.slice(0, 200)}`, latencyMs };
  } catch (err: unknown) {
    return { name: "OpenAI", status: "fail", present: true, detail: `Network error: ${err instanceof Error ? err.message : String(err)}`, latencyMs: Date.now() - start };
  }
}

async function testAnthropic(): Promise<Result> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { name: "Anthropic (Claude)", status: "skip", present: false, detail: "ANTHROPIC_API_KEY not configured (optional)" };
  const start = Date.now();
  try {
    // Lightweight test: send a tiny message with max_tokens=1
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { name: "Anthropic (Claude)", status: "pass", present: true, detail: `API reachable (${res.status})`, latencyMs };
    }
    const body = await res.text().catch(() => "");
    return { name: "Anthropic (Claude)", status: "fail", present: true, detail: `HTTP ${res.status}: ${body.slice(0, 200)}`, latencyMs };
  } catch (err: unknown) {
    return { name: "Anthropic (Claude)", status: "fail", present: true, detail: `Network error: ${err instanceof Error ? err.message : String(err)}`, latencyMs: Date.now() - start };
  }
}

async function testClerk(): Promise<Result> {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return { name: "Clerk (Auth)", status: "fail", present: false, detail: "CLERK_SECRET_KEY not configured" };
  if (!pubKey) return { name: "Clerk (Auth)", status: "fail", present: false, detail: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not configured" };
  const start = Date.now();
  try {
    const res = await fetch("https://api.clerk.com/v1/users?limit=1", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { name: "Clerk (Auth)", status: "pass", present: true, detail: `API reachable`, latencyMs };
    }
    const body = await res.text().catch(() => "");
    return { name: "Clerk (Auth)", status: "fail", present: true, detail: `HTTP ${res.status}: ${body.slice(0, 200)}`, latencyMs };
  } catch (err: unknown) {
    return { name: "Clerk (Auth)", status: "fail", present: true, detail: `Network error: ${err instanceof Error ? err.message : String(err)}`, latencyMs: Date.now() - start };
  }
}

async function testStripe(): Promise<Result> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { name: "Stripe (Payments)", status: "fail", present: false, detail: "STRIPE_SECRET_KEY not configured" };
  const start = Date.now();
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      const starterPrice = process.env.STRIPE_STARTER_PRICE_ID ? "set" : "MISSING";
      const proPrice = process.env.STRIPE_PRO_PRICE_ID ? "set" : "MISSING";
      const agencyPrice = process.env.STRIPE_AGENCY_PRICE_ID ? "set" : "MISSING";
      const webhook = process.env.STRIPE_WEBHOOK_SECRET ? "set" : "MISSING";
      return {
        name: "Stripe (Payments)",
        status: "pass",
        present: true,
        detail: `API reachable | Prices: starter=${starterPrice}, pro=${proPrice}, agency=${agencyPrice} | Webhook: ${webhook}`,
        latencyMs,
      };
    }
    const body = await res.text().catch(() => "");
    return { name: "Stripe (Payments)", status: "fail", present: true, detail: `HTTP ${res.status}: ${body.slice(0, 200)}`, latencyMs };
  } catch (err: unknown) {
    return { name: "Stripe (Payments)", status: "fail", present: true, detail: `Network error: ${err instanceof Error ? err.message : String(err)}`, latencyMs: Date.now() - start };
  }
}

async function testVercelKV(): Promise<Result> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return { name: "Vercel KV (Redis)", status: "fail", present: false, detail: !url ? "KV_REST_API_URL not configured" : "KV_REST_API_TOKEN not configured" };
  const start = Date.now();
  try {
    const res = await fetch(`${url}/ping`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { name: "Vercel KV (Redis)", status: "pass", present: true, detail: `Connected to ${new URL(url).hostname}`, latencyMs };
    }
    const body = await res.text().catch(() => "");
    return { name: "Vercel KV (Redis)", status: "fail", present: true, detail: `HTTP ${res.status}: ${body.slice(0, 200)}`, latencyMs };
  } catch (err: unknown) {
    return { name: "Vercel KV (Redis)", status: "fail", present: true, detail: `Network error: ${err instanceof Error ? err.message : String(err)}`, latencyMs: Date.now() - start };
  }
}

async function testVercelBlob(): Promise<Result> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return { name: "Vercel Blob (Storage)", status: "fail", present: false, detail: "BLOB_READ_WRITE_TOKEN not configured" };
  const start = Date.now();
  try {
    // List blobs (limit 1) to test connection
    const res = await fetch("https://blob.vercel-storage.com/?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { name: "Vercel Blob (Storage)", status: "pass", present: true, detail: `API reachable`, latencyMs };
    }
    const body = await res.text().catch(() => "");
    return { name: "Vercel Blob (Storage)", status: "fail", present: true, detail: `HTTP ${res.status}: ${body.slice(0, 200)}`, latencyMs };
  } catch (err: unknown) {
    return { name: "Vercel Blob (Storage)", status: "fail", present: true, detail: `Network error: ${err instanceof Error ? err.message : String(err)}`, latencyMs: Date.now() - start };
  }
}

function testResend(): Result {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { name: "Resend (Email)", status: "skip", present: false, detail: "RESEND_API_KEY not configured (optional — emails disabled)" };
  return { name: "Resend (Email)", status: "pass", present: true, detail: "Key present (not live-tested to avoid sending email)" };
}

function testEnvVars(): Result {
  const missing: string[] = [];
  const vars = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
    "ADMIN_USER_IDS",
  ];
  for (const v of vars) {
    if (!process.env[v]) missing.push(v);
  }
  if (missing.length > 0) {
    return { name: "Config Vars", status: "fail", detail: `Missing: ${missing.join(", ")}` };
  }
  return { name: "Config Vars", status: "pass", detail: `APP_URL=${process.env.NEXT_PUBLIC_APP_URL}` };
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Access control: require shared secret header
  const adminKey = process.env.D8_ADMIN_KEY;
  const providedKey = req.headers.get("x-d8-admin-key");
  if (!adminKey || providedKey !== adminKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const startAll = Date.now();

  const results = await Promise.all([
    testOpenAI(),
    testAnthropic(),
    testClerk(),
    testStripe(),
    testVercelKV(),
    testVercelBlob(),
    Promise.resolve(testResend()),
    Promise.resolve(testEnvVars()),
  ]);

  const totalMs = Date.now() - startAll;
  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const skipCount = results.filter((r) => r.status === "skip").length;

  const body = {
    ok: failCount === 0,
    summary: `${passCount} pass, ${failCount} fail, ${skipCount} skip`,
    totalMs,
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    results,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: failCount > 0 ? 503 : 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
