import "./globals.css";
import type { Metadata } from "next";
import { SafeClerkProvider } from "@/components/shared/SafeClerkProvider";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
// Only enable Clerk when the publishable key exists AND has a valid format.
// Clerk throws "Publishable key not valid" if the format is wrong, which
// crashes the entire layout with a 500. Guard against that here.
// SafeClerkProvider also wraps in an error boundary as a second safety net.
const clerkReady = /^pk_(test|live)_/.test(clerkKey);
const isStaging = process.env.NEXT_PUBLIC_D8_ENV === "staging" || process.env.VERCEL_ENV === "preview";

export const metadata: Metadata = {
  metadataBase: new URL("https://dominat8.io"),
  title: {
    default: "Dominat8.io — AI Website Builder",
    template: "%s — Dominat8.io",
  },
  description: "Describe your website. Watch it appear in seconds. No templates, no drag and drop. Just results.",
  keywords: ["AI website builder", "website generator", "AI web design", "automatic website creation", "no-code website builder"],
  authors: [{ name: "Dominat8", url: "https://dominat8.io" }],
  creator: "Dominat8.io",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dominat8.io",
    siteName: "Dominat8.io",
    title: "Dominat8.io — Build a world-class website in seconds",
    description: "Describe your business. Our AI builds a complete, professional website in under 30 seconds. No templates. No drag and drop.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dominat8.io — AI Website Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dominat8.io — AI Website Builder",
    description: "Build a world-class website in seconds. Just describe your business.",
    images: ["/opengraph-image"],
    creator: "@dominat8io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {isStaging && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999,
            background: "linear-gradient(90deg, rgba(255,184,0,0.95), rgba(255,140,0,0.95))",
            color: "#000", textAlign: "center", fontSize: 11, fontWeight: 700,
            padding: "4px 0", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif",
          }}>
            STAGING ENVIRONMENT — Not production
          </div>
        )}
        {children}
      </body>
    </html>
  );

  // ClerkProvider throws at render time when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  // is missing, which crashes the entire root layout with a 500.
  // Wrap conditionally so the site still serves without auth.
  return clerkReady ? <SafeClerkProvider>{shell}</SafeClerkProvider> : shell;
}
