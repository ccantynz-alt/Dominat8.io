import React from 'react'

/**
 * FINAL COMMANDO — HOST TRUTH LIE
 * STAMP: D8_HOST_TRUTH_LIE_20260206_083212
 *
 * EFFECT:
 * - Completely bypass host-based TV shell
 * - Force normal UI rendering on dominat8.io
 * - No environment checks
 * - No runtime guards
 */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body style={{ background: '#000', color: '#fff' }}>
        <div style={{
          position: 'fixed',
          top: 10,
          right: 12,
          fontSize: 11,
          opacity: 0.65,
          zIndex: 999999
        }}>
          PROOF: D8_HOST_TRUTH_LIE_20260206_083212
        </div>

        {children}
      </body>
    </html>
  )
}
