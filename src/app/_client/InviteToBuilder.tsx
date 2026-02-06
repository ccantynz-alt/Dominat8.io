'use client';

import React, { useMemo, useState } from 'react';

const STAMP = 'D8_IO_MEGA_LAUNCH_20260206_151108';

export default function InviteToBuilder() {
  const [invite, setInvite] = useState('');
  const [prompt, setPrompt] = useState('');

  const injected = useMemo(() => {
    const i = invite.trim();
    const p = prompt.trim();
    return [
      'D8_INVITE_TO_BUILDER',
      'STAMP=' + STAMP,
      i ? ('INVITE=' + i) : '',
      p ? ('PROMPT=' + p) : ''
    ].filter(Boolean).join('\\n');
  }, [invite, prompt]);

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 24 }}>
      <div style={{
        position: 'fixed',
        top: 10,
        right: 12,
        fontSize: 11,
        opacity: 0.75,
        zIndex: 999999
      }}>
        PROOF: {STAMP}
      </div>

      <h1 style={{ fontSize: 30, margin: 0 }}>Dominat8 IO — Invite → Builder</h1>
      <p style={{ opacity: 0.85, marginTop: 10, maxWidth: 900 }}>
        This is the live bypass route. If you see the PROOF stamp, middleware bypass is working and you are NOT stuck in TV lock.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, maxWidth: 900, marginTop: 18 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ opacity: 0.9 }}>Invite code / token (optional)</span>
          <input
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            placeholder="invite_..."
            style={{ padding: 12, borderRadius: 10, border: '1px solid #333', background: '#0b0b0b', color: '#fff' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ opacity: 0.9 }}>Prompt (optional)</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Build me a luxury landing page for ..."
            rows={6}
            style={{ padding: 12, borderRadius: 10, border: '1px solid #333', background: '#0b0b0b', color: '#fff' }}
          />
        </label>

        <div style={{ padding: 14, borderRadius: 12, border: '1px solid #222', background: '#070707' }}>
          <div style={{ opacity: 0.85, marginBottom: 8 }}>Injected payload preview</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: 0.9 }}>{injected}</pre>
        </div>
      </div>
    </main>
  );
}
