import { BUILD_MARKER, MONSTER_MARKER } from "../../lib/buildMarker";

export function MarketingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(900px_circle_at_80%_15%,rgba(16,185,129,0.14),transparent_55%),radial-gradient(700px_circle_at_50%_90%,rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.74),rgba(255,255,255,1))]" />
    </div>
  );
}

export function TopBar() {
  return (
    <div className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Green deployments enabled
          </span>
          <span className="hidden md:inline text-slate-500">
            Marker: <span className="font-mono text-slate-700">{MONSTER_MARKER}</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <a className="hover:text-slate-900" href="/__status">Status</a>
          <a className="hover:text-slate-900" href="/pricing">Pricing</a>
          <a className="hover:text-slate-900" href="/templates">Templates</a>
        </div>
      </div>
    </div>
  );
}

export function HeaderNav() {
  return (
    <header className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <span className="text-sm font-semibold">D8</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Dominat8</div>
            <div className="text-xs text-slate-600">AI website automation builder</div>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-slate-700 md:flex">
          <a className="hover:text-slate-950" href="/templates">Templates</a>
          <a className="hover:text-slate-950" href="/use-cases">Use cases</a>
          <a className="hover:text-slate-950" href="/pricing">Pricing</a>
          <a className="hover:text-slate-950" href="/faq">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <a className="rounded-xl px-4 py-2 text-sm text-slate-700 hover:text-slate-950" href="/sign-in">
            Sign in
          </a>
          <a
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm"
            href="/p/new"
          >
            Generate my site
          </a>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-500">
        BUILD: <span className="font-mono text-slate-700">{BUILD_MARKER}</span>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">Dominat8</div>
            <div className="mt-1 text-xs text-slate-600">
              Marker: <span className="font-mono text-slate-700">{MONSTER_MARKER}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
            <a className="hover:text-slate-950" href="/templates">Templates</a>
            <a className="hover:text-slate-950" href="/use-cases">Use cases</a>
            <a className="hover:text-slate-950" href="/pricing">Pricing</a>
            <a className="hover:text-slate-950" href="/faq">FAQ</a>
            <a className="hover:text-slate-950" href="/contact">Contact</a>
            <a className="hover:text-slate-950" href="/terms">Terms</a>
            <a className="hover:text-slate-950" href="/__status">Status</a>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} Dominat8. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function PageHeader({ eyebrow, title, subtitle, rightSlot }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-2 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow ? (
            <div className="inline-flex items-center rounded-full bg-white/80 px-4 py-2 text-xs text-slate-700 ring-1 ring-slate-200 shadow-sm">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        {rightSlot ? <div className="md:pb-2">{rightSlot}</div> : null}
      </div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, linkText, linkHref }) {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          {eyebrow ? <div className="text-xs font-semibold text-slate-600">{eyebrow}</div> : null}
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm text-slate-700">
              {subtitle}
            </p>
          ) : null}
        </div>
        {linkText && linkHref ? (
          <a className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline" href={linkHref}>
            {linkText} <span className="opacity-70">→</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function CardGrid({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-14">
      <div className="grid gap-5 md:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

export function Card({ title, desc, href, meta }) {
  return (
    <a
      href={href || "#"}
      className="group rounded-3xl bg-white/85 p-6 ring-1 ring-slate-200 shadow-sm hover:bg-white transition"
    >
      <div className="text-xs text-slate-500">{meta || "Premium output"}</div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{title}</div>
      <div className="mt-2 text-sm text-slate-700 leading-relaxed">{desc}</div>
      <div className="mt-5 text-sm font-semibold text-slate-900 group-hover:underline">
        Learn more →
      </div>
    </a>
  );
}

export function LogoCloud({ label }) {
  const logos = ["NORTH", "LAGOON", "BRIGHT", "CLOUD", "STUDIO", "OPERATOR"];
  return (
    <div className="mx-auto max-w-6xl px-6 pb-12">
      <div className="rounded-3xl bg-white/70 p-6 ring-1 ring-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-600">{label || "Trusted pattern"}</div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((l) => (
            <div key={l} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 text-center tracking-widest">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <details key={item.q} className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950 flex items-center justify-between">
            <span>{item.q}</span>
            <span className="text-slate-400 group-open:rotate-45 transition">+</span>
          </summary>
          <div className="mt-3 text-sm leading-relaxed text-slate-700">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function TemplateGalleryCard({ title, desc, tag, href }) {
  return (
    <a href={href || "/p/new"} className="group rounded-3xl bg-white/85 ring-1 ring-slate-200 shadow-sm hover:bg-white transition overflow-hidden">
      <div className="h-36 bg-[radial-gradient(600px_circle_at_20%_10%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(500px_circle_at_80%_30%,rgba(16,185,129,0.14),transparent_60%)]" />
      <div className="p-6">
        <div className="text-xs text-slate-500">{tag || "Template"}</div>
        <div className="mt-2 text-lg font-semibold text-slate-950">{title}</div>
        <div className="mt-2 text-sm leading-relaxed text-slate-700">{desc}</div>
        <div className="mt-5 text-sm font-semibold text-slate-900 group-hover:underline">
          Preview →
        </div>
      </div>
    </a>
  );
}
