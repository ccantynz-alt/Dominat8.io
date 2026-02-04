import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      background:'#050814',
      color:'white',
      fontFamily:'system-ui,Segoe UI,Roboto,Helvetica,Arial'
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:42,fontWeight:900,letterSpacing:-1}}>TV IS LIVE</div>
        <div style={{marginTop:10,opacity:.75,fontWeight:700}}>{'D8_IO_TV_FORCE_DEPLOY_011_20260205_080918'}</div>
        <div style={{marginTop:18,opacity:.55,fontSize:12}}>If you still see /io rewrite headers, middleware bypass is not deployed.</div>
      </div>
    </div>
  );
}
