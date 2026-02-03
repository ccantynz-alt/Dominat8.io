"use client";

import React from "react";

class SafeBoundary extends React.Component<React.PropsWithChildren<{}>, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // swallow
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children ?? null;
  }
}

export default function IOTVClientEnhance() {
  return (
    <SafeBoundary>
      {/* Enhancement slot (optional). Intentionally empty for now. */}
    </SafeBoundary>
  );
}