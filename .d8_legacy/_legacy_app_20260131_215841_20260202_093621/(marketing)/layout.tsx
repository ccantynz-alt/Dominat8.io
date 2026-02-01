import PolishShell from "@/app/_client/PolishShell";
import type { Metadata } from "next";

/**
 * Dominat8 Marketing Layout
 * Marker: SEO_BASELINE_V1
 *
 * This controls metadata for marketing routes under (marketing).
 * It does NOT affect the /app product area unless you copy it there.
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dominat8.com"),
  title: {
    default: "Dominat8 â€” The WOW website builder",
    template: "%s â€” Dominat8",
  },
  description: "The WOW website builder. Built by AI. Shipped fast. Generate premium sites and publish with confidence.",
  applicationName: "Dominat8",
  openGraph: {
    type: "website",
    url: "https://www.dominat8.com",
    siteName: "Dominat8",
    title: "Dominat8 â€” The WOW website builder",
    description: "Built by AI. Shipped fast. Generate premium sites and publish with confidence.",
    images: [
      // Add a real OG image later. Safe placeholder path.
      { url: "/og.png", width: 1200, height: 630, alt: "Dominat8" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dominat8 â€” The WOW website builder",
    description: "Built by AI. Shipped fast. Generate premium sites and publish with confidence.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}