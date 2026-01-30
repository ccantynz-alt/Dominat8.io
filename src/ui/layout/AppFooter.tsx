'use client';
import React from 'react';

export function AppFooter() {
  return (
    <footer style={{
      marginTop: 80,
      borderTop: '1px solid rgba(255,255,255,0.10)',
      background: 'rgba(7,7,11,0.9)'
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '32px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 24
      }}>
        <div>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Dominat8</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
            AI website builder for fast, confident launches.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Product</div>
          <div><a href="/templates" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Templates</a></div>
          <div><a href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Pricing</a></div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Company</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>About</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Contact</div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Legal</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>Terms</div>
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13
      }}>
        Â© {new Date().getFullYear()} Dominat8
      </div>
    </footer>
  );
}