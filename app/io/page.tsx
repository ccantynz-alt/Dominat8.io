export const dynamic = 'force-dynamic';

export default function IOPage() {
  return (
    <main style={{minHeight:'100vh',background:'#000',color:'#fff',padding:24}}>
      <div style={{position:'fixed',top:10,right:12,fontSize:11,opacity:0.75,zIndex:999999}}>
        PROOF: D8_IO_DUAL_ROUTE_20260206_164751
      </div>
      <h1 style={{fontSize:30,margin:0}}>Dominat8 IO — /io is LIVE</h1>
      <p style={{opacity:0.85,marginTop:10,maxWidth:900}}>
        If you see this, the /io route exists and is rendering from the active Next.js app tree.
      </p>
      <div style={{marginTop:18,opacity:0.75,fontSize:12}}>
        <div>Stamp: D8_IO_DUAL_ROUTE_20260206_164751</div>
        <div>Path: /io</div>
      </div>
    </main>
  );
}
