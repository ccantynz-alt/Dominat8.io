/**
 * AI Email Classifier + Auto-Responder
 *
 * Uses Claude to:
 *   1. Classify incoming emails by category + priority
 *   2. Search the knowledge base for relevant articles
 *   3. Draft a personalized response
 *   4. Score confidence — auto-send if > 0.85, queue for review otherwise
 *
 * Tone: Friendly, helpful, concise. Never robotic or overly formal.
 * Brand voice: Confident, approachable, slightly casual. Like a smart friend.
 */

import Anthropic from "@anthropic-ai/sdk";
import { kv } from "@vercel/kv";
import {
  searchKnowledgeBase,
  formatKBForPrompt,
  type SupportCategory,
  type SupportPriority,
} from "./support-kb";

export interface ClassificationResult {
  category: SupportCategory;
  priority: SupportPriority;
  tags: string[];
  summary: string;
  draftResponse: string;
  confidence: number;
  shouldAutoSend: boolean;
  reasoning: string;
}

const CLASSIFIER_SYSTEM_PROMPT = `You are the AI support agent for Dominat8.io, an AI website builder.

Your job:
1. Classify the incoming customer email
2. Draft a helpful, accurate response using ONLY the knowledge base provided
3. Score your confidence in the response

CLASSIFICATION:
- category: "billing" | "technical" | "account" | "feature" | "bug" | "general"
- priority: "low" (general questions) | "medium" (needs help) | "high" (blocked/frustrated) | "urgent" (billing error, data loss, security)

RESPONSE GUIDELINES:
- Be warm and human. Sign off as "The Dominat8 Team"
- Keep it concise — 2-4 short paragraphs max
- Include specific steps/instructions when applicable
- If you're not sure about something, be honest and say you'll escalate
- Never make up features or pricing that aren't in the knowledge base
- For billing issues, always suggest contacting hello@dominat8.io for manual help
- For bug reports, acknowledge the issue and ask for repro steps if not provided
- For feature requests, thank them and note it's been logged

CONFIDENCE SCORING:
- 0.9-1.0: Answer is clearly correct based on KB, no ambiguity
- 0.7-0.89: Likely correct but some interpretation needed
- 0.5-0.69: Partially answerable, may need human review
- Below 0.5: Can't answer reliably, needs human escalation

AUTO-SEND RULES:
- shouldAutoSend = true ONLY if confidence >= 0.85 AND category is NOT "billing" AND priority is NOT "urgent"
- Billing and urgent tickets ALWAYS go to human review regardless of confidence

Return ONLY valid JSON:
{
  "category": "...",
  "priority": "...",
  "tags": ["..."],
  "summary": "One-sentence summary of the customer's issue",
  "draftResponse": "The full email response to send",
  "confidence": 0.0-1.0,
  "shouldAutoSend": true/false,
  "reasoning": "Brief explanation of why you classified and responded this way"
}`;

export async function classifyAndDraft(
  senderEmail: string,
  senderName: string | null,
  subject: string,
  body: string,
): Promise<ClassificationResult> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  // Search KB for relevant articles
  const searchQuery = `${subject} ${body}`.slice(0, 500);
  const relevantArticles = searchKnowledgeBase(searchQuery);
  const kbContext = formatKBForPrompt(relevantArticles);

  // Look up user info if they're a known customer
  let userContext = "";
  const userIdByEmail = await kv.get<string>(`support:email-to-user:${senderEmail}`);
  if (userIdByEmail) {
    const plan = await kv.get<string>(`user:${userIdByEmail}:plan`);
    userContext = `\n\nKNOWN CUSTOMER:\n- Plan: ${plan ?? "free"}\n- User ID: ${userIdByEmail}`;
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    temperature: 0.1,
    system: [
      {
        type: "text",
        text: CLASSIFIER_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          "KNOWLEDGE BASE:",
          kbContext || "(no matching articles found)",
          userContext,
          "",
          "--- INCOMING EMAIL ---",
          `From: ${senderName ? `${senderName} <${senderEmail}>` : senderEmail}`,
          `Subject: ${subject}`,
          "",
          body,
          "--- END EMAIL ---",
          "",
          "Classify this email and draft a response. Return JSON only.",
        ].join("\n"),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "support_classification",
        schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["billing", "technical", "account", "feature", "bug", "general"] },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
            tags: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            draftResponse: { type: "string" },
            confidence: { type: "number" },
            shouldAutoSend: { type: "boolean" },
            reasoning: { type: "string" },
          },
          required: ["category", "priority", "tags", "summary", "draftResponse", "confidence", "shouldAutoSend", "reasoning"],
        },
        strict: true,
      },
    },
  } as unknown as Anthropic.MessageCreateParamsNonStreaming);

  const block = msg.content[0];
  const raw = block.type === "text" ? block.text : "{}";
  const result = JSON.parse(raw) as ClassificationResult;

  // Safety: enforce auto-send rules regardless of what the model says
  if (result.category === "billing" || result.priority === "urgent") {
    result.shouldAutoSend = false;
  }
  if (result.confidence < 0.85) {
    result.shouldAutoSend = false;
  }

  return result;
}
