# Dominat8.io — Setup guide (if this is your first time)

This guide is for anyone who sees the repo and thinks: *"I don’t know where to start."* Follow the steps in order. You don’t need to understand everything; you can copy and paste.

---

## What you need on your computer

1. **Node.js** (the runtime that runs the app)  
   - Download from [nodejs.org](https://nodejs.org/) — pick the **LTS** version.  
   - After installing, open a **new** terminal and run: `node -v`  
   - You should see something like `v20.x.x`. If you get “command not found”, Node isn’t installed or isn’t on your PATH.

2. **A code editor** (optional but helpful)  
   - VS Code or Cursor is enough. You mainly need it to edit one file: `.env.local`.

3. **A terminal**  
   - On Windows: PowerShell or Command Prompt.  
   - On Mac/Linux: Terminal.

---

## Step 1: Get the code and install dependencies

In the terminal, go to the project folder (the one that contains `package.json`), then run:

```bash
npm install
```

**What this does:** Installs every library the app needs (Next.js, Clerk, OpenAI, etc.). You only need to do this once (or after pulling new code that changes dependencies).

---

## Step 2: Create your environment file

The app needs **secrets** (API keys) so it can talk to sign-in, AI, and payments. Those go in a file that is **not** committed to git.

1. In the project folder, find the file **`.env.example`**.
2. **Copy** it and name the copy **`.env.local`** (same folder).  
   - Windows (PowerShell): `Copy-Item .env.example .env.local`  
   - Mac/Linux: `cp .env.example .env.local`
3. Open **`.env.local`** in your editor. You’ll fill in the values below.

**What this file is:** A list of “variables” (keys and values). Each line is something like `NAME=value`. The app reads these when it starts. Never commit `.env.local` or share it; it contains secrets.

---

## Step 3: Minimum setup (see the app and try Generate)

To **run the app and use the Builder** (home page + “Generate Site”), you only need **two** services:

### 3a. Clerk (sign-in)

- Go to [clerk.com](https://clerk.com) and create a free account and a new **Application**.
- In the Clerk dashboard, open **API Keys**.
- Copy the **Publishable key** (starts with `pk_`) and the **Secret key** (starts with `sk_`).
- In `.env.local`, set:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` (paste your key)
  - `CLERK_SECRET_KEY=sk_test_...` (paste your key)
- Leave the lines like `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` as they are unless you changed the sign-in page path.

**What Clerk is:** It handles “Sign in” and “Sign up”. The app won’t let you use the Builder or Generate until you’re signed in. Clerk does that for us.

### 3b. OpenAI (website generation)

- Go to [platform.openai.com](https://platform.openai.com/api-keys) and create an API key.
- In `.env.local`, set:
  - `OPENAI_API_KEY=sk-...` (paste your key)

**What this is:** The “Generate Site” button sends your prompt to OpenAI to create the HTML. No key = generation will fail with a message like “OpenAI API key not configured”.

---

## Step 4: Run the app

In the project folder, in the terminal:

```bash
npm run dev
```

You should see something like:

- `Local: http://localhost:3000`

Open that URL in your browser. You should see the Dominat8 home (Builder).

- If you’re **not** signed in, you’ll be redirected to sign-in. Sign up or sign in with Clerk.
- Then you can type a prompt and click **Generate Site**. The first time might take a minute; it’s calling OpenAI.

**What “dev” means:** This runs the app in **development** mode: it restarts when you change code and shows clearer errors. For putting the site on the internet you’ll use `npm run build` and a host like Vercel (see below).

---

## Step 5 (optional): Payments, usage tracking, and sharing

These are only needed if you want:

- **Pricing / payments** → Stripe keys and webhook (see `.env.example` comments).
- **Usage limits and plans** → Vercel KV (the app can run without this; generation still works).
- **Save and share generated sites** → Vercel Blob.

You can leave those variables empty or as placeholders until you’re ready. The app will still run and generate; some features (e.g. “Save” or “Upgrade”) may show errors or be disabled.

---

## Step 6: Build and run a production check (optional)

To make sure the site **builds** correctly (as it would on a server):

```bash
npm run build
```

If that finishes without errors, the project is in good shape. To run the built app locally:

```bash
npm start
```

Then open `http://localhost:3000` again. This is closer to how it will behave when deployed.

---

## Deploying to the internet (e.g. Vercel)

1. Push your code to GitHub (and don’t commit `.env.local`).
2. Go to [vercel.com](https://vercel.com), sign in, and **Import** your repo.
3. In the Vercel project, go to **Settings → Environment Variables**.
4. Add the **same** variables you put in `.env.local` (Clerk, OpenAI, and any others you use). Use the same names (e.g. `OPENAI_API_KEY`, `CLERK_SECRET_KEY`).
5. For Clerk: in the Clerk dashboard, add your Vercel URL (e.g. `https://your-app.vercel.app`) to allowed redirect/origin URLs.
6. Deploy. Vercel will run `npm run build` and then serve the app.

**What “deploy” means:** Your app runs on Vercel’s servers so anyone with the link can open it. Environment variables you set in Vercel are used instead of `.env.local`.

---

## Quick reference: “What do I run?”

| Goal                     | Command           |
|--------------------------|-------------------|
| Install dependencies     | `npm install`     |
| Run app locally (dev)    | `npm run dev`     |
| Build for production     | `npm run build`   |
| Run built app locally    | `npm start`       |
| One-shot build check     | `npm run keep-build` (see FINISH-SITE.md) |

---

## Troubleshooting (things that confuse people)

- **“Sign in to generate” or 401**  
  You must be signed in (Clerk). Use Sign up / Sign in. Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in `.env.local`.

- **“OpenAI API key not configured”**  
  Add `OPENAI_API_KEY=sk-...` to `.env.local` and restart the dev server (`npm run dev`).

- **“Invalid project directory” when running lint**  
  Known quirk on some setups. Use `npm run finish-build:no-lint` or set `SKIP_LINT=1` when running scripts (see FINISH-SITE.md).

- **Build fails**  
  Run `node -v` and ensure you’re on Node 20.x (or the version in `package.json` “engines”). Run `npm install` again, then `npm run build`.

- **Port 3000 already in use**  
  Another app is using that port. Stop it or run `npm run dev -- -p 3001` to use port 3001.

- **Where do I change the home page?**  
  The main home is the Builder. The code is in `src/app/page.tsx` (which renders the Builder) and `src/io/surfaces/Builder.tsx`.

---

## More docs

- **FINISH-SITE.md** — Commands for “finish the build” and overnight runs; env summary.
- **.env.example** — Full list of environment variables with short comments.

If you’re still stuck, check that you completed Step 1 (install), Step 2 (`.env.local`), Step 3 (Clerk + OpenAI keys), and Step 4 (`npm run dev`). Most “it doesn’t work” cases are a missing key or a typo in `.env.local`.
