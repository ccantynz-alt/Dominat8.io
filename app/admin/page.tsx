import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <p className="text-muted-foreground">
        System administration and internal tools.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/program-pages"
          className="block rounded-lg border p-4 hover:bg-muted transition"
        >
          <h2 className="text-xl font-semibold">Programmatic SEO Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage KV-based SEO intent pages per project.
          </p>
        </Link>

        <Link
          href="/admin/support"
          className="block rounded-lg border p-4 hover:bg-muted transition"
        >
          <h2 className="text-xl font-semibold">Support Inbox</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and respond to customer support tickets.
          </p>
        </Link>
      </div>

      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Next up: real domain verification + SSL status via Vercel API/webhooks, plus
        AI-assisted replies from your support agent.
      </div>
    </main>
  );
}
