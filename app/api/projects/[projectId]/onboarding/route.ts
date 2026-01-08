import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

type Project = {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

type OnboardingAnswers = {
  businessType: string;
  mainGoal: 'contact' | 'book' | 'buy' | 'quote' | 'learn';
  targetCustomer: 'local' | 'businesses' | 'anyone' | 'unsure';
  style: 'clean' | 'bold' | 'friendly' | 'corporate';
  businessName: string;
  location: string; // optional (can be empty)
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

function buildPrompt(a: OnboardingAnswers) {
  // This becomes your “single prompt” you’ll feed into the generator later.
  // Keep it deterministic and readable.
  const goalMap: Record<OnboardingAnswers['mainGoal'], string> = {
    contact: 'Get visitors to contact me',
    book: 'Get visitors to book a service',
    buy: 'Sell products or services',
    quote: 'Get visitors to request a quote',
    learn: 'Help visitors learn about my business',
  };

  const targetMap: Record<OnboardingAnswers['targetCustomer'], string> = {
    local: 'Local customers',
    businesses: 'Businesses',
    anyone: 'Anyone',
    unsure: 'Not sure yet',
  };

  const styleMap: Record<OnboardingAnswers['style'], string> = {
    clean: 'Clean & modern',
    bold: 'Bold & eye-catching',
    friendly: 'Friendly & welcoming',
    corporate: 'Professional & corporate',
  };

  const locationPart = a.location?.trim() ? `Location: ${a.location.trim()}.` : '';

  return [
    `Create a professional business website.`,
    `Business type: ${a.businessType.trim()}.`,
    `Business name: ${a.businessName.trim()}.`,
    locationPart,
    `Primary goal: ${goalMap[a.mainGoal]}.`,
    `Target customers: ${targetMap[a.targetCustomer]}.`,
    `Style: ${styleMap[a.style]}.`,
    `Include sections: Hero, Services, About, Testimonials (if appropriate), Contact.`,
    `Use clear headings, modern layout, and conversion-focused copy.`,
  ]
    .filter(Boolean)
    .join(' ');
}

async function requireOwnedProject(userId: string, projectId: string): Promise<Project | null> {
  const raw = await kv.get(projectKey(projectId));
  if (!raw || typeof raw !== 'object') return null;

  const obj: any = raw;
  if (String(obj.userId) !== userId) return null;

  return {
    id: String(obj.id ?? projectId),
    userId: String(obj.userId),
    name: String(obj.name ?? 'Untitled project'),
    createdAt: Number(obj.createdAt ?? 0) || 0,
    updatedAt: Number(obj.updatedAt ?? 0) || 0,
  };
}

export async function GET(_req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

    const projectId = String(ctx?.params?.projectId || '').trim();
    if (!projectId) return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 });

    const project = await requireOwnedProject(userId, projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Project not found or you do not have access.' }, { status: 404 });
    }

    const record = await kv.get(onboardingKey(projectId));
    if (!record) return NextResponse.json({ ok: true, record: null });

    return NextResponse.json({ ok: true, record });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to load onboarding' }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

    const projectId = String(ctx?.params?.projectId || '').trim();
    if (!projectId) return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 });

    const project = await requireOwnedProject(userId, projectId);
    if (!project) {
      return NextResponse.json({ ok: false, error: 'Project not found or you do not have access.' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const answers = body?.answers as Partial<OnboardingAnswers> | undefined;

    const businessType = String(answers?.businessType ?? '').trim();
    const businessName = String(answers?.businessName ?? '').trim();

    const mainGoal = String(answers?.mainGoal ?? '').trim() as OnboardingAnswers['mainGoal'];
    const targetCustomer = String(answers?.targetCustomer ?? '').trim() as OnboardingAnswers['targetCustomer'];
    const style = String(answers?.style ?? '').trim() as OnboardingAnswers['style'];
    const location = String(answers?.location ?? '').trim();

    const allowedGoals = new Set(['contact', 'book', 'buy', 'quote', 'learn']);
    const allowedTargets = new Set(['local', 'businesses', 'anyone', 'unsure']);
    const allowedStyles = new Set(['clean', 'bold', 'friendly', 'corporate']);

    if (!businessType) return NextResponse.json({ ok: false, error: 'Business type is required' }, { status: 400 });
    if (!businessName) return NextResponse.json({ ok: false, error: 'Business name is required' }, { status: 400 });
    if (!allowedGoals.has(mainGoal)) return NextResponse.json({ ok: false, error: 'Invalid main goal' }, { status: 400 });
    if (!allowedTargets.has(targetCustomer)) return NextResponse.json({ ok: false, error: 'Invalid target customer' }, { status: 400 });
    if (!allowedStyles.has(style)) return NextResponse.json({ ok: false, error: 'Invalid style' }, { status: 400 });

    const normalized: OnboardingAnswers = {
      businessType,
      mainGoal,
      targetCustomer,
      style,
      businessName,
      location,
    };

    const prompt = buildPrompt(normalized);
    const existing = await kv.get(onboardingKey(projectId));

    const t = Date.now();
    const record: OnboardingRecord = {
      projectId,
      userId,
      answers: normalized,
      prompt,
      createdAt: (existing as any)?.createdAt ? Number((existing as any).createdAt) : t,
      updatedAt: t,
    };

    await kv.set(onboardingKey(projectId), record);

    return NextResponse.json({ ok: true, record });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed to save onboarding' }, { status: 500 });
  }
}
