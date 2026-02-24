# Deploy — get it live, fast

**One rule:** Merge to `main` → Vercel deploys to production. That’s it.

- **Production:** Vercel builds the `main` branch. Point your live domain (e.g. dominat8.io) at that deployment.
- **Previews:** Every PR gets a preview URL. Use it to check before merging.
- **To ship:** Merge your branch into `main` (e.g. complete the PR). No extra steps.

## For AI / rapid iteration

- Work on a branch. Push. Open PR. Merge when green → live.
- CI runs one build on PRs to `main`. Protected-path checks only block when you change middleware, `src/lib/engine/`, or billing/Stripe routes; normal app changes pass.
- If CI is slow, the latest push cancels the previous run (concurrency), so you’re not waiting on stale builds.

## Checklist before merging to main

1. Branch builds locally: `npm ci && npm run build`
2. No conflicting routes (e.g. only one of `pages/X` or `app/X` for the same path)
3. Merge → wait for Vercel to finish → check live URL

## If Vercel says ".next was not found at .../github/.next"

The build succeeded but Vercel is looking in the wrong place. **Fix:** In Vercel → Project Settings → General → **Root Directory**: set to **empty** (or `.`) so the app root is the repo root. Leave **Output Directory** empty so Next.js uses `.next`. Save and redeploy.
