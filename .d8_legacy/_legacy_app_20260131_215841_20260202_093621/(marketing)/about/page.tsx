import Link from "next/link";
import MarketingCTA from "@/src/components/marketing/MarketingCTA";
import SeoJsonLd from "@/src/components/marketing/SeoJsonLd";

export const metadata = {
  title: "About — Dominat8",
  description:
    "Dominat8 is an AI website automation builder for generating, optimizing, and publishing high-converting websites.",
};

export default function AboutPage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dominat8",
    url: "https://www.dominat8.com",
    description:
      "AI website automation builder for generating, optimizing, and publishing high-converting websites.",
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <SeoJsonLd data={orgJsonLd} />

      <div className="mb-6">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← Back home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">About Dominat8</h1>
      <p className="mt-3 text-base opacity-80">
        Dominat8 helps you build and ship websites faster using AI agents. Generate a complete site
        foundation, run SEO + conversion passes, then publish to your custom domain.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">What we focus on</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm opacity-80">
          <li>Speed: get from idea to published site fast</li>
          <li>Growth: SEO structure, metadata, and conversion-first pages</li>
          <li>Automation: repeatable agent-driven workflows</li>
          <li>Quality: clean output that’s easy to refine and publish</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
        <div className="text-sm font-semibold">Next step</div>
        <p className="mt-2 text-sm opacity-80">
          Start free and generate your first website.
        </p>
        <div className="mt-4">
          <MarketingCTA />
        </div>
      </section>
    </main>
  );
}