'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SPECIALTIES, STATES } from '@/lib/catalog';
import { PageIntro } from '@/components/ui';

const DRAFT_KEY = 'legalgrads-intake-draft';

interface Draft {
  specialties: string[];
  jurisdiction: string;
  description: string;
  service: string;
  budget: string;
  urgency: string;
  format: string;
  step: number;
}

const EMPTY: Draft = {
  specialties: [],
  jurisdiction: '',
  description: '',
  service: 'consultation',
  budget: 'Not sure',
  urgency: 'Flexible',
  format: 'remote',
  step: 1,
};

export function FindLawyerView() {
  const params = useSearchParams();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    const base: Draft = stored ? { ...EMPTY, ...JSON.parse(stored) } : { ...EMPTY };
    const fromQuery = params.get('specialty');
    if (fromQuery && !base.specialties.includes(fromQuery)) base.specialties = [fromQuery, ...base.specialties];
    const step = Number(params.get('step') || base.step || 1);
    base.step = step >= 1 && step <= 3 ? step : 1;
    setDraft(base);
  }, [params]);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const names = useMemo(
    () => draft.specialties.map((slug) => SPECIALTIES.find((s) => s.slug === slug)?.name).filter(Boolean).join(', '),
    [draft.specialties],
  );

  function toggle(slug: string) {
    setDraft((d) => ({
      ...d,
      specialties: d.specialties.includes(slug) ? d.specialties.filter((s) => s !== slug) : [...d.specialties, slug],
    }));
  }

  function go(step: number) {
    if (step > 1 && draft.specialties.length === 0) {
      setError('Select at least one practice area.');
      return;
    }
    setError('');
    const next = new URLSearchParams(params.toString());
    next.set('step', String(step));
    if (draft.specialties[0]) next.set('specialty', draft.specialties[0]);
    router.push(`/find-lawyer/?${next.toString()}`);
    setDraft((d) => ({ ...d, step }));
  }

  function finish(event: FormEvent) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (draft.specialties.length) query.set('specialty', draft.specialties.join(','));
    if (draft.jurisdiction) query.set('jurisdiction', draft.jurisdiction);
    if (draft.description) query.set('q', draft.description);
    if (draft.format) query.set('format', draft.format);
    query.set('service', draft.service);
    router.push(`/find-lawyer/results/?${query.toString()}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageIntro kicker="Find a lawyer" title="What do you need legal help with?" body="Choose one or more areas. This intake stays in your browser and does not create a representation." />
      <ol className="mt-6 flex gap-2 text-sm font-semibold" aria-label="Progress">
        {['Areas', 'Details', 'Review'].map((label, index) => (
          <li key={label} className={draft.step === index + 1 ? 'rounded-full bg-navy px-3 py-2 text-white' : 'rounded-full bg-white px-3 py-2'}>{index + 1}. {label}</li>
        ))}
      </ol>
      <p className="mt-4 text-sm" data-testid="selected-specialties">Selected: {names || 'None yet'}</p>
      {error ? <p role="alert" className="mt-2 text-sm text-pink">{error}</p> : null}

      {draft.step === 1 ? (
        <div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SPECIALTIES.map((spec) => {
              const on = draft.specialties.includes(spec.slug);
              return (
                <button type="button" key={spec.slug} aria-pressed={on} onClick={() => toggle(spec.slug)} className={on ? 'flex items-center gap-3 rounded-3xl bg-white p-4 text-left ring-2 ring-purple' : 'flex items-center gap-3 rounded-3xl bg-white p-4 text-left ring-1 ring-navy/10'}>
                  <img src={spec.icon} alt="" width={56} height={56} />
                  <span>
                    <span className="block font-display text-lg font-extrabold">{spec.name}</span>
                    <span className="text-sm text-ink">{spec.examples}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white" onClick={() => go(2)}>Continue</button>
          </div>
        </div>
      ) : null}

      {draft.step === 2 ? (
        <form className="mt-4 grid gap-4 rounded-3xl bg-white p-5" onSubmit={(event) => { event.preventDefault(); go(3); }}>
          <label className="text-sm font-medium">Jurisdiction
            <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={draft.jurisdiction} onChange={(e) => setDraft({ ...draft, jurisdiction: e.target.value })}>
              <option value="">Any jurisdiction</option>
              {STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Short non-confidential description
            <textarea className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Example: review a draft NDA. Do not include secrets." />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Desired service
              <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value })}>
                <option value="consultation">Consultation</option>
                <option value="fixed">Fixed-price project</option>
                <option value="hourly">Hourly help</option>
              </select>
            </label>
            <label className="text-sm font-medium">Budget
              <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={draft.budget} onChange={(e) => setDraft({ ...draft, budget: e.target.value })}>
                {['Under $250', '$250–$750', '$750–$2,000', '$2,000+', 'Not sure'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Timeline
              <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={draft.urgency} onChange={(e) => setDraft({ ...draft, urgency: e.target.value })}>
                {['This week', 'This month', 'Flexible'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Format
              <select className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value })}>
                <option value="remote">Remote</option>
                <option value="in_person">In person</option>
                <option value="">Either</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" className="min-h-11 rounded-full bg-white px-5 font-display font-semibold ring-1 ring-navy/10" onClick={() => go(1)}>Back</button>
            <button type="submit" className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white">Continue</button>
          </div>
        </form>
      ) : null}

      {draft.step === 3 ? (
        <form className="mt-4 rounded-3xl bg-white p-5" onSubmit={finish}>
          <h2 className="font-display text-2xl font-extrabold">Review your intake</h2>
          <ul className="mt-3 space-y-1 text-sm text-ink">
            <li>Practice areas: {names}</li>
            <li>Jurisdiction: {draft.jurisdiction || 'Any'}</li>
            <li>Service: {draft.service}</li>
            <li>Budget: {draft.budget}</li>
            <li>Timeline: {draft.urgency}</li>
            <li>Format: {draft.format || 'Either'}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="min-h-11 rounded-full bg-white px-5 font-display font-semibold ring-1 ring-navy/10" onClick={() => go(2)}>Back</button>
            <button type="button" className="min-h-11 rounded-full bg-white px-5 font-display font-semibold ring-1 ring-navy/10" onClick={() => go(1)}>Edit areas</button>
            <button type="submit" className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white">See matching attorneys</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
