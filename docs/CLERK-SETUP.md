# Clerk setup (minimal)

You only need to do this once per environment (local vs live).

---

## 1. Get two keys

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign in.
2. Create or open an **Application**.
3. Open **API Keys**.
4. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

---

## 2. Where to put them

| Where you're running | Where to put the keys |
|----------------------|------------------------|
| **Local** (`npm run dev`) | File **`.env.local`** in the project root. Add: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...` and `CLERK_SECRET_KEY=sk_...` |
| **Live** (Vercel) | **Vercel → your project → Settings → Environment Variables**. Add the same two variable names and paste the same values. Redeploy after saving. |

You can use the same Clerk application for both; use test keys for dev and (when ready) production keys for live.

---

## 3. Live only: allow your domain in Clerk

For sign-in to work on your live URL (e.g. `https://dominat8.io` or `https://your-app.vercel.app`):

1. In the Clerk dashboard, go to **Configure → Paths** (or **Domains / URLs**).
2. Add your **production URL** to:
   - **Allowed redirect URLs** (e.g. `https://yourdomain.com/sign-in`, `https://yourdomain.com/sign-up`)
   - **Allowed origins** (e.g. `https://yourdomain.com`)

If you skip this, sign-in may work locally but fail in production with redirect or CORS errors.

---

## 4. Optional: leave Clerk unset

If you don’t set the keys:

- **Local:** The app still runs. The proxy skips Clerk so you won’t get “Missing publishableKey”. Sign-in UI won’t work until you add keys.
- **Live:** Same — no crash, but sign-in and protected routes (/io, /cockpit, save, deploy) won’t work until you add the keys in Vercel and allow the domain in Clerk.

---

## Quick checklist

- [ ] Create a Clerk application and copy Publishable + Secret keys.
- [ ] **Local:** Add both keys to `.env.local`, then run `npm run dev`.
- [ ] **Live:** Add both keys to Vercel Environment Variables, then redeploy.
- [ ] **Live:** In Clerk dashboard, add your live URL to allowed redirect URLs and origins.

That’s it. No code changes needed for basic setup.
