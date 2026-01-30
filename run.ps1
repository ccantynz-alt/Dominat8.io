Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

$env:PYTHONPATH = (Get-Location).Path
Write-Host ("PYTHONPATH=" + $env:PYTHONPATH) -ForegroundColor Yellow

python -c "import importlib; m=importlib.import_module('backend.app.server'); print('IMPORT_OK:', m)"

python -m uvicorn backend.app.server:app --host 127.0.0.1 --port 8000 --reload