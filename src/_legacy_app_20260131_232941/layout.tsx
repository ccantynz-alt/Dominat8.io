import "../io/styles/io.globals.css";

export const metadata = {
  title: "Dominat8.io — Rocket Cockpit",
  description: "Operator-grade cockpit for Dominat8 IO.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}