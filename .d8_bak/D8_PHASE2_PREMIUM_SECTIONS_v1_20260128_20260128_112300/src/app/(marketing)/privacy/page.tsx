import Link from "next/link";

export const metadata = {
  title: "Privacy — Dominat8",
  description: "Privacy policy for Dominat8.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← Back home
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm opacity-80">
        This is a starter Privacy page to unblock marketing + SEO. Replace with your final legal text.
      </p>

      <section className="mt-8 space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div>
          <div className="text-sm font-semibold">What we collect</div>
          <div className="mt-2 text-sm opacity-80">
            Account information and usage data needed to provide and improve the service. Replace with specifics.
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">How we use data</div>
          <div className="mt-2 text-sm opacity-80">
            To operate Dominat8, support customers, improve performance, and maintain security.
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Publishing content</div>
          <div className="mt-2 text-sm opacity-80">
            Content you publish is controlled by you. Ensure you have rights to publish and share it.
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Contact</div>
          <div className="mt-2 text-sm opacity-80">
            Add your support email/contact channel here.
          </div>
        </div>

        <div className="pt-2 text-xs opacity-60">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </div>
      </section>
    </main>
  );
}