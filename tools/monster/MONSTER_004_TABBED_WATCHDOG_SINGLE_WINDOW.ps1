param(
  [Parameter(Mandatory=$false)][string]$Repo = "ccantynz-alt/Dominat8.io",
  [Parameter(Mandatory=$false)][string]$ProdDomain = "dominat8.io"
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Header([string]$t){
  Clear-Host
  Write-Host "============================================================" -ForegroundColor DarkGray
  Write-Host ("D8 WATCHDOG (single-window hotkeys)  " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")) -ForegroundColor Cyan
  Write-Host ("Repo: " + $Repo) -ForegroundColor DarkGray
  Write-Host ("Prod: https://" + $ProdDomain) -ForegroundColor DarkGray
  Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
  Write-Host $t -ForegroundColor White
  Write-Host "============================================================" -ForegroundColor DarkGray
  Write-Host ""
  Write-Host "Keys: [1]=Runs  [2]=PRs  [3]=Prod probes  [4]=047B  [K]=Kick  [Q]=Quit" -ForegroundColor Yellow
  Write-Host ""
}

function View-Runs{
  Header "1) GitHub Actions Runs"
  gh run list -R $Repo --limit 12 | Out-Host
}
function View-PRs{
  Header "2) Open PRs"
  gh pr list -R $Repo --state open --limit 10 | Out-Host
}
function View-Probes{
  Header "3) Prod probes (no-cache)"
  $ts = [int][double]::Parse((Get-Date -UFormat %s))
  Write-Host ("GET https://{0}/api/tv/status?ts={1}" -f $ProdDomain, $ts) -ForegroundColor DarkGray
  curl.exe -s -H "Cache-Control: no-cache" "https://$ProdDomain/api/tv/status?ts=$ts" | Out-Host
  Write-Host ""
  Write-Host ("Open: https://{0}/tv" -f $ProdDomain) -ForegroundColor Green
  Write-Host ("Open: https://{0}/sites" -f $ProdDomain) -ForegroundColor Green
}
function View-047B{
  Header "4) 047B workflow status"
  gh workflow list -R $Repo | Out-Host
  Write-Host ""
  gh run list -R $Repo --limit 12 | Out-Host
}
function Kick-047B{
  Header "K) Kick 047B Self-Heal PR Loop"
  gh workflow run -R $Repo "047B Self-Heal PR Loop" | Out-Host
  Write-Host ""
  gh run list -R $Repo --limit 10 | Out-Host
}

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) { throw "gh not found in PATH" }

View-Probes

while ($true) {
  $k = [Console]::ReadKey($true)
  switch ($k.Key) {
    "D1" { View-Runs; continue }
    "D2" { View-PRs; continue }
    "D3" { View-Probes; continue }
    "D4" { View-047B; continue }
    "K"  { Kick-047B; continue }
    "Q"  { break }
    default { continue }
  }
}