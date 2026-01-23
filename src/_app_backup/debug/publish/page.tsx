import PublishDebugClient from "./publishDebugClient";

export const dynamic = "force-dynamic";

export default function PublishDebugPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Publish (Debug)</h1>
        <p className="text-gray-600 mb-8">
          This page safely wires your Publish API without modifying your builder UI.
        </p>

        <PublishDebugClient />
      </div>
    </main>
  );
}
