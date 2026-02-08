<# 
D8_IO_BIG5_ROLLUP_001.ps1
Single-script rollup:
1) Preflight
2) DNS NS propagation gate (multi-resolver)
3) API probes (evidence)
4) Vercel prod redeploy (optional)
5) Doctor loop (optional) + GH workflow kick (optional)

PowerShell: Windows PowerShell 5.1+ compatible
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string] $RepoRoot,

  [string] $Domain = "dominat8.io",

  # resolvers to check NS propagation against
  [string[]] $Resolvers = @("1.1.1.1","8.8.8.8"),

  # expected Vercel nameservers
  [string[]] $ExpectedNs = @("ns1.vercel-dns.com","ns2.vercel-dns.com"),

  # overall behavior toggles
  [switch] $AutoDeploy,                 # run `vercel --prod --force` after DNS green
  [switch] $AutoDoctorLoop,             # loop probes until green or timeout
  [switch] $AutoKickGitHubWorkflows,    # try `gh workflow run` for obvious workflows

  # timing controls
  [int] $DnsMaxMinutes = 90,
  [int] $DoctorMaxMinutes = 30,
  [int] $LoopSleepSeconds = 20
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# --------------------------
# Helpers
# --------------------------
function Now-Stamp { (Get-Date).ToString("yyyyMMdd_HHmmss") }

function Ok([string]$m){ Write-Host ("OK   " + $m) -ForegroundColor Green }
function Warn([string]$m){ Write-Host ("WARN " + $m) -ForegroundColor Yellow }
function Fail([string]$m){ Write-Host ("FAIL " + $m) -ForegroundColor Red }

function Require-Cmd([string]$name){
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Required command not found: $name" }
  Ok ("Found tool: {0} -> {1}" -f $name, $cmd.Source)
}

function Ensure-Dir([string]$p){
  if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

function Write-Text([string]$path,[string]$text){
  $dir = Split-Path -Parent $path
  Ensure-Dir $dir
  [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))
}

function Run-Capture([string]$exe, [string[]]$args){
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $exe
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  $psi.Arguments = ($args -join " ")
  $p = New-Object System.Diagnostics.Process
  $p.StartInfo = $psi
  [void]$p.Start()
  $stdout = $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()
  $p.WaitForExit()
  return [pscustomobject]@{
    ExitCode = $p.ExitCode
    StdOut   = $stdout
    StdErr   = $stderr
  }
}

function Curl-Get([string]$url){
  # returns object with StatusLine + Headers + Body (best effort)
  $args = @(
    "-s","-D","-",
    "-H","Cache-Control: no-cache",
    "-H","Pragma: no-cache",
    "--max-time","25",
    $url
  )
  $r = Run-Capture "curl.exe" $args
  $raw = $r.StdOut

  # Split headers/body on first empty line
  $split = $raw -split "(\r?\n)\1", 2
  $headers = $split[0]
  $body = ""
  if ($split.Count -ge 2) { $body = $split[1] }

  $statusLine = ($headers -split "\r?\n" | Select-Object -First 1)
  return [pscustomobject]@{
    ExitCode   = $r.ExitCode
    StatusLine = $statusLine
    Headers    = $headers
    Body       = $body
    Raw        = $raw
  }
}

function Resolve-NS([string]$domain,[string]$resolver){
  # nslookup output parsing
  $r = Run-Capture "nslookup.exe" @("-type=ns", $domain, $resolver)
  $txt = ($r.StdOut + "`n" + $r.StdErr)

  # extract FQDN-like tokens that look like nameservers
  $matches = @()
  foreach ($line in ($txt -split "\r?\n")) {
    if ($line -match "nameserver\s*=\s*(\S+)") {
      $matches += $Matches[1].Trim().TrimEnd(".")
    }
  }

  # fallback: some nslookup formats show "NS record = ..."
  foreach ($line in ($txt -split "\r?\n")) {
    if ($line -match "NS\s+(\S+)$") {
      $matches += $Matches[1].Trim().TrimEnd(".")
    }
  }

  $matches = $matches | Where-Object { $_ -and ($_ -match "\.") } | Select-Object -Unique
  return [pscustomobject]@{
    Resolver = $resolver
    Ns       = $matches
    Raw      = $txt
  }
}

function Has-ExpectedNs([string[]]$observed,[string[]]$expected){
  $obs = @($observed | ForEach-Object { $_.ToLowerInvariant().TrimEnd(".") })
  $exp = @($expected | ForEach-Object { $_.ToLowerInvariant().TrimEnd(".") })
  foreach ($e in $exp){
    if ($obs -notcontains $e) { return $false }
  }
  return $true
}

# --------------------------
# 0) Preflight
# --------------------------
Write-Host ""
Write-Host "================ D8 IO BIG5 ROLLUP ================" -ForegroundColor Cyan
Write-Host ("Stamp: {0}" -f (Now-Stamp)) -ForegroundColor Gray

if (-not (Test-Path -LiteralPath $RepoRoot)) { throw "RepoRoot does not exist: $RepoRoot" }
Set-Location -LiteralPath $RepoRoot
Ok ("RepoRoot: {0}" -f (Get-Location).Path)

Require-Cmd "git"
Require-Cmd "gh"
Require-Cmd "vercel"
Require-Cmd "curl.exe"
Require-Cmd "nslookup.exe"

# Basic repo sanity
$gitTop = (git rev-parse --show-toplevel 2>$null)
if (-not $gitTop) { throw "Not a git repo (or git failed) at: $RepoRoot" }
Ok ("Git top-level: {0}" -f $gitTop)

$porc = (git status --porcelain)
if ($porc -and $porc.Count -gt 0) {
  Warn "Working tree NOT clean. I will NOT commit/stash for you."
  Warn "If deploy scripts depend on clean tree, fix it first."
} else {
  Ok "Working tree clean."
}

# Evidence directory
$EvidenceRoot = Join-Path $RepoRoot ("EVIDENCE_D8IO_BIG5_" + (Now-Stamp))
Ensure-Dir $EvidenceRoot
Ok ("Evidence dir: {0}" -f $EvidenceRoot)

# Save quick vercel domain inspect (best-effort)
try {
  $vd = Run-Capture "vercel" @("domains","inspect",$Domain)
  Write-Text (Join-Path $EvidenceRoot "vercel_domains_inspect.txt") ($vd.StdOut + "`n" + $vd.StdErr)
  Ok "Captured: vercel domains inspect"
} catch {
  Warn ("Could not capture vercel domains inspect: " + $_.Exception.Message)
}

# --------------------------
# 1) DNS Propagation Gate
# --------------------------
Write-Host ""
Write-Host "================ 1) DNS NS PROPAGATION GATE ================" -ForegroundColor Cyan
Write-Host ("Expected NS: {0}" -f ($ExpectedNs -join ", ")) -ForegroundColor Gray
Write-Host ("Resolvers:   {0}" -f ($Resolvers -join ", ")) -ForegroundColor Gray

$dnsStart = Get-Date
$dnsDeadline = $dnsStart.AddMinutes($DnsMaxMinutes)

$DnsGreen = $false
$lastDnsSummary = ""

while ($true) {
  $rows = @()
  $allGreen = $true

  foreach ($res in $Resolvers) {
    $ns = Resolve-NS $Domain $res
    $rows += $ns
    $isGreen = Has-ExpectedNs $ns.Ns $ExpectedNs
    if (-not $isGreen) { $allGreen = $false }
  }

  $summary = ""
  foreach ($r in $rows) {
    $summary += ("Resolver {0} => {1}`n" -f $r.Resolver, (($r.Ns -join ", ") -replace "\s+$",""))
  }

  if ($summary -ne $lastDnsSummary) {
    Write-Host ""
    Write-Host $summary -ForegroundColor Gray
    Write-Text (Join-Path $EvidenceRoot ("dns_ns_" + (Now-Stamp) + ".txt")) $summary
    $lastDnsSummary = $summary
  }

  if ($allGreen) {
    Ok "DNS NS looks GREEN across resolvers."
    $DnsGreen = $true
    break
  }

  if ((Get-Date) -ge $dnsDeadline) {
    Warn ("DNS NS not green within {0} minutes." -f $DnsMaxMinutes)
    break
  }

  Warn ("DNS not green yet. Sleeping {0}s..." -f $LoopSleepSeconds)
  Start-Sleep -Seconds $LoopSleepSeconds
}

# --------------------------
# 2) Probe suite
# --------------------------
function Run-Probes([string]$phaseTag){
  Write-Host ""
  Write-Host ("================ 2) PROBES ({0}) ================" -f $phaseTag) -ForegroundColor Cyan

  $ts = [int][double]::Parse((Get-Date -UFormat %s))
  $urls = @(
    "https://$Domain/api/io/health?ts=$ts",
    "https://$Domain/api/tv/status?ts=$ts",
    "https://$Domain/api/tv/health?ts=$ts",
    "https://$Domain/api/tv/ping?ts=$ts"
  )

  $results = @()
  foreach ($u in $urls) {
    Write-Host ("PROBE {0}" -f $u) -ForegroundColor Gray
    $r = Curl-Get $u
    $fileBase = ($u -replace "https://","" -replace "[^\w\-\.]","_")
    Write-Text (Join-Path $EvidenceRoot ("probe_{0}_{1}.headers.txt" -f $phaseTag, $fileBase)) $r.Headers
    Write-Text (Join-Path $EvidenceRoot ("probe_{0}_{1}.body.txt" -f $phaseTag, $fileBase)) $r.Body
    $results += [pscustomobject]@{
      Url        = $u
      StatusLine = $r.StatusLine
      ExitCode   = $r.ExitCode
      BodyFirst  = ($r.Body | Select-Object -First 1)
    }
  }

  # Determine "green": none of the probes return 404
  $has404 = $false
  foreach ($x in $results) {
    if ($x.StatusLine -match "\s404\s") { $has404 = $true }
  }

  # Print summary
  Write-Host ""
  foreach ($x in $results) {
    $color = "Green"
    if ($x.StatusLine -match "\s404\s") { $color = "Red" }
    Write-Host ("{0}`n  {1}`n" -f $x.StatusLine, $x.Url) -ForegroundColor $color
  }

  return [pscustomobject]@{
    Green = (-not $has404)
    Results = $results
  }
}

$pre = Run-Probes "PRE"

# --------------------------
# 3) Optional Deploy (only if DNS green)
# --------------------------
Write-Host ""
Write-Host "================ 3) OPTIONAL PROD DEPLOY ================" -ForegroundColor Cyan

if ($AutoDeploy) {
  if (-not $DnsGreen) {
    Warn "AutoDeploy requested, but DNS NS is not green. Skipping deploy."
  } else {
    Write-Host "Running: vercel --prod --force" -ForegroundColor Yellow
    try {
      $vd = Run-Capture "cmd.exe" @("/c","vercel --prod --force")
      Write-Text (Join-Path $EvidenceRoot ("vercel_prod_force_" + (Now-Stamp) + ".txt")) ($vd.StdOut + "`n" + $vd.StdErr)
      if ($vd.ExitCode -eq 0) {
        Ok "Vercel deploy command completed."
      } else {
        Warn ("Vercel deploy exit code: {0}" -f $vd.ExitCode)
      }
    } catch {
      Warn ("Deploy failed: " + $_.Exception.Message)
    }
  }
} else {
  Warn "AutoDeploy not set. Skipping deploy step."
}

$post = Run-Probes "POST"

# --------------------------
# 4) Optional GH workflow kick (best-effort)
# --------------------------
Write-Host ""
Write-Host "================ 4) OPTIONAL GH WORKFLOW KICK ================" -ForegroundColor Cyan

if ($AutoKickGitHubWorkflows) {
  try {
    $w = Run-Capture "gh" @("workflow","list","--limit","50")
    Write-Text (Join-Path $EvidenceRoot ("gh_workflow_list_" + (Now-Stamp) + ".txt")) ($w.StdOut + "`n" + $w.StdErr)
    Ok "Captured: gh workflow list"

    # Heuristic: try running workflows that look like watchdog/keep-green/quality/ci
    $names = @()
    foreach ($line in ($w.StdOut -split "\r?\n")) {
      if ($line -match "watchdog|keep|quality|ci|build" ) {
        # workflow list output typically contains the name at start of line
        $nm = ($line -split "\s{2,}")[0].Trim()
        if ($nm) { $names += $nm }
      }
    }
    $names = $names | Select-Object -Unique

    if ($names.Count -eq 0) {
      Warn "No obvious workflows found to kick."
    } else {
      foreach ($nm in $names) {
        Write-Host ("KICK workflow: {0}" -f $nm) -ForegroundColor Yellow
        $rr = Run-Capture "gh" @("workflow","run",$nm)
        Write-Text (Join-Path $EvidenceRoot ("gh_workflow_run_" + (Now-Stamp) + "_" + ($nm -replace "[^\w\-\.]","_") + ".txt")) ($rr.StdOut + "`n" + $rr.StdErr)
      }
      Ok "Attempted GH workflow kicks."
    }
  } catch {
    Warn ("GH workflow kick failed: " + $_.Exception.Message)
  }
} else {
  Warn "AutoKickGitHubWorkflows not set. Skipping GH workflow step."
}

# --------------------------
# 5) Optional Doctor Loop (probe until green)
# --------------------------
Write-Host ""
Write-Host "================ 5) OPTIONAL DOCTOR LOOP ================" -ForegroundColor Cyan

if ($AutoDoctorLoop) {
  $docStart = Get-Date
  $docDeadline = $docStart.AddMinutes($DoctorMaxMinutes)

  while ($true) {
    $r = Run-Probes "DOCTOR"
    if ($r.Green) {
      Ok "Doctor loop: GREEN (no 404s detected)."
      break
    }

    if ((Get-Date) -ge $docDeadline) {
      Warn ("Doctor loop timed out after {0} minutes." -f $DoctorMaxMinutes)
      break
    }

    Warn ("Doctor loop still red. Sleeping {0}s..." -f $LoopSleepSeconds)
    Start-Sleep -Seconds $LoopSleepSeconds
  }
} else {
  Warn "AutoDoctorLoop not set. Skipping doctor loop."
}

# --------------------------
# Final summary
# --------------------------
Write-Host ""
Write-Host "================ FINAL SUMMARY ================" -ForegroundColor Cyan
Write-Host ("DNS green:      {0}" -f $DnsGreen) -ForegroundColor Gray
Write-Host ("Pre probes ok:  {0}" -f $pre.Green) -ForegroundColor Gray
Write-Host ("Post probes ok: {0}" -f $post.Green) -ForegroundColor Gray
Write-Host ("Evidence dir:   {0}" -f $EvidenceRoot) -ForegroundColor Gray
Write-Host ""

if ($post.Green) {
  Ok "OVERALL: GREEN"
  exit 0
} else {
  Warn "OVERALL: NOT GREEN (check evidence files)."
  exit 2
}
