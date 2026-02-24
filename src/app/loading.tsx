/** Global loading UI — minimal, on-brand. No design change to Gold Fog. */
export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06080e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: "2px solid rgba(61,240,255,0.25)",
          borderTopColor: "rgba(61,240,255,0.9)",
          animation: "d8-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes d8-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
