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
$Mode     = (Get-ArgValue "Mode" "Report").ToLowerInvariant()   # Report | Lock | Unlock

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$MonsterDir = Join-Path $RepoRoot "tools\monster"
if (-not (Test-Path -LiteralPath $MonsterDir)) { Fail ("Missing: {0}" -f $MonsterDir) }

Write-Host ("RepoRoot:   " + $RepoRoot)
Write-Host ("MonsterDir: " + $MonsterDir)
Write-Host ("Mode:       " + $Mode) -ForegroundColor Cyan

function Report {
  Write-Host ""
  Write-Host "== ATTRIBUTES ==" -ForegroundColor Cyan
  Get-ChildItem -LiteralPath $MonsterDir -File |
    Select-Object Name,Length,LastWriteTime,Attributes |
    Sort-Object Name | Format-Table -AutoSize

  Write-Host ""
  Write-Host "== ACL (folder) ==" -ForegroundColor Cyan
  (Get-Acl -LiteralPath $MonsterDir).Access |
    Select-Object IdentityReference,FileSystemRights,AccessControlType,IsInherited,InheritanceFlags,PropagationFlags |
    Format-Table -AutoSize
}

function Lock {
  Write-Host ""
  Write-Host "Locking (ReadOnly attribute on files)..." -ForegroundColor Yellow
  Get-ChildItem -LiteralPath $MonsterDir -File | ForEach-Object {
    try { $_.Attributes = ($_.Attributes -bor [IO.FileAttributes]::ReadOnly) } catch {}
  }
  Ok "ReadOnly attribute applied to all monster files."
  Report
}

function Unlock {
  Write-Host ""
  Write-Host "Unlocking (remove ReadOnly attribute on files)..." -ForegroundColor Yellow
  Get-ChildItem -LiteralPath $MonsterDir -File | ForEach-Object {
    try { $_.Attributes = ($_.Attributes -band (-bnot [IO.FileAttributes]::ReadOnly)) } catch {}
  }
  Ok "ReadOnly attribute removed from all monster files."
  Report
}

switch ($Mode) {
  "report" { Report }
  "lock"   { Lock }
  "unlock" { Unlock }
  default  { Fail "Mode must be Report|Lock|Unlock" }
}
