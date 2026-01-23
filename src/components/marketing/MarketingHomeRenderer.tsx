import * as React from "react";

type AnyObj = Record<string, any>;

const s = (v: any, f = "") => (typeof v === "string" ? v : f);
const a = (v: any) => (Array.isArray(v) ? v : []);
const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(" ");

export default function MarketingHomeRenderer({
  homepage,
  flow,
  debug,
}: {
  homepage: AnyObj | null;
  flow: AnyObj | null;
  debug?: boolean;
}) {
  const hp = homepage || {};
  const fl = flow || {};

  const hero = hp.hero || hp.header || {};
  const title = s(hero.title || hp.title, "Dominate your website automation.");
  const subtitle = s(hero.subtitle || hp.subtitle, "");
  const kicker = s(hero.kicker, "");

  const primary = hero.ctaPrimary || hp.ctaPrimary || {};
  const primaryLabel = s(primary.label, "Get started");
  const primaryHref = s(primary.href, "/sign-in");

  const steps = a(fl.steps || fl.cards || fl.flow);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {debug && (
        <pre className="mb-6 rounded-xl border p-3 text-xs">
          homepage keys: {Object.keys(hp).join(", ")}{"\n"}
          flow keys: {Object.keys(fl).join(", ")}
        </pre>
      )}

      <section className="rounded-3xl border p-8">
        {kicker && <div className="mb-2 text-xs opacity-70">{kicker}</div>}
        <h1 className="text-4xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-3 opacity-80">{subtitle}</p>}
        <a href={primaryHref} className="mt-6 inline-block rounded-xl bg-black px-5 py-3 text-white">
          {primaryLabel}
        </a>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className={cx("mt-6 grid gap-4", "md:grid-cols-3")}>
          {steps.length ? (
            steps.map((s2: any, i: number) => (
              <div key={i} className="rounded-3xl border p-6">
                <div className="text-sm opacity-60">Step {i + 1}</div>
                <div className="mt-2 text-lg font-semibold">{s(s2.title, `Step ${i + 1}`)}</div>
                {s2.body && <div className="mt-2 text-sm opacity-80">{s2.body}</div>}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border p-6 opacity-70">
              No flow steps found. Update marketing KV and refresh.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
