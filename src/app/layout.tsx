import "../io/styles/io.css";
import D8TV from './_client/D8TV';

export const metadata = {
  title: "Dominat8.io ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Rocket Cockpit",
  description: "Operator-grade IO cockpit for Dominat8.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}{(process.env.NEXT_PUBLIC_D8_TV === '1' || process.env.NODE_ENV !== 'production') ? <D8TV /> : null}
</body>
    </html>
  );
}