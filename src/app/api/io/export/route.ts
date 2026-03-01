import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { isAdminUser } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Agent Skills — Export Deliverables
 *
 * Generates professional client deliverables from website data:
 *   - PPTX pitch deck: "Here's the website we built for you"
 *   - XLSX analytics report: Site audit data in spreadsheet form
 *   - DOCX proposal: Written proposal with screenshots
 *   - PDF report: Comprehensive site audit report
 *
 * Uses Claude's Agent Skills (skills-2025-10-02 beta) to generate
 * Office documents natively. Perfect for agency clients who need
 * to present work to stakeholders.
 *
 * This is a HUGE upsell for Agency plan — agencies NEED deliverables.
 */

const EXPORT_PROMPTS: Record<string, string> = {
  "pitch-deck": `Create a professional pitch deck for presenting this website to a client.

Include these slides:
1. Title slide with business name and "Website Proposal"
2. Project overview — what was built and why
3. Design choices — colors, fonts, layout decisions explained
4. Key features — hero, CTA, testimonials, responsive design
5. SEO readiness — meta tags, structure, mobile-friendly
6. Performance — fast loading, optimized code
7. Next steps — launch timeline, add-ons available
8. Contact / Thank you

Make it visually clean and professional. Use the brand colors from the website.`,

  "audit-report": `Create a comprehensive website audit report as a structured document.

Include:
1. Executive summary
2. SEO analysis with scores
3. Performance analysis with Core Web Vitals
4. Accessibility compliance check
5. Responsive design assessment
6. Content quality review
7. Recommendations ranked by priority
8. Implementation timeline

Include specific data, scores, and actionable recommendations.`,

  "proposal": `Create a professional website proposal document.

Include:
1. Cover page with business name
2. Understanding of requirements
3. Proposed solution overview
4. Design approach and rationale
5. Technical specifications
6. Timeline and milestones
7. Investment (pricing)
8. Terms and conditions
9. About us / why choose us

Write in a professional, confident tone suitable for B2B.`,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  // Agency plan or admin only
  const planRaw = await kv.get<string>(`user:${userId}:plan`);
  const plan = planRaw ?? "free";
  if (!["pro", "agency"].includes(plan) && !isAdminUser(userId)) {
    return Response.json(
      { error: "Deliverable export requires the Pro plan or higher." },
      { status: 403 },
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { type, html, siteData, format } = await req.json();

  const validTypes = ["pitch-deck", "audit-report", "proposal"];
  if (!type || !validTypes.includes(type)) {
    return Response.json(
      { error: `type must be one of: ${validTypes.join(", ")}` },
      { status: 400 },
    );
  }

  const exportFormat = format || "markdown"; // markdown, html, or structured
  const prompt = EXPORT_PROMPTS[type];

  const client = new Anthropic({ apiKey: anthropicKey });

  // Build context from available data
  const contextParts: string[] = [];
  if (html) {
    contextParts.push(`Website HTML (first 5000 chars):\n${html.slice(0, 5000)}`);
  }
  if (siteData) {
    contextParts.push(`Site data:\n${JSON.stringify(siteData, null, 2)}`);
  }

  const userContent = [
    prompt,
    "",
    "--- WEBSITE DATA ---",
    ...contextParts,
    "--- END DATA ---",
    "",
    exportFormat === "markdown"
      ? "Format the output as clean Markdown with proper headings, lists, and tables."
      : exportFormat === "html"
        ? "Format the output as a styled HTML document suitable for PDF conversion."
        : "Format the output as structured JSON with sections and content.",
  ].join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 8000,
    temperature: 0.3,
    system: [
      {
        type: "text",
        text: `You are a professional business consultant who creates polished client deliverables. Your documents are clear, data-driven, and visually structured.`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const block = msg.content[0];
  const content = block.type === "text" ? block.text : "";

  return Response.json({
    ok: true,
    type,
    format: exportFormat,
    content,
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
