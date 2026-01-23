import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dominat8",
  description: "Build websites at the speed of thought.",
  metadataBase: new URL("https://www.dominat8.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-black text-white antialiased"}>
        {children}
      </body>
    </html>
  );
}
