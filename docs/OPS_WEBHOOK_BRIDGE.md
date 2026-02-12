# ops-webhook-bridge

A secure webhook endpoint that allows external systems (like AI agents running on Render or other platforms) to trigger GitHub Actions workflows for automated PR creation.

## Overview

The ops-webhook-bridge provides a REST API endpoint that:
- Accepts webhook POST requests with patch data
- Validates webhook signatures for security
- Triggers GitHub Actions workflow dispatch
- Creates PRs automatically via the `agent-pr.yml` workflow

## Architecture

```
External Agent (Render) → POST /api/ops-webhook-bridge → GitHub Actions Workflow → PR Created
```

## Endpoints

### GET `/api/ops-webhook-bridge`

Health check endpoint that returns configuration status.

**Response:**
```json
{
  "ok": true,
  "service": "ops-webhook-bridge",
  "version": "1.0.0",
  "config": {
    "github_token_configured": true,
    "webhook_secret_configured": true,
    "repository": "ccantynz-alt/Dominat8.io"
  },
  "timestamp": "2026-02-12T11:30:00.000Z"
}
```

### POST `/api/ops-webhook-bridge`

Trigger a GitHub Actions workflow to create a PR from a patch.

**Headers:**
- `Content-Type: application/json`
- `x-webhook-signature: sha256=<hmac-signature>` (required if `OPS_WEBHOOK_SECRET` is configured)

**Request Body:**
```json
{
  "instruction": "Natural language description of changes",
  "patch_b64": "base64-encoded git patch (optional)",
  "patch_url": "https://example.com/patch.diff (optional)",
  "pr_title": "Title for the PR (optional)",
  "auto_merge": "false (optional)"
}
```

**Note:** Either `patch_b64` or `patch_url` must be provided.

**Response (Success):**
```json
{
  "ok": true,
  "message": "Workflow dispatch triggered successfully",
  "workflow": "agent-pr.yml",
  "repository": "ccantynz-alt/Dominat8.io"
}
```

**Response (Error):**
```json
{
  "error": "Error description",
  "status": 400,
  "details": "Additional error information"
}
```

## Security

### Webhook Signature Verification

When `OPS_WEBHOOK_SECRET` is configured, all webhook requests must include a valid HMAC signature in the `x-webhook-signature` header.

**Signature Generation (example in Node.js):**
```javascript
const crypto = require('crypto');

const payload = JSON.stringify({
  instruction: "Update documentation",
  patch_url: "https://example.com/patch.diff",
  pr_title: "docs: update README"
});

const secret = process.env.OPS_WEBHOOK_SECRET;
const signature = `sha256=${crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex')}`;

// Include signature in header: x-webhook-signature
```

**Signature Generation (example in Python):**
```python
import hmac
import hashlib
import json

payload = json.dumps({
    "instruction": "Update documentation",
    "patch_url": "https://example.com/patch.diff",
    "pr_title": "docs: update README"
})

secret = os.environ['OPS_WEBHOOK_SECRET']
signature = f"sha256={hmac.new(
    secret.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()}"

# Include signature in header: x-webhook-signature
```

## Environment Variables

Required environment variables for deployment:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` and `actions:write` scopes | Yes |
| `GITHUB_REPOSITORY` | Repository in format `owner/repo` (defaults to `ccantynz-alt/Dominat8.io`) | No |
| `OPS_WEBHOOK_SECRET` | Secret key for HMAC signature verification | Recommended |

### Setting up GITHUB_TOKEN

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token (classic or fine-grained)
3. Grant the following permissions:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Actions workflows)
4. Add the token to your deployment environment as `GITHUB_TOKEN`

## Usage Examples

### Example 1: Submit a patch via URL

```bash
curl -X POST https://www.dominat8.com/api/ops-webhook-bridge \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: sha256=<signature>" \
  -d '{
    "instruction": "Fix typo in documentation",
    "patch_url": "https://example.com/patches/typo-fix.patch",
    "pr_title": "docs: fix typo in README"
  }'
```

### Example 2: Submit a base64-encoded patch

```bash
# Create a patch
git diff > changes.patch
PATCH_B64=$(base64 -w 0 changes.patch)

# Submit via webhook
curl -X POST https://www.dominat8.com/api/ops-webhook-bridge \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: sha256=<signature>" \
  -d "{
    \"instruction\": \"Add new feature\",
    \"patch_b64\": \"$PATCH_B64\",
    \"pr_title\": \"feat: add new feature\",
    \"auto_merge\": \"false\"
  }"
```

### Example 3: From a Node.js agent

```javascript
const crypto = require('crypto');
const fs = require('fs');

async function submitPatch(patchFile, instruction, prTitle) {
  const patchContent = fs.readFileSync(patchFile, 'utf8');
  const patchB64 = Buffer.from(patchContent).toString('base64');
  
  const payload = JSON.stringify({
    instruction,
    patch_b64: patchB64,
    pr_title: prTitle
  });
  
  const secret = process.env.OPS_WEBHOOK_SECRET;
  const signature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;
  
  const response = await fetch('https://www.dominat8.com/api/ops-webhook-bridge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-signature': signature
    },
    body: payload
  });
  
  return await response.json();
}

// Usage
submitPatch('changes.patch', 'Update component', 'feat: update component')
  .then(console.log)
  .catch(console.error);
```

## Testing

A test script is provided at `scripts/ops/test-webhook-bridge.mjs` for local testing.

```bash
# Set environment variables
export OPS_WEBHOOK_SECRET="your-secret-key"
export WEBHOOK_URL="http://localhost:3000/api/ops-webhook-bridge"

# Run test
node scripts/ops/test-webhook-bridge.mjs
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - workflow triggered |
| 400 | Bad Request - invalid payload or missing required fields |
| 401 | Unauthorized - invalid webhook signature |
| 500 | Internal Server Error - server configuration issue |
| 502 | Bad Gateway - failed to trigger GitHub workflow |

## Integration with agent-pr.yml

The webhook bridge triggers the existing `agent-pr.yml` workflow with the following inputs:

- `instruction`: Natural language description of the change
- `patch_b64`: Base64-encoded patch (if provided)
- `patch_url`: URL to patch file (if provided)
- `pr_title`: Title for the created PR
- `auto_merge`: Whether to label PR with auto-merge

The workflow then:
1. Creates a new branch
2. Applies the patch
3. Commits the changes
4. Pushes to GitHub
5. Creates a Pull Request
6. Optionally labels for auto-merge

## Monitoring

The webhook logs all requests with:
- Timestamp of request
- PR title and instruction summary
- Processing duration
- Success/failure status

Check application logs for webhook activity:
```bash
vercel logs <deployment-url> --follow
```

## Security Best Practices

1. **Always use HTTPS** - Never send webhooks over unencrypted connections
2. **Configure OPS_WEBHOOK_SECRET** - Enable signature verification
3. **Rotate secrets regularly** - Update webhook secrets periodically
4. **Monitor logs** - Watch for unauthorized access attempts
5. **Rate limiting** - Consider adding rate limiting for production use
6. **IP allowlisting** - If possible, restrict webhook access to known IPs
7. **Validate patches** - The agent-pr.yml workflow includes validation checks

## Troubleshooting

### "Missing GITHUB_TOKEN" error
- Ensure `GITHUB_TOKEN` is configured in your deployment environment
- Verify the token has the required permissions

### "Invalid webhook signature" error
- Check that `OPS_WEBHOOK_SECRET` matches between sender and receiver
- Ensure the signature is calculated on the raw JSON payload
- Verify the signature format: `sha256=<hex-digest>`

### "Failed to trigger workflow" error
- Verify the repository and workflow file exist
- Check that the `agent-pr.yml` workflow supports `workflow_dispatch`
- Ensure GITHUB_TOKEN has workflow permissions

### Workflow not triggering
- Check GitHub Actions tab for workflow runs
- Verify the workflow file is on the main branch
- Ensure the repository has Actions enabled
