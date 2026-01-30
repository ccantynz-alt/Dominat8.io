'use client';
import React from 'react';

export function AppNav() {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      background: 'rgba(7,7,11,0.65)',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontWeight: 950, letterSpacing: '-0.02em' }}>
          Dominat8
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <a href="/pricing" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 600 }}>
            Pricing
          </a>
          <a href="/templates" style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(157,123,255,1), rgba(45,226,230,1))',
            color: '#0b0b0f',
            fontWeight: 900,
            textDecoration: 'none'
          }}>
            Build my site
          </a>
        </div>
      </div>
    </div>
  );
}