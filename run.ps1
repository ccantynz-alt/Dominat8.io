Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Run from repo root
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

# Make repo root importable so "backend.*" works
$env:PYTHONPATH = (Get-Location).Path
Write-Host ("PYTHONPATH=" + $env:PYTHONPATH) -ForegroundColor Yellow

# Prove import
python -c "import importlib; m=importlib.import_module('backend.app.server'); print('IMPORT_OK:', m)"

# Start API
python -m uvicorn backend.app.server:app --host 0.0.0.0 --port 8000 --reload