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
$RepoRoot = Get-ArgValue "RepoRoot" (Get-Location).Path
$OutDir   = Get-ArgValue "OutDir" (Join-Path $env:TEMP "D8_EVIDENCE")
$Seconds  = [int](Get-ArgValue "Seconds" "0")  # 0=one-shot, otherwise loop for N seconds

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$MonsterDir = Join-Path $RepoRoot "tools\monster"
Ensure-Dir $OutDir

function Snap([string]$tag){
  $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
  $dir = Join-Path $OutDir ("MONSTER_INTEGRITY_{0}_{1}" -f $tag, $stamp)
  Ensure-Dir $dir

  $rows = @()
  Get-ChildItem -LiteralPath $MonsterDir -File | Sort-Object Name | ForEach-Object {
    $h = ""
    try { $h = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash } catch { $h = "ERR" }
    $rows += [pscustomobject]@{
      name=$_.Name;
      length=$_.Length;
      lastWrite=$_.LastWriteTime.ToString("o");
      sha256=$h
    }
  }
  $json = ([pscustomobject]@{ when=(Get-Date).ToString("o"); tag=$tag; rows=$rows } | ConvertTo-Json -Depth 6)
  $p = Join-Path $dir "integrity.json"
  Write-Text $p $json
  Ok ("Wrote: {0}" -f $p)
  return $p
}

function Compare-Snaps([string]$aPath,[string]$bPath){
  $a = (Read-Text $aPath | ConvertFrom-Json).rows
  $b = (Read-Text $bPath | ConvertFrom-Json).rows

  $mapA = @{}; foreach ($r in $a) { $mapA[$r.name] = $r }
  $mapB = @{}; foreach ($r in $b) { $mapB[$r.name] = $r }

  $names = @($mapA.Keys + $mapB.Keys | Sort-Object -Unique)
  $diff = @()
  foreach ($n in $names) {
    $ra = $null; $rb = $null
    if ($mapA.ContainsKey($n)) { $ra = $mapA[$n] }
    if ($mapB.ContainsKey($n)) { $rb = $mapB[$n] }
    if (-not $ra -or -not $rb) {
      $diff += [pscustomobject]@{ name=$n; change="ADDED_OR_REMOVED"; a=($ra|ConvertTo-Json -Depth 3); b=($rb|ConvertTo-Json -Depth 3) }
      continue
    }
    if ($ra.sha256 -ne $rb.sha256 -or $ra.length -ne $rb.length) {
      $diff += [pscustomobject]@{ name=$n; change="CHANGED"; a_sha=$ra.sha256; b_sha=$rb.sha256; a_len=$ra.length; b_len=$rb.length; a_time=$ra.lastWrite; b_time=$rb.lastWrite }
    }
  }

  if ($diff.Count -eq 0) { Ok "No drift detected." }
  else {
    Warn ("DRIFT DETECTED: {0} file(s)" -f $diff.Count)
    $diff | Format-Table -AutoSize | Out-Host
  }
}

Write-Host ("RepoRoot: " + $RepoRoot)
Write-Host ("OutDir:   " + $OutDir)
Write-Host ("Seconds:  " + $Seconds) -ForegroundColor Cyan

if ($Seconds -le 0) {
  $p = Snap "ONEShot"
  Write-Host $p
  return
}

$first = Snap "START"
$end = [DateTime]::UtcNow.AddSeconds($Seconds)
while ([DateTime]::UtcNow -lt $end) { Start-Sleep -Seconds 2 }
$last = Snap "END"
Compare-Snaps $first $last
Write-Host $first
Write-Host $last
