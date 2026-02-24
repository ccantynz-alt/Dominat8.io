import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Cockpit — Dominat8.io",
  description: "Deploy, domains, SSL, and settings for your AI-built sites.",
  robots: { index: false, follow: false },
};

export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <>{children}</>;
}
