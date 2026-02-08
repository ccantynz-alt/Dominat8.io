Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host "OK   $m" -ForegroundColor Green }
function Info($m){ Write-Host "INFO $m" -ForegroundColor Gray }
function Warn($m){ Write-Host "WARN $m" -ForegroundColor Yellow }
function Fail($m){ Write-Host "FATAL $m" -ForegroundColor Red; throw $m }

function Write-Utf8NoBom([string]$Path,[string]$Content){
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-IfExists([string]$Path){
  if (Test-Path -LiteralPath $Path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -LiteralPath $Path -Destination ($Path + ".bak_" + $ts) -Force
    Info ("Backup: " + $Path + ".bak_" + $ts)
  }
}

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoRoot
Info ("Locked PWD: " + (Get-Location))
if (-not (Test-Path -LiteralPath ".\package.json")) { Fail "package.json missing. Wrong folder." }
try { $null = git rev-parse --is-inside-work-tree 2>$null } catch { Fail "Not a git repo." }
try { $null = Get-Command vercel -ErrorAction Stop } catch { Fail "vercel CLI not found in PATH." }

git checkout main | Out-Null
git pull origin main | Out-Null

$Stamp = "D8_IO_MEGA_013_FIX_{0}" -f (Get-Date -Format "yyyyMMdd_HHmmss")
$Sha = (git rev-parse HEAD).Trim()
Ok ("Stamp: " + $Stamp)
Ok ("Git SHA: " + $Sha)

# /io proof page
$ioPath = ".\src\app\io\page.tsx"
Backup-IfExists $ioPath
$ioContent = @("export const dynamic = ""force-dynamic"";","",
"export default function IOCockpit() {",
"  const STAMP = """ + $Stamp + """;",
"  const SHA = """ + $Sha + """;",
"  return (",
"    <main style={{minHeight:""100vh"", background:""#000"", color:""#fff"", padding:24}}>",
"      <div style={{position:""fixed"", top:10, right:12, fontSize:11, opacity:0.75, zIndex:999999}}>",
"        PROOF: {STAMP}",
"      </div>",
"      <h1 style={{fontSize:28, margin:0}}>Dominat8 IO â€” Cockpit</h1>",
"      <p style={{opacity:0.85, marginTop:10, maxWidth:900}}>If you see this, /io is live.</p>",
"      <div style={{marginTop:18, opacity:0.75, fontSize:12}}>",
"        <div>Stamp: {STAMP}</div>",
"        <div>Git: {SHA}</div>",
"        <div>Path: /io</div>",
"      </div>",
"      <pre style={{marginTop:16, background:""rgba(255,255,255,0.06)"", padding:12, borderRadius:10, overflowX:""auto""}}>",
"PROOF: {STAMP}",
"      </pre>",
"    </main>",
"  );",
"}" ) -join "`n"
Write-Utf8NoBom $ioPath $ioContent
Ok ("Wrote: " + $ioPath)

# API routes
$healthPath = ".\src\app\api\io\health\route.ts"
$pingPath   = ".\src\app\api\io\ping\route.ts"
$statePath  = ".\src\app\api\io\state\route.ts"
Backup-IfExists $healthPath
Backup-IfExists $pingPath
Backup-IfExists $statePath

$healthContent = @(
"export const runtime = ""nodejs"";",
"export const dynamic = ""force-dynamic"";",
"" ,
"export async function GET() {",
"  const body = { ok: true, stamp: """ + $Stamp + """, git_sha: """ + $Sha + """, time: new Date().toISOString() };",
"  return new Response(JSON.stringify(body), { status: 200, headers: { ""content-type"": ""application/json; charset=utf-8"", ""x-d8-proof"": """ + $Stamp + """ } });",
"}"
) -join "`n"
$pingContent = "export const runtime = ""nodejs"";`nexport const dynamic = ""force-dynamic"";`nexport async function GET(){ return new Response(""PONG: 
" + $Stamp + "
\n"", {status:200, headers:{""content-type"":""text/plain; charset=utf-8"",""x-d8-proof"":""
" + $Stamp + "
""}}); }"
$stateContent = "export const runtime = ""nodejs"";`nexport const dynamic = ""force-dynamic"";`nexport async function GET(){ return new Response(JSON.stringify({ok:true,stamp:""
" + $Stamp + "
""}), {status:200, headers:{""content-type"":""application/json; charset=utf-8"",""x-d8-proof"":""
" + $Stamp + "
""}}); }"
Write-Utf8NoBom $healthPath $healthContent
Write-Utf8NoBom $pingPath $pingContent
Write-Utf8NoBom $statePath $stateContent
Ok ("Wrote: " + $healthPath)
Ok ("Wrote: " + $pingPath)
Ok ("Wrote: " + $statePath)

# Loop (PS5 safe)
$loopPath = ".\D8_IO_AUTO_LOOP_DOCTOR_011.ps1"
Backup-IfExists $loopPath
$loopContent = (@(
"Set-StrictMode -Version Latest",
"`$ErrorActionPreference = ""Stop""",
"",
"param([string]`$BaseUrl=""https://dominat8.io"",[int]`$LoopSleepSeconds=8,[int]`$HttpTimeoutSeconds=20)",
"",
"function Epoch(){ [int](Get-Date -UFormat %s) }",
"",
"while (`$true) {",
"  try {",
"    `$ts = Epoch",
"    `$u = ""`$BaseUrl/api/io/health?ts=`$ts""",
"    `$raw = & curl.exe -s -S --max-time ""`$HttpTimeoutSeconds"" -D - ""`$u""",
"    `$parts = `$raw -split ""(`r`n`r`n|`n`n)"", 2",
"    `$hdrs = `$parts[0]",
"    `$body = if (`$parts.Count -ge 2) { `$parts[1] } else { """" }",
"    `$code = `$null",
"    `$first = (`$hdrs -split ""(`r`n|`n)"")[0]",
"    if (`$first -match ""HTTP\/\d+\.\d+\s+(\d{3})"") { `$code = [int]`$Matches[1] }",
"    `$proof = """"",
"    foreach (`$line in (`$hdrs -split ""(`r`n|`n)"")) { if (`$line -match ""^(x-d8-proof)\s*:\s*(.+)`$"") { `$proof = `$Matches[2].Trim() } }",
"    `$jsonOk = (`$body -match '""ok""\s*:\s*true')",
"    if (`$code -eq 200 -and `$proof) {",
"      Write-Host (""GREEN {0} proof={1}"" -f (Get-Date -Format ""HH:mm:ss""), `$proof) -ForegroundColor Green",
"    } else {",
"      Write-Host (""RED   {0} http={1} ok={2} proof={3}"" -f (Get-Date -Format ""HH:mm:ss""), `$code, `$jsonOk, `$proof) -ForegroundColor Red",
"    }",
"  } catch {",
"    Write-Host (""WARN  {0}"" -f `$_.Exception.Message) -ForegroundColor Yellow",
"  }",
"  Start-Sleep -Seconds `$LoopSleepSeconds",
"}"
) -join "`n")
Write-Utf8NoBom $loopPath $loopContent
Ok ("Wrote: " + $loopPath)

git add -A | Out-Null
$staged = git diff --cached --name-only
if (-not $staged) { Fail "Nothing staged â€” unexpected." }
$msg = "D8: IO mega-doctor 013 FIX (" + $Stamp + ")"
git commit -m $msg | Out-Null
Ok ("Committed: " + $msg)
git push origin main | Out-Null
Ok "Pushed: origin/main"

Info "Vercel whoami:"
vercel whoami
Info "vercel link --yes:"
try { vercel link --yes | Out-Host } catch { }
Info "vercel deploy --prod --yes:"
vercel deploy --prod --yes | Out-Host
Ok "Prod deploy issued."

$ts=[int](Get-Date -UFormat %s)
Ok "PROOF: /api/io/health headers (first 30 lines)"
curl.exe -s -D - -H "Cache-Control: no-cache" -H "Pragma: no-cache" "https://dominat8.io/api/io/health?ts=$ts" | Select-Object -First 30

Ok "PROOF: /io contains PROOF:"
curl.exe -s -H "Cache-Control: no-cache" -H "Pragma: no-cache" "https://dominat8.io/io?ts=$ts" | findstr /I "PROOF:"

Ok "Start loop:"
Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\D8_IO_AUTO_LOOP_DOCTOR_011.ps1" -ForegroundColor Yellow