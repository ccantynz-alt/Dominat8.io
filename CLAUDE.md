# Dominat8.io — Claude Code Configuration

## GitHub Full Control Setup

Claude needs a **GitHub PAT** with admin access to approve PRs, merge branches, and manage Actions.

### One-time setup (run this on your machine or here)

1. Create a PAT at https://github.com/settings/tokens/new
   Required scopes: `repo`, `workflow`, `pull_requests`, `admin:repo_hook`

2. Add it as a repo secret named `GH_CLAUDE_PAT`:
   ```
   gh secret set GH_CLAUDE_PAT --repo ccantynz-alt/Dominat8.io
   ```

3. Run the auth setup script in this environment:
   ```bash
   GH_TOKEN=ghp_YOUR_TOKEN bash scripts/gh-auth-setup.sh --persist
   ```

### Automated PR flow

Once `GH_CLAUDE_PAT` is set as a repo secret:
- Any PR from a `claude/*` branch will be **auto-approved + auto-merged** once all checks pass
- Workflow: `.github/workflows/auto-approve-merge.yml`

### Manual merge (any PR)

```bash
GH_TOKEN=ghp_YOUR_TOKEN bash scripts/gh-merge-pr.sh <PR_NUMBER>
```

### Environment notes

- Git proxy: `http://local_proxy@127.0.0.1:54107/git/` (auto-configured)
- GitHub API proxy: use `HTTPS_PROXY=$GLOBAL_AGENT_HTTP_PROXY`
- `gh` CLI is installed at `/usr/bin/gh` (v2.45.0)

## Repo

- Owner: `ccantynz-alt`
- Repo: `Dominat8.io`
- Main branch protection: requires 1 approving review + `enforce_admins: true`

## Development branches

Claude develops on `claude/*` branches. The auto-approve workflow handles merging.