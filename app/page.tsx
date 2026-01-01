import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold">AI Website Builder</div>
            <div className="text-sm text-zinc-500">
              Chat → Runs → Agents → Output
            </div>
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <div className="mt-8 border rounded-xl p-5">
          <SignedOut>
            <div className="text-lg font-medium">Welcome</div>
            <div className="text-sm text-zinc-600 mt-1">
              Sign in to access your dashboard.
            </div>
            <div className="mt-4 flex gap-3">
              <Link className="border rounded-lg px-4 py-2 text-sm hover:bg-zinc-50" href="/sign-in">
                Sign in
              </Link>
              <Link className="border rounded-lg px-4 py-2 text-sm hover:bg-zinc-50" href="/sign-up">
                Create account
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-lg font-medium">You’re signed in</div>
            <div className="text-sm text-zinc-600 mt-1">
              Go to your dashboard.
            </div>
            <div className="mt-4 flex gap-3">
              <Link className="border rounded-lg px-4 py-2 text-sm hover:bg-zinc-50" href="/dashboard">
                Go to Dashboard
              </Link>
              <Link className="border rounded-lg px-4 py-2 text-sm hover:bg-zinc-50" href="/threads">
                Open Threads (dev)
              </Link>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
