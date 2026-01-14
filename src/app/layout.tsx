import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "my-saas-app",
  description: "AI website builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

