# Finish the site — overnight & one-shot

**First time setting up?** See [SETUP-NOVICE.md](./SETUP-NOVICE.md) for install, env, and run.

## One-shot (run now)

```bash
# Full pipeline once (no server needed)
SKIP_SMOKE=1 SKIP_LINT=1 npm run keep-build
```

**Windows (PowerShell):**

```powershell
$env:SKIP_SMOKE="1"; $env:SKIP_LINT="1"; npm run keep-build
```

## Overnight (run before bed)

Loop for **8 hours**, every **20 minutes**: heal → doctor → typecheck → auto-improve → build. Logs to `keep-build-moving.log`.

```bash
npm run finish:overnight
```

**Custom duration (e.g. 4 hours, every 15 min):**

```bash
DURATION_HOURS=4 INTERVAL_MINUTES=15 npm run finish:overnight
```

**Windows (PowerShell):**

```powershell
$env:DURATION_HOURS="8"; $env:INTERVAL_MINUTES="20"; npm run finish:overnight
```

## Env for deploy

Copy `.env.example` to `.env.local` and set at least:

| Variable | Required for |
|----------|----------------|
| `OPENAI_API_KEY` | Builder “Generate Site” |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | Sign-in, cockpit |
| `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` | Pricing, payments |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Usage/plan (optional; generate works without) |
| `BLOB_READ_WRITE_TOKEN` | Save/share links (optional) |

## Notes

- **Lint:** On this setup `next lint` can fail with “Invalid project directory …/lint”. Use `SKIP_LINT=1` or `npm run finish-build:no-lint`.
- **Typecheck:** Passes; aquarium uses `// @ts-nocheck` for R3F JSX until global types are wired.
- **Smoke:** Run with dev server (`npm run dev`) and omit `SKIP_SMOKE=1` to hit `/`, `/pricing`, `/icon`, `/healthz`, etc.
