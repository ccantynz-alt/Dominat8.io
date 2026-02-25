# Dominat8.io

Generate. Launch. Rank. — AI-powered website builder: describe your business, get a full site in seconds. Sign in to use the Builder; generate, preview, and deploy from the cockpit.

---

## New here? Start here.

**First time setting this up?** Use the step-by-step guide:

- **[SETUP-NOVICE.md](./SETUP-NOVICE.md)** — Install Node, copy `.env.local`, add Clerk + OpenAI keys, run `npm run dev`. Written so you don’t need to already know the stack.

**Already comfortable with Node/Next?** Quick start:

```bash
npm install
cp .env.example .env.local   # then edit .env.local with your keys
npm run dev
```

Required for the Builder and “Generate Site”: **Clerk** (sign-in) and **OpenAI** (generation). See [docs/CLERK-SETUP.md](./docs/CLERK-SETUP.md) for a minimal Clerk checklist, or `.env.example` and [SETUP-NOVICE.md](./SETUP-NOVICE.md) for the full setup.

---

## Scripts and deploy

- **Finish today:** [FINISH-TODAY.md](./FINISH-TODAY.md) — checklist to get the site built, running locally, and deployed to live (Vercel + env).
- **Build & quality:** [FINISH-SITE.md](./FINISH-SITE.md) — `npm run keep-build`, `npm run finish:overnight`, env checklist.
- **Env reference:** [.env.example](./.env.example) — all variables with short comments.

---

## Tech

- **Next.js 16** (App Router), **Clerk** (auth), **OpenAI** (generation), **Stripe** (payments), **Vercel KV/Blob** (optional usage and storage).
