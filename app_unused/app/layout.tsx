import "../globals.css";

export const metadata = {
  title: "MySaaS Builder",
  description: "Premium AI website builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">{children}</body>
    </html>
  );
}

