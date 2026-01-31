'use client';

import React, { useMemo } from 'react';
import { SectionShell } from '../../ui/sections/SectionShell';

export const HOMECLIENT_STAMP = 'PHASE_D_LOCK_HOMEPAGE_2026-01-31' as const;

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        fontSize: 13,
        color: 'rgba(255,255,255,0.82)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 16,
        textDecoration: 'none',
        fontWeight: 900,
        letterSpacing: '-0.01em',
        color: '#0b0b0f',
        background: 'linear-gradient(135deg, rgba(157,123,255,1) 0%, rgba(45,226,230,1) 100%)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      {children}
    </a>
  );
}

function GhostButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 16,
        textDecoration: 'none',
        fontWeight: 800,
        color: 'rgba(255,255,255,0.92)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {children}
    </a>
  );
}

function Card({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 14px 48px rgba(0,0,0,0.30)',
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontSize: 14 }}>{body}</div>
    </div>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ padding: 14, borderRadius: 18, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.18)' }}>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{q}</div>
      <div style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, fontSize: 14 }}>{a}</div>
    </div>
  );
}

export default function HomeClient() {
  const ts = useMemo(() => Math.floor(Date.now() / 1000), []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(1200px 600px at 20% 10%, rgba(157,123,255,0.28), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(45,226,230,0.18), transparent 60%), #07070b',
        color: '#ffffff',
      }}
    >
      {/* --- PROOF MARKER (hidden unless you view source) --- */}
      <div style={{ display: 'none' }}>{HOMECLIENT_STAMP}__TS_{String(ts)}</div>

      {/* HERO */}
      <SectionShell id="top" tone="dark" padY="loose" maxWidth={1180}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 22, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', marginBottom: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: 'linear-gradient(135deg, rgba(157,123,255,1), rgba(45,226,230,1))' }} />
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 800 }}>
                Dominat8 â€¢ AI Website Builder
              </div>
            </div>

            <div style={{ fontSize: 54, lineHeight: 1.03, fontWeight: 950, letterSpacing: '-0.03em' }}>
              A finished website.
              <br />
              Built in minutes.
            </div>

            <div style={{ marginTop: 14, maxWidth: 720, fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
              Describe your business â€” Dominat8 generates a complete, publishable site with clean structure, conversion sections, and SEO fundamentals.
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PrimaryButton href="/templates">Build my site</PrimaryButton>
              <GhostButton href="/pricing">View pricing</GhostButton>
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Pill>No templates</Pill>
              <Pill>No setup headaches</Pill>
              <Pill>Publish-ready</Pill>
              <Pill>SEO basics included</Pill>
            </div>
          </div>

          <div
            style={{
              borderRadius: 26,
              padding: 18,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.25) 100%)',
              boxShadow: '0 22px 80px rgba(0,0,0,0.55)',
            }}
          >
            <div style={{ fontWeight: 950, letterSpacing: '-0.02em', marginBottom: 10, fontSize: 16 }}>
              What you get
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 12, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ fontWeight: 900 }}>Homepage + core pages</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>Hero, trust, features, pricing teaser, FAQ, CTA.</div>
              </div>
              <div style={{ padding: 12, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ fontWeight: 900 }}>SEO fundamentals</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>Clean titles, metadata, sitemap-ready structure.</div>
              </div>
              <div style={{ padding: 12, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ fontWeight: 900 }}>Fast publish flow</div>
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 }}>Start simple. Improve iteratively. Ship confidently.</div>
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)', fontSize: 13 }}>
              BUILD: <span style={{ fontWeight: 900, color: 'rgba(255,255,255,0.92)' }}>{HOMECLIENT_STAMP}</span>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* TRUST STRIP */}
      <SectionShell tone="panel" padY="tight" maxWidth={1180} showDividerTop={false} showDividerBottom={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 950, letterSpacing: '-0.02em' }}>Designed to feel premium from day one</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Pill>Clean structure</Pill>
            <Pill>Conversion sections</Pill>
            <Pill>Consistent design</Pill>
            <Pill>Deploy confidence</Pill>
          </div>
        </div>
      </SectionShell>

      {/* FEATURES */}
      <SectionShell tone="dark" padY="normal" maxWidth={1180} showDividerTop={false} showDividerBottom={true}>
        <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: '-0.02em' }}>Everything your site needs to launch</div>
        <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.75)', maxWidth: 800, lineHeight: 1.7 }}>
          A real site layout â€” not a half-finished template. Sections, hierarchy, and clarity â€” so customers trust it immediately.
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          <Card title="Hero that sells" body="A strong headline, clear promise, and clean calls-to-action." />
          <Card title="Trust + proof" body="Signals that reduce doubt and increase conversions." />
          <Card title="Feature pillars" body="The benefits that explain why Dominat8 wins." />
          <Card title="How it works" body="A simple sequence customers can understand fast." />
          <Card title="Pricing teaser" body="Enough to convert, without overwhelming the page." />
          <Card title="Final CTA" body="A focused close that moves people to action." />
        </div>
      </SectionShell>

      {/* HOW IT WORKS */}
      <SectionShell tone="panel" padY="normal" maxWidth={1180}>
        <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: '-0.02em' }}>How it works</div>
        <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.75)', maxWidth: 840, lineHeight: 1.7 }}>
          You donâ€™t need to be technical. You just need to describe what you do.
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          <Card title="1) Describe" body="Tell Dominat8 your business, audience, and offer." />
          <Card title="2) Generate" body="Get a clean site structure with sections and SEO basics." />
          <Card title="3) Publish" body="Ship a premium-looking website fast â€” then improve over time." />
        </div>
      </SectionShell>

      {/* PRICING TEASER */}
      <SectionShell tone="dark" padY="normal" maxWidth={1180} showDividerTop={false} showDividerBottom={true}>
        <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: '-0.02em' }}>Pricing that makes sense</div>
        <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.75)', maxWidth: 820, lineHeight: 1.7 }}>
          Start free, then upgrade when youâ€™re ready to publish and scale.
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          <div style={{ padding: 18, borderRadius: 22, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Free</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 1.7 }}>
              Explore Dominat8 and generate your first layout.
            </div>
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
              â€¢ Build concept sites<br />
              â€¢ Preview structure<br />
              â€¢ Start your draft
            </div>
          </div>

          <div style={{ padding: 18, borderRadius: 22, border: '1px solid rgba(255,255,255,0.10)', background: 'linear-gradient(180deg, rgba(157,123,255,0.18) 0%, rgba(45,226,230,0.10) 100%)' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Pro</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 1.7 }}>
              Publish-ready, premium finish and faster iteration.
            </div>
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.78)', fontSize: 14 }}>
              â€¢ Custom domains<br />
              â€¢ SEO essentials<br />
              â€¢ Faster publish workflow
            </div>
            <div style={{ marginTop: 14 }}>
              <PrimaryButton href="/pricing">See Pro</PrimaryButton>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* FAQ */}
      <SectionShell tone="panel" padY="normal" maxWidth={1180}>
        <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: '-0.02em' }}>FAQ</div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <QA q="Is this a template?" a="No â€” Dominat8 generates a real structured site layout designed to convert." />
          <QA q="Will it look finished?" a="Yes. The section architecture locks spacing and hierarchy so it feels premium." />
          <QA q="Can I edit it later?" a="Yes. You can refine copy and iterate as your business evolves." />
          <QA q="Can I use my own domain?" a="Yes â€” custom domain support is part of the roadmap and onboarding flow." />
        </div>
      </SectionShell>

      {/* FINAL CTA */}
      <SectionShell tone="dark" padY="loose" maxWidth={1180}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, fontWeight: 950, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Ready to ship something youâ€™re proud of?
          </div>
          <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.78)', maxWidth: 840, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            This is the homepage â€œlock.â€ Now every future upgrade lands into a clean architecture instead of chaos.
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <PrimaryButton href="/templates">Build my site</PrimaryButton>
            <GhostButton href="/pricing">Pricing</GhostButton>
          </div>

          <div style={{ marginTop: 18, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
            {HOMECLIENT_STAMP}
          </div>
        </div>
      </SectionShell>

      <div style={{ height: 30 }} />
    </div>
  );
}