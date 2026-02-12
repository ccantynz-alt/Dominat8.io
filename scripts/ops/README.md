# Ops Scripts

This directory contains operational scripts for the Dominat8.io platform.

## Scripts

### ops-guard-agent.mjs

Production health monitoring and automatic rollback script.

**Purpose:**
- Monitors production deployment health
- Automatically rolls back to previous deployment if health checks fail
- Integrates with Vercel API for deployment management

**Usage:**
```bash
VERCEL_TOKEN=xxx \
VERCEL_PROJECT_ID=xxx \
VERCEL_TEAM_ID=xxx \
OPS_DOMAINS="dominat8.com,www.dominat8.com" \
node scripts/ops/ops-guard-agent.mjs
```

**Environment Variables:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VERCEL_TEAM_ID` - Vercel team ID (optional)
- `OPS_DOMAINS` - Comma-separated list of production domains
- `OPS_BASE_URL` - Base URL for health checks (default: https://www.dominat8.com)

### test-webhook-bridge.mjs

Test suite for the ops-webhook-bridge API endpoint.

**Purpose:**
- Validates webhook endpoint functionality
- Tests signature verification
- Tests payload validation
- Tests error handling

**Usage:**
```bash
# Without signature verification
WEBHOOK_URL="http://localhost:3000/api/ops-webhook-bridge" \
node scripts/ops/test-webhook-bridge.mjs

# With signature verification
WEBHOOK_URL="http://localhost:3000/api/ops-webhook-bridge" \
OPS_WEBHOOK_SECRET="your-secret-key" \
node scripts/ops/test-webhook-bridge.mjs
```

**Tests:**
1. Health check (GET endpoint)
2. Missing required fields validation
3. Invalid signature rejection
4. Valid payload with patch_url
5. Valid payload with patch_b64

See [OPS_WEBHOOK_BRIDGE.md](../../docs/OPS_WEBHOOK_BRIDGE.md) for complete documentation.

## Related Documentation

- [OPS_WEBHOOK_BRIDGE.md](../../docs/OPS_WEBHOOK_BRIDGE.md) - Complete webhook bridge documentation
- [OPS_WEBHOOK_BRIDGE.env.example](../../docs/OPS_WEBHOOK_BRIDGE.env.example) - Environment variable example
