import "./globals.css";
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
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
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    color: "#9aa3c7",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  style={{
                    padding: "8px 16px",
                    background: "#3DF0FF",
                    color: "#04060e",
                    border: "none",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
