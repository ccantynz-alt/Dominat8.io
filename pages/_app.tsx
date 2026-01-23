// pages/_app.tsx
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";

// If you have a global CSS file already, keep this import.
// If your project doesn't have styles/globals.css, tell me and I’ll adjust.
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
