/* C31_SALVAGE_WRAPPER_INSTALLED
   Goal: avoid contract_fail when model output is almost-correct.
   Strategy:
   - Prefer a single ```powershell fence
   - If missing/messy: salvage PowerShell-looking lines and auto-wrap into one fence
*/

function __c31_countFences(raw: string): number {
  const m = raw.match(/```/g);
  return m ? m.length : 0;
}

function __c31_extractBestFencedPowerShell(raw: string): string | null {
  // Accept ```powershell, ```pwsh, ```ps1 (case-insensitive)
  const re = /```(?:powershell|pwsh|ps1)\s*([\s\S]*?)```/gi;
  let best: string | null = null;
  let bestLen = -1;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    const body = (match[1] || "").trim();
    if (body.length > bestLen) {
      bestLen = body.length;
      best = body;
    }
  }
  return best && bestLen > 0 ? best : null;
}

function __c31_looksLikePowerShellLine(line: string): boolean {
  const s = line.trim();
  if (!s) return false;

  // obvious prose markers to skip
  if (/^(here'?s|summary:|notes:|explanation:|i will|we will|plan:)/i.test(s)) return false;

  // common PowerShell starters / verbs
  if (/^(Set-StrictMode|\$ErrorActionPreference|\$ProgressPreference|function\s+\w+|param\s*\(|if\s*\(|foreach\s*\(|for\s*\(|while\s*\(|try\s*\{|catch\s*\{|throw\s+|Write-Host|Write-Output|New-Item|Remove-Item|Copy-Item|Move-Item|Get-Content|Set-Content|Add-Content|Out-File|Invoke-RestMethod|Invoke-WebRequest|Start-Process|Expand-Archive|Compress-Archive|git\s+|vercel\s+|npm\s+|node\s+|curl\.exe)/i.test(s)) return true;

  // assignments / paths / comments
  if (/^\$[A-Za-z_][A-Za-z0-9_]*\s*=/.test(s)) return true;
  if (/^\.\\/.test(s)) return true;
  if (/^#/.test(s)) return true;

  return false;
}

function __c31_salvagePowerShell(raw: string): string | null {
  const lines = raw.split(/\r?\n/);
  const kept: string[] = [];
  for (const line of lines) {
    if (__c31_looksLikePowerShellLine(line)) kept.push(line);
  }

  // Require real code signal (not just comments)
  const signal = kept.filter(l => {
    const t = l.trim();
    return t && !t.startsWith("#");
  }).length;

  if (signal < 4) return null;

  return ["```powershell", ...kept, "```"].join("\n");
}

function __c31_normalizeToSingleFence(raw: string): { ok: boolean; text: string; reason?: string } {
  // 1) If there is a good fenced PS block, use the largest one.
  const best = __c31_extractBestFencedPowerShell(raw);
  if (best) {
    return { ok: true, text: ["```powershell", best, "```"].join("\n") };
  }

  // 2) Otherwise salvage PowerShell-looking lines and wrap them.
  const salvaged = __c31_salvagePowerShell(raw);
  if (salvaged) {
    return { ok: true, text: salvaged };
  }

  // 3) Nothing usable
  return { ok: false, text: raw, reason: "missing_or_multiple_powershell_fences" };
}
/* =========================================================
 * INSTALL C3 â€” STRICT PER-AGENT TASK MODE (BUNDLE)
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