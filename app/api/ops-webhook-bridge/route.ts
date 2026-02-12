import { NextRequest } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WebhookPayload {
  instruction: string;
  patch_b64?: string;
  patch_url?: string;
  pr_title?: string;
  auto_merge?: string;
}

// Verify HMAC signature from webhook
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Trigger GitHub Actions workflow dispatch
async function triggerWorkflow(payload: WebhookPayload): Promise<Response> {
  const {
    GITHUB_TOKEN,
    GITHUB_REPOSITORY = "ccantynz-alt/Dominat8.io",
  } = process.env;

  if (!GITHUB_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Server configuration error: Missing GITHUB_TOKEN" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  const workflowId = "agent-pr.yml";

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;

  const dispatchPayload = {
    ref: "main",
    inputs: {
      instruction: payload.instruction,
      patch_b64: payload.patch_b64 || "",
      patch_url: payload.patch_url || "",
      pr_title: payload.pr_title || "agent: changes via ops-webhook-bridge",
      auto_merge: payload.auto_merge || "false",
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dispatchPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`GitHub API error: ${response.status} - ${errorText}`);
    return new Response(
      JSON.stringify({
        error: "Failed to trigger workflow",
        status: response.status,
        details: errorText,
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Workflow dispatch triggered successfully",
      workflow: workflowId,
      repository: GITHUB_REPOSITORY,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Read request body
    const body = await request.text();
    let payload: WebhookPayload;

    try {
      payload = JSON.parse(body);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.OPS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("x-webhook-signature");
      
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.warn("Webhook signature verification failed");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }
    }

    // Validate required fields
    if (!payload.instruction) {
      return new Response(
        JSON.stringify({ error: "Missing required field: instruction" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    if (!payload.patch_b64 && !payload.patch_url) {
      return new Response(
        JSON.stringify({
          error: "Must provide either patch_b64 or patch_url",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Log webhook receipt
    console.log(
      `[ops-webhook-bridge] Received webhook: ${payload.pr_title || "untitled"} - ${payload.instruction.substring(0, 100)}`
    );

    // Trigger the workflow
    const result = await triggerWorkflow(payload);
    
    const duration = Date.now() - startTime;
    console.log(`[ops-webhook-bridge] Request processed in ${duration}ms`);
    
    return result;
  } catch (error: any) {
    console.error("[ops-webhook-bridge] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || String(error),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

// Health check endpoint
export async function GET() {
  const hasToken = !!process.env.GITHUB_TOKEN;
  const hasSecret = !!process.env.OPS_WEBHOOK_SECRET;
  
  return new Response(
    JSON.stringify({
      ok: true,
      service: "ops-webhook-bridge",
      version: "1.0.0",
      config: {
        github_token_configured: hasToken,
        webhook_secret_configured: hasSecret,
        repository: process.env.GITHUB_REPOSITORY || "ccantynz-alt/Dominat8.io",
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
