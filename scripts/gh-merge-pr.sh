#!/usr/bin/env bash
# ============================================================
# gh-merge-pr.sh — full-control PR approve + merge
# ============================================================
# Requires GH_TOKEN env var or ~/.config/gh/hosts.yml auth.
# Usage:
#   GH_TOKEN=ghp_... bash scripts/gh-merge-pr.sh <PR_NUMBER>
#   bash scripts/gh-merge-pr.sh 40
# ============================================================
set -euo pipefail

PR="${1:-}"
REPO="ccantynz-alt/Dominat8.io"

if [[ -z "$PR" ]]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

GH="HTTPS_PROXY=${HTTPS_PROXY:-${GLOBAL_AGENT_HTTP_PROXY:-}} gh"

# Validate credentials before proceeding
echo "==> Validating credentials"
if ! AUTH_USER=$(eval "$GH api user --jq '.login'" 2>&1); then
  echo "ERROR: Bad credentials. Your GH_TOKEN is expired, revoked, or not set."
  echo "  Detail: $AUTH_USER"
  echo ""
  echo "Fix: regenerate the PAT and re-export:"
  echo "  export GH_TOKEN=ghp_..."
  echo "  bash scripts/gh-merge-pr.sh $PR"
  echo ""
  echo "Or re-run gh-auth-setup.sh:"
  echo "  GH_TOKEN=ghp_... bash scripts/gh-auth-setup.sh"
  exit 1
fi
echo "✓ Authenticated as $AUTH_USER"

echo "==> PR #$PR status"
eval "$GH pr view $PR --repo $REPO --json title,state,mergeable,reviews"

echo ""
echo "==> Approving PR #$PR"
eval "$GH pr review $PR --repo $REPO --approve --body 'Auto-approved by Claude operator'" && echo "✓ Approved"

echo ""
echo "==> Merging PR #$PR (squash)"
eval "$GH pr merge $PR --repo $REPO --squash --delete-branch" && echo "✓ Merged"
