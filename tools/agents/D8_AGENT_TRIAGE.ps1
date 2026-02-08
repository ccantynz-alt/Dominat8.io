[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference="Stop"

function Info($m){Write-Host "INFO $m" -ForegroundColor Gray}
Info "gh workflow list"
gh workflow list | Out-Host
Info "gh run list --limit 15"
gh run list --limit 15 | Out-Host