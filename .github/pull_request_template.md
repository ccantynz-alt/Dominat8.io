# Dominat8 PR Checklist (Quality Gates)

## What changed?
- 

## Risk level
- [ ] Low (copy/text only)
- [ ] Medium (refactor / routing adjacent)
- [ ] High (routing, auth, billing, domains, middleware)

## Guardrails
- [ ] I ran: npm run build
- [ ] I ran: npm run lint (if present)
- [ ] I ran: npm run typecheck (if present)
- [ ] I ran: pwsh -File scripts/verify_protected_paths.ps1

## Protected paths touched?
- [ ] app/ or src/app/
- [ ] middleware
- [ ] api routes
- [ ] workflows / CI

## Verification
- [ ] I checked the live marker/stamp or proof endpoint (if relevant)
- [ ] I confirmed no 404 on: /, /pricing, /templates, /signup