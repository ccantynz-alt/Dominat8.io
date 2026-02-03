Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location -LiteralPath "C:\Temp\FARMS\Dominat8.io-clone"
$out = "C:\Temp\FARMS\Dominat8.io-clone\_doctor_out_20260203_201539"

function Tee([string]$name, [string]$value) {
  "$name: $value" | Tee-Object -FilePath (Join-Path $out "A1_ENV_PREFLIGHT.txt") -Append | Out-Null
}

"=== A1 ENV PREFLIGHT ===" | Tee-Object -FilePath (Join-Path $out "A1_ENV_PREFLIGHT.txt") | Out-Null

Tee "pwd" (Get-Location).Path
Tee "time" (Get-Date).ToString("o")

try { Tee "git" (git --version) } catch { Tee "git" "MISSING" }
try { Tee "node" (node -v) } catch { Tee "node" "MISSING" }
try { Tee "npm" (npm -v) } catch { Tee "npm" "MISSING" }

try {
  $sb = git status -sb
  "
=== git status -sb ===
$sb" | Tee-Object -FilePath (Join-Path $out "A1_GIT_STATUS.txt") | Out-Null
} catch {
  "git status failed: $_" | Tee-Object -FilePath (Join-Path $out "A1_GIT_STATUS.txt") | Out-Null
}

try {
  $pj = Get-Content -LiteralPath ".\package.json" -Raw
  $eng = (ConvertFrom-Json $pj).engines.node
  "
package.json engines.node = "$eng"" | Tee-Object -FilePath (Join-Path $out "A1_PACKAGE_ENGINES.txt") | Out-Null
} catch {
  "Could not read engines.node: $_" | Tee-Object -FilePath (Join-Path $out "A1_PACKAGE_ENGINES.txt") | Out-Null
}

"=== A1 DONE ===" | Tee-Object -FilePath (Join-Path $out "A1_ENV_PREFLIGHT.txt") -Append | Out-Null
