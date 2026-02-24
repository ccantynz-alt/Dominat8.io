import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cockpit — Dominat8.io",
  description: "Deploy, domains, SSL, and settings for your AI-built sites.",
  robots: { index: false, follow: false },
};

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
