# Dominat8 overnight run

One script that **improves the site** (auto-improve) then **verifies** (heal → typecheck → lint → build → smoke). Run it and go to bed; in the morning the codebase is in better shape.

## What “builds” overnight

- **Auto-improve** (new): adds missing layouts (cockpit, templates), loading UI for those routes, and runs lint. It **never** touches the home page (Gold Fog), icons, or Builder UI.
- **Heal**: fixes known issues (e.g. router conflicts, corrupted files).
- **Doctor**: reports routing/config issues.
- **Typecheck + Lint + Build**: verifies everything compiles.
- **Smoke**: hits key URLs to catch 404s.

In **loop mode** the same pipeline runs every N minutes (e.g. every 30 min for 8 hours). Each run can add more improvements (e.g. new layouts/loading if you add new routes later) and re-verify.

## When to run

- **Before bed** — start it and leave it. In the morning, check `overnight-run.log` in the project root.
- **After pulling big changes** — one shot to verify everything still builds and key routes respond.
- **Loop mode** — run every 30 minutes for 8 hours to catch flakiness or env issues.

## Quick start

**One run (heal → typecheck → lint → build → smoke):**

```bash
npm run overnight
```

Smoke checks hit `http://localhost:3000`. **Start the app in another terminal first** if you want smoke to pass:

```bash
# Terminal 1
npm run dev

# Terminal 2 (after dev is up)
npm run overnight
```

If you don’t have a server running, smoke will fail but build/heal/typecheck/lint still run. To skip smoke:

```bash
SKIP_SMOKE=1 npm run overnight
```

**Loop overnight (e.g. every 30 min for 8 hours):**

**PowerShell (Windows):**

```powershell
$env:RUN_LOOP="1"; $env:INTERVAL_MINUTES="30"; $env:DURATION_HOURS="8"; npm run overnight
```

**Bash / WSL / Mac:**

```bash
RUN_LOOP=1 INTERVAL_MINUTES=30 DURATION_HOURS=8 npm run overnight
```

## What the script does

1. **Heal** — runs `scripts/heal.mjs` (fixes known issues: PowerShell-in-tsx, router conflicts, shim checks).
2. **Doctor** — runs `scripts/doctor.mjs` (reports routing/config issues; does not fix).
3. **Typecheck** — `npm run typecheck`.
4. **Lint** — `npm run lint`.
5. **Auto-improve** — runs `scripts/auto-improve.mjs`: adds cockpit/templates layouts and loading UI if missing, runs lint. Never touches home, Gold Fog, or icons.
6. **Build** — `npm run build`. If it fails, runs heal again and retries build once.
7. **Smoke** — GETs key routes (/, /pricing, /templates, /gallery, /about, /icon, /opengraph-image, /healthz, /sitemap.xml, /robots.txt, /api/__d8__/stamp) and logs any non-2xx.

All output is appended to `overnight-run.log` (or `LOG_FILE` if set).

## Env vars

| Env | Meaning |
|-----|--------|
| `SMOKE_BASE_URL` | Base URL for smoke (default `http://localhost:3000`) |
| `SKIP_SMOKE` | `1` = skip HTTP smoke checks |
| `RUN_LOOP` | `1` = run in a loop |
| `INTERVAL_MINUTES` | Minutes between runs in loop (default 30) |
| `DURATION_HOURS` | How long to loop in hours (default 8) |
| `LOG_FILE` | Full path for the log file |

## When you can go to bed

- Start **one** of:
  - `npm run overnight` (one run), or  
  - Loop mode with the env vars above.
- Leave the terminal open (or run in a background session if you prefer).
- In the morning, open `overnight-run.log` and search for `FAIL`, `failed`, or `Build still failed` to see if anything needs attention.

No human contact required until you check the log.
