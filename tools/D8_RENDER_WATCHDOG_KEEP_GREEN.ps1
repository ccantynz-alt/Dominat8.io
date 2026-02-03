Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ============================================================
# D8_RENDER_WATCHDOG_KEEP_GREEN.ps1
# Purpose: Keep production GREEN by auto-triggering a Render deploy if health fails.
# How:
#  - GET health URL
#  - If non-200 or timeout => trigger Render Deploy Hook URL (GET)
# Safe: no repo changes; can run forever.
# ============================================================

$HealthUrl = "https://dominat8.io/api/__d8__/stamp"
$DeployHookUrl = "PASTE_YOUR_RENDER_DEPLOY_HOOK_URL_HERE"

# Poll interval (seconds)
$SleepSeconds = 60

# Minimum time between deploy triggers (seconds) to avoid loops
$MinDeployIntervalSeconds = 600

$lastDeploy = [DateTime]::MinValue

function Log([string]$msg) {
  $ts = (Get-Date).ToString("o")
  Write-Host "$ts  $msg"
}

if ($DeployHookUrl -eq "PASTE_YOUR_RENDER_DEPLOY_HOOK_URL_HERE") {
  throw "Set DeployHookUrl first (Render Dashboard -> Deploy Hook URL)."
}

while ($true) {
  try {
    $ok = $false
    $status = 0

    try {
      # Use curl.exe for consistent headers/exit codes
      $resp = & curl.exe -sS -D - --max-time 15 -H "cache-control: no-cache" -H "pragma: no-cache" "$HealthUrl"
      if ($LASTEXITCODE -eq 0 -and $resp -match "HTTP/\d\.\d\s+(\d{3})") {
        $status = [int]$matches[1]
        if ($status -ge 200 -and $status -lt 400) { $ok = $true }
      }
    } catch {}

    if ($ok) {
      Log "HEALTH OK  status=$status  url=$HealthUrl"
    } else {
      Log "HEALTH FAIL  status=$status  url=$HealthUrl"

      $now = Get-Date
      $since = ($now - $lastDeploy).TotalSeconds
      if ($since -ge $MinDeployIntervalSeconds) {
        Log "TRIGGER DEPLOY HOOK: $DeployHookUrl"
        & curl.exe -sS -D - --max-time 20 "$DeployHookUrl" | Out-Null
        if ($LASTEXITCODE -eq 0) {
          $lastDeploy = $now
          Log "DEPLOY TRIGGERED OK"
        } else {
          Log "DEPLOY TRIGGER FAILED (curl exit=$LASTEXITCODE)"
        }
      } else {
        Log "DEPLOY SKIPPED (rate limit) seconds_since_last=$([int]$since)"
      }
    }
  } catch {
    Log ("WATCHDOG ERROR: " + $_.Exception.Message)
  }

  Start-Sleep -Seconds $SleepSeconds
}
