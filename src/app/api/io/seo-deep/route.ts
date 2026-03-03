/**
 * POST /api/io/seo-deep
 * Premium deep SEO agent — comprehensive analysis including:
 *   - Competitive keyword analysis
 *   - Content strategy with topic clusters
 *   - Technical SEO deep-dive
 *   - Local SEO recommendations
 *   - Content calendar (30-day)
 *   - Backlink strategy
 *   - Schema markup recommendations
 *
 * Costs 5 credits (seo-deep agent). Pro+ plan required. Admin bypass.
 */
import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredits, isAdminUser } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminUser(userId)) {
    const check = await checkAndConsumeCredits(userId, "seo-deep");
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message, code: check.code, balance: check.balance },
        { status: check.code === "NO_ACCESS" ? 403 : 402 },
      );
    }
  }

  let html: string;
  let businessInfo: string | undefined;
  let targetKeywords: string | undefined;
  try {
    const body = await req.json();
    html = body.html;
    businessInfo = body.businessInfo;
    targetKeywords = body.targetKeywords;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!html?.trim()) {
    return NextResponse.json({ error: "HTML required" }, { status: 400 });
  }

  const truncated = html.length > 12000 ? html.slice(0, 12000) + "\n<!-- truncated -->" : html;

  const systemPrompt = `You are a senior SEO strategist with 15 years of experience ranking sites on Google. Provide a comprehensive, actionable SEO audit and growth strategy.

Respond with a single valid JSON object:
{
  "overallScore": 0-100,
  "grade": "A+/A/B+/B/C/D/F",
  "executiveSummary": "2-3 sentence overview",
  "technicalSeo": {
    "score": 0-100,
    "issues": [{ "severity": "critical/warning/info", "issue": "Description", "fix": "How to fix", "impact": "High/Medium/Low" }],
    "strengths": ["What's done well"]
  },
  "contentStrategy": {
    "primaryKeywords": [{ "keyword": "keyword phrase", "difficulty": "Easy/Medium/Hard", "searchVolume": "High/Medium/Low", "priority": 1-5 }],
    "topicClusters": [{ "pillar": "Main topic", "subtopics": ["related articles to write"], "estimatedTraffic": "Potential monthly visitors" }],
    "contentGaps": ["Missing content opportunities"]
  },
  "localSeo": {
    "applicable": true/false,
    "recommendations": ["Specific local SEO actions"]
  },
  "backlinkStrategy": {
    "currentProfile": "Assessment of existing link signals",
    "opportunities": [{ "type": "Guest post/Directory/Partnership/PR", "target": "Specific suggestion", "difficulty": "Easy/Medium/Hard" }]
  },
  "schemaMarkup": {
    "existing": ["Already implemented"],
    "recommended": [{ "type": "Organization/Product/FAQ/HowTo/etc", "reason": "Why add this", "impact": "Expected benefit" }]
  },
  "contentCalendar": [
    { "week": 1, "topic": "Article/page title", "type": "Blog/Landing/Guide", "targetKeyword": "keyword", "notes": "Brief" }
  ],
  "quickWins": ["5-8 things to do THIS WEEK for immediate improvement"],
  "competitorInsights": ["3-5 observations about likely competitors and how to outrank them"]
}`;

  const userMsg = `Perform a comprehensive SEO audit and strategy for this website HTML:\n\n${truncated}${businessInfo ? `\n\nBusiness info: ${businessInfo}` : ""}${targetKeywords ? `\n\nTarget keywords: ${targetKeywords}` : ""}`;

  try {
    let content = "";

    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.2,
      });
      const block = msg.content[0];
      content = block.type === "text" ? block.text : "";
    } else if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        max_tokens: 4096,
        temperature: 0.2,
      });
      content = resp.choices[0]?.message?.content ?? "";
    } else {
      return NextResponse.json({ error: "No AI key configured" }, { status: 503 });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
