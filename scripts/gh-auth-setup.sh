#!/usr/bin/env bash
# ============================================================
# gh-auth-setup.sh — configure gh CLI for full GitHub control
# ============================================================
# Usage:
#   export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
#   bash scripts/gh-auth-setup.sh
#
# Or run once to persist the token into ~/.config/gh/config.yml:
#   GH_TOKEN=<pat> bash scripts/gh-auth-setup.sh --persist
# ============================================================
set -euo pipefail

PERSIST=false
[[ "${1:-}" == "--persist" ]] && PERSIST=true

if [[ -z "${GH_TOKEN:-}" ]]; then
  echo "ERROR: GH_TOKEN is not set."
  echo ""
  echo "Create a GitHub PAT at:"
  echo "  https://github.com/settings/tokens/new?scopes=repo,workflow,admin:repo_hook,pull_requests"
  echo ""
  echo "Then run:  GH_TOKEN=ghp_... bash scripts/gh-auth-setup.sh"
  exit 1
fi

# Install gh if missing
if ! command -v gh &>/dev/null; then
  echo "Installing gh CLI…"
  apt-get install -y gh 2>/dev/null || \
    (type -t apt-get &>/dev/null && apt-get update -qq && apt-get install -y gh) || \
    echo "Could not auto-install gh. Install from https://cli.github.com"
fi

# Configure the proxy (required in this environment)
gh config set http_proxy "${HTTPS_PROXY:-${GLOBAL_AGENT_HTTP_PROXY:-}}" 2>/dev/null || true

# Verify auth works
if HTTPS_PROXY="${HTTPS_PROXY:-${GLOBAL_AGENT_HTTP_PROXY:-}}" GH_TOKEN="$GH_TOKEN" gh api user --jq '.login' 2>/dev/null; then
  echo "✓ Authenticated successfully"
else
  echo "✗ Auth check failed — token may lack required scopes"
  exit 1
fi

if $PERSIST; then
  mkdir -p ~/.config/gh
  cat > ~/.config/gh/hosts.yml <<YAML
github.com:
    oauth_token: ${GH_TOKEN}
    git_protocol: https
    user: ccantynz-alt
YAML
  echo "✓ Token persisted to ~/.config/gh/hosts.yml"
  echo "  gh CLI is now ready without GH_TOKEN env var"
fi

echo ""
echo "Ready. Sample commands:"
echo "  gh pr list --repo ccantynz-alt/Dominat8.io"
echo "  gh pr review <N> --repo ccantynz-alt/Dominat8.io --approve"
echo "  gh pr merge <N> --repo ccantynz-alt/Dominat8.io --squash"
echo "  gh api repos/ccantynz-alt/Dominat8.io/branches/main/protection"
