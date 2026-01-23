# BOOTSTRAP Pack (Novice-safe Copy/Paste)

This folder is a "known-good" backup of critical files for the app.
When Vercel fails a build, you will copy/paste the matching file from BOOTSTRAP
into the real app path.

## Rules
- Use GitHub web editor only.
- No local git.
- No patching. Always replace the entire target file.
- Fix only the file Vercel shows in "Failed to compile".
- Commit small, one change per commit.

## How to use BOOTSTRAP (the workflow)
1) Wait for Vercel to fail.
2) Copy the exact path Vercel shows, e.g.:
   app/api/projects/[projectId]/publish/route.ts
3) In GitHub:
   - open the BOOTSTRAP version of that file:
     BOOTSTRAP/app/api/projects/[projectId]/publish/route.ts
   - copy all of it
4) Open the real file:
   app/api/projects/[projectId]/publish/route.ts
5) Replace the entire file:
   - Ctrl+A, Delete, Paste
6) Commit message format:
   Fix: restore <file path> from BOOTSTRAP

## What files will live in BOOTSTRAP
- API routes (Finish / Audit / Preview / Publish / Agents)
- Public route: /p/[projectId]
- Builder UI: /projects/[projectId]
- Stripe client: lib/stripe.ts
- Any other file that commonly breaks deploys

## Notes
- BOOTSTRAP is not executed by Next.js unless we copy it into the real paths.
- BOOTSTRAP is only a storage area for copy/paste recovery.
