#!/usr/bin/env bash
# ============================================================
# gh-check.sh — verify GitHub auth and integration health
# ============================================================
# Usage:  bash scripts/gh-check.sh
# ============================================================
set -euo pipefail

REPO="ccantynz-alt/Dominat8.io"
PASS=0
FAIL=0

ok()   { echo "  ✓ $1"; ((PASS++)); }
fail() { echo "  ✗ $1"; ((FAIL++)); }

echo "=== GitHub Integration Health Check ==="
echo ""

# 1. gh CLI installed
echo "[1/5] gh CLI"
if command -v gh &>/dev/null; then
  ok "gh found at $(command -v gh) — $(gh --version | head -1)"
else
  fail "gh CLI not installed"
fi

# 2. Git proxy configured
echo "[2/5] Git proxy"
REMOTE_URL=$(git -C "$(dirname "$0")/.." remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" == *"127.0.0.1"* ]]; then
  ok "Git remote uses local proxy"
else
  fail "Git remote not using local proxy: $REMOTE_URL"
fi

# 3. GLOBAL_AGENT_HTTP_PROXY set
echo "[3/5] API proxy"
if [[ -n "${GLOBAL_AGENT_HTTP_PROXY:-}" ]]; then
  ok "GLOBAL_AGENT_HTTP_PROXY is set"
else
  fail "GLOBAL_AGENT_HTTP_PROXY not set — gh API calls may fail"
fi

# 4. gh CLI authenticated
echo "[4/5] gh CLI auth"
GH_USER=$(HTTPS_PROXY="${HTTPS_PROXY:-${GLOBAL_AGENT_HTTP_PROXY:-}}" gh api user --jq '.login' 2>/dev/null || echo "")
if [[ -n "$GH_USER" ]]; then
  ok "Authenticated as: $GH_USER"
else
  fail "gh CLI not authenticated — run: GH_TOKEN=<pat> bash scripts/gh-auth-setup.sh --persist"
fi

# 5. Can reach repo
echo "[5/5] Repo access"
REPO_NAME=$(HTTPS_PROXY="${HTTPS_PROXY:-${GLOBAL_AGENT_HTTP_PROXY:-}}" gh api "repos/$REPO" --jq '.full_name' 2>/dev/null || echo "")
if [[ "$REPO_NAME" == "$REPO" ]]; then
  ok "Repo $REPO is accessible"
else
  fail "Cannot reach $REPO — check token scopes or network"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && echo "All checks passed." || echo "Fix the failures above before proceeding."
exit $FAIL
