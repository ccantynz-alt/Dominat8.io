# Dominat8.io — Claude Code Configuration

## Repo

- Owner: `ccantynz-alt`
- Repo: `Dominat8.io`
- Main branch protection: requires 1 approving review + `enforce_admins: true`

## Development branches

Claude develops on `claude/*` branches. The auto-approve workflow handles merging.

## Authentication — Dual-Account Setup

Two GitHub accounts serve distinct roles:

| Account | Role | Used for |
|---|---|---|
| `ccantynz-alt` | Repo owner | Pushes code, creates PRs |
| `ccantyusa-hue` | Approver | Approves + merges PRs (via `GH_CLAUDE_PAT`) |

GitHub blocks self-approval, so the approve/merge token **must** come from `ccantyusa-hue`.

### Required secrets (repo settings)

| Secret | Source account | Purpose |
|---|---|---|
| `GH_CLAUDE_PAT` | `ccantyusa-hue` | Classic PAT — auto-approve + merge `claude/*` PRs |
| `ANTHROPIC_API_KEY` | Anthropic | Tier 2 AI healing in `d8_agent_autofix.yml` (optional) |
| `GITHUB_TOKEN` | (auto-provided) | Default Actions token for CI, checkout, PR creation |

### GH_CLAUDE_PAT — required scopes

Classic token from `ccantyusa-hue` with:
- `repo` — full repo access (read/write/merge)
- `workflow` — trigger and interact with Actions
- `admin:repo_hook` — manage webhooks

Set as repo secret:
```
gh secret set GH_CLAUDE_PAT --repo ccantynz-alt/Dominat8.io
```

### Automated PR flow

Once `GH_CLAUDE_PAT` is configured:
1. Claude pushes to `claude/*` branch
2. PR is created targeting `main`
3. CI checks run (`ci.yml`, `d8-keep-green.yml`)
4. `auto-approve-merge.yml` approves (as `ccantyusa-hue`) and squash-merges

Workflow: `.github/workflows/auto-approve-merge.yml`

### Manual merge (any PR)

```bash
GH_TOKEN=ghp_YOUR_TOKEN bash scripts/gh-merge-pr.sh <PR_NUMBER>
```

### Verify setup

Run the health check:
```bash
bash scripts/gh-check.sh
```

## Environment notes

- Git proxy: auto-configured per session (port changes each time — do not hardcode)
- GitHub API proxy: use `HTTPS_PROXY=$GLOBAL_AGENT_HTTP_PROXY`
- `gh` CLI: installed at `/usr/bin/gh`
