import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Cockpit — Dominat8.io",
  description: "Deploy, domains, SSL, and settings for your AI-built sites.",
  robots: { index: false, follow: false },
};

export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  await headers();
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch {
    /* Clerk auth() can throw in Next 16 (headers/symbol). Treat as unauthenticated. */
  }
  if (!userId) redirect("/sign-in");

  return <>{children}</>;
}
