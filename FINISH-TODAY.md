# Finish the site today

Use this as your **single checklist** to get Dominat8.io to a shippable state.

---

## 1. Local: confirm it works

| Step | Command / action |
|------|------------------|
| Install | `npm install` |
| Env | Copy `.env.example` → `.env.local`, add at least **OpenAI** + **Clerk** keys (see [SETUP-NOVICE.md](./SETUP-NOVICE.md)) |
| Build | `npm run build` — must finish with no errors |
| Run | `npm run dev` → open http://localhost:3000 |
| Try | Open home → type a prompt → click **Generate Site** (no sign-in needed). You should see HTML in the preview. |
| Optional | Sign in → generate again → click **Save** to test save flow. |

If any step fails, fix it before deploying. Most “Generate” failures are missing `OPENAI_API_KEY` in `.env.local`.

---

## 2. Get to live (Vercel)

- **main** is protected: you can’t push directly. Use a **pull request**.
- Create a branch from your current work (e.g. `deploy-to-live` or use the branch you’re on), push it, then open a PR into **main**. Use **Squash and merge** so main gets one clean commit.
- In **Vercel** → your project → **Settings → Environment Variables**, add the same variables you use locally (at minimum: `OPENAI_API_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). Same names as in `.env.example`.
- In **Clerk** dashboard, add your production URL (e.g. `https://dominat8.io` or `https://your-app.vercel.app`) to allowed redirect/origin URLs.
- After merging to main (or the branch Vercel builds from), Vercel will redeploy. Wait for the build to pass.

---

## 3. Build failing on Vercel?

- **“runtime mustn’t be reexported” on opengraph-image**  
  The route file must define the OG image **inline** (no `export { ... } from "../src/..."`). The fix is in `app/opengraph-image.tsx`: it should contain the full `ImageResponse` component and `runtime` / `alt` / `size` / `contentType` in that same file. If your branch still has the old re-export, merge or cherry-pick the commit that inlines it, or copy the content from the current `app/opengraph-image.tsx`.

- **Node / engine warnings**  
  `package.json` may pin Node 20.x; Vercel will use that. Optional: set **Node.js Version** in Vercel project settings if you want a different version.

---

## 4. Critical path (what “finished” means)

- [ ] **Home** loads (Builder with gold fog, prompt, Generate button).
- [ ] **Generate Site** works without sign-in (prompt → streaming HTML in preview).
- [ ] **Sign in / Sign up** works (Clerk); after sign-in, **Save** and **Deploy** / cockpit work.
- [ ] **Build** passes locally and on Vercel.
- [ ] **Env** on Vercel: OpenAI + Clerk set; optional: Stripe, KV, Blob for payments, usage, save.

Once these are true, the site is in a shippable state. You can polish (copy, trust badges, mobile) after.

---

## 5. Quick reference

| Goal | Command / doc |
|------|----------------|
| First-time setup | [SETUP-NOVICE.md](./SETUP-NOVICE.md) |
| Env variables | [.env.example](./.env.example) |
| Build / overnight scripts | [FINISH-SITE.md](./FINISH-SITE.md) |
| Product / first impressions | [docs/FIRST_IMPRESSIONS.md](./docs/FIRST_IMPRESSIONS.md) |
