Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail($msg) { throw "ERROR: $msg" }
function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllBytes($Path, $enc.GetBytes($Content))
}
function FirstLine-File([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return "[MISSING]" }
  return (Get-Content -LiteralPath $Path -TotalCount 1)
}

Write-Host "Repo path: $((Resolve-Path -LiteralPath '.').Path)"
Write-Host ("Branch  : " + (git rev-parse --abbrev-ref HEAD))
Write-Host ("HEAD    : " + (git rev-parse HEAD))
Write-Host "Origin  :"
git remote -v

$target = ".\src\app\page.tsx"
if (-not (Test-Path -LiteralPath ".\src\app")) { New-Item -ItemType Directory -Path ".\src\app" | Out-Null }

Write-Host ""
Write-Host "DISK first line BEFORE:"
Write-Host ("  " + (FirstLine-File $target))

# HARD OVERWRITE page.tsx — this removes any accidental pasted junk like C:\Users\...
$home = @"
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative grid gap-10 px-8 py-14 md:grid-cols-2 md:px-12 md:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI Website Builder • From brief → live website
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
              A website that looks premium —
              <span className="text-white/70"> built in minutes</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
              Dominat8 generates a complete site from a short brief: pages, copy, layout, and SEO basics.
              You review, tweak, and publish fast.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/templates"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-200"
              >
                Browse templates
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                View pricing
              </Link>

              <a href="/templates" className="text-sm font-semibold text-white/80 hover:text-white">
                Get started →
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div>
                <div className="text-xl font-bold">3 min</div>
                <div className="mt-1 text-xs text-white/70">to first draft</div>
              </div>
              <div>
                <div className="text-xl font-bold">SEO-ready</div>
                <div className="mt-1 text-xs text-white/70">sitemap + meta</div>
              </div>
              <div>
                <div className="text-xl font-bold">1 click</div>
                <div className="mt-1 text-xs text-white/70">publish</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/90">Preview</div>
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/70">
                Marketing site draft
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="h-3 w-24 rounded bg-white/20" />
                <div className="mt-4 h-7 w-3/4 rounded bg-white/15" />
                <div className="mt-3 h-3 w-5/6 rounded bg-white/10" />
                <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
                <div className="mt-6 flex gap-3">
                  <div className="h-9 w-28 rounded-xl bg-white/20" />
                  <div className="h-9 w-28 rounded-xl border border-white/15" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="h-3 w-20 rounded bg-white/15" />
                  <div className="mt-3 h-3 w-full rounded bg-white/10" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-white/10" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="h-3 w-20 rounded bg-white/15" />
                  <div className="mt-3 h-3 w-full rounded bg-white/10" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-white/10" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
                Tip: start with a template, then let the agents fill content + SEO.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Pages included", desc: "Homepage, pricing, templates, use-cases — consistent design." },
          { title: "AI copy that converts", desc: "Headlines, benefits, FAQs and CTAs — ready to tweak." },
          { title: "Publish-ready basics", desc: "Canonical, sitemap, metadata — clean baseline." },
        ].map((f) => (
          <div key={f.title} className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">{f.title}</div>
            <div className="mt-2 text-sm leading-6 opacity-80">{f.desc}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border bg-white p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to see a real draft?</h2>
            <p className="mt-2 text-sm opacity-80">Start from a template and publish when it looks right.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/templates" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">
              Get started
            </Link>
            <Link href="/pricing" className="rounded-xl border px-5 py-3 text-sm font-semibold">
              Compare plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
"@

Write-Utf8NoBom $target $home

Write-Host ""
Write-Host "DISK first line AFTER:"
Write-Host ("  " + (FirstLine-File $target))

git add "src/app/page.tsx"
Write-Host ""
Write-Host "STAGED first line:"
git show ":src/app/page.tsx" | Select-Object -First 1

# Safety check: fail if staged still starts with Windows path
$first = (git show ":src/app/page.tsx" | Select-Object -First 1)
if ($first -match '^[A-Za-z]:\\') { Fail "Still corrupted after rewrite (starts with Windows path)." }

# Commit/push
$staged = (git diff --cached --name-only)
if ($staged) {
  git commit -m "fix: repair homepage file (remove Windows-path corruption)"
} else {
  Write-Host "No staged changes to commit."
}

git fetch origin
git push origin HEAD:main --force

Write-Host ""
Write-Host "ORIGIN first line AFTER push:"
git show "origin/main:src/app/page.tsx" | Select-Object -First 1

Write-Host ""
Write-Host "== Deploy PROD =="
vercel --prod --force
if ($LASTEXITCODE -ne 0) { Fail "vercel deploy failed." }

Write-Host ""
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
Write-Host "✅ LIVE (cache-busted):"
Write-Host ("  https://www.dominat8.com/?ts=" + $ts)