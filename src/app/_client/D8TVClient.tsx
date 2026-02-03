"use client";

import React from "react";

/**
 * D8TVClient — STABLE STUB (BUILD IMMUNITY)
 * Marker: D8TVCLIENT_STUB_LOCK_20260204
 *
 * NOTE: children must NOT be required in props typing, otherwise TS may fail at <SafeBoundary> usage.
 * Using React.PropsWithChildren<{}> is the safest.
 */
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

export default function D8TVClient() {
  return (
    <SafeBoundary>
      {/* Intentionally empty stub. */}
    </SafeBoundary>
  );
}