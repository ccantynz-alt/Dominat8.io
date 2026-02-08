Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param([string]$BaseUrl="https://dominat8.io",[int]$LoopSleepSeconds=8,[int]$HttpTimeoutSeconds=20)

function Epoch(){ [int](Get-Date -UFormat %s) }

while ($true) {
  try {
    $ts = Epoch
    $u = "$BaseUrl/api/io/health?ts=$ts"
    $raw = & curl.exe -s -S --max-time "$HttpTimeoutSeconds" -D - "$u"
    $parts = $raw -split "(

|

)", 2
    $hdrs = $parts[0]
    $body = if ($parts.Count -ge 2) { $parts[1] } else { "" }
    $code = $null
    $first = ($hdrs -split "(
|
)")[0]
    if ($first -match "HTTP\/\d+\.\d+\s+(\d{3})") { $code = [int]$Matches[1] }
    $proof = ""
    foreach ($line in ($hdrs -split "(
|
)")) { if ($line -match "^(x-d8-proof)\s*:\s*(.+)$") { $proof = $Matches[2].Trim() } }
    $jsonOk = ($body -match '"ok"\s*:\s*true')
    if ($code -eq 200 -and $proof) {
      Write-Host ("GREEN {0} proof={1}" -f (Get-Date -Format "HH:mm:ss"), $proof) -ForegroundColor Green
    } else {
      Write-Host ("RED   {0} http={1} ok={2} proof={3}" -f (Get-Date -Format "HH:mm:ss"), $code, $jsonOk, $proof) -ForegroundColor Red
    }
  } catch {
    Write-Host ("WARN  {0}" -f $_.Exception.Message) -ForegroundColor Yellow
  }
  Start-Sleep -Seconds $LoopSleepSeconds
}