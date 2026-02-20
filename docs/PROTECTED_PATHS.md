# Protected Paths Guardrails (Dominat8)

These guardrails block PRs that touch only a small set of sensitive paths. Normal feature work (e.g. `src/app/**` UI/routes) is unrestricted so CI passes without a bypass.

## What is protected

The workflow blocks PRs that modify:

- `src/middleware.ts` and `middleware.ts` (routing / auth / domain)
- `src/lib/engine/**` (core engine)
- Billing-related API routes: `src/app/api/stripe/**`, `src/app/api/billing/**`

Everything else (including `src/app/**` pages and most API routes) is **not** protected — no `[ALLOW-PROTECTED]` needed for normal builds.

## How to intentionally bypass

If you *do* need to change a protected path:

1) Edit the PR title and add:

`[ALLOW-PROTECTED]`

Example:
`[ALLOW-PROTECTED] fix: tighten domain routing`

That is an explicit “I know this is sensitive” override.

## Why this exists

- Protects routing, engine, and billing from accidental regressions
- Keeps main stable for sensitive areas only
- Normal app/feature changes pass CI automatically