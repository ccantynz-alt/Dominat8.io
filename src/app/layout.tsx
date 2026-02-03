import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dominat8 — The WOW Website Builder",
  description: "AI-built websites. Shipped fast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
