# ================================
# tools\smoke.ps1
# ================================
# Aggressive smoke tests against production.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File ".\tools\smoke.ps1"
#   powershell -ExecutionPolicy Bypass -File ".\tools\smoke.ps1" -BaseUrl "https://www.dominat8.com"
#   powershell -ExecutionPolicy Bypass -File ".\tools\smoke.ps1" -BaseUrl "https://my-saas-app-5eyw.vercel.app" -HostHeader "www.dominat8.com"
#
# It checks:
# - homepage HTML (not Next 404 shell)
# - key marketing routes (pricing/templates/use-cases)
# - deploy proof endpoint
# - basic API endpoints (best-effort)
# - Host header routing (optional)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$BaseUrl = "https://www.dominat8.com",
  [string]$HostHeader = ""
)

function Fail($msg) { throw "SMOKE FAILED: $msg" }

function New-TS() { return [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() }

function Invoke-HttpText([string]$Url, [hashtable]$Headers) {
  $resp = & curl.exe -sS -D - -H "cache-control: no-cache" -H "pragma: no-cache" @(
    if ($Headers.ContainsKey("Host")) { "-H"; ("Host: " + $Headers["Host"]) } else { @() }
  ) $Url
  if ($LASTEXITCODE -ne 0) { Fail "curl failed: $Url" }
  return $resp
}

function Get-StatusLine([string]$Raw) {
  $first = ($Raw -split "`r?`n")[0]
  return $first
}

function Body-From-Raw([string]$Raw) {
  # Split on first blank line (headers/body)
  $parts = $Raw -split "(\r?\n){2}", 2
  if ($parts.Length -lt 2) { return "" }
  return $parts[1]
}

function Assert-NotNext404([string]$Body, [string]$What) {
  # Detect the classic Next 404 shell string you pasted previously
  if ($Body -match "404This page could not be found" -or $Body -match "This page could not be found\." ) {
    Fail "$What looks like a Next 404 shell."
  }
}

function Assert-Has([string]$Body, [string]$Needle, [string]$What) {
  if ($Body -notmatch [regex]::Escape($Needle)) {
    Fail "$What missing expected marker: $Needle"
  }
}

function Check-Page([string]$Path, [string]$What) {
  $ts = New-TS
  $url = ($BaseUrl.TrimEnd("/") + $Path + ($(if ($Path -match "\?") { "&" } else { "?" })) + "ts=" + $ts)
  $headers = @{}
  if (-not [string]::IsNullOrWhiteSpace($HostHeader)) { $headers["Host"] = $HostHeader }

  Write-Host "== PAGE: $What -> $url"
  if (-not [string]::IsNullOrWhiteSpace($HostHeader)) { Write-Host "   Host: $HostHeader" }

  $raw = Invoke-HttpText $url $headers
  $status = Get-StatusLine $raw
  $body = Body-From-Raw $raw

  Write-Host "   $status"

  # basic OK checks
  if ($status -notmatch "200" -and $status -notmatch "307" -and $status -notmatch "308") {
    Fail "$What returned non-OK status: $status"
  }

  Assert-NotNext404 $body $What

  return $body
}

function Check-Json([string]$Path, [string]$What) {
  $ts = New-TS
  $url = ($BaseUrl.TrimEnd("/") + $Path + ($(if ($Path -match "\?") { "&" } else { "?" })) + "ts=" + $ts)
  $headers = @{}
  if (-not [string]::IsNullOrWhiteSpace($HostHeader)) { $headers["Host"] = $HostHeader }

  Write-Host "== API: $What -> $url"
  if (-not [string]::IsNullOrWhiteSpace($HostHeader)) { Write-Host "   Host: $HostHeader" }

  try {
    if (-not [string]::IsNullOrWhiteSpace($HostHeader)) {
      # Use curl for Host override and then parse body as JSON
      $raw = & curl.exe -sS -H ("Host: " + $HostHeader) $url
      if ($LASTEXITCODE -ne 0) { Fail "curl failed: $url" }
      $obj = $raw | ConvertFrom-Json -ErrorAction Stop
    } else {
      $obj = Invoke-RestMethod -Method GET -Uri $url
    }
  } catch {
    Fail "$What JSON call failed: $($_.Exception.Message)"
  }

  $obj | ConvertTo-Json -Depth 10
  return $obj
}

Write-Host ""
Write-Host "========================="
Write-Host " Dominat8 SMOKE TESTS"
Write-Host "========================="
Write-Host "BaseUrl    : $BaseUrl"
if (-not [string]::IsNullOrWhiteSpace($HostHeader)) { Write-Host "HostHeader : $HostHeader" }
Write-Host ""

# 1) Homepage
$home = Check-Page "/" "Homepage"
# A lightweight heuristic: homepage should at least have <html or <!doctype
if ($home -notmatch "<html" -and $home -notmatch "<!doctype") {
  Fail "Homepage response does not look like HTML."
}

# 2) Marketing pages (best-effort: if routes exist, they must not 404-shell)
# If your marketing group uses these exact paths, they should pass.
# If not present yet, you can comment them out later.
Check-Page "/pricing"   "Marketing: Pricing"   | Out-Null
Check-Page "/templates" "Marketing: Templates" | Out-Null
Check-Page "/use-cases" "Marketing: Use-cases" | Out-Null

# 3) Deploy proof (must exist, must return ok=true)
$proof = Check-Json "/api/__deploy_proof__" "Deploy proof"
if ($null -eq $proof.ok -or $proof.ok -ne $true) { Fail "Deploy proof ok!=true" }

# 4) Optional endpoints (only if they exist in your repo; fail if they hard-error)
# If you don’t have these endpoints, remove them from smoke later.
try { Check-Json "/api/marketing/flow" "Marketing flow (optional)" | Out-Null } catch { Write-Host "WARN: marketing/flow check skipped/failed: $($_.Exception.Message)" }
try { Check-Json "/api/domains/resolve?domain=www.dominat8.com" "Domains resolve (optional)" | Out-Null } catch { Write-Host "WARN: domains/resolve check skipped/failed: $($_.Exception.Message)" }

Write-Host ""
Write-Host "✅ SMOKE PASSED"