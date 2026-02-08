param(
  [Parameter(Mandatory=$true)][string]$RepoRoot,
  [Parameter(Mandatory=$true)][string]$Repo
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN " + $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL " + $m) -ForegroundColor Red; throw $m }

if (-not (Test-Path -LiteralPath (Join-Path $RepoRoot ".git"))) { Fail "RepoRoot not a git repo: $RepoRoot" }

# This is an intentionally SAFE stub:
# - It does NOT attempt LLM patching.
# - It ONLY opens a PR that re-runs a clean build baseline (touch file) if recent runs are failing.
# Later you can swap in PatchPack logic.

if (-not $env:GH_TOKEN) {
  Warn "GH_TOKEN not set. Exiting (no-op)."
  exit 0
}

# Ensure gh exists
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) { Warn "gh not found on runner (unexpected). Exiting."; exit 0 }

Push-Location -LiteralPath $RepoRoot
try {
  Ok "Checking recent runs"
  $runsJson = gh run list -R $Repo --limit 10 --json databaseId,status,conclusion,workflowName,createdAt,htmlUrl 2>$null
  if (-not $runsJson) { Warn "No runs returned. Exiting."; exit 0 }
  $runs = $runsJson | ConvertFrom-Json

  $bad = $runs | Where-Object { $_.conclusion -in @("failure","cancelled","timed_out") } | Select-Object -First 1
  if (-not $bad) {
    Ok "No failing runs detected (last 10). Exiting."
    exit 0
  }

  Warn ("Detected failing run: {0} ({1}) {2}" -f $bad.workflowName, $bad.conclusion, $bad.htmlUrl)

  # Create a tiny branch and PR that bumps a stamp file (forces clean pipeline + creates a place to attach future patches)
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $branch = "self-heal/047b/$stamp"

  Ok "Creating branch $branch"
  git checkout -b $branch | Out-Null

  $stampPath = Join-Path $RepoRoot "tools\doctor\SELF_HEAL_STAMP.txt"
  New-Item -ItemType Directory -Path (Split-Path -Parent $stampPath) -Force | Out-Null
  Set-Content -LiteralPath $stampPath -Value ("SELF_HEAL_047B " + $stamp) -Encoding UTF8

  git add $stampPath | Out-Null
  git commit -m ("chore(self-heal): stamp " + $stamp) | Out-Null
  git push -u origin $branch | Out-Null

  Ok "Opening PR"
  $title = "047B self-heal stub: baseline stamp ($stamp)"
  $body  = @"
Detected failing run: $($bad.workflowName)
Conclusion: $($bad.conclusion)
Run: $($bad.htmlUrl)

This PR is a SAFE placeholder: it creates an anchor PR for attaching PatchPacks later.
"@
  gh pr create -R $Repo -t $title -b $body | Out-Null

  Ok "PR created."
}
finally {
  Pop-Location
}