D8 WEBHOOK BRIDGE — SETUP

Root Directory in Vercel MUST be:
  ops/webhook-bridge

Vercel Env Vars to set:
  BRIDGE_SHARED_SECRET = (choose strong random)
  GH_OWNER            = ccantynz-alt
  GH_REPO             = Dominat8.io
  GH_REF              = main
  GH_WORKFLOWS        = watchdog.yml,d8-red-sweeper.yml
  GH_TOKEN            = fine-grained PAT (repo-scoped) with Actions: Write

Webhook endpoint to paste into Vercel/Render:
  https://<bridge-project>.vercel.app/api/hook?secret=<BRIDGE_SHARED_SECRET>

Test:
  Invoke-WebRequest -Method POST -ContentType "application/json" -Body "{`"ping`":true}" -Uri "https://<bridge>.vercel.app/api/hook?secret=<secret>"