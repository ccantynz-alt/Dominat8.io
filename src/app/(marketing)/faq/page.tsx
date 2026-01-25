import Link from "next/link";
import MarketingCTA from "@/src/components/marketing/MarketingCTA";
import MarketingFAQ from "@/components/marketing/MarketingFAQ";
import SeoJsonLd from "@/src/components/marketing/SeoJsonLd";
import { marketingFaq } from "@/src/lib/marketing/faq";

export const metadata = {
  title: "FAQ â€” Dominat8",
  description:
    "Answers to common questions about Dominat8: AI website generation, SEO, publishing, and domains.",
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: marketingFaq.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <SeoJsonLd data={faqJsonLd} />

      <div className="mb-6">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          â† Back home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
      <p className="mt-3 text-base opacity-80">
        Quick answers about how Dominat8 works.
      </p>

      <MarketingFAQ items={marketingFaq} />

      <section className="mt-10 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
        <div className="text-sm font-semibold">Still have questions?</div>
        <p className="mt-2 text-sm opacity-80">
          Start free and explore the workflow â€” youâ€™ll see how the agents generate and refine your site.
        </p>
        <div className="mt-4">
          <MarketingCTA />
        </div>
      </section>
    </main>
  );
}
