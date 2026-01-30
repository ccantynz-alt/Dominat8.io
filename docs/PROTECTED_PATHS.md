# Protected Paths Guardrails (Dominat8)

These guardrails prevent accidental “core” changes from slipping into main.

## What is protected

The workflow blocks PRs that modify (examples):

- `src/app/**` (core UI routes)
- `middleware.ts` / `src/middleware.ts` (routing / auth / domain handling)
- API routes (e.g. `pages/api/**`)
- build config (`package.json`, `next.config.*`, `vercel.json`)
- CI workflows (`.github/workflows/**`)

## How to intentionally bypass

If you *do* need to change a protected path:

1) Edit the PR title and add:

`[ALLOW-PROTECTED]`

Example:
`[ALLOW-PROTECTED] fix: tighten domain routing`

That is an explicit “I know this is sensitive” override.

## Why this exists

- Prevents accidental regressions
- Keeps main stable
- Makes changes intentional and reviewable