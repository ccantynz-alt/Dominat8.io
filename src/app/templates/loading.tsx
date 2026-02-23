export default function TemplatesLoading() {
  return (
    <div style={{ minHeight: "60vh", background: "#06080e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid rgba(61,240,255,0.25)", borderTopColor: "rgba(61,240,255,0.9)", animation: "d8-spin 0.8s linear infinite" }} />
      <style dangerouslySetInnerHTML={{ __html: "@keyframes d8-spin { to { transform: rotate(360deg); } }" }} />
    </div>
  );
}
