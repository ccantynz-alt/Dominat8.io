import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthHeader } from "@/components/AuthHeader";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const metadata: Metadata = {
  metadataBase: new URL("https://dominat8.io"),
  icons: {
    icon: "/api/icon",
    shortcut: "/api/icon",
    apple: "/api/icon",
  },
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
        url: "/api/opengraph-image",
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
    images: ["/api/opengraph-image"],
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

function SimpleHeader() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        minHeight: "48px",
        background: "rgba(4, 6, 14, 0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <a href="/sign-in" style={{ padding: "8px 16px", color: "#9aa3c7", textDecoration: "none", fontSize: 14 }}>Sign in</a>
      <a href="/sign-up" style={{ padding: "8px 16px", borderRadius: 9999, background: "rgba(61,240,255,0.15)", color: "#9ef2e6", textDecoration: "none", fontSize: 14 }}>Sign up</a>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = Boolean(publishableKey.trim());
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {hasClerk ? (
          <ClerkProvider publishableKey={publishableKey}>
            <AuthHeader />
            {children}
          </ClerkProvider>
        ) : (
          <>
            <SimpleHeader />
            {children}
          </>
        )}
      </body>
    </html>
  );
}
