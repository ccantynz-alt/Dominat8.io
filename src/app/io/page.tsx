export const dynamic = "force-dynamic";

export default function IOCockpit() {
  const STAMP = "
D8_IO_MEGA_013_FIX_20260206_202733
";
  const SHA = "
0d81664886595553ce9f623607c402ad933d0f20
";
  return (
    <main style={{minHeight:"100vh", background:"#000", color:"#fff", padding:24}}>
      <div style={{position:"fixed", top:10, right:12, fontSize:11, opacity:0.75, zIndex:999999}}>
        PROOF: {STAMP}
      </div>
      <h1 style={{fontSize:28, margin:0}}>Dominat8 IO Ã¢â‚¬â€ Cockpit</h1>
      <p style={{opacity:0.85, marginTop:10, maxWidth:900}}>If you see this, /io is live.</p>
      <div style={{marginTop:18, opacity:0.75, fontSize:12}}>
        <div>Stamp: {STAMP}</div>
        <div>Git: {SHA}</div>
        <div>Path: /io</div>
      </div>
      <pre style={{marginTop:16, background:"rgba(255,255,255,0.06)", padding:12, borderRadius:10, overflowX:"auto"}}>
PROOF: {STAMP}
      </pre>
    </main>
  );
}