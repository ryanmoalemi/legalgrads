'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  insuranceLabel,
  loadDraft,
  rateLabel,
  saveDraft,
  submitApplication,
} from '@/lib/applications';
import { ListingPreview } from '@/components/ListingPreview';
import { PhotoField } from '@/components/PhotoField';
import { inputClass, PageIntro } from '@/components/ui';

const STEPS = ['You', 'License', 'Areas', 'Practice', 'Rate', 'Review'];

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

  function patch(partial: Partial<ApplicationInput>) {
    setInput((current) => ({ ...current, ...partial }));
  }

  function focusFirstInvalid() {
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function forward() {
    const found = errorsForStep(step, input);
    if (errors.photo) found.photo = errors.photo;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid();
      return;
    }
    const next = Math.min(step + 1, STEP_IDS.length - 1);
    window.location.hash = STEP_IDS[next];
  }

  async function submit() {
    const found = errorsForStep(5, input);
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageIntro kicker="Attorneys" title="Apply for a free listing" body="Six short steps. Your listing is not public until Legalgrads manually verifies your California State Bar record. Clients contact you directly." />
      <p className="mt-4 font-display text-sm font-bold md:hidden" data-testid="step-count">Step {step + 1} of 6</p>
      <ol className="mt-3 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Progress">
        {STEPS.map((label, index) => (
          <li key={label} aria-current={step === index ? 'step' : undefined} className={step === index ? 'rounded-full bg-navy px-3 py-2 text-white' : 'rounded-full bg-white px-3 py-2'}>{index + 1}. {label}</li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="mt-6 grid gap-4">
          <Field label="Full name" id="apply-name" hint="Why we ask: this is the name clients see on your listing." error={errors.fullName} value={input.fullName} autoComplete="name" onChange={(value) => patch({ fullName: value })} />
          <Field label="Email" id="apply-email" type="email" hint="Why we ask: we email you about the State Bar check. You choose whether clients see it." error={errors.email} value={input.email} autoComplete="email" onChange={(value) => patch({ email: value })} />
          <Choice name="emailPublic" legend="Show your email on the public listing?" error={errors.emailPublic} value={input.emailPublic} onChange={(value) => patch({ emailPublic: value })} />
          <Field label="Phone" id="apply-phone" type="tel" hint="Why we ask: so we can reach you about this application. You choose whether clients see it." error={errors.phone} value={input.phone} autoComplete="tel" onChange={(value) => patch({ phone: value })} />
          <Choice name="phonePublic" legend="Show your phone number on the public listing?" error={errors.phonePublic} value={input.phonePublic} onChange={(value) => patch({ phonePublic: value })} />
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

      {step === 1 ? (
        <div className="mt-6 grid gap-4">
          <Field label="California State Bar number" id="apply-bar" inputMode="numeric" hint="Digits only, up to 6. Why we ask: we look this up before anything goes live." error={errors.barNumber} value={input.barNumber} onChange={(value) => patch({ barNumber: value })} />
          <p className="text-sm"><a className="font-semibold text-purple" href={BAR_SEARCH_URL} target="_blank" rel="noreferrer">Look up a record on the State Bar site</a></p>
          <label className="text-sm font-medium text-navy" htmlFor="apply-admitted">Admission date
            <input id="apply-admitted" data-testid="apply-admitted" type="date" className={inputClass} value={input.admissionDate} aria-invalid={errors.admissionDate ? true : undefined} aria-describedby="hint-admitted err-admitted" onChange={(event) => patch({ admissionDate: event.target.value })} />
          </label>
          <p id="hint-admitted" className="text-sm text-ink">Why we ask: we confirm you are already admitted in California. A future date is not accepted.</p>
          {errors.admissionDate ? <p id="err-admitted" role="alert" className="text-sm font-medium text-[#6E123F]">{errors.admissionDate}</p> : <p id="err-admitted" className="sr-only" />}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6">
          <p id="hint-areas" className="text-sm text-ink">Why we ask: clients filter Find an attorney by these areas.</p>
          {errors.practiceAreas ? <p id="err-areas" role="alert" className="mt-2 text-sm font-medium text-[#6E123F]">{errors.practiceAreas}</p> : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {SPECIALTIES.map((spec) => {
              const on = input.practiceAreas.includes(spec.slug);
              return (
                <button type="button" key={spec.slug} data-testid={`apply-specialty-${spec.slug}`} aria-pressed={on} aria-invalid={errors.practiceAreas ? true : undefined} onClick={() => patch({ practiceAreas: on ? input.practiceAreas.filter((slug) => slug !== spec.slug) : [...input.practiceAreas, spec.slug] })} className={on ? 'flex items-center gap-3 rounded-3xl bg-white p-4 text-left ring-2 ring-purple' : 'flex items-center gap-3 rounded-3xl bg-white p-4 text-left ring-1 ring-navy/10'}>
                  <img src={spec.icon} alt="" width={56} height={56} />
                  <span>
                    <span className="block font-display text-lg font-extrabold">{spec.name}</span>
                    <span className="text-sm text-ink">{spec.examples}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-4">
          <Field label="Cities served" id="apply-cities" hint="Why we ask: clients search by California city." error={errors.citiesServed} value={input.citiesServed} onChange={(value) => patch({ citiesServed: value })} placeholder="Oakland, San Francisco" />
          <Field label="Languages" id="apply-languages" hint="Why we ask: clients can see the languages you work in." error={errors.languages} value={input.languages} onChange={(value) => patch({ languages: value })} placeholder="English, Spanish" />
          <label className="text-sm font-medium text-navy" htmlFor="apply-bio">Short bio
            <textarea id="apply-bio" data-testid="apply-bio" className={inputClass} rows={5} value={input.bio} aria-invalid={errors.bio ? true : undefined} aria-describedby="hint-bio err-bio" onChange={(event) => patch({ bio: event.target.value })} />
          </label>
          <p id="hint-bio" className="text-sm text-ink">Why we ask: this is the text on your listing. Example: {BIO_EXAMPLE}</p>
          <p className={input.bio.length > 600 ? 'text-sm font-medium text-[#6E123F]' : 'text-sm text-ink'} data-testid="bio-count">{input.bio.length} / 600</p>
          {errors.bio ? <p id="err-bio" role="alert" className="text-sm font-medium text-[#6E123F]">{errors.bio}</p> : <p id="err-bio" className="sr-only" />}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 grid gap-4">
          <fieldset aria-describedby="hint-rate err-rate">
            <legend className="text-sm font-medium text-navy">Rate type</legend>
            <p id="hint-rate" className="mt-1 text-sm text-ink">Why we ask: clients see what you charge. They contact you directly. Legalgrads is not part of the payment.</p>
            <div className="mt-2 flex gap-3">
              {(['flat', 'hourly'] as const).map((type) => (
                <label key={type} className="flex min-h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-navy/10">
                  <input data-testid={`apply-rate-${type}`} type="radio" name="rateType" checked={input.rateType === type} aria-invalid={errors.rateType ? true : undefined} onChange={() => patch({ rateType: type })} />
                  {type === 'flat' ? 'Flat fee' : 'Hourly'}
                </label>
              ))}
            </div>
          </fieldset>
          {errors.rateType ? <p id="err-rate" role="alert" className="text-sm font-medium text-[#6E123F]">{errors.rateType}</p> : <p id="err-rate" className="sr-only" />}
          <Field label="Amount in dollars" id="apply-rate-amount" type="number" hint="Minimum $25." error={errors.rateAmount} value={input.rateAmount} onChange={(value) => patch({ rateAmount: value })} />
          <Field label="For what" id="apply-rate-for" hint="Why we ask: say what the amount covers, such as a lease review or a one-hour consult." error={errors.rateFor} value={input.rateFor} onChange={(value) => patch({ rateFor: value })} />
          <label className="flex items-start gap-2 text-sm">
            <input data-testid="apply-starting-at" type="checkbox" checked={input.rateStartingAt} onChange={(event) => patch({ rateStartingAt: event.target.checked })} />
            Show this as “starting at”
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input data-testid="apply-free-consult" type="checkbox" checked={input.freeConsultation} onChange={(event) => patch({ freeConsultation: event.target.checked })} />
            I offer a free consultation
          </label>
          <Field label="How clients contact you" id="apply-contact" hint="Use an https link, an email address, or a phone number. Clients reach you directly." error={errors.contactLink} value={input.contactLink} onChange={(value) => patch({ contactLink: value })} placeholder="https:// or you@firm.com" />
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mt-6 grid gap-4">
          <ListingPreview
            name={input.fullName}
            cities={input.citiesServed}
            rate={rateLabel(input)}
            areas={input.practiceAreas.map((slug) => specialtyName(slug))}
            bio={input.bio}
            insured={input.insurance === 'insured'}
            photoUrl={photoDataUrl}
            contact={input.contactLink}
          />
          <fieldset aria-invalid={errors.insurance ? true : undefined} aria-describedby="hint-insurance err-insurance">
            <legend className="text-sm font-medium text-navy">Professional liability insurance</legend>
            <p id="hint-insurance" className="mt-1 text-sm text-ink">Why we ask: the Insured badge appears only if you carry insurance. If you do not, California Rule of Professional Conduct 1.4.2 requires a written disclosure to clients.</p>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input data-testid="apply-insured" type="radio" name="insurance" checked={input.insurance === 'insured'} aria-invalid={errors.insurance ? true : undefined} onChange={() => patch({ insurance: 'insured' })} />
              I carry professional liability insurance
            </label>
            <label className="mt-2 flex items-start gap-2 text-sm">
              <input data-testid="apply-disclose" type="radio" name="insurance" checked={input.insurance === 'will_disclose'} onChange={() => patch({ insurance: 'will_disclose' })} />
              I don&apos;t currently, and I will disclose that to clients in writing as California Rule of Professional Conduct 1.4.2 requires
            </label>
          </fieldset>
          {errors.insurance ? <p id="err-insurance" role="alert" className="text-sm font-medium text-[#6E123F]">{errors.insurance}</p> : <p id="err-insurance" className="sr-only" />}
          <p className="text-sm text-ink">Choice: {insuranceLabel(input.insurance)}</p>
          <label className="flex items-start gap-2 text-sm">
            <input data-testid="apply-terms" type="checkbox" checked={input.terms} aria-invalid={errors.terms ? true : undefined} aria-describedby="err-terms" onChange={(event) => patch({ terms: event.target.checked })} />
            <span>I agree to the <Link className="font-semibold text-purple" href="/attorney-terms/">Attorney Terms</Link>. I am responsible for my own advertising. My listing goes live only after Legalgrads manually verifies my California State Bar record. Clients contact me directly.</span>
          </label>
          {errors.terms ? <p id="err-terms" role="alert" className="text-sm font-medium text-[#6E123F]">{errors.terms}</p> : <p id="err-terms" className="sr-only" />}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 ? <button type="button" data-testid="apply-back" className="min-h-11 rounded-full bg-white px-5 font-display font-semibold ring-1 ring-navy/10" onClick={() => window.history.back()}>Back</button> : null}
        {step < 5 ? <button type="button" data-testid="apply-next" className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white" onClick={forward}>Continue</button> : null}
        {step === 5 ? <button type="button" data-testid="application-submit" disabled={busy} className="min-h-11 rounded-full bg-pink px-5 font-display font-semibold text-white disabled:opacity-50" onClick={() => void submit()}>{busy ? 'Sending…' : 'Submit application'}</button> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  hint,
  error,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  inputMode,
}: {
  label: string;
  id: string;
  hint: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: 'numeric' | 'text';
}) {
  const hintId = `hint-${id}`;
  const errorId = `err-${id}`;
  return (
    <div>
      <label className="text-sm font-medium text-navy" htmlFor={id}>{label}
        <input
          id={id}
          data-testid={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={inputClass}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${hintId} ${errorId}`}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <p id={hintId} className="mt-1 text-sm text-ink">{hint}</p>
      {error ? <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{error}</p> : <p id={errorId} className="sr-only" />}
    </div>
  );
}

function Choice({
  name,
  legend,
  error,
  value,
  onChange,
}: {
  name: 'emailPublic' | 'phonePublic';
  legend: string;
  error?: string;
  value: ApplicationInput['emailPublic'];
  onChange: (value: 'public' | 'private') => void;
}) {
  return (
    <fieldset aria-describedby={`err-${name}`}>
      <legend className="text-sm font-medium text-navy">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-3">
        <label className="flex min-h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-navy/10">
          <input data-testid={`apply-${name === 'emailPublic' ? 'email' : 'phone'}-public`} type="radio" name={name} checked={value === 'public'} aria-invalid={error ? true : undefined} onChange={() => onChange('public')} />
          Show on listing
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-navy/10">
          <input data-testid={`apply-${name === 'emailPublic' ? 'email' : 'phone'}-private`} type="radio" name={name} checked={value === 'private'} onChange={() => onChange('private')} />
          Keep private
        </label>
      </div>
      {error ? <p id={`err-${name}`} role="alert" className="mt-1 text-sm font-medium text-[#6E123F]">{error}</p> : <p id={`err-${name}`} className="sr-only" />}
    </fieldset>
  );
}
