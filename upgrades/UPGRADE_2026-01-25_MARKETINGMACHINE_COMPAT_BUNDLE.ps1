Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$m) { throw "ERROR: $m" }

if (-not (Test-Path -LiteralPath ".\package.json")) {
  Fail "Run this from your repo root (the folder that contains package.json)."
}

function WriteUtf8NoBom([string]$path, [string]$content) {
  $dir = Split-Path -Parent $path
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

function AppendIfMissing([string]$path, [string]$needleRegex, [string]$appendBlock) {
  if (-not (Test-Path -LiteralPath $path)) { Fail "Missing file: $path" }
  $txt = Get-Content -LiteralPath $path -Raw
  if ($txt -match $needleRegex) {
    Write-Host "OK: already present -> $path" -ForegroundColor DarkGreen
    return
  }
  $new = ($txt.TrimEnd() + "`r`n" + $appendBlock.Trim() + "`r`n")
  WriteUtf8NoBom $path $new
  Write-Host "UPDATED: $path" -ForegroundColor Green
}

# Paths
$mmDir = ".\src\lib\marketingMachine"
$kvPath = Join-Path $mmDir "kv.ts"
$utilsPath = Join-Path $mmDir "utils.ts"
$keysPath = Join-Path $mmDir "keys.ts"
$genPath = Join-Path $mmDir "generate.ts"

# ------------------------------------------------------------
# 1) kv.ts: force correct startsWith (overwrite ONLY if broken)
# ------------------------------------------------------------
if (Test-Path -LiteralPath $kvPath) {
  $kvTxt = Get-Content -LiteralPath $kvPath -Raw
  if ($kvTxt -match '\.StartsWith\(') {
    $kvTxt = $kvTxt -replace '\.StartsWith\(', '.startsWith('
    WriteUtf8NoBom $kvPath $kvTxt
    Write-Host "FIXED: StartsWith -> startsWith in kv.ts" -ForegroundColor Green
  } else {
    Write-Host "OK: kv.ts casing fine" -ForegroundColor DarkGreen
  }
} else {
  Fail "Missing: $kvPath"
}

# ------------------------------------------------------------
# 2) utils.ts: ensure randomId + uniq exist
# ------------------------------------------------------------
AppendIfMissing $utilsPath 'export\s+function\s+randomId\s*\(' @'
/**
 * Compatibility export: publisher/store expect randomId().
 * Alias to shortId() if present, otherwise generate inline.
 */
export function randomId(prefix = "mm"): string {
  // prefer shortId if it exists
  // @ts-ignore
  if (typeof shortId === "function") return shortId(prefix);
  const rnd = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rnd}`;
}
'@

AppendIfMissing $utilsPath 'export\s+function\s+uniq\s*<' @'
/**
 * Compatibility export: store.ts expects uniq().
 * De-dupe preserving first-seen order.
 */
export function uniq<T>(arr: T[]): T[] {
  const out: T[] = [];
  const seen = new Set<unknown>();
  for (const v of arr ?? []) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}
'@

# ------------------------------------------------------------
# 3) keys.ts: ensure Keys object includes campaign keys
# ------------------------------------------------------------
if (-not (Test-Path -LiteralPath $keysPath)) { Fail "Missing: $keysPath" }
$kTxt = Get-Content -LiteralPath $keysPath -Raw

if ($kTxt -notmatch 'export\s+const\s+Keys\s*=') {
  Fail "keys.ts does not contain 'export const Keys = {...}'. Paste keys.ts here if needed."
}

# If Keys exists but missing campaign/campaignIndex, patch them in.
if (($kTxt -notmatch 'campaign\s*:\s*\(') -or ($kTxt -notmatch 'campaignIndex\s*:')) {
  # Insert members before the closing "};" of Keys object (best-effort)
  $kTxt2 = $kTxt -replace '(export\s+const\s+Keys\s*=\s*\{[\s\S]*?)(\s*\};)', ('$1' + @'

  // Campaign storage keys (store.ts compatibility)
  campaign: (id: string) => `${MM_PREFIX}campaign:${id}`,
  campaignIndex: () => `${MM_PREFIX}campaign:index`,

  // Extra safe keys (won't hurt if unused; prevents future missing members)
  post: (id: string) => `${MM_PREFIX}post:${id}`,
  postIndex: () => `${MM_PREFIX}post:index`,
  log: (id: string) => `${MM_PREFIX}log:${id}`,
  logIndex: () => `${MM_PREFIX}log:index`,
'@ + '$2')
  WriteUtf8NoBom $keysPath $kTxt2
  Write-Host "UPDATED: keys.ts (added campaign/campaignIndex + extras)" -ForegroundColor Green
} else {
  Write-Host "OK: Keys already has campaign + campaignIndex" -ForegroundColor DarkGreen
}

# ------------------------------------------------------------
# 4) generate.ts: ensure generateContentForCampaign exists
# ------------------------------------------------------------
AppendIfMissing $genPath 'generateContentForCampaign' @'
/**
 * Compatibility export: store.ts expects generateContentForCampaign().
 * Deterministic stub output for build safety.
 */
export type CampaignInput = {
  campaignId?: string;
  topic?: string;
  intent?: string;
  slugs?: string[];
};

export type GeneratedContentItem = {
  slug: string;
  title: string;
  description: string;
  html: string;
  spec: any;
};

export async function generateContentForCampaign(input: CampaignInput): Promise<GeneratedContentItem[]> {
  // @ts-ignore
  const makeSlug = (s: string) => (typeof slugify === "function" ? slugify(s) : s);
  // @ts-ignore
  const makeTitle = (s: string) => (typeof toTitle === "function" ? toTitle(s) : s);

  const slugs = (input?.slugs?.length ? input.slugs : [
    input?.topic ? makeSlug(input.topic) : "wow-website-builder",
    "templates",
    "use-cases"
  ]);

  return slugs.map((s) => {
    // @ts-ignore
    const spec = (typeof generateMarketingPageSpec === "function")
      ? generateMarketingPageSpec({ slug: s, title: makeTitle(s), description: input?.topic ? `Campaign (stub) for: ${input.topic}` : "Campaign stub content" })
      : { slug: s, title: makeTitle(s), description: "Campaign stub content" };

    const html = `
      <main style="font-family:system-ui;padding:40px;max-width:900px;margin:0 auto;">
        <h1>${spec.title}</h1>
        <p>${spec.description}</p>
        <hr />
        <p><strong>Note:</strong> Deterministic stub output (build-safe).</p>
      </main>
    `.trim();

    return { slug: s, title: spec.title, description: spec.description, html, spec };
  });
}
'@

Write-Host ""
Write-Host "DONE: MarketingMachine compatibility bundle applied." -ForegroundColor Green
