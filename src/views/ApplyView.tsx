'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { SPECIALTIES, specialtyName } from '@/lib/catalog';
import {
  BAR_SEARCH_URL,
  BIO_EXAMPLE,
  EMPTY_APPLICATION,
  STEP_IDS,
  type ApplicationInput,
  clearDraft,
  dataUrlToFile,
  errorsForStep,
  formatUsPhone,
  PHONE_HINT,
  phoneProblem,
  loadDraft,
  saveDraft,
  submitApplication,
} from '@/lib/applications';
import { ListingPreview } from '@/components/ListingPreview';
import { PhotoField } from '@/components/PhotoField';
import { inputClass } from '@/components/ui';
import { STATE_BAR_LOOKUP, stateName, US_STATES } from '@/lib/states';

const STEPS = ['You', 'License', 'Areas', 'Practice', 'Review'] as const;

const STEP_LINES = [
  'Your name, email, and phone.',
  'Your state of licensure, bar number, and admission date.',
  'Choose the areas you practice. Clients browse by these.',
  'Cities, languages, and a short bio.',
  'Check the listing, then send it.',
];

const fieldClass = `${inputClass} mt-2 min-h-12 text-base`;

export function ApplyView() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ApplicationInput>(EMPTY_APPLICATION);
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = loadDraft();
    if (saved) {
      setInput(saved.input);
      setPhotoDataUrl(saved.photoDataUrl);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDraft({ input, photoDataUrl });
  }, [input, photoDataUrl, hydrated]);

  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace('#', '');
      const index = STEP_IDS.indexOf(id as typeof STEP_IDS[number]);
      setStep(index >= 0 ? index : 0);
    };
    if (!window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#you`);
    }
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const invalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    const target = invalid ?? document.getElementById('join-step');
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - (invalid ? Math.max(0, (window.innerHeight - target.getBoundingClientRect().height) / 2) : 12);
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, top));
    root.style.scrollBehavior = previous;
  }, [step, hydrated]);

  function patch(partial: Partial<ApplicationInput>) {
    setInput((current) => ({ ...current, ...partial }));
  }

  function focusFirstInvalid() {
    window.requestAnimationFrame(() => {
      const field = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (!field) return;
      const box = field.getBoundingClientRect();
      const top = box.top + window.scrollY - Math.max(0, (window.innerHeight - box.height) / 2);
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, Math.max(0, top));
      root.style.scrollBehavior = previous;
      field.focus({ preventScroll: true });
    });
  }

  function forward() {
    const found = errorsForStep(step, input);
    if (step === 3 && errors.photo) found.photo = errors.photo;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid();
      return;
    }
    const next = Math.min(step + 1, STEP_IDS.length - 1);
    window.location.hash = STEP_IDS[next];
  }

  async function submit() {
    const phone = phoneProblem(input.phone);
    if (phone) {
      setErrors({ phone });
      window.location.hash = 'you';
      focusFirstInvalid();
      return;
    }
    const found = errorsForStep(4, input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid();
      return;
    }
    setBusy(true);
    const photo = await dataUrlToFile(photoDataUrl, input.photoName || 'photo.jpg');
    const result = await submitApplication(input, photo);
    clearDraft();
    window.sessionStorage.setItem('legalgrads-application-result', JSON.stringify(result));
    router.push('/join/confirmation/');
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) forward();
    else void submit();
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <form onSubmit={onSubmit} className="join-form mx-auto flex w-full max-w-xl flex-col px-4 pt-6 md:pt-8">
      <header id="join-step">
        <h1 className="font-display text-3xl font-black tracking-tight text-navy sm:text-4xl">Join Legalgrads free</h1>
        <p className="mt-2 font-display text-lg font-bold text-navy sm:text-xl" data-testid="step-line">{STEP_LINES[step]}</p>
      </header>

      <div className="mt-5">
        <p className="sr-only" data-testid="step-count" aria-current="step">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
        <ol
          className="grid grid-cols-5 gap-1"
          data-testid="step-dots"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          aria-valuetext={`Step ${step + 1} of ${STEPS.length}, ${STEPS[step]}`}
        >
          {STEPS.map((name, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <li key={name} className="relative flex flex-col items-center text-center" aria-hidden="true">
                {index > 0 ? <span className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${index <= step ? 'bg-purple' : 'bg-navy/15'}`} /> : null}
                <span className={`relative flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-bold ${current ? 'bg-pink text-white ring-4 ring-pink/20' : done ? 'bg-purple text-white' : 'bg-white text-ink ring-1 ring-navy/20'}`}>{done ? '✓' : index + 1}</span>
                <span className={`mt-1 font-display text-xs ${current ? 'font-bold text-navy' : 'font-semibold text-ink'}`}>{name}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {step === 0 ? (
        <div className="mt-6 grid gap-5">
          <Field label="Full name" id="apply-name" why="This is the name clients see on your listing." error={errors.fullName} value={input.fullName} autoComplete="name" onChange={(value) => patch({ fullName: value })} />
          <Field label="Email" id="apply-email" type="email" why="We email you about the state bar check. This address is never shown on your listing." error={errors.email} value={input.email} autoComplete="email" onChange={(value) => patch({ email: value })} />
          <Field label="Phone" id="apply-phone" type="tel" required hint={PHONE_HINT} error={errors.phone} value={input.phone} autoComplete="tel" transform={formatUsPhone} onChange={(value) => patch({ phone: value })} />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 grid gap-5">
          <div>
            <label className="text-base font-semibold text-navy" htmlFor="apply-state">State of licensure</label>
            <select id="apply-state" data-testid="apply-state" className={fieldClass} value={input.licensedState} aria-invalid={errors.licensedState ? true : undefined} aria-describedby="err-state" onChange={(event) => patch({ licensedState: event.target.value })}>
              <option value="">Choose a state</option>
              {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            {errors.licensedState ? <p id="err-state" role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.licensedState}</p> : <p id="err-state" className="sr-only" />}
          </div>
          <Field label={input.licensedState ? `${stateName(input.licensedState)} bar number` : 'Bar number'} id="apply-bar" maxLength={12} hint="The number your state bar issued. Letters and digits only." why="We look this up with your state bar before anything goes live." error={errors.barNumber} value={input.barNumber} transform={(value) => value.replace(/[^A-Za-z0-9]/g, '').slice(0, 12)} onChange={(value) => patch({ barNumber: value })} />
          <p className="text-sm"><a className="inline-flex min-h-11 items-center font-semibold text-purple" data-testid="bar-lookup" href={STATE_BAR_LOOKUP[input.licensedState] ?? BAR_SEARCH_URL} target="_blank" rel="noreferrer">{STATE_BAR_LOOKUP[input.licensedState] ? `Open the ${stateName(input.licensedState)} attorney lookup` : 'Find your state bar’s lawyer lookup'}</a></p>
          <div>
            <div className="flex flex-wrap items-center gap-1">
              <label className="text-base font-semibold text-navy" htmlFor="apply-admitted">Admission date</label>
              <InfoTip text="We confirm you are already admitted in that state. A future date is not accepted." />
            </div>
            <input id="apply-admitted" data-testid="apply-admitted" type="date" className={fieldClass} value={input.admissionDate} aria-invalid={errors.admissionDate ? true : undefined} aria-describedby="err-admitted" onChange={(event) => patch({ admissionDate: event.target.value })} />
            {errors.admissionDate ? <p id="err-admitted" role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.admissionDate}</p> : <p id="err-admitted" className="sr-only" />}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-1">
            <p className="text-base font-semibold text-navy" id="areas-label">Practice areas</p>
            <InfoTip text="Clients filter Find an attorney by these areas." />
          </div>
          {errors.practiceAreas ? <p id="err-areas" role="alert" className="mt-2 text-sm font-medium text-[#6E123F]">{errors.practiceAreas}</p> : null}
          <div className="mt-3 grid gap-3" role="group" aria-labelledby="areas-label">
            {SPECIALTIES.map((spec) => {
              const on = input.practiceAreas.includes(spec.slug);
              return (
                <button type="button" key={spec.slug} data-testid={`apply-specialty-${spec.slug}`} aria-pressed={on} aria-invalid={errors.practiceAreas ? true : undefined} onClick={() => patch({ practiceAreas: on ? input.practiceAreas.filter((slug) => slug !== spec.slug) : [...input.practiceAreas, spec.slug] })} className={on ? 'flex min-h-16 items-center gap-3 rounded-2xl bg-white p-4 text-left ring-2 ring-purple' : 'flex min-h-16 items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-navy/10'}>
                  <img src={spec.icon} alt="" width={48} height={48} />
                  <span>
                    <span className="block font-display text-base font-extrabold">{spec.name}</span>
                    <span className="text-sm text-ink">{spec.examples}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-5">
          <Field label="Cities served" id="apply-cities" hint="Separate cities with commas, for example: Springfield, Riverside." why="Clients search by state and city." error={errors.citiesServed} value={input.citiesServed} onChange={(value) => patch({ citiesServed: value })} />
          <Field label="Languages" id="apply-languages" hint="Separate languages with commas, for example: English, Spanish." why="Clients can see the languages you work in." error={errors.languages} value={input.languages} onChange={(value) => patch({ languages: value })} />
          <div>
            <div className="flex flex-wrap items-center gap-1">
              <label className="text-base font-semibold text-navy" htmlFor="apply-bio">Short bio</label>
              <InfoTip text="This is the text on your listing." />
            </div>
            <textarea id="apply-bio" data-testid="apply-bio" className={fieldClass} rows={5} value={input.bio} aria-invalid={errors.bio ? true : undefined} aria-describedby="hint-bio err-bio" onChange={(event) => patch({ bio: event.target.value })} />
            <p id="hint-bio" className="mt-1 text-sm text-ink">Example: {BIO_EXAMPLE}</p>
            <p className={input.bio.length > 600 ? 'text-sm font-medium text-[#6E123F]' : 'text-sm text-ink'} data-testid="bio-count">{input.bio.length} / 600</p>
            {errors.bio ? <p id="err-bio" role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{errors.bio}</p> : <p id="err-bio" className="sr-only" />}
          </div>
          <PhotoField
            photoDataUrl={photoDataUrl}
            error={errors.photo}
            onError={(message) => setErrors((current) => ({ ...current, photo: message }))}
            onPhoto={(dataUrl, name) => {
              setPhotoDataUrl(dataUrl);
              patch({ photoName: name });
            }}
          />
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 grid gap-5">
          <ListingPreview
            name={input.fullName}
            cities={input.citiesServed}
            state={stateName(input.licensedState)}
            languages={input.languages}
            areas={input.practiceAreas.map((slug) => specialtyName(slug))}
            bio={input.bio}
            insured={input.insurance === 'insured'}
            photoUrl={photoDataUrl}
            contact={input.contactLink}
            staticPreview
          />
          <p className="text-sm text-ink" data-testid="review-privacy">Nothing goes live until we verify your state bar record. Your email and phone stay private unless you choose otherwise.</p>
          <section className="grid gap-5 rounded-3xl bg-white/60 p-4 ring-1 ring-navy/10" aria-labelledby="review-details" data-testid="listing-details">
            <h2 id="review-details" className="font-display text-lg font-extrabold text-navy">Listing details</h2>
          <section className="grid gap-3" aria-labelledby="review-phone">
            <h3 id="review-phone" className="font-display text-base font-bold text-navy">Phone visibility</h3>
            <Choice name="phonePublic" legend="Show your phone number on the public listing?" why="Clients see it only if you choose show on listing. Your email is never shown." error={errors.phonePublic} value={input.phonePublic} onChange={(value) => patch({ phonePublic: value })} />
          </section>
          <Field label="Website" id="apply-contact" optional hint="An https link, if you have one. Leave this blank if you don't." error={errors.contactLink} value={input.contactLink} onChange={(value) => patch({ contactLink: value })} placeholder="https://" />
          <section className="grid gap-3" aria-labelledby="review-insurance">
            <h3 id="review-insurance" className="font-display text-base font-bold text-navy">Insurance</h3>
            <fieldset aria-invalid={errors.insurance ? true : undefined} aria-describedby="err-insurance">
              <legend className="flex flex-wrap items-center gap-1 text-base font-semibold text-navy">
                Professional liability insurance
                <InfoTip text="The Insured badge appears only if you carry insurance. If you do not, your state’s rules may require a written disclosure to clients (check your state bar’s rules)." />
              </legend>
              <div className="mt-3 grid gap-2">
                <label className="flex min-h-14 items-start gap-3 rounded-2xl bg-white px-4 py-3 text-base">
                  <input data-testid="apply-insured" className="mt-1 h-5 w-5" type="radio" name="insurance" checked={input.insurance === 'insured'} aria-invalid={errors.insurance ? true : undefined} onChange={() => patch({ insurance: 'insured' })} />
                  I carry professional liability insurance
                </label>
                <label className="flex min-h-14 items-start gap-3 rounded-2xl bg-white px-4 py-3 text-base">
                  <input data-testid="apply-disclose" className="mt-1 h-5 w-5" type="radio" name="insurance" checked={input.insurance === 'will_disclose'} aria-invalid={errors.insurance ? true : undefined} onChange={() => patch({ insurance: 'will_disclose' })} />
                  I don&apos;t. I&apos;ll tell clients in writing if my state&apos;s rules require it.
                </label>
              </div>
              {errors.insurance ? <p id="err-insurance" role="alert" className="mt-2 text-sm font-medium text-[#6E123F]">{errors.insurance}</p> : <p id="err-insurance" className="sr-only" />}
            </fieldset>
          </section>
          </section>
          <section className="grid gap-3" aria-labelledby="review-terms">
            <h2 id="review-terms" className="font-display text-lg font-extrabold text-navy">Terms</h2>
            <label className="flex min-h-14 items-start gap-3 rounded-2xl bg-white px-4 py-3 text-base">
              <input data-testid="apply-terms" className="mt-1 h-5 w-5" type="checkbox" checked={input.terms} aria-invalid={errors.terms ? true : undefined} aria-describedby="err-terms" onChange={(event) => patch({ terms: event.target.checked })} />
              <span>I agree to the <Link className="font-semibold text-purple" href="/attorney-terms/">Attorney Terms</Link>. I am responsible for my own advertising. My listing goes live only after Legalgrads manually verifies my state bar record. Clients reach me through Legalgrads’ private contact form.</span>
            </label>
            {errors.terms ? <p id="err-terms" role="alert" className="text-sm font-medium text-[#6E123F]">{errors.terms}</p> : <p id="err-terms" className="sr-only" />}
          </section>
        </div>
      ) : null}

      <div data-testid="apply-actions" className="join-actions border-t border-navy/10 bg-[#FFF8F1]/95 px-4 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-3">
          {step > 0 ? (
            <button type="button" data-testid="apply-back" className="min-h-12 flex-1 rounded-full bg-white px-4 font-display text-base font-semibold text-navy ring-1 ring-navy/10" onClick={() => window.history.back()}>Back</button>
          ) : null}
          {step < 4 ? (
            <button type="submit" data-testid="apply-next" className="min-h-12 flex-[1.4] rounded-full bg-pink px-4 font-display text-base font-semibold text-white">Continue</button>
          ) : (
            <button type="submit" data-testid="application-submit" disabled={busy} className="min-h-12 flex-[1.4] rounded-full bg-pink px-4 font-display text-base font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Submit application'}</button>
          )}
        </div>
      </div>
    </form>
  );
}

function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-purple"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Why we ask"
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
      </button>
      {open ? <span id={panelId} role="note" className="basis-full text-sm font-normal text-ink">{text}</span> : null}
    </>
  );
}

function Field({
  label,
  id,
  hint,
  why,
  error,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  inputMode,
  required = false,
  optional = false,
  maxLength,
  transform,
}: {
  label: string;
  id: string;
  hint?: string;
  why?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: 'numeric' | 'text';
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  transform?: (value: string) => string;
}) {
  const hintId = `hint-${id}`;
  const errorId = `err-${id}`;
  const describedBy = [hint ? hintId : '', errorId].filter(Boolean).join(' ');
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1">
        <label className="text-base font-semibold text-navy" htmlFor={id}>
          {label}
          {optional ? <span className="ml-2 text-sm font-medium text-ink">Optional</span> : null}
        </label>
        {why ? <InfoTip text={why} /> : null}
      </div>
      <input
        id={id}
        data-testid={id}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={fieldClass}
        value={value}
        aria-required={required ? true : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          const next = transform ? transform(event.target.value) : event.target.value;
          event.target.value = next;
          onChange(next);
        }}
      />
      {hint ? <p id={hintId} className="mt-1 text-sm text-ink">{hint}</p> : null}
      {error ? <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{error}</p> : <p id={errorId} className="sr-only" />}
    </div>
  );
}

function Choice({
  name,
  legend,
  why,
  error,
  value,
  onChange,
}: {
  name: 'phonePublic';
  legend: string;
  why: string;
  error?: string;
  value: ApplicationInput['emailPublic'];
  onChange: (value: 'public' | 'private') => void;
}) {
  return (
    <fieldset aria-describedby={`err-${name}`}>
      <legend className="flex flex-wrap items-center gap-1 text-base font-semibold text-navy">
        {legend}
        <InfoTip text={why} />
      </legend>
      <div className="mt-3 grid gap-2">
        <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 text-base ring-1 ring-navy/10">
          <input data-testid="apply-phone-public" className="h-5 w-5" type="radio" name={name} checked={value === 'public'} aria-invalid={error ? true : undefined} onChange={() => onChange('public')} />
          Show on listing
        </label>
        <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-4 text-base ring-1 ring-navy/10">
          <input data-testid="apply-phone-private" className="h-5 w-5" type="radio" name={name} checked={value === 'private'} onChange={() => onChange('private')} />
          Keep private
        </label>
      </div>
      {error ? <p id={`err-${name}`} role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{error}</p> : <p id={`err-${name}`} className="sr-only" />}
    </fieldset>
  );
}
