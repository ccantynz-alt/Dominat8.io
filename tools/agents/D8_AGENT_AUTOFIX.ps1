param(
  [Parameter(Mandatory=$true)]
  [string] $RepoRoot
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN " + $m) -ForegroundColor Yellow }

function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Write-Utf8NoBom([string]$Path,[string]$Content){
  Ensure-Dir -p (Split-Path -Parent $Path)
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path,$Content,$enc)
}

Set-Location -LiteralPath $RepoRoot

# Detect routing root
$hasApp = Test-Path -LiteralPath (Join-Path $RepoRoot "app")
$hasSrcApp = Test-Path -LiteralPath (Join-Path $RepoRoot "src\app")

$routerRoot = $null
if ($hasApp -and -not $hasSrcApp) { $routerRoot = "app" }
elseif ($hasSrcApp -and -not $hasApp) { $routerRoot = "src\app" }
elseif ($hasSrcApp -and $hasApp) {
  # Prefer src/app if it already contains /tv
  if (Test-Path -LiteralPath (Join-Path $RepoRoot "src\app\tv")) { $routerRoot = "src\app" } else { $routerRoot = "app" }
} else {
  # default to src/app for modern setups
  $routerRoot = "src\app"
  Ensure-Dir -p (Join-Path $RepoRoot $routerRoot)
}
Ok ("RouterRoot: " + $routerRoot)

function Ensure-TvPage([string]$slug,[string]$stamp){
  $p = Join-Path $RepoRoot (Join-Path $routerRoot (Join-Path $slug "page.tsx"))
  $c = @"
export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: ""system-ui, -apple-system, Segoe UI, Roboto, Arial"" }}>
      <h1>/$slug</h1>
      <p>Stamp: $stamp</p>
      <p><a href=""/tv"">Go to /tv</a></p>
    </main>
  );
}
"@
  Write-Utf8NoBom -Path $p -Content $c
  Ok ("Ensured: " + $p)
}

Ensure-TvPage -slug "tv-glass" -stamp "TV_GLASS_OK"
Ensure-TvPage -slug "tv-sci" -stamp "TV_SCI_OK"
Ensure-TvPage -slug "tv-enterprise" -stamp "TV_ENTERPRISE_OK"

# Ensure src/middleware.ts allows /tv-* if file exists
$mw = Join-Path $RepoRoot "src\middleware.ts"
if (Test-Path -LiteralPath $mw) {
  $raw = Get-Content -LiteralPath $mw -Raw
  if ($raw -notmatch "/tv-glass") {
    $needle = "/tv/*"
    if ($raw -match [Regex]::Escape($needle)) {
      $insert = @"
  || pathname === ""/tv-glass"" || pathname.startsWith(""/tv-glass/"")
  || pathname === ""/tv-sci"" || pathname.startsWith(""/tv-sci/"")
  || pathname === ""/tv-enterprise"" || pathname.startsWith(""/tv-enterprise/"")
"@
      $lines = $raw -split "`r?`n"
      $out = New-Object System.Collections.Generic.List[string]
      $did = $false
      for ($i=0; $i -lt $lines.Length; $i++) {
        $out.Add($lines[$i])
        if (-not $did -and $lines[$i] -match [Regex]::Escape($needle)) {
          ($insert -split "`r?`n") | ForEach-Object { $out.Add($_) }
          $did = $true
        }
      }
      $raw2 = ($out -join "`r`n")
      Write-Utf8NoBom -Path $mw -Content $raw2
      Ok "Patched src/middleware.ts allow-list for /tv-*"
    } else {
      Warn "src/middleware.ts does not contain /tv/* pattern; skipped patch"
    }
  } else {
    Ok "src/middleware.ts already references /tv-glass"
  }
} else {
  Warn "src/middleware.ts not found"
}

# Drop a stamp file for build proof
$stampPath = Join-Path $RepoRoot "public\d8_agent_stamp.txt"
Ensure-Dir -p (Split-Path -Parent $stampPath)
Write-Utf8NoBom -Path $stampPath -Content ("D8_AGENT_AUTOFIX_OK " + (Get-Date).ToString("s"))
Ok ("Wrote stamp: " + $stampPath)