import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates — Dominat8.io",
  description: "Start from a template. Describe your business, we generate a world-class website.",
  openGraph: { title: "Templates — Dominat8.io", description: "Start from a template. We generate a world-class website." },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
