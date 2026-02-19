# Deployment Automation Guide

## Overview
This repository uses automated deployment workflows to safely deploy code to staging and production environments.

## Workflows

### ✅ Continuous Integration (d8_ci_build.yml)
- **Trigger**: Automatically runs on every push and pull request
- **Purpose**: Validates that code builds successfully
- **Actions**: 
  - Installs dependencies
  - Runs build
  - Uploads build logs on failure

### 🚀 Deployment Pipeline (deploy.yml)
This workflow handles automated deployment to staging and manual deployment to production.

#### Staging Deployment (Automatic)
- **Trigger**: Automatically runs when code is pushed to `main` branch
- **Requirements**: CI tests must pass first
- **Environment**: Staging/Preview environment
- **Actions**:
  1. Runs CI tests (build validation)
  2. Automatically deploys to Vercel staging
  3. Provides deployment URL
  4. Sends success/failure notifications

#### Production Deployment (Manual Approval Required)
- **Trigger**: After successful staging deployment
- **Requirements**: Manual approval via GitHub Actions UI
- **Environment**: Production environment
- **Actions**:
  1. Waits for manual approval
  2. Deploys to Vercel production
  3. Provides deployment URL
  4. Sends success/failure notifications

#### Rollback (Manual)
- **Trigger**: Manual workflow dispatch
- **Purpose**: Roll back production to previous version
- **Actions**:
  1. Checks out previous commit
  2. Deploys previous version to production
  3. Sends rollback status notifications

### 🔧 Agent PR (agent-pr.yml)
- **Trigger**: Manual workflow dispatch only
- **Purpose**: Apply patches and create pull requests
- **Status**: Kept for manual use only, no auto-triggers

## Removed Workflows

### ❌ Auto-Fix Agent (REMOVED)
The `d8_agent_autofix.yml` workflow has been removed as it:
- Created 27 unwanted pull requests in an infinite loop
- Was causing automation chaos
- Did not follow proper deployment practices

## How to Use

### Automatic Staging Deployment
1. Merge code to `main` branch
2. CI tests run automatically
3. If tests pass, staging deployment happens automatically
4. Check the Actions tab for deployment URL

### Manual Production Deployment
1. After staging deployment succeeds
2. Go to Actions → Deploy to Staging & Production workflow
3. Find the workflow run
4. Click "Review deployments"
5. Approve the production deployment
6. Production deploys automatically after approval

### Emergency Rollback
1. Go to Actions → Deploy to Staging & Production
2. Click "Run workflow" button
3. Select "rollback" from the "Deployment action" dropdown
4. Click "Run workflow"
5. The rollback job will deploy the previous version to production

## Required Secrets

To use the deployment workflow, configure these GitHub secrets:

- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

## Environment Configuration

### GitHub Environments
The workflow uses GitHub Environments for deployment protection:

1. **staging** - No approval required
2. **production** - Requires manual approval
3. **production-rollback** - Requires manual approval

Configure these in: Repository Settings → Environments

### Setting up Manual Approvals
1. Go to Settings → Environments → production
2. Enable "Required reviewers"
3. Add team members who can approve deployments
4. Save protection rules

## Notifications

The workflow provides console notifications for:
- ✅ CI test success/failure
- ✅ Staging deployment success/failure
- ✅ Production deployment success/failure
- ✅ Rollback success/failure

For enhanced notifications, consider integrating:
- Slack notifications
- Email notifications
- Status badges in README

## Best Practices

1. **Always test on staging first** - Never skip staging deployment
2. **Review staging thoroughly** - Check the staging URL before approving production
3. **Use rollback if needed** - Don't hesitate to rollback if issues are found
4. **Monitor deployments** - Watch the Actions tab during deployments
5. **Keep secrets secure** - Rotate tokens regularly

## Troubleshooting

### Deployment fails with token error
- Verify VERCEL_TOKEN secret is set and valid
- Check token has proper permissions

### CI gate fails
- Check build logs in Actions tab
- Fix build errors before attempting deployment
- Do not bypass CI checks

### Production approval not showing
- Verify environment "production" exists
- Check required reviewers are configured
- Ensure you have proper permissions

## Migration Notes

This replaces the previous broken auto-fix workflow that:
- Automatically created PRs on CI failures
- Had infinite loop issues
- Lacked proper deployment controls

The new workflow provides:
- ✅ Predictable deployment pipeline
- ✅ Manual production approval gates
- ✅ Easy rollback capability
- ✅ Clear status notifications
- ❌ No automatic code fixing (prevents chaos)
