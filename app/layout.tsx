import "./globals.css";
import React from "react";

export const metadata = {
  title: "my-saas-app",
  description: "AI Website Builder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
