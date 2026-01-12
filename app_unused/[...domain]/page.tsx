import Link from "next/link";

export const dynamic = "force-dynamic";

function kvConfigured() {
  return (
    typeof process.env.KV_REST_API_URL === "string" &&
    process.env.KV_REST_API_URL.length > 0 &&
    typeof process.env.KV_REST_API_TOKEN === "string" &&
    process.env.KV_REST_API_TOKEN.length > 0
  );
}

export default async function DomainCatchAllPage() {
  // If KV isn't configured (common in Codespaces/local),
  // do NOT crash the whole site. Show a helpful page instead.
  if (!kvConfigured()) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-lg w-full border border-gray-200 rounded-xl p-6">
          <h1 className="text-2xl font-semibold mb-2">KV not configured</h1>
          <p className="text-gray-600 mb-4">
            This route needs Vercel KV to resolve custom domains, but KV_REST_API_URL
            / KV_REST_API_TOKEN are not set in this environment.
          </p>
          <p className="text-gray-600 mb-6">
            Add these to <code className="px-1 py-0.5 bg-gray-100 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_or_test_REPLACE_ME
CLERK_SECRET_KEY=sk_live_or_test_REPLACE_ME
KV_REST_API_URL=REPLACE_ME
KV_REST_API_TOKEN=REPLACE_ME
KV_REST_API_READ_ONLY_TOKEN=REPLACE_ME
</code>{" "}
            (Codespaces) and to Vercel Environment Variables (Production).
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition"
            >
              Go home
            </Link>
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition"
            >
              Go to projects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // KV is configured: import and use it only now (prevents module crash)
  const { kv } = await import("@vercel/kv");

  // Your existing logic likely resolves domain -> project/page content.
  // We keep it safe with a minimal fallback if nothing matches.
  // NOTE: If you already had domain resolution logic, paste it back here
  //       after this "kv" import.
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg w-full border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Domain route</h1>
        <p className="text-gray-600">
          KV is configured. Next step: implement domain → project resolution here.
        </p>
      </div>
    </main>
  );
}
