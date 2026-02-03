Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "C:\Temp\FARMS\Dominat8.io-clone"
$out = "C:\Temp\FARMS\Dominat8.io-clone\_doctor_out_20260203_201539"

Write-Host "
=== A4 PUSH + DEPLOY ===" -ForegroundColor Cyan

# Show status
git status -sb | Tee-Object -FilePath (Join-Path $out "A4_git_status_before.txt") | Out-Null

if (git diff --name-only) {
  git add -A
  git commit -m "RECOVERY: unblock build (safe machine stubs) + guard param fixes" | Tee-Object -FilePath (Join-Path $out "A4_git_commit.txt") | Out-Null
} else {
  Write-Host "No changes to commit." -ForegroundColor DarkGray
}

if (-not False) {
  git push | Tee-Object -FilePath (Join-Path $out "A4_git_push.txt") | Out-Null
  Write-Host "Pushed to origin/main." -ForegroundColor Green
} else {
  Write-Host "SKIP: push disabled (-SkipPush)" -ForegroundColor Yellow
}

# Optional Vercel CLI deploy (if installed/logged in)
if (-not False) {
  Write-Host "
--- Vercel CLI check ---" -ForegroundColor Yellow
  try {
    vercel --version | Tee-Object -FilePath (Join-Path $out "A4_vercel_version.txt") | Out-Null

    # If you're already linked/logged in, this will deploy prod.
    # If it prompts, stop and run manually in an interactive session.
    Write-Host "Attempting: vercel --prod --force" -ForegroundColor Yellow
    vercel --prod --force 2>&1 | Tee-Object -FilePath (Join-Path $out "A4_vercel_prod_deploy.txt")
  } catch {
    Write-Host "Vercel CLI deploy skipped/failed (not installed or not logged in): $_" -ForegroundColor Yellow
  }
} else {
  Write-Host "SKIP: Vercel CLI disabled (-SkipVercelCli)" -ForegroundColor Yellow
}

Write-Host "
=== A4 DONE ===" -ForegroundColor Green
