import * as React from "react";

export type MarketingFaqItem = {
  q: string;
  a: string;
};

export type MarketingFAQProps = {
  items: MarketingFaqItem[];
};

export function MarketingFAQ({ items }: MarketingFAQProps) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="text-sm font-semibold opacity-90">FAQ</div>

      <div className="mt-4 grid gap-3">
        {items.map((it, idx) => (
          <details
            key={idx}
            className="group rounded-xl border border-white/10 bg-black/[0.18] px-4 py-3"
          >
            <summary className="cursor-pointer list-none font-semibold opacity-95">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white/50 align-middle" />
              {it.q}
            </summary>
            <div className="mt-2 text-sm leading-6 opacity-80">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default MarketingFAQ;
