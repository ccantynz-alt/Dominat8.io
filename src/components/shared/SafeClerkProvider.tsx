"use client";

import React, { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";

/**
 * Client-only ClerkProvider wrapper.
 *
 * @clerk/nextjs v5.7.x ClerkProvider calls headers() and initialState()
 * during server-side rendering, and throws "Publishable key not valid" if
 * the key format doesn't pass Clerk's internal validation. This crashes
 * the entire root layout with a 500 on every page.
 *
 * This wrapper:
 *  1. Renders children WITHOUT Clerk during SSR (safe, no auth during SSR)
 *  2. Mounts ClerkProvider on the client after hydration
 *  3. Catches any client-side Clerk errors via error boundary
 */
export function SafeClerkProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // During SSR and initial hydration, render without Clerk
    return <>{children}</>;
  }

  // On client, wrap with ClerkProvider (caught by error boundary below)
  return (
    <ClerkErrorBoundary fallback={children}>
      <ClerkProvider>{children}</ClerkProvider>
    </ClerkErrorBoundary>
  );
}

class ClerkErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
