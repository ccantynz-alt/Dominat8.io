import Head from "next/head";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const REDIRECT_AFTER_SIGNIN = "/projects";
const SIGNIN_URL = `/sign-in?redirect_url=${encodeURIComponent(
  REDIRECT_AFTER_SIGNIN
)}`;

export default function ProjectsPage() {
  // NOTE:
  // This is a polished EMPTY STATE page.
  // When you later wire real project listing data, keep this empty state UI
  // and render it only when there are zero projects.

  return (
    <>
      <Head>
        <title>Projects — Rovenza</title>
        <meta
          name="description"
          content="Your projects in Rovenza. Create, review, and publish with confidence."
        />
      </Head>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <SignedOut>
          <section className="mx-auto max-w-xl text-center">
            <h1 className="mb-3 text-3xl font-semibold tracking-tight">
              Your projects
            </h1>

            <p className="mb-8 text-gray-600">
              Sign in to see your projects and continue where you left off.
            </p>

            <Link
              href={SIGNIN_URL}
              className="inline-block rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
            >
              Sign in to continue
            </Link>

            <p className="mt-4 text-sm text-gray-500">
              You’ll come back right here after signing in.
            </p>
          </section>
        </SignedOut>

        <SignedIn>
          <header className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-2 text-gray-600">
              Everything you’re building in Rovenza, in one place.
            </p>
          </header>

          {/* Empty state */}
          <section className="rounded-lg border p-8">
            <h2 className="mb-2 text-xl font-semibold">
              You don’t have any projects yet.
            </h2>

            <p className="mb-6 max-w-2xl text-gray-600">
              When you create your first project, it will show up here. We’ll
              guide you step by step — and help you check everything before you
              publish.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/projects/new"
                className="inline-block rounded-md bg-black px-6 py-3 text-white hover:bg-gray-800"
              >
                Create my first project
              </Link>

              <Link
                href="/"
                className="inline-block text-sm text-gray-600 hover:text-gray-900"
              >
                Back to home
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Tip: If you’re not ready, you can come back later — nothing is lost.
            </div>
          </section>
        </SignedIn>
      </main>
    </>
  );
}
