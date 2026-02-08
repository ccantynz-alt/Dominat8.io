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

$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
Ensure-Dir $OutDir
$stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$dir = Join-Path $OutDir ("ENV_028_{0}" -f $stamp)
Ensure-Dir $dir
Ok ("Evidence: {0}" -f $dir)

function RunCmd([string]$name,[string]$cmd){
  $p = Join-Path $dir ($name + ".txt")
  Write-Host ("--- " + $cmd) -ForegroundColor Cyan
  try {
    $out = cmd /c $cmd 2^>^&1
    $text = ($out | Out-String)
    Write-Text $p $text
    Write-Host $text
  } catch {
    $msg = "ERR " + $_.Exception.Message
    Write-Text $p $msg
    Warn $msg
  }
}

Write-Text (Join-Path $dir "00_machine.txt") (
  "WHEN=" + (Get-Date).ToString("o") + "`r`n" +
  "COMPUTERNAME=" + $env:COMPUTERNAME + "`r`n" +
  "USERNAME=" + $env:USERNAME + "`r`n" +
  "PSVERSION=" + $PSVersionTable.PSVersion.ToString() + "`r`n" +
  "PWD=" + (Get-Location).Path + "`r`n"
)

RunCmd "01_git_version"   "git --version"
RunCmd "02_node_version"  "node --version"
RunCmd "03_npm_version"   "npm --version"
RunCmd "04_vercel_ver"    "vercel --version"
RunCmd "05_vercel_whoami" "vercel whoami"
RunCmd "06_gh_version"    "gh --version"
RunCmd "07_gh_auth"       "gh auth status"

Push-Location -LiteralPath $RepoRoot
try {
  RunCmd "08_git_status" "git status --porcelain"
  RunCmd "09_git_branch" "git rev-parse --abbrev-ref HEAD"
  RunCmd "10_git_head"   "git rev-parse HEAD"
} finally { Pop-Location }

Write-Host $dir
