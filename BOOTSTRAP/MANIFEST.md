# BOOTSTRAP MANIFEST — my-saas-app

This manifest maps **Bootstrap files → Live files**.
When something breaks, Vercel will tell you the failing file.
You then replace it using the matching BOOTSTRAP file (full copy/paste).

---

## HOW TO USE (NOVICE SAFE)
1. Look at next build
2. Identify the file path (example: app/api/projects/[projectId]/publish/route.ts).
3. Open the matching BOOTSTRAP file.
4. Copy everything.
5. Replace the live file completely.
6. Commit ONE file.

No patching. No guessing.

---

## CORE BOOTSTRAP FILES

### 1) Builder UI (Finish → Audit → Publish → Agent)
- BOOTSTRAP:
  - `BOOTSTRAP/app/projects/[projectId]/page.tsx`
- Replaces live:
  - `app/projects/[projectId]/page.tsx`
- Use when:
  - Finish button broken
  - Audit not updating
  - Publish button does nothing
  - Conversion Agent not clickable
  - Debug panels missing

---

### 2) Publish Route (Audit + Pro Gate)
- BOOTSTRAP:
  - `BOOTSTRAP/app/api/projects/[projectId]/publish/route.ts`
- Replaces live:
  - `app/api/projects/[projectId]/publish/route.ts`
- Use when:
  - Publish returns wrong status
  - Free users can publish
  - Pro users blocked
  - /p/<projectId> says not published after publish
  - Stripe upgrade not triggered

---

### 3) Public Page (/p/<projectId>)
- BOOTSTRAP:
  - `BOOTSTRAP/app/p/[projectId]/page.tsx`
- Replaces live:
  - `app/p/[projectId]/page.tsx`
- Use when:
  - “This site isn’t published yet” shows incorrectly
  - Public page blank
  - Wrong KV key used

---

### 4) Preview Route
- BOOTSTRAP:
  - `BOOTSTRAP/app/api/projects/[projectId]/preview/route.ts`
- Replaces live:
  - `app/api/projects/[projectId]/preview/route.ts`
- Use when:
  - Preview iframe blank
  - Reload preview does nothing
  - Finish succeeded but no preview

---

### 5) Audit Route
- BOOTSTRAP:
  - `BOOTSTRAP/app/api/projects/[projectId]/audit/route.ts`
- Replaces live:
  - `app/api/projects/[projectId]/audit/route.ts`
- Use when:
  - Audit always fails
  - Audit blocks publish incorrectly
  - Audit rules too strict / inconsistent

---

### 6) Conversion Agent Route
- BOOTSTRAP:
  - `BOOTSTRAP/app/api/projects/[projectId]/agents/conversion/route.ts`
- Replaces live:
  - `app/api/projects/[projectId]/agents/conversion/route.ts`
- Use when:
  - Conversion Agent button not clickable
  - Agent runs but HTML not changing
  - Calls/meetings language not removed
  - Trust strip / pricing teaser not injected

---

### 7) Stripe Client
- BOOTSTRAP:
  - `BOOTSTRAP/lib/stripe.ts`
- Replaces live:
  - `lib/stripe.ts`
- Use when:
  - next build
  - Checkout sessions fail to create
  - Upgrade link missing

---

## REQUIRED ENVIRONMENT VARIABLES (VERCEL)
These must exist or Pro gating will feel “broken”:

- STRIPE_SECRET_KEY
- STRIPE_PRICE_ID
- NEXT_PUBLIC_APP_URL (e.g. https://my-saas-app-5eyw.vercel.app)

---

## GUARANTEES THIS SYSTEM PROVIDES
- Any single-file failure is recoverable in minutes
- No local tools required
- No partial edits
- Deterministic behavior for Finish / Audit / Publish / Pro

---

## GOLDEN RULE
If something breaks:
**Replace the file Vercel complains about with its BOOTSTRAP version.**
