import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

/**
 * Code Execution Tool — Validate Generated HTML/CSS/JS
 *
 * Uses Claude's sandboxed code execution environment to:
 *   1. Parse HTML for syntax errors
 *   2. Validate CSS properties
 *   3. Check JavaScript for runtime errors
 *   4. Test responsive breakpoints via DOM measurement
 *   5. Validate links and anchors
 *   6. Check accessibility attributes
 *
 * The sandbox runs Node.js 18 so we can use jsdom, css-tree, etc.
 * This catches errors BEFORE the user sees the site.
 *
 * Cost: Free when used with web search/fetch, otherwise ~$0.05/hr
 * after 50 free hours/org/day (we'll almost never exceed that).
 */

const VALIDATE_PROMPT = `You have access to a code execution sandbox. Validate this HTML website for errors.

Write and execute code to check:

1. **HTML Validity**: Parse the HTML and check for:
   - Unclosed tags
   - Invalid nesting (e.g. <p> inside <p>)
   - Missing required attributes (img alt, a href)
   - Duplicate IDs
   - Missing doctype, html, head, body

2. **CSS Validation**: Extract all <style> content and check for:
   - Invalid property names
   - Invalid values
   - Missing units (e.g. "width: 100" instead of "width: 100px")
   - Undefined CSS variables
   - Vendor prefix consistency

3. **JavaScript Safety**: Extract all <script> content and check for:
   - Syntax errors (try parsing with new Function())
   - Console.error calls
   - Undefined variable references
   - Missing error handling in event listeners

4. **Link Check**: Extract all href/src attributes and check for:
   - Empty hrefs
   - javascript:void(0) links
   - Broken internal anchors (#id that don't exist)
   - Missing mailto/tel formatting

5. **Accessibility Quick Check**:
   - All images have alt attributes
   - Form inputs have labels
   - Buttons have accessible text
   - Heading hierarchy (h1 → h2 → h3, no skips)
   - Lang attribute on <html>

Return a JSON object with your findings:
{
  "valid": true/false,
  "score": 0-100,
  "errors": [{"type": "html|css|js|link|a11y", "severity": "error|warning", "message": "...", "line": N}],
  "stats": {"elements": N, "cssRules": N, "scripts": N, "links": N, "images": N}
}`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { html } = await req.json();
  if (!html?.trim()) {
    return Response.json({ error: "html required" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  // Use Claude with code execution tool to validate the HTML
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 4000,
    temperature: 0,
    system: VALIDATE_PROMPT,
    messages: [
      {
        role: "user",
        content: `Validate this HTML website:\n\n${html.slice(0, 40000)}`,
      },
    ],
    tools: [
      {
        type: "code_execution_20250825",
        name: "code_execution",
      } as Anthropic.Tool,
    ],
  });

  // Extract results from the response
  const textBlocks: string[] = [];
  const codeResults: Array<{ code: string; output: string }> = [];

  for (const block of msg.content) {
    if (block.type === "text") {
      textBlocks.push(block.text);
    } else if (block.type === "server_tool_use" || block.type === "tool_use") {
      // Code execution tool was called
      const input = (block as Record<string, unknown>).input as Record<string, string> | undefined;
      if (input?.code) {
        codeResults.push({ code: input.code, output: "" });
      }
    } else if (block.type === "server_tool_result" || block.type === "tool_result") {
      // Code execution result
      const content = (block as Record<string, unknown>).content;
      if (typeof content === "string" && codeResults.length > 0) {
        codeResults[codeResults.length - 1].output = content;
      }
    }
  }

  const fullText = textBlocks.join("\n");
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  const validation = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: fullText };

  return Response.json({
    ok: true,
    validation,
    codeExecutionUsed: codeResults.length > 0,
    codeResults,
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
