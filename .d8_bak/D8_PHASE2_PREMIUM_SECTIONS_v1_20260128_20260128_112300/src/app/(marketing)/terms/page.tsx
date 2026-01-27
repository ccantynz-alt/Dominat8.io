import Link from "next/link";

export const metadata = {
  title: "Terms — Dominat8",
  description: "Terms of service for Dominat8.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← Back home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm opacity-80">
        This is a starter Terms page to unblock marketing + SEO. Replace with your final legal text.
      </p>

      <section className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div>
          <div className="text-sm font-semibold">1) Service</div>
          <div className="mt-2 text-sm opacity-80">
            Dominat8 provides tools to generate, optimize, and publish websites. Features may change over time.
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">2) Accounts</div>
          <div className="mt-2 text-sm opacity-80">
            You are responsible for maintaining access to your account and the content you publish.
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">3) Publishing</div>
          <div className="mt-2 text-sm opacity-80">
            You are responsible for content accuracy, compliance, and rights to publish any material generated or uploaded.
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">4) Liability</div>
          <div className="mt-2 text-sm opacity-80">
            Service is provided “as is” to the maximum extent permitted by law. Replace this with your legal wording.
          </div>
        </div>

        <div className="pt-2 text-xs opacity-60">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </div>
      </section>
    </main>
  );
}