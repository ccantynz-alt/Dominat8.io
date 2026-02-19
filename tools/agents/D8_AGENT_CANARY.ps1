[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string] $BaseUrl,
  [Parameter(Mandatory=$true)][string[]] $Paths
)
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Ok($m){Write-Host "OK   $m" -ForegroundColor Green}
function Info($m){Write-Host "INFO $m" -ForegroundColor Gray}

$ts = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$fail = 0
foreach($p in $Paths){
  $u = "$BaseUrl$p"
  if($u -match "\?"){ $u = "$u&ts=$ts" } else { $u = "$u?ts=$ts" }
  Info "GET $u"
  $hdr = & curl.exe -s -D - -o NUL --max-time 25 -H "Cache-Control: no-cache" -H "Pragma: no-cache" $u 2>$null
  $first = ($hdr | Select-Object -First 1)
  $first | Out-Host
  if($first -notmatch " 200 " -and $first -notmatch " 30[12378] "){
    $fail++
  }
}
if($fail -gt 0){ throw "Canary failed ($fail endpoints)." }
Ok "Canary OK"