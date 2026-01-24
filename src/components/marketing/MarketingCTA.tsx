import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function MarketingCTA({
  title = "Launch your next site in minutes",
  subtitle = "Answer a few questions — Dominat8 generates a complete, publish-ready website with SEO fundamentals baked in.",
  primaryHref = "/templates",
  primaryLabel = "Browse templates",
  secondaryHref = "/pricing",
  secondaryLabel = "See pricing",
}: Props) {
  return (
    <section className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">{subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}