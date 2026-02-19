Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ok($m){ Write-Host ("OK   {0}" -f $m) -ForegroundColor Green }
function Warn($m){ Write-Host ("WARN {0}" -f $m) -ForegroundColor Yellow }
function Fail($m){ Write-Host ("FATAL {0}" -f $m) -ForegroundColor Red; throw $m }

function Ensure-Dir([string]$p){ if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p | Out-Null } }
function Write-Text([string]$Path,[string]$Text){
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}
function Read-Text([string]$Path){ return [System.IO.File]::ReadAllText($Path) }

function Get-ArgValue([string]$Name,[string]$Default){
  for ($i=0; $i -lt $args.Count; $i++) {
    $a = $args[$i]
    if ($a -is [string] -and $a.Trim().ToLowerInvariant() -eq ("-" + $Name.ToLowerInvariant())) {
      if (($i + 1) -lt $args.Count) { return [string]$args[$i+1] }
      return $Default
    }
  }
  return $Default
}
function Has-Switch([string]$Name){
  for ($i=0; $i -lt $args.Count; $i++) {
    $a = $args[$i]
    if ($a -is [string] -and $a.Trim().ToLowerInvariant() -eq ("-" + $Name.ToLowerInvariant())) { return $true }
  }
  return $false
}

function NowUnix { return [int][double]::Parse((Get-Date -UFormat %s)) }
$Domain = Get-ArgValue "Domain" "dominat8.io"
$Seconds = [int](Get-ArgValue "Seconds" "900")
$Interval = [int](Get-ArgValue "IntervalSeconds" "30")
$ExpectNS1 = Get-ArgValue "ExpectNS1" "ns1.vercel-dns.com"
$ExpectNS2 = Get-ArgValue "ExpectNS2" "ns2.vercel-dns.com"

Write-Host "=== DNS PROPAGATION WATCH ===" -ForegroundColor Cyan
Write-Host ("Domain:   " + $Domain)
Write-Host ("Seconds:  " + $Seconds + "  Interval: " + $Interval + "s")
Write-Host ("Expect:   " + $ExpectNS1 + " + " + $ExpectNS2)

$end = (Get-Date).AddSeconds($Seconds)
$hit = 0
while ((Get-Date) -lt $end) {
  $hit++
  Write-Host ""
  Write-Host ("--- Tick {0}  {1}" -f $hit, (Get-Date).ToString("HH:mm:ss")) -ForegroundColor Cyan
  $out = ""
  try { $out = (nslookup -type=ns $Domain 2>&1 | Out-String) } catch { $out = "ERR " + $_.Exception.Message }
  Write-Host $out
  $ok1 = ($out.ToLowerInvariant() -match [regex]::Escape($ExpectNS1.ToLowerInvariant()))
  $ok2 = ($out.ToLowerInvariant() -match [regex]::Escape($ExpectNS2.ToLowerInvariant()))
  if ($ok1 -and $ok2) { Ok "Nameservers look correct (Vercel NS detected)."; break }
  Warn "Not yet on Vercel nameservers. Waiting..."
  Start-Sleep -Seconds $Interval
}
Write-Host ""
Ok "DNS watch finished."
