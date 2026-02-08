# D8_IO_MEGA_DOCTOR_ALLINONE_013.ps1
# One-shot: create IO API routes + fix loop (PS5) + commit/push main + force Vercel prod deploy + prove endpoints
# Run from: C:\Temp\FARMS\Dominat8.io-clone

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

function Write-Utf8NoBom {
  param([Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Content)
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    $null = New-Item -ItemType Directory -Path $dir -Force
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-IfExists([string]$Path){
  if (Test-Path -LiteralPath $Path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $Path -Destination ($Path + ".bak_" + $ts) -Force
    Info "Backup: $($Path + ".bak_" + $ts)"
  }
}

# ---------------------------
# 0) Lock PWD to repo root
# ---------------------------
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoRoot
Info "Locked PWD: $(Get-Location)"

if (-not (Test-Path -LiteralPath ".\package.json")) { Fail "package.json missing. You are not in Dominat8.io repo." }
try { $null = git rev-parse --is-inside-work-tree 2>$null } catch { Fail "Not a git repo." }
try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

# ---------------------------
# 1) Ensure main branch
# ---------------------------
git checkout main | Out-Null
git pull origin main | Out-Null

$Stamp = "D8_IO_MEGA_013_{0}" -f (Get-Date -Format "yyyyMMdd_HHmmss")
$Sha = (git rev-parse HEAD).Trim()
Ok "Stamp: $Stamp"
Ok "Git SHA: $Sha"

# ---------------------------
# 2) Ensure /io proof page exists (src/app)
# ---------------------------
$ioPath = ".\src\app\io\page.tsx"
Backup-IfExists $ioPath

$ioPage = @"
export const dynamic = "force-dynamic";

export default function IOCockpit() {
  const STAMP = "${Stamp}";
  const SHA = "${Sha}";
  return (
    <main style={{minHeight:"100vh", background:"#000", color:"#fff", padding:24}}>
      <div style={{position:"fixed", top:10, right:12, fontSize:11, opacity:0.75, zIndex:999999}}>
        PROOF: {STAMP}
      </div>
      <h1 style={{fontSize:28, margin:0}}>Dominat8 IO — Cockpit</h1>
      <p style={{opacity:0.85, marginTop:10, maxWidth:900}}>
        If you see this, the /io route exists and is rendering from the active Next.js app tree.
      </p>
      <div style={{marginTop:18, opacity:0.75, fontSize:12}}>
        <div>Stamp: {STAMP}</div>
        <div>Git: {SHA}</div>
        <div>Path: /io</div>
      </div>
      <pre style={{marginTop:16, background:"rgba(255,255,255,0.06)", padding:12, borderRadius:10, overflowX:"auto"}}>
PROOF: {STAMP}
      </pre>
    </main>
  );
}
"@
Write-Utf8NoBom -Path $ioPath -Content $ioPage
Ok "Wrote: $ioPath"

# ---------------------------
# 3) Create API routes (src/app/api/io/*)
# ---------------------------
$healthPath = ".\src\app\api\io\health\route.ts"
$pingPath   = ".\src\app\api\io\ping\route.ts"
$statePath  = ".\src\app\api\io\state\route.ts"

Backup-IfExists $healthPath
Backup-IfExists $pingPath
Backup-IfExists $statePath

$health = @"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const body = {
    ok: true,
    service: "dominat8io",
    component: "io-health",
    stamp: "${Stamp}",
    git_sha: "${Sha}",
    time: new Date().toISOString()
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-d8-proof": "${Stamp}",
      "x-d8-git-sha": "${Sha}"
    }
  });
}
"@

$ping = @"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("PONG: ${Stamp}`n", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-d8-proof": "${Stamp}"
    }
  });
}
"@

$state = @"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const body = {
    ok: true,
    stamp: "${Stamp}",
    git_sha: "${Sha}",
    time: new Date().toISOString(),
    routes: {
      "/io": true,
      "/api/io/health": true,
      "/api/io/ping": true,
      "/api/io/state": true
    }
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-d8-proof": "${Stamp}",
      "x-d8-git-sha": "${Sha}"
    }
  });
}
"@

Write-Utf8NoBom -Path $healthPath -Content $health
Write-Utf8NoBom -Path $pingPath   -Content $ping
Write-Utf8NoBom -Path $statePath  -Content $state
Ok "Wrote: $healthPath"
Ok "Wrote: $pingPath"
Ok "Wrote: $statePath"

# ---------------------------
# 4) Fix loop script (PS 5.1 safe)
# ---------------------------
$loopPath = ".\D8_IO_AUTO_LOOP_DOCTOR_011.ps1"
Backup-IfExists $loopPath

$loop = @'
# D8_IO_AUTO_LOOP_DOCTOR_011.ps1 (PS 5.1 SAFE)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$BaseUrl = "https://dominat8.io",
  [int]$LoopSleepSeconds = 8,
  [int]$HttpTimeoutSeconds = 20
)

function Epoch(){ return [int](Get-Date -UFormat %s) }

while ($true) {
  try {
    $ts = Epoch
    $u  = "$BaseUrl/api/io/health?ts=$ts"

    $raw = & curl.exe -s -S --max-time "$HttpTimeoutSeconds" -D - "$u"
    if ($LASTEXITCODE -ne 0 -or -not $raw) {
      Write-Host ("RED   {0} curl_failed" -f (Get-Date -Format "HH:mm:ss")) -ForegroundColor Red
    } else {
      $parts = $raw -split "(`r`n`r`n|`n`n)", 2
      $hdrs  = $parts[0]
      $body  = ""
      if ($parts.Count -ge 2) { $body = $parts[1] }

      $code = $null
      $first = ($hdrs -split "(`r`n|`n)")[0]
      if ($first -match "HTTP\/\d+\.\d+\s+(\d{3})") { $code = [int]$Matches[1] }

      $proof = ""
      foreach ($line in ($hdrs -split "(`r`n|`n)")) {
        if ($line -match "^(x-d8-proof)\s*:\s*(.+)$") { $proof = $Matches[2].Trim() }
      }

      $jsonOk = ($body -match '"ok"\s*:\s*true')

      if ($code -eq 200 -and $jsonOk -and $proof) {
        Write-Host ("GREEN {0} proof={1}" -f (Get-Date -Format "HH:mm:ss"), $proof) -ForegroundColor Green
      } else {
        Write-Host ("RED   {0} http={1} ok={2} proof={3}" -f (Get-Date -Format "HH:mm:ss"), $code, $jsonOk, $proof) -ForegroundColor Red
      }
    }
  } catch {
    Write-Host ("WARN  {0}" -f $_.Exception.Message) -ForegroundColor Yellow
  }

  Start-Sleep -Seconds $LoopSleepSeconds
}