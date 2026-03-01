# Copilot Instructions for Dominat8.io

## Project Overview

Dominat8.io is an AI-powered website builder. Users describe their business and the platform generates a complete, professional website in seconds. The application is built with Next.js (App Router) and deployed on Vercel.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with React 18
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4, global CSS in `src/app/globals.css`
- **Auth:** Clerk (`@clerk/nextjs`)
- **Payments:** Stripe
- **Storage:** Vercel KV (`@vercel/kv`), Vercel Blob (`@vercel/blob`)
- **Email:** Resend
- **AI:** OpenAI, Anthropic SDKs
- **Validation:** Zod
- **Node.js:** 20.x

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # React components (d8/, dxl/, marketing/, shared/, terminal/)
  lib/           # Business logic, stores, utilities, engine
  middleware.ts  # Clerk auth + subdomain routing
  core/          # Core domain logic
  server/        # Server-side utilities
  shared/        # Shared types and utilities
  ui/            # UI primitives
  widgets/       # Composite UI widgets
styles/          # Additional global stylesheets
public/          # Static assets
```

## Development Commands

```bash
npm ci            # Install dependencies (use ci, not install, for reproducible builds)
npm run dev       # Start local dev server
npm run build     # Production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type checking (tsc --noEmit)
```

## Coding Standards

- Use TypeScript for all new code; do not add plain `.js` files under `src/`.
- Follow the existing ESLint configuration (`next/core-web-vitals`).
- Use the `@/*` path alias for imports (maps to `./src/*` and `./*`).
- Components go in `src/components/` under the appropriate subdirectory.
- API routes go in `src/app/api/`.
- Keep `src/middleware.ts` minimal — it handles Clerk auth and subdomain routing.

## Important Conventions

- **Protected paths:** Some files are guarded by `scripts/protected-paths-check.mjs` in CI. Include `[ALLOW_PROTECTED]` in the PR title if changes touch protected paths.
- **PR template:** Follow the PR template in `.github/pull_request_template.md` — include proof URLs and safety checks.
- **No UI regressions:** Unless explicitly intended, changes should not alter the visible UI.
- **Cache headers:** API and health routes use `no-store, max-age=0` — do not change cache behavior without discussion.

## Testing

There is no automated test suite currently configured. Validate changes by:
1. Running `npm run build` to confirm the production build succeeds.
2. Running `npm run lint` and `npm run typecheck` for code quality.
3. Manual verification of affected routes.
