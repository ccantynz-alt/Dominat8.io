param(
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io"
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Ok($m){ Write-Host ("OK   " + $m) -ForegroundColor Green }

Ok "Open these in browser:"
Write-Host ("https://{0}/sites" -f $Domain) -ForegroundColor Green
Write-Host ("https://{0}/api/sites/list" -f $Domain) -ForegroundColor Green
Write-Host ""
Ok "Test add (requires KV configured):"
$body = '{"url":"https://hibiscustoairport.co.nz","notes":"Update hero CTA","platformHint":"emergent"}'
$ts = [int][double]::Parse((Get-Date -UFormat %s))
curl.exe -s -X POST -H "content-type: application/json" -d $body "https://$Domain/api/sites/add?ts=$ts" | Out-Host