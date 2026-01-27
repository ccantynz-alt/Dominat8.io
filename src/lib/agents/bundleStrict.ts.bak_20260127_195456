/* =========================================================
 * INSTALL C3 — STRICT PER-AGENT TASK MODE (BUNDLE)
 * File: src/lib/agents/bundleStrict.ts
 * ========================================================= */

export type StrictTaskSpec = {
  agentId: string;
  title: string;
  task: string; // small, finishable, code-only
};

export const STRICT_STEP_MAX_OUTPUT_TOKENS = 1600;

export function buildStrictSystemPrompt(): string {
  return [
    "You are an engineering agent inside Dominat8's Bundle Runner.",
    "",
    "HARD OUTPUT CONTRACT (NON-NEGOTIABLE):",
    "1) Output MUST be EXACTLY one fenced code block: ```powershell ... ```",
    "2) Output MUST contain ONLY PowerShell code. No prose. No markdown. No explanation.",
    "3) The PowerShell MUST be runnable on Windows PowerShell and must be copy/paste safe.",
    "4) The PowerShell MUST make ONLY small, safe, concrete changes.",
    "5) The PowerShell MUST end by writing proof artifact:",
    "   Set-Content -LiteralPath '.\\PATCH_BUNDLE_VERIFY.txt' -Value 'BUNDLE_OK' -Encoding utf8",
    "",
    "If you cannot comply, output ONLY this exact empty powershell block:",
    "```powershell",
    "# CONTRACT_FAIL",
    "```",
  ].join("\n");
}

export function buildStrictUserPrompt(goal: string, spec: StrictTaskSpec): string {
  const g = (goal || "").trim() || "Polish the marketing homepage slightly with safe UI improvements.";
  return [
    "BUNDLE GOAL (high level):",
    g,
    "",
    "YOUR ONE SMALL TASK (must finish):",
    `Agent: ${spec.agentId}`,
    `Title: ${spec.title}`,
    spec.task,
    "",
    "REQUIREMENTS:",
    "- Make ONLY the smallest change needed to complete the task.",
    "- Do not refactor unrelated code.",
    "- Do not include any commentary outside the PowerShell code block.",
    "- The patch must be safe to apply and must not break TypeScript build.",
    "",
    "REMEMBER: output exactly one ```powershell``` block only.",
  ].join("\n");
}

export function extractSinglePowershellFence(text: string): { ok: boolean; code: string; reason?: string } {
  const t = (text || "").trim();

  // Accept only one powershell fence
  const re = /```powershell\s*([\s\S]*?)\s*```/g;
  const matches: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    matches.push(m);
    if (matches.length > 2) break;
  }

  if (matches.length !== 1) {
    return { ok: false, code: "", reason: "missing_or_multiple_powershell_fences" };
  }

  // Must be ONLY that fence (no leading/trailing content)
  const only = matches[0][0].trim();
  if (only !== t) {
    return { ok: false, code: "", reason: "content_outside_fence" };
  }

  const code = (matches[0][1] || "").trim();
  if (!code) return { ok: false, code: "", reason: "empty_code" };

  return { ok: true, code };
}