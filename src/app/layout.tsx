import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dominat8.io — AI Website Builder",
  description: "Describe your website. Watch it appear in seconds. No templates, no drag and drop. Just results.",
  openGraph: {
    title: "Dominat8.io — AI Website Builder",
    description: "The AI website builder that actually builds websites. Prompt to live site in under 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>{children}</body>
    </html>
  );
}
