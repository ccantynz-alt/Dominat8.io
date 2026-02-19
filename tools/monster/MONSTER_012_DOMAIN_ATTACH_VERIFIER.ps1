Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory=$false)][string]$Domain = "dominat8.io",
  [Parameter(Mandatory=$false)][string]$ExpectedProjectHint = "dominat8io"
)

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

$cmd = "vercel domains inspect " + $Domain
Ok $cmd
$out = cmd /c $cmd 2^>^&1
$text = ($out | Out-String)
Write-Host $text

if ($text -match [regex]::Escape($ExpectedProjectHint)) {
  Ok ("Hint found: {0}" -f $ExpectedProjectHint)
} else {
  Warn ("Hint NOT found: {0} (this often means the domain is attached to another project)" -f $ExpectedProjectHint)
}
