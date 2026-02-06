# D8_IO_AUTO_LOOP_DOCTOR_011.ps1
# Minimal IO health loop. Prints GREEN when /api/io/health is live.
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

      $proof = $null
      foreach ($line in ($hdrs -split "(`r`n|`n)")) {
        if ($line -match "^(x-d8-proof)\s*:\s*(.+)$") { $proof = $Matches[2].Trim() }
      }

      $jsonOk = ($body -match '"ok"\s*:\s*true')

      if ($code -eq 200 -and $jsonOk -and $proof) {
        Write-Host ("GREEN {0} proof={1}" -f (Get-Date -Format "HH:mm:ss"), $proof) -ForegroundColor Green
      } else {
        Write-Host ("RED   {0} http={1} ok={2} proof={3}" -f (Get-Date -Format "HH:mm:ss"), $code, $jsonOk, ($proof ?? "")) -ForegroundColor Red
      }
    }
  } catch {
    Write-Host ("WARN  {0}" -f $_.Exception.Message) -ForegroundColor Yellow
  }

  Start-Sleep -Seconds $LoopSleepSeconds
}