# Dominat8.io — Handover

One-page context for the next person or AI session.

---

## What this is

- **Product:** Dominat8 — AI website builder. User enters prompt + industry → streaming HTML generation → preview in iframe → optional deploy.
- **Stack:** Next.js 14 (App Router + Pages), React, TypeScript, OpenAI, Vercel.

---

## Branch and deploy

- **Production:** Vercel builds **`main`**. Live domain should point at that deployment.
- **Primary feature branch:** `claude/complete-website-designs-YqxQ4` — has the Builder, middleware fix (root = Builder), CI speed-ups, relaxed guardrails, and tv route conflict fix. **Merge this into `main`** when you want it live.
- **To go live:** Merge branch → `main` → Vercel deploys. See **DEPLOY.md** for the short checklist.

---

## Key paths

| What | Where |
|------|--------|
| Builder UI | `src/io/surfaces/Builder.tsx` |
| Root page (Builder) | `src/app/page.tsx` |
| /io cockpit | `src/app/io/page.tsx` → RocketCockpit |
| Generate API | `src/app/api/io/generate/route.ts` |
| Middleware (routing) | `src/middleware.ts` |
| Deploy / CI rules | **DEPLOY.md** |
| Build continuity (AI) | `.cursor/rules/dominat8-build-continuity.mdc` |
| Protected paths | `docs/PROTECTED_PATHS.md`, `scripts/protected-paths-check.mjs` |
| Recovery (BOOTSTRAP) | `BOOTSTRAP/MANIFEST.md` |

---

## Routing (middleware)

- **`/`** → Builder (root page).
- **`/io`** → Cockpit (RocketCockpit).
- **`/tv`**, **`/api/*`**, **`/_next/*`**, **`/favicon.ico`** → pass through.
- Everything else is rewritten to `/io`. Do not break this when editing `src/middleware.ts`.

---

## Recent fixes (this session / recent work)

1. **Builder visible at root** — middleware no longer rewrites `/` to `/io`; root serves the Builder.
2. **Pages vs App conflict** — removed `src/pages/tv.tsx` so only App Router handles `/tv` (avoids Vercel build error).
3. **Faster deploy loop** — DEPLOY.md added; CI has concurrency (new push cancels previous); d8-gate disabled; d8_ci_build skips on `main`; guardrails relaxed to middleware/engine/billing only.
4. **Vercel “.next not found”** — if build succeeds but Vercel says `.next` not found at `.../github/.next`, set Vercel Project Settings → Root Directory to **empty** (repo root).

---

## Conventions to keep

- **Generator:** Single self-contained HTML; required sections (Nav, Hero, Features, Social proof, CTA, Footer); no Lorem; strict iframe sandbox (no `allow-same-origin` + `allow-scripts`); validate `OPENAI_API_KEY`.
- **CI:** One main workflow for PRs to `main`; protected paths = middleware, `src/lib/engine/`, Stripe/billing API routes only. Use `[ALLOW-PROTECTED]` in PR title only when changing those.
- **Agents:** Specs in `agents/`; wiring via API and KV.

---

## Uncommitted / optional

- **`.cursor/`** — Cursor rules and config; can stay untracked or be committed.
- Any local tweaks to workflows or docs that weren’t pushed are only on your machine.

---

## Quick commands

```bash
# Build and run locally
npm ci && npm run build && npm run start

# Check branch vs origin
git status && git branch -v && git log --oneline -3
```

---

*Last handover context: Builder at `/`, /io cockpit at `/io`, CI simplified, guardrails relaxed, Vercel Root Directory fix documented. Merge `claude/complete-website-designs-YqxQ4` into `main` to ship.*
