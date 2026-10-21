'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SPECIALTIES } from '@/lib/catalog';
import {
  EMPTY_APPLICATION,
  type ApplicationInput,
  normalizeLink,
  saveDraft,
  stepError,
  submitApplication,
} from '@/lib/applications';
import { inputClass, PageIntro } from '@/components/ui';

const STEPS = ['You', 'License', 'Areas', 'Practice', 'Rate', 'Confirm'];

export function ApplyView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ApplicationInput>(EMPTY_APPLICATION);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function patch(partial: Partial<ApplicationInput>) {
    setInput((current) => ({ ...current, ...partial }));
  }

  function next() {
    const problem = stepError(step, input);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  async function submit() {
    const problem = stepError(5, input);
    if (problem) {
      setError(problem);
      return;
    }
    if (photo && photo.size > 5 * 1024 * 1024) {
      setError('Photo must be 5 MB or smaller.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await submitApplication({ ...input, photoName: photo?.name ?? '' }, photo);
    saveDraft({ ...input, photoName: photo?.name ?? '' });
    window.sessionStorage.setItem('legalgrads-application-result', JSON.stringify(result));
    router.push('/join/confirmation/');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageIntro kicker="Founding Member" title="Apply for a free listing" body="Six short steps. Your listing is not public until Legalgrads manually verifies your California State Bar record." />
      <ol className="mt-6 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Progress" data-testid="apply-step">
        {STEPS.map((label, index) => (
          <li key={label} className={step === index ? 'rounded-full bg-navy px-3 py-2 text-white' : 'rounded-full bg-white px-3 py-2'}>{index + 1}. {label}</li>
        ))}
      </ol>
      {error ? <p role="alert" className="mt-4 text-sm text-pink">{error}</p> : null}

      {step === 0 ? (
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-medium">Full name
            <input data-testid="apply-name" className={inputClass} value={input.fullName} onChange={(event) => patch({ fullName: event.target.value })} autoComplete="name" />
          </label>
          <label className="text-sm font-medium">Email
            <input data-testid="apply-email" type="email" className={inputClass} value={input.email} onChange={(event) => patch({ email: event.target.value })} autoComplete="email" />
          </label>
          <label className="text-sm font-medium">Phone
            <input data-testid="apply-phone" type="tel" className={inputClass} value={input.phone} onChange={(event) => patch({ phone: event.target.value })} autoComplete="tel" />
          </label>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-medium">California State Bar number
            <input data-testid="apply-bar" inputMode="numeric" className={inputClass} value={input.barNumber} onChange={(event) => patch({ barNumber: event.target.value.replace(/\D/g, '').slice(0, 8) })} />
          </label>
          <label className="text-sm font-medium">Admission date
            <input data-testid="apply-admitted" type="date" className={inputClass} value={input.admissionDate} onChange={(event) => patch({ admissionDate: event.target.value })} />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {SPECIALTIES.map((spec) => {
            const on = input.practiceAreas.includes(spec.slug);
            return (
              <button type="button" key={spec.slug} data-testid={`apply-specialty-${spec.slug}`} aria-pressed={on} onClick={() => patch({ practiceAreas: on ? input.practiceAreas.filter((slug) => slug !== spec.slug) : [...input.practiceAreas, spec.slug] })} className={on ? 'flex items-center gap-3 rounded-3xl bg-white p-4 text-left ring-2 ring-purple' : 'flex items-center gap-3 rounded-3xl bg-white p-4 text-left ring-1 ring-navy/10'}>
                <img src={spec.icon} alt="" width={56} height={56} />
                <span>
                  <span className="block font-display text-lg font-extrabold">{spec.name}</span>
                  <span className="text-sm text-ink">{spec.examples}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-medium">Cities served
            <input data-testid="apply-cities" className={inputClass} value={input.citiesServed} onChange={(event) => patch({ citiesServed: event.target.value })} placeholder="Oakland, San Francisco" />
          </label>
          <label className="text-sm font-medium">Languages
            <input data-testid="apply-languages" className={inputClass} value={input.languages} onChange={(event) => patch({ languages: event.target.value })} placeholder="English, Spanish" />
          </label>
          <label className="text-sm font-medium">Short bio
            <textarea data-testid="apply-bio" className={inputClass} rows={5} value={input.bio} onChange={(event) => patch({ bio: event.target.value })} />
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 grid gap-4">
          <fieldset>
            <legend className="text-sm font-medium">Rate type</legend>
            <div className="mt-2 flex gap-3">
              {(['flat', 'hourly'] as const).map((type) => (
                <label key={type} className="flex min-h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-navy/10">
                  <input data-testid={`apply-rate-${type}`} type="radio" name="rateType" checked={input.rateType === type} onChange={() => patch({ rateType: type })} />
                  {type === 'flat' ? 'Flat fee' : 'Hourly'}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="text-sm font-medium">Amount in dollars
            <input data-testid="apply-rate-amount" type="number" min={1} className={inputClass} value={input.rateAmount} onChange={(event) => patch({ rateAmount: event.target.value })} />
          </label>
          <label className="text-sm font-medium">Contact or booking link
            <input data-testid="apply-contact" className={inputClass} value={input.contactLink} onChange={(event) => patch({ contactLink: event.target.value })} placeholder="https://" />
          </label>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mt-6 grid gap-4 rounded-3xl bg-white p-5 text-sm">
          <h2 className="font-display text-2xl font-extrabold">Review</h2>
          <ul className="space-y-1 text-ink">
            <li>{input.fullName} · {input.email} · {input.phone}</li>
            <li>Bar {input.barNumber} · admitted {input.admissionDate}</li>
            <li>{input.practiceAreas.map((slug) => SPECIALTIES.find((item) => item.slug === slug)?.name).join(', ')}</li>
            <li>{input.citiesServed} · {input.languages}</li>
            <li>{input.rateType === 'hourly' ? `$${input.rateAmount}/hr` : `$${input.rateAmount} flat`} · {normalizeLink(input.contactLink)}</li>
            <li>Photo: {photo ? photo.name : 'none'}</li>
          </ul>
          <p className="leading-6 text-ink">{input.bio}</p>
          <label className="flex items-start gap-2">
            <input data-testid="apply-insurance" type="checkbox" checked={input.malpractice} onChange={(event) => patch({ malpractice: event.target.checked })} />
            <span>I confirm I maintain professional liability (malpractice) insurance.</span>
          </label>
          <label className="flex items-start gap-2">
            <input data-testid="apply-terms" type="checkbox" checked={input.terms} onChange={(event) => patch({ terms: event.target.checked })} />
            <span>I agree to the <Link className="font-semibold text-purple" href="/attorney-terms/">Attorney Terms</Link>. The listing is free. Legalgrads takes no referral fee and no share of legal fees. I am responsible for my own advertising. My listing goes live only after Legalgrads manually verifies my California State Bar record.</span>
          </label>
          <label className="text-sm font-medium">Photo, optional
            <input data-testid="apply-photo" className="mt-1 block w-full" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setPhoto(file);
              patch({ photoName: file?.name ?? '' });
            }} />
          </label>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 ? <button type="button" data-testid="apply-back" className="min-h-11 rounded-full bg-white px-5 font-display font-semibold ring-1 ring-navy/10" onClick={() => { setError(''); setStep((value) => value - 1); }}>Back</button> : null}
        {step < 5 ? <button type="button" data-testid="apply-next" className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white" onClick={next}>Continue</button> : null}
        {step === 5 ? <button type="button" data-testid="application-submit" disabled={busy} className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white disabled:opacity-50" onClick={() => void submit()}>{busy ? 'Sending…' : 'Submit application'}</button> : null}
      </div>
    </div>
  );
}
