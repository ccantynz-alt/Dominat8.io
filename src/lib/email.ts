/**
 * Email sending via Resend
 * Falls back gracefully if RESEND_API_KEY is not configured.
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Dominat8.io <hello@dominat8.io>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dominat8.io";

async function send(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) return; // Silently skip if not configured
  try {
    await resend.emails.send({ from: FROM, ...opts });
  } catch {
    // Email failures are non-fatal
  }
}

// ── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, firstName?: string) {
  const name = firstName || "there";
  await send({
    to,
    subject: "Welcome to Dominat8.io — build your first site now",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#060810;color:#e9eef7;font-family:'Outfit',system-ui,sans-serif;margin:0;padding:40px 24px">
  <div style="max-width:520px;margin:0 auto">
    <div style="font-size:24px;font-weight:900;letter-spacing:-0.03em;margin-bottom:32px">
      Dominat8<span style="color:#3DF0FF">.io</span>
    </div>
    <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;margin:0 0 12px">
      Hey ${name} 👋
    </h1>
    <p style="color:rgba(255,255,255,0.65);font-size:16px;line-height:1.6;margin:0 0 24px">
      You're in. The world's most powerful AI website builder is ready for you.
    </p>
    <p style="color:rgba(255,255,255,0.65);font-size:16px;line-height:1.6;margin:0 0 32px">
      Describe any business in one sentence. Watch a complete, professional website appear in under 30 seconds — full HTML, real content, zero templates.
    </p>
    <a href="${APP_URL}/build" style="display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,rgba(61,240,255,0.25),rgba(139,92,246,0.25));border:1px solid rgba(61,240,255,0.45);color:rgba(61,240,255,0.97);text-decoration:none;font-weight:700;font-size:16px;letter-spacing:-0.01em">
      Build your first site →
    </a>
    <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:48px">
      Dominat8.io · <a href="${APP_URL}/unsubscribe" style="color:rgba(255,255,255,0.25)">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`,
  });
}

// ── Upgrade confirmation ──────────────────────────────────────────────────────

export async function sendUpgradeEmail(
  to: string,
  plan: string,
  firstName?: string
) {
  const name = firstName || "there";
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
  const credits: Record<string, string> = {
    starter: "25 agent credits/mo",
    pro: "150 agent credits/mo",
    agency: "600 agent credits/mo",
  };

  await send({
    to,
    subject: `${planLabel} plan activated — you're ready to build`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#060810;color:#e9eef7;font-family:'Outfit',system-ui,sans-serif;margin:0;padding:40px 24px">
  <div style="max-width:520px;margin:0 auto">
    <div style="font-size:24px;font-weight:900;letter-spacing:-0.03em;margin-bottom:32px">
      Dominat8<span style="color:#3DF0FF">.io</span>
    </div>
    <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;margin:0 0 12px">
      ${planLabel} activated 🎉
    </h1>
    <p style="color:rgba(255,255,255,0.65);font-size:16px;line-height:1.6;margin:0 0 24px">
      Hey ${name}, your ${planLabel} plan is live. Here's what you've unlocked:
    </p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:20px 24px;margin-bottom:32px">
      <div style="margin-bottom:10px">✓ &nbsp;<strong>${credits[plan] ?? "Unlimited"}</strong></div>
      ${plan === "pro" || plan === "agency" ? '<div style="margin-bottom:10px">✓ &nbsp;<strong>Deploy to your own .dominat8.io subdomain</strong></div>' : ""}
      ${plan === "agency" ? '<div style="margin-bottom:10px">✓ &nbsp;<strong>Bulk generation + API access</strong></div>' : ""}
      <div>✓ &nbsp;<strong>All 6 AI agents unlocked</strong></div>
    </div>
    <a href="${APP_URL}/build" style="display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,rgba(61,240,255,0.25),rgba(139,92,246,0.25));border:1px solid rgba(61,240,255,0.45);color:rgba(61,240,255,0.97);text-decoration:none;font-weight:700;font-size:16px">
      Start building →
    </a>
    <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-top:48px">
      Dominat8.io · <a href="${APP_URL}/unsubscribe" style="color:rgba(255,255,255,0.25)">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`,
  });
}

// ── Usage warning ─────────────────────────────────────────────────────────────

export async function sendUsageWarningEmail(
  to: string,
  pctUsed: number,
  plan: string,
  firstName?: string
) {
  const name = firstName || "there";
  await send({
    to,
    subject: `You've used ${pctUsed}% of your Dominat8.io credits`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#060810;color:#e9eef7;font-family:system-ui,sans-serif;margin:0;padding:40px 24px">
  <div style="max-width:520px;margin:0 auto">
    <div style="font-size:24px;font-weight:900;margin-bottom:32px">Dominat8<span style="color:#3DF0FF">.io</span></div>
    <h1 style="font-size:24px;font-weight:800;margin:0 0 12px">Running low on credits</h1>
    <p style="color:rgba(255,255,255,0.65);font-size:16px;line-height:1.6;margin:0 0 24px">
      Hey ${name}, you've used <strong>${pctUsed}%</strong> of your monthly agent credits on the ${plan} plan.
      Top up now to keep building without interruption.
    </p>
    <a href="${APP_URL}/pricing" style="display:inline-block;padding:14px 32px;border-radius:12px;background:rgba(61,240,255,0.15);border:1px solid rgba(61,240,255,0.40);color:rgba(61,240,255,0.97);text-decoration:none;font-weight:700;font-size:16px">
      Buy credits or upgrade →
    </a>
  </div>
</body>
</html>`,
  });
}
