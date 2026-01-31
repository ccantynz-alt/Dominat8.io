"use client";

/**
 * D8_VISIBLE_POLISH_ALLPAGES_v1_20260128
 * Global visible design layer for ALL pages:
 * - premium background (aurora + grid + vignette)
 * - subtle animated highlights
 * - wrapper class hooks for consistent spacing
 */
export default function PolishShell() {
  return (
    <>
      {/* D8_VISIBLE_POLISH_ALLPAGES_v1_20260128 */}
      <div className="d8-polish-bg" aria-hidden="true">
        <div className="d8-aurora" />
        <div className="d8-grid" />
        <div className="d8-vignette" />
        <div className="d8-spark a" />
        <div className="d8-spark b" />
        <div className="d8-spark c" />
      </div>
    </>
  );
}