Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Utf8NoBomFile {
  param([Parameter(Mandatory=$true)][string]$Path, [Parameter(Mandatory=$true)][string]$Content)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Assert-Tool { param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Missing required tool on PATH: $Name" }
}

function Find-RepoRoot {
  param([Parameter(Mandatory=$true)][string]$StartDir)
  $cur = (Resolve-Path -LiteralPath $StartDir).Path
  while ($true) {
    if (Test-Path -LiteralPath (Join-Path $cur ".git")) { return $cur }
    $parent = Split-Path -Parent $cur
    if ($parent -eq $cur -or $parent -eq "") { throw "Not inside a git repo. cd into your Dominat8 repo and re-run." }
    $cur = $parent
  }
}

# Preconditions
Assert-Tool git
Assert-Tool node
Assert-Tool npm

$repo = Find-RepoRoot -StartDir (Get-Location).Path
Set-Location -LiteralPath $repo

if (-not (Test-Path -LiteralPath ".\package.json")) { throw "package.json missing. Not repo root." }
if (-not (Test-Path -LiteralPath ".\src\app"))      { throw "src\app missing. Not a Next.js App Router repo." }

$ciPath     = ".\.github\workflows\d8_ci_build.yml"
$deployPath = ".\.github\workflows\d8_vercel_deploy.yml"
$readmePath = ".\.github\D8_AUTOMATION_README.md"

$ciYaml = @"
name: D8 CI - Build Gate

on:
  push:
    branches: ["**"]
  pull_request:

concurrency:
  group: d8-ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build
"@

$deployYaml = @"
name: D8 Deploy - Vercel (Prod)

on:
  workflow_dispatch:
  push:
    branches: ["main"]

concurrency:
  group: d8-deploy-prod
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Build (gate)
        run: npm run build

      - name: Deploy to Vercel (prod)
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID }}
        run: |
          npx vercel pull --yes --environment=production --token "\$VERCEL_TOKEN"
          npx vercel deploy --prod --token "\$VERCEL_TOKEN"

      - name: Proof (homepage headers)
        run: |
          ts=\$(date +%s)
          curl -s -D - --max-time 20 -H "cache-control: no-cache" -H "pragma: no-cache" "https://www.dominat8.com/?ts=\$ts" | head -n 40
"@

$readme = @"
# Dominat8 Automation (Installed)

This repo has two workflows:

## 1) D8 CI - Build Gate
Runs on every push + PR:
- npm ci
- npm run build

## 2) D8 Deploy - Vercel (Prod)
Runs:
- manually (workflow_dispatch)
- automatically on push to main

### Required GitHub Secrets
Repo -> Settings -> Secrets and variables -> Actions:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
"@

Write-Utf8NoBomFile -Path $ciPath -Content $ciYaml
Write-Utf8NoBomFile -Path $deployPath -Content $deployYaml
Write-Utf8NoBomFile -Path $readmePath -Content $readme

git add -A

$changes = (git status --porcelain)
if (-not $changes) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
  exit 0
}

$stamp = "D8_AUTOMATION_BOOTSTRAP_2026-02-01"
git commit -m $stamp
git push

Write-Host ""
Write-Host "INSTALLED: CI build gate + Vercel deploy workflow files committed and pushed." -ForegroundColor Green
Write-Host "NEXT: Add GitHub Secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID" -ForegroundColor Yellow