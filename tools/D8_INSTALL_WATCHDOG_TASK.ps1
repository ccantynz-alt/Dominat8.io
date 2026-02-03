Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Installs a Windows Scheduled Task that runs the watchdog at login and keeps it running.
# Run PowerShell as Administrator for best results.

$RepoRoot = "C:\Temp\FARMS\Dominat8.io-clone"
$Script = Join-Path $RepoRoot "tools\D8_RENDER_WATCHDOG_KEEP_GREEN.ps1"

if (-not (Test-Path -LiteralPath $Script)) { throw "Missing watchdog script: $Script" }

$TaskName = "D8_Render_Watchdog_KeepGreen"

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ("-NoProfile -ExecutionPolicy Bypass -File "$Script"")
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
} catch {}

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest | Out-Null

Write-Host "OK: Installed scheduled task: $TaskName" -ForegroundColor Green
Write-Host "To remove: Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false" -ForegroundColor Yellow
