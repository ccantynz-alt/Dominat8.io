'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Answers = {
  businessType: string;
  mainGoal: 'contact' | 'book' | 'buy' | 'quote' | 'learn' | '';
  targetCustomer: 'local' | 'businesses' | 'anyone' | 'unsure' | '';
  style: 'clean' | 'bold' | 'friendly' | 'corporate' | '';
  businessName: string;
  location: string;
};

function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm ${props.className ?? ''}`}>
      {props.children}
    </div>
  );
}

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }
) {
  const variant = props.variant ?? 'primary';
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-black text-white hover:bg-neutral-800'
      : variant === 'secondary'
      ? 'bg-white text-black border border-neutral-300 hover:bg-neutral-50'
      : 'bg-transparent text-black hover:bg-neutral-100';
  return (
    <button {...props} className={`${base} ${styles} ${props.className ?? ''}`}>
      {props.children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 ${
        props.className ?? ''
      }`}
    />
  );
}

function ChoiceButton(props: { selected: boolean; onClick: () => void; title: string; subtitle?: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        props.selected ? 'border-black bg-neutral-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
      }`}
    >
      <div className="text-sm font-semibold text-neutral-900">{props.title}</div>
      {props.subtitle ? <div className="mt-1 text-xs text-neutral-600">{props.subtitle}</div> : null}
    </button>
  );
}

const DEFAULT_ANSWERS: Answers = {
  businessType: '',
  mainGoal: '',
  targetCustomer: '',
  style: '',
  businessName: '',
  location: '',
};

export default function BuildWalkPage({ params }: { params: { projectId: string } }) {
  const projectId = params?.projectId;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(DEFAULT_ANSWERS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 7;

  const canNext = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return answers.businessType.trim().length > 0;
    if (step === 2) return answers.mainGoal !== '';
    if (step === 3) return answers.targetCustomer !== '';
    if (step === 4) return answers.style !== '';
    if (step === 5) return answers.businessName.trim().length > 0;
    if (step === 6) return true; // location optional
    return true;
  }, [step, answers]);

  async function loadExisting() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/onboarding`, { method: 'GET' });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to load onboarding (HTTP ${res.status})`);
      }

      if (data.record?.answers) {
        setAnswers({
          businessType: String(data.record.answers.businessType ?? ''),
          mainGoal: (String(data.record.answers.mainGoal ?? '') as any) || '',
          targetCustomer: (String(data.record.answers.targetCustomer ?? '') as any) || '',
          style: (String(data.record.answers.style ?? '') as any) || '',
          businessName: String(data.record.answers.businessName ?? ''),
          location: String(data.record.answers.location ?? ''),
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load onboarding');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function saveAndFinish() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/onboarding`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Failed to save onboarding (HTTP ${res.status})`);
      }

      // After saving, send user back to project page where we’ll later add “Generate”
      window.location.href = `/projects/${encodeURIComponent(projectId)}`;
    } catch (e: any) {
      setError(e?.message || 'Failed to save onboarding');
      setSaving(false);
    }
  }

  function next() {
    if (!canNext) return;
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">AI Website Builder</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Answer a few quick questions — we’ll generate a professional website based on your choices.
            </p>
            <p className="mt-1 text-xs text-neutral-500">Project ID: {projectId}</p>
          </div>

          <a
            href={`/projects/${encodeURIComponent(projectId)}`}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-50"
          >
            Back to Project
          </a>
        </div>

        <div className="mt-6 rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-black transition-all"
            style={{ width: `${Math.round((Math.min(step, totalSteps) / totalSteps) * 100)}%` }}
          />
        </div>

        {loading ? (
          <div className="mt-6">
            <Card>
              <div className="p-6">
                <div className="h-6 w-64 animate-pulse rounded-lg bg-neutral-200" />
                <div className="mt-4 h-4 w-full animate-pulse rounded-lg bg-neutral-200" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded-lg bg-neutral-200" />
                <div className="mt-2 h-4 w-4/6 animate-pulse rounded-lg bg-neutral-200" />
              </div>
            </Card>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {error ? (
              <Card>
                <div className="p-6">
                  <div className="text-sm font-semibold text-red-900">Something went wrong</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-red-800">{error}</div>
                  <div className="mt-4">
                    <Button variant="secondary" onClick={loadExisting}>
                      Try again
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 0 */}
            {step === 0 ? (
              <Card>
                <div className="p-6">
                  <div className="text-xl font-semibold text-neutral-900">Let’s build your website together.</div>
                  <p className="mt-2 text-sm text-neutral-600">
                    I’ll ask you a few simple questions and create a professional website for you.
                    You don’t need to design anything — just answer honestly.
                  </p>

                  <div className="mt-6">
                    <Button onClick={next}>Start</Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 1 */}
            {step === 1 ? (
              <Card>
                <div className="p-6">
                  <div className="text-lg font-semibold text-neutral-900">What type of business or project is this?</div>
                  <p className="mt-2 text-sm text-neutral-600">
                    For example: plumber, café, electrician, personal trainer, consultant.
                  </p>

                  <div className="mt-4">
                    <Input
                      value={answers.businessType}
                      onChange={(e) => setAnswers((a) => ({ ...a, businessType: e.target.value }))}
                      placeholder="e.g., Plumber"
                      maxLength={80}
                    />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 2 */}
            {step === 2 ? (
              <Card>
                <div className="p-6">
                  <div className="text-lg font-semibold text-neutral-900">
                    What do you want visitors to do on your website?
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ChoiceButton
                      selected={answers.mainGoal === 'contact'}
                      onClick={() => setAnswers((a) => ({ ...a, mainGoal: 'contact' }))}
                      title="📞 Contact me"
                    />
                    <ChoiceButton
                      selected={answers.mainGoal === 'book'}
                      onClick={() => setAnswers((a) => ({ ...a, mainGoal: 'book' }))}
                      title="📅 Book a service"
                    />
                    <ChoiceButton
                      selected={answers.mainGoal === 'buy'}
                      onClick={() => setAnswers((a) => ({ ...a, mainGoal: 'buy' }))}
                      title="🛒 Buy something"
                    />
                    <ChoiceButton
                      selected={answers.mainGoal === 'quote'}
                      onClick={() => setAnswers((a) => ({ ...a, mainGoal: 'quote' }))}
                      title="📩 Get a quote"
                    />
                    <ChoiceButton
                      selected={answers.mainGoal === 'learn'}
                      onClick={() => setAnswers((a) => ({ ...a, mainGoal: 'learn' }))}
                      title="Just learn about my business"
                    />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 3 */}
            {step === 3 ? (
              <Card>
                <div className="p-6">
                  <div className="text-lg font-semibold text-neutral-900">Who is this website for?</div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ChoiceButton
                      selected={answers.targetCustomer === 'local'}
                      onClick={() => setAnswers((a) => ({ ...a, targetCustomer: 'local' }))}
                      title="Local customers"
                    />
                    <ChoiceButton
                      selected={answers.targetCustomer === 'businesses'}
                      onClick={() => setAnswers((a) => ({ ...a, targetCustomer: 'businesses' }))}
                      title="Businesses"
                    />
                    <ChoiceButton
                      selected={answers.targetCustomer === 'anyone'}
                      onClick={() => setAnswers((a) => ({ ...a, targetCustomer: 'anyone' }))}
                      title="Anyone"
                    />
                    <ChoiceButton
                      selected={answers.targetCustomer === 'unsure'}
                      onClick={() => setAnswers((a) => ({ ...a, targetCustomer: 'unsure' }))}
                      title="I’m not sure yet"
                    />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 4 */}
            {step === 4 ? (
              <Card>
                <div className="p-6">
                  <div className="text-lg font-semibold text-neutral-900">Which style feels right for your business?</div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ChoiceButton
                      selected={answers.style === 'clean'}
                      onClick={() => setAnswers((a) => ({ ...a, style: 'clean' }))}
                      title="Clean & modern"
                    />
                    <ChoiceButton
                      selected={answers.style === 'bold'}
                      onClick={() => setAnswers((a) => ({ ...a, style: 'bold' }))}
                      title="Bold & eye-catching"
                    />
                    <ChoiceButton
                      selected={answers.style === 'friendly'}
                      onClick={() => setAnswers((a) => ({ ...a, style: 'friendly' }))}
                      title="Friendly & welcoming"
                    />
                    <ChoiceButton
                      selected={answers.style === 'corporate'}
                      onClick={() => setAnswers((a) => ({ ...a, style: 'corporate' }))}
                      title="Professional & corporate"
                    />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 5 */}
            {step === 5 ? (
              <Card>
                <div className="p-6">
                  <div className="text-lg font-semibold text-neutral-900">What’s the name of your business or project?</div>
                  <p className="mt-2 text-sm text-neutral-600">You can change this later.</p>

                  <div className="mt-4">
                    <Input
                      value={answers.businessName}
                      onChange={(e) => setAnswers((a) => ({ ...a, businessName: e.target.value }))}
                      placeholder="e.g., Mike’s Plumbing"
                      maxLength={80}
                    />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canNext}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 6 */}
            {step === 6 ? (
              <Card>
                <div className="p-6">
                  <div className="text-lg font-semibold text-neutral-900">Where are you based? (optional)</div>
                  <p className="mt-2 text-sm text-neutral-600">This helps your site feel more personal.</p>

                  <div className="mt-4">
                    <Input
                      value={answers.location}
                      onChange={(e) => setAnswers((a) => ({ ...a, location: e.target.value }))}
                      placeholder="e.g., Auckland"
                      maxLength={80}
                    />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="secondary" onClick={back}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(7)}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* STEP 7 */}
            {step === 7 ? (
              <Card>
                <div className="p-6">
                  <div className="text-xl font-semibold text-neutral-900">That’s all I need.</div>
                  <p className="mt-2 text-sm text-neutral-600">
                    I’m saving your answers now. Next we’ll generate your website from this.
                  </p>

                  <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
                    <div className="font-semibold">Summary</div>
                    <div className="mt-2 space-y-1 text-sm text-neutral-700">
                      <div>• Business type: <span className="font-medium">{answers.businessType || '—'}</span></div>
                      <div>• Goal: <span className="font-medium">{answers.mainGoal || '—'}</span></div>
                      <div>• Audience: <span className="font-medium">{answers.targetCustomer || '—'}</span></div>
                      <div>• Style: <span className="font-medium">{answers.style || '—'}</span></div>
                      <div>• Name: <span className="font-medium">{answers.businessName || '—'}</span></div>
                      <div>• Location: <span className="font-medium">{answers.location || '—'}</span></div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={() => setStep(6)} disabled={saving}>
                      Back
                    </Button>
                    <Button onClick={saveAndFinish} disabled={saving}>
                      {saving ? 'Saving…' : 'Create my website'}
                    </Button>
                  </div>

                  <div className="mt-3 text-xs text-neutral-500">
                    “Create my website” saves your onboarding answers + a generation prompt in KV.
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
