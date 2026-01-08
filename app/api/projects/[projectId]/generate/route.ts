import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

type OnboardingAnswers = {
  businessType: string;
  mainGoal: 'contact' | 'book' | 'buy' | 'quote' | 'learn';
  targetCustomer: 'local' | 'businesses' | 'anyone' | 'unsure';
  style: 'clean' | 'bold' | 'friendly' | 'corporate';
  businessName: string;
  location: string;
};

type OnboardingRecord = {
  projectId: string;
  userId: string;
  answers: OnboardingAnswers;
  prompt: string;
  createdAt: number;
  updatedAt: number;
};

function projectKey(projectId: string) {
  return `project:${projectId}`;
}

function onboardingKey(projectId: string) {
  return `onboarding:${projectId}`;
}

function generatedHtmlKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function goalToCTA(goal: OnboardingAnswers['mainGoal']) {
  const map: Record<OnboardingAnswers['mainGoal'], { primary: string; secondary: string }> = {
    contact: { primary: 'Contact Us', secondary: 'Get in touch today' },
    book: { primary: 'Book Now', secondary: 'Schedule your service' },
    buy: { primary: 'Shop Now', secondary: 'Browse our offers' },
    quote: { primary: 'Request a Quote', secondary: 'Get a fast estimate' },
    learn: { primary: 'Learn More', secondary: 'Discover what we do' },
  };
  return map[goal];
}

function styleTokens(style: OnboardingAnswers['style']) {
  // Minimal style differences for V1 — later you can make full themes
  if (style === 'bold') return { accent: '#111827', bg: '#0b1220', card: '#111827', text: '#F9FAFB' };
  if (style === 'friendly') return { accent: '#111827', bg: '#F9FAFB', card: '#FFFFFF', text: '#111827' };
  if (style === 'corporate') return { accent: '#0F172A', bg: '#F3F4F6', card: '#FFFFFF', text: '#0F172A' };
  return { accent: '#111827', bg: '#F9FAFB', card: '#FFFFFF', text: '#111827' }; // clean
}

function buildHtml(a: OnboardingAnswers) {
  const name = escapeHtml(a.businessName);
  const type = escapeHtml(a.businessType);
  const location = a.location?.trim() ? escapeHtml(a.location.trim()) : '';
  const cta = goalToCTA(a.mainGoal);
  const theme = styleTokens(a.style);

  const subtitle = location
    ? `${type} based in ${location}.`
    : `${type} services you can trust.`;

  const services = [
    `Professional ${type} service`,
    `Friendly support and clear communication`,
    `High-quality results with attention to detail`,
  ];

  const about = `We help customers with reliable ${type.toLowerCase()} services designed to make life easier. Our focus is quality work, clear communication, and an excellent customer experience.`;

  const contactLine = location
    ? `We’re based in ${location}. Tell us what you need and we’ll respond as soon as possible.`
    : `Tell us what you need and we’ll respond as soon as possible.`;

  // Single-file HTML (simple + fast + easy to preview)
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name} — ${type}</title>
  <meta name="description" content="${name} — ${type}. ${cta.secondary}." />
  <style>
    :root {
      --accent: ${theme.accent};
      --bg: ${theme.bg};
      --card: ${theme.card};
      --text: ${theme.text};
      --muted: rgba(17, 24, 39, 0.65);
      --border: rgba(17, 24, 39, 0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .nav {
      display:flex; align-items:center; justify-content:space-between;
      padding: 14px 0;
    }
    .brand { font-weight: 800; letter-spacing: -0.02em; }
    .links { display:flex; gap: 14px; font-size: 14px; }
    .links a { color: var(--text); text-decoration: none; opacity: 0.8; }
    .links a:hover { opacity: 1; text-decoration: underline; }

    .hero {
      margin-top: 18px;
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: 22px;
      padding: 34px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    .hero h1 { margin: 0; font-size: 44px; line-height: 1.05; letter-spacing: -0.03em; }
    .hero p { margin: 14px 0 0; font-size: 16px; opacity: 0.8; max-width: 65ch; }
    .ctaRow { margin-top: 18px; display:flex; gap: 12px; flex-wrap: wrap; }
    .btn {
      display:inline-flex; align-items:center; justify-content:center;
      padding: 12px 16px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      border: 1px solid var(--border);
    }
    .btnPrimary { background: var(--accent); color: #fff; border-color: var(--accent); }
    .btnGhost { background: transparent; color: var(--text); }

    .grid {
      margin-top: 18px;
      display:grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 14px;
    }
    .card {
      grid-column: span 6;
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: 18px;
      padding: 18px;
    }
    .card h2 { margin: 0; font-size: 18px; }
    .card p { margin: 8px 0 0; font-size: 14px; opacity: 0.8; }

    .list { margin: 10px 0 0; padding-left: 18px; }
    .list li { margin: 6px 0; opacity: 0.85; font-size: 14px; }

    .full { grid-column: span 12; }
    .muted { opacity: 0.75; }
    .footer { margin-top: 28px; padding: 18px 0; font-size: 12px; opacity: 0.7; }

    @media (max-width: 900px) {
      .hero h1 { font-size: 34px; }
      .card { grid-column: span 12; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="nav">
      <div class="brand">${name}</div>
      <div class="links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </div>

    <section class="hero">
      <h1>${escapeHtml(cta.secondary)}</h1>
      <p class="muted">${subtitle}</p>
      <div class="ctaRow">
        <a class="btn btnPrimary" href="#contact">${escapeHtml(cta.primary)}</a>
        <a class="btn btnGhost" href="#services">View Services</a>
      </div>
    </section>

    <section id="services" class="grid">
      <div class="card full">
        <h2>Services</h2>
        <p class="muted">Here are the services we’re known for.</p>
        <ul class="list">
          ${services.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    </section>

    <section id="about" class="grid">
      <div class="card">
        <h2>About</h2>
        <p class="muted">${escapeHtml(about)}</p>
      </div>

      <div class="card">
        <h2>Why choose us</h2>
        <ul class="list">
          <li>Clear, upfront communication</li>
          <li>Quality-first mindset</li>
          <li>Friendly and reliable service</li>
        </ul>
      </div>
    </section>

    <section id="contact" class="grid">
      <div class="card full">
        <h2>Contact</h2>
        <p class="muted">${escapeHtml(contactLine)}</p>
        <p class="muted" style="margin-top:10px;">
          Email: <b>hello@example.com</b> &nbsp; • &nbsp; Phone: <b>+64 00 000 0000</b>
        </p>
        <p class="muted" style="margin-top:10px;">
          (In the next step, we’ll connect this to a real contact form + your details.)
        </p>
      </div>
    </section>

    <div class="footer">Generated by your AI Website Builder — V1</div>
  </div>
</body>
</html>`;
}

async function requireOwnedProject(userId: string, projectId: string) {
  const raw = await kv.get(projectKey(projectId));
  if (!raw || typeof raw !== 'object') return null;
  const obj: any = raw;
  if (String(obj.userId) !== userId) return null;
  return obj;
}

export async function POST(_req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

    const projectId = String(ctx?.params?.projectId || '').trim();
    if (!projectId) return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 });

    const project = await requireOwnedProject(userId, projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Project not found or you do not have access.' }, { status: 404 });
    }

    const onboarding = (await kv.get(onboardingKey(projectId))) as OnboardingRecord | null;
    if (!onboarding?.answers) {
      return NextResponse.json(
        { ok: false, error: 'No onboarding answers found. Please complete the AI Walk first.' },
        { status: 400 }
      );
    }

    const html = buildHtml(onboarding.answers);

    await kv.set(generatedHtmlKey(projectId), {
      projectId,
      userId,
      html,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: 'template-v1',
      prompt: onboarding.prompt,
      answers: onboarding.answers,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Generate failed' }, { status: 500 });
  }
}
