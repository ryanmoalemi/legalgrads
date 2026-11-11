'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SPECIALTIES, specialtyName } from '@/lib/catalog';
import {
  type OwnerClaim,
  type OwnerStats,
  claimHref,
  dashboardHref,
  editorHref,
  loadClaim,
  loadOwnerStats,
  normalizeProfilePath,
  readPhotoFile,
  readProofFile,
  saveOwnerEdit,
  uploadClaimProof,
} from '@/lib/claim';
import { contactProblem, phoneProblem } from '@/lib/applications';
import {
  AVAILABILITY,
  BILLING,
  CLIENT_TYPES,
  CONSULT_MODES,
  CONTACT_PREFS,
  SERVICE_OPTIONS,
  completeness,
  consultSummary,
  feeSummary,
  labelFor,
  shortDate,
} from '@/lib/ownerProfile';
import { PageIntro } from '@/components/ui';

const box = 'mt-1 w-full rounded-2xl border border-navy/15 bg-white px-3 py-3 text-base text-navy';
const section = 'rounded-3xl bg-white p-4 shadow-pill sm:p-5';

function toggle(list: string[] | undefined, value: string, on: boolean): string[] {
  const current = list || [];
  return on ? (current.includes(value) ? current : [...current, value]) : current.filter((item) => item !== value);
}

function Chip({ checked, onChange, label, testId }: { checked: boolean; onChange: (on: boolean) => void; label: string; testId?: string }) {
  return (
    <label className={`relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${checked ? 'border-navy bg-navy text-white' : 'border-navy/15 bg-white text-navy'}`}>
      <input data-testid={testId} type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span aria-hidden="true">{checked ? '✓' : '+'}</span>
      {label}
    </label>
  );
}

function Radio({ name, value, current, onChange, label, testId }: { name: string; value: string; current: string; onChange: (value: string) => void; label: string; testId?: string }) {
  const checked = current === value;
  return (
    <label className={`relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${checked ? 'border-navy bg-navy text-white' : 'border-navy/15 bg-white text-navy'}`}>
      <input data-testid={testId} type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(value)} />
      {label}
    </label>
  );
}

export function ProfilePreview({ claim }: { claim: OwnerClaim }) {
  const services = [...(claim.serviceList || []), ...(claim.services ? [claim.services] : [])];
  const consult = consultSummary(claim);
  const avail = labelFor(AVAILABILITY, claim.availability || '');
  return (
    <div data-testid="owner-preview" className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#6A00E0] to-[#B8005F] p-4 text-white">
        {claim.photoDataUrl ? <img src={claim.photoDataUrl} alt="" className="h-16 w-16 flex-none rounded-full border-2 border-white object-cover" /> : <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-white font-display text-xl font-extrabold text-[#6A00E0]">{claim.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>}
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-extrabold">{claim.name}</p>
          <p className="text-sm">{claim.city}{avail ? ` · ${avail}` : ''}</p>
        </div>
      </div>
      <div className="grid gap-3 p-4 text-sm text-navy">
        {claim.bio ? <p>{claim.bio}</p> : <p className="text-ink">Your bio shows here.</p>}
        {services.length ? <div><p className="font-semibold">Services</p><ul className="mt-1 list-disc pl-5">{services.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
        {claim.clientTypes?.length ? <p><b>Works with:</b> {claim.clientTypes.join(', ')}</p> : null}
        {consult ? <p><b>Consultations:</b> {consult}</p> : null}
        <p><b>Fees:</b> {feeSummary(claim)}</p>
        {claim.billing?.includes('fixed') && claim.fixedFees?.length ? <ul className="list-disc pl-5">{claim.fixedFees.map((fee) => <li key={fee.service}>{fee.service}: {fee.price}</li>)}</ul> : null}
        {avail ? <p><b>Availability:</b> {avail}{claim.availabilityUpdatedAt ? ` (updated ${shortDate(claim.availabilityUpdatedAt)})` : ''}</p> : null}
        <div className="flex flex-wrap gap-2">
          {claim.contactPref === 'inquiry' || (claim.inquiriesEnabled !== false && !claim.contactPref) ? <span className="rounded-full bg-[#C2006A] px-3 py-2 font-semibold text-white">{claim.consultModes?.length ? 'Request a consultation' : 'Ask about your legal needs'}</span> : null}
          {claim.phone ? <span className="rounded-full border border-navy/20 px-3 py-2">{claim.phone}</span> : null}
          {claim.contactLink ? <span className="rounded-full border border-navy/20 px-3 py-2">Website</span> : null}
        </div>
      </div>
    </div>
  );
}

export function ProofUpload({ profilePath }: { profilePath: string }) {
  const [card, setCard] = useState('');
  const [selfie, setSelfie] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);

  async function pick(file: File | undefined, set: (value: string) => void) {
    if (!file) return;
    setMessage('');
    try {
      set(await readProofFile(file));
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Could not read that image.');
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const claim = loadClaim(profilePath);
    if (!claim || !card || !selfie) {
      setMessage('Add both photos first.');
      return;
    }
    setBusy(true);
    const result = await uploadClaimProof(claim, card, selfie);
    setBusy(false);
    setMessage(result.message);
    setDone(result.ok);
  }

  return (
    <form data-testid="proof-form" className="grid gap-3 rounded-3xl bg-white p-4 text-sm" onSubmit={(event) => void submit(event)}>
      <p className="font-semibold">Help us review your claim</p>
      <p>Upload two photos: your bar card or law license, and a photo of you holding it next to your face. Photos are stored privately, seen only by our reviewer, and deleted once we decide on your claim.</p>
      <p>Please do not send a screenshot of the State Bar lookup page. Anyone can take one, so it does not prove who you are.</p>
      {done ? null : (
        <>
          <label className="font-medium">Bar card or license
            <input data-testid="proof-card" type="file" accept="image/*" className="mt-1 block w-full" onChange={(event) => void pick(event.target.files?.[0], setCard)} />
          </label>
          <label className="font-medium">Photo of you holding it
            <input data-testid="proof-selfie" type="file" accept="image/*" capture="user" className="mt-1 block w-full" onChange={(event) => void pick(event.target.files?.[0], setSelfie)} />
          </label>
          <button data-testid="proof-submit" type="submit" disabled={busy} className="min-h-11 rounded-full bg-navy font-display font-semibold text-white disabled:opacity-50">Upload photos</button>
        </>
      )}
      {message ? <p role="status" data-testid="proof-status">{message}</p> : null}
    </form>
  );
}

function useOwnerClaim() {
  const params = useSearchParams();
  const profilePath = normalizeProfilePath(params.get('profile'));
  const [claim, setClaim] = useState<OwnerClaim | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (profilePath) setClaim(loadClaim(profilePath));
    setReady(true);
  }, [profilePath]);
  return { profilePath, claim, setClaim, ready, welcome: params.get('welcome') === '1' };
}

function SignInFirst({ profilePath, what }: { profilePath: string | null; what: string }) {
  if (!profilePath) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageIntro title="Profile link is not valid" body="Open the claim page from the attorney listing, then confirm the code." />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro title="Verify this profile first" body={`The confirmation code signs you in on this device. Enter it on the claim page, then come back here to ${what}.`} />
      <p className="mt-4"><a className="font-semibold text-purple" href={claimHref(profilePath)}>Go to the claim page</a></p>
    </div>
  );
}

export function OwnerEditorView() {
  const { profilePath, claim, setClaim, ready, welcome } = useOwnerClaim();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timer = useRef<number | null>(null);

  function update(patch: Partial<OwnerClaim>) {
    setClaim((current) => (current ? { ...current, ...patch } : current));
    setDirty(true);
    setStatus('');
  }

  function problem(next: OwnerClaim): string | null {
    if ((next.bio || '').length > 600) return 'Keep the bio to 600 characters.';
    if ((next.services || '').length > 600) return 'Keep other services to 600 characters.';
    const phoneError = (next.phone || '').trim() ? phoneProblem(next.phone) : null;
    if (phoneError) return phoneError;
    const linkError = contactProblem(next.contactLink || '');
    if (linkError) return linkError;
    return null;
  }

  async function save(next: OwnerClaim) {
    const issue = problem(next);
    if (issue) {
      setError(issue);
      return;
    }
    setError('');
    setSaving(true);
    const trimmed: OwnerClaim = { ...next, bio: next.bio.trim(), services: next.services.trim(), phone: next.phone.trim(), contactLink: next.contactLink.trim() };
    const result = await saveOwnerEdit(trimmed);
    setSaving(false);
    setDirty(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setClaim((current) => (current ? { ...current, availabilityUpdatedAt: result.claim.availabilityUpdatedAt } : current));
    setStatus(result.message);
  }

  useEffect(() => {
    if (!dirty || !claim) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void save(claim), 1500);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim, dirty]);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      update({ photoDataUrl: await readPhotoFile(file) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not read that image.');
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (timer.current) window.clearTimeout(timer.current);
    if (claim) void save(claim);
  }

  if (!ready) return <p className="px-4 py-10">Loading editor…</p>;
  if (!profilePath || !claim) return <SignInFirst profilePath={profilePath} what="edit" />;

  const meter = completeness(claim);
  const pending = claim.approved === false;
  const fees = claim.fixedFees || [];
  const setAvailability = (value: string) => update({ availability: value as OwnerClaim['availability'], availabilityUpdatedAt: new Date().toISOString() });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageIntro title="Edit your profile" body={`Signed in on this device as ${claim.email} for ${claim.name}. ${pending ? 'Your claim is pending review, so your edits stay hidden from the public until we confirm it against the official bar record.' : 'Your edits show on your public profile.'}`} />
      {welcome ? <p role="status" data-testid="owner-welcome" className="mt-3 rounded-2xl bg-mint/15 px-3 py-2 text-sm text-navy">You claimed this profile. Fill in a few sections below. Changes save as you go.</p> : null}
      <div className="mt-4 rounded-3xl bg-white p-4 shadow-pill">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p data-testid="owner-progress" className="font-display text-lg font-extrabold text-navy">Profile {meter.percent}% complete</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a className="font-semibold text-purple underline" href={claim.profilePath}>View public profile</a>
            <a data-testid="owner-dashboard-link" className="font-semibold text-purple underline" href={dashboardHref(claim.profilePath)}>Profile stats</a>
          </div>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#EDE6F7]" role="progressbar" aria-label="Profile completeness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={meter.percent}>
          <div className="h-full rounded-full bg-[#007A63]" style={{ width: `${meter.percent}%` }} />
        </div>
        {meter.missing.length ? <p className="mt-2 text-sm text-ink">Next: {meter.missing.slice(0, 3).join(', ')}.</p> : <p className="mt-2 text-sm text-ink">Every section is filled in.</p>}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form className="grid min-w-0 gap-4" onSubmit={submit}>
          <fieldset className={section}>
            <legend className="sr-only">Photo</legend>
            <h2 className="font-display text-xl font-extrabold">Photo</h2>
            <div className="mt-3 flex items-center gap-3">
              {claim.photoDataUrl ? <img src={claim.photoDataUrl} alt="" className="h-20 w-20 rounded-full object-cover" /> : <div className="h-20 w-20 rounded-full bg-[#EDE6F7]" aria-hidden="true" />}
              <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-navy/20 px-4 text-sm font-semibold">
                {claim.photoDataUrl ? 'Change photo' : 'Upload a photo'}
                <input data-testid="owner-photo" type="file" accept="image/*" className="sr-only" onChange={(event) => void onPhoto(event.target.files?.[0])} />
              </label>
              {claim.photoDataUrl ? <button type="button" className="min-h-11 text-sm font-semibold text-purple" onClick={() => update({ photoDataUrl: '' })}>Remove</button> : null}
            </div>
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">About you</legend>
            <h2 className="font-display text-xl font-extrabold">About you</h2>
            <label className="mt-3 block text-sm font-medium">Short bio
              <textarea data-testid="owner-bio" className={box} rows={4} maxLength={600} value={claim.bio} onChange={(event) => update({ bio: event.target.value })} placeholder="Who you help and how you work, in two or three sentences." />
            </label>
            <p className="mt-1 text-right text-xs text-ink">{claim.bio.length}/600</p>
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">Services</legend>
            <h2 className="font-display text-xl font-extrabold">Services</h2>
            <p className="mt-1 text-sm text-ink">Tap everything you offer.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((item, index) => <Chip key={item} testId={`owner-service-${index}`} label={item} checked={Boolean(claim.serviceList?.includes(item))} onChange={(on) => update({ serviceList: toggle(claim.serviceList, item, on) })} />)}
            </div>
            <label className="mt-3 block text-sm font-medium">Other services (optional)
              <textarea data-testid="owner-services" className={box} rows={2} maxLength={600} value={claim.services} onChange={(event) => update({ services: event.target.value })} placeholder="For example: franchise agreements" />
            </label>
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">Who you work with</legend>
            <h2 className="font-display text-xl font-extrabold">Who you work with</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {CLIENT_TYPES.map((item, index) => <Chip key={item} testId={`owner-client-${index}`} label={item} checked={Boolean(claim.clientTypes?.includes(item))} onChange={(on) => update({ clientTypes: toggle(claim.clientTypes, item, on) })} />)}
            </div>
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">Consultations</legend>
            <h2 className="font-display text-xl font-extrabold">Consultations</h2>
            <p className="mt-1 text-sm text-ink">How can a new client talk to you first?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CONSULT_MODES.map((item) => <Chip key={item.value} testId={`owner-consult-${item.value}`} label={item.label} checked={Boolean(claim.consultModes?.includes(item.value))} onChange={(on) => update({ consultModes: toggle(claim.consultModes, item.value, on) })} />)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Consultation fee">
              <Radio name="consult-fee" value="free" current={claim.consultFee || ''} onChange={(value) => update({ consultFee: value as OwnerClaim['consultFee'] })} label="Free consultation" testId="owner-consult-free" />
              <Radio name="consult-fee" value="paid" current={claim.consultFee || ''} onChange={(value) => update({ consultFee: value as OwnerClaim['consultFee'] })} label="Paid consultation" testId="owner-consult-paid" />
            </div>
            {claim.consultFee === 'paid' ? (
              <label className="mt-3 block text-sm font-medium">Consultation price
                <input data-testid="owner-consult-price" className={box} maxLength={40} value={claim.consultPrice || ''} onChange={(event) => update({ consultPrice: event.target.value })} placeholder="$150 for 30 minutes" />
              </label>
            ) : null}
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">Fees</legend>
            <h2 className="font-display text-xl font-extrabold">How you bill</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {BILLING.map((item) => <Chip key={item.value} testId={`owner-billing-${item.value}`} label={item.label} checked={Boolean(claim.billing?.includes(item.value))} onChange={(on) => update({ billing: toggle(claim.billing, item.value, on) })} />)}
            </div>
            {claim.billing?.includes('fixed') ? (
              <div className="mt-3 grid gap-2">
                <p className="text-sm font-medium">Fixed-fee services (optional)</p>
                {fees.map((fee, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1fr)_110px_auto] items-center gap-2">
                    <input aria-label="Service" data-testid={`owner-fee-service-${index}`} className={box} maxLength={80} value={fee.service} onChange={(event) => update({ fixedFees: fees.map((row, i) => (i === index ? { ...row, service: event.target.value } : row)) })} placeholder="LLC formation" />
                    <input aria-label="Price" data-testid={`owner-fee-price-${index}`} className={box} maxLength={40} value={fee.price} onChange={(event) => update({ fixedFees: fees.map((row, i) => (i === index ? { ...row, price: event.target.value } : row)) })} placeholder="$900" />
                    <button type="button" aria-label="Remove fee" className="min-h-11 min-w-11 text-lg font-bold text-purple" onClick={() => update({ fixedFees: fees.filter((_, i) => i !== index) })}>×</button>
                  </div>
                ))}
                {fees.length < 6 ? <button type="button" data-testid="owner-fee-add" className="min-h-11 justify-self-start rounded-full border border-navy/20 px-4 text-sm font-semibold" onClick={() => update({ fixedFees: [...fees, { service: '', price: '' }] })}>Add a fixed fee</button> : null}
              </div>
            ) : null}
            <p className="mt-2 text-sm text-ink">Leave this blank and your profile says &quot;Ask about fees.&quot;</p>
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">Availability</legend>
            <h2 className="font-display text-xl font-extrabold">Availability</h2>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Availability">
              {AVAILABILITY.map((item) => <Radio key={item.value} name="availability" value={item.value} current={claim.availability || ''} onChange={setAvailability} label={item.label} testId={`owner-availability-${item.value}`} />)}
            </div>
            {claim.availability ? <p data-testid="owner-availability-date" className="mt-2 text-sm text-ink">Shown with the date you last updated it{claim.availabilityUpdatedAt ? `: ${shortDate(claim.availabilityUpdatedAt)}` : ''}.</p> : null}
          </fieldset>

          <fieldset className={section}>
            <legend className="sr-only">Contact</legend>
            <h2 className="font-display text-xl font-extrabold">How clients reach you</h2>
            <label className="mt-3 block text-sm font-medium">Phone
              <input data-testid="owner-phone" type="tel" inputMode="tel" autoComplete="tel" className={box} value={claim.phone} onChange={(event) => update({ phone: event.target.value })} />
            </label>
            <label className="mt-3 block text-sm font-medium">Website
              <input data-testid="owner-link" type="url" inputMode="url" className={box} value={claim.contactLink} onChange={(event) => update({ contactLink: event.target.value })} placeholder="https://" />
            </label>
            <p className="mt-3 text-sm font-medium">Preferred contact method</p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred contact method">
              {CONTACT_PREFS.map((item) => <Radio key={item.value} name="contact-pref" value={item.value} current={claim.contactPref || ''} onChange={(value) => update({ contactPref: value as OwnerClaim['contactPref'] })} label={item.label} testId={`owner-pref-${item.value}`} />)}
            </div>
            <label className="mt-3 flex items-start gap-3 text-sm">
              <input data-testid="owner-inquiries" type="checkbox" className="mt-1 h-5 w-5 flex-none" checked={claim.inquiriesEnabled !== false} onChange={(event) => update({ inquiriesEnabled: event.target.checked })} />
              <span>Show the &quot;Ask about your legal needs&quot; form. Requests are emailed to {claim.useBarEmail ? 'the email address in your State Bar record' : claim.email}.</span>
            </label>
          </fieldset>

          <fieldset className={section}>
            <legend className="text-sm font-medium">Practice areas</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIALTIES.map((item) => <Chip key={item.slug} testId={`owner-area-${item.slug}`} label={specialtyName(item.slug)} checked={claim.practiceAreas.includes(item.slug)} onChange={(on) => update({ practiceAreas: toggle(claim.practiceAreas, item.slug, on) })} />)}
            </div>
          </fieldset>

          <div className="sticky bottom-0 z-10 -mx-4 bg-cream/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:p-0">
            <button data-testid="owner-save" type="submit" disabled={saving} className="min-h-12 w-full rounded-full bg-pinkdark font-display font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8">{saving ? 'Saving…' : pending ? 'Submit profile for review' : 'Save'}</button>
            <span className="ml-0 mt-2 block text-sm text-ink sm:ml-3 sm:mt-0 sm:inline" aria-live="polite">{saving ? '' : dirty ? 'Unsaved changes. Saving shortly.' : ''}</span>
          </div>
          {error ? <p role="alert" data-testid="owner-error" className="rounded-2xl bg-[#F8E8EE] px-3 py-2 text-sm font-medium text-[#6E123F]">{error}</p> : null}
          {status ? <p role="status" data-testid="owner-status" className="text-sm">{status}</p> : null}
        </form>
        <aside className="grid content-start gap-4 lg:sticky lg:top-4">
          <p className="font-display text-lg font-extrabold">Live preview</p>
          <ProfilePreview claim={claim} />
          {pending ? <ProofUpload profilePath={claim.profilePath} /> : null}
        </aside>
      </div>
    </div>
  );
}

const MEASURE_START = '2026-11-11';

const DEFINITIONS: { key: keyof OwnerStats; label: string; detail: string }[] = [
  { key: 'views', label: 'Profile views', detail: 'Visitors who opened your profile page, counted once per visitor per day. Known bots, crawlers, and link previews are not counted, and neither are your own visits from this device.' },
  { key: 'websiteClicks', label: 'Website clicks', detail: 'Visitors who tapped the website link on your profile, once per visitor per day.' },
  { key: 'phoneClicks', label: 'Contact clicks', detail: 'Visitors who tapped your phone number on your profile, once per visitor per day.' },
  { key: 'inquiries', label: 'Delivered requests', detail: 'Requests sent with the form on your profile and delivered to your email. Requests we blocked as spam are not counted.' },
];

export function OwnerDashboardView() {
  const { profilePath, claim, ready } = useOwnerClaim();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!claim) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void loadOwnerStats(claim).then((result) => {
      if (cancelled) return;
      setLoading(false);
      setStats(result.stats || null);
      setMessage(result.message);
    });
    return () => {
      cancelled = true;
    };
  }, [claim]);

  if (!ready) return <p className="px-4 py-10">Loading stats…</p>;
  if (!profilePath || !claim) return <SignInFirst profilePath={profilePath} what="see your stats" />;
  const start = stats?.since && stats.since > MEASURE_START ? stats.since : MEASURE_START;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <PageIntro kicker="Private to you" title="Profile stats" body={`The last 30 days for ${claim.name}. Only you can see these numbers. They are never shown on your public profile.`} />
      <p className="mt-3 flex flex-wrap gap-3 text-sm">
        <a className="font-semibold text-purple underline" href={editorHref(claim.profilePath)}>Edit your profile</a>
        <a className="font-semibold text-purple underline" href={claim.profilePath}>View public profile</a>
      </p>
      {loading ? <p className="mt-6 text-sm">Loading stats…</p> : null}
      {!loading && !stats ? <p role="status" data-testid="dashboard-unavailable" className="mt-6 rounded-2xl bg-white p-4 text-sm">{message}</p> : null}
      {stats ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {DEFINITIONS.map((item) => (
              <div key={item.key} className="rounded-3xl bg-white p-4 shadow-pill">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p data-testid={`dashboard-${item.key}`} className="mt-1 font-display text-4xl font-extrabold text-navy">{Number(stats[item.key] || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
          {DEFINITIONS.every((item) => !stats[item.key]) ? <p data-testid="dashboard-zero" className="mt-4 text-sm text-ink">No activity yet. A complete profile with services, fees, and availability gives business owners more reason to reach out.</p> : null}
          <p className="mt-4 text-sm text-ink">Counting since {shortDate(`${start}T12:00:00Z`)}. Earlier activity was not measured.</p>
        </>
      ) : null}
      <section className="mt-8 rounded-3xl bg-white p-4 text-sm shadow-pill">
        <h2 className="font-display text-xl font-extrabold">What each number means</h2>
        <dl className="mt-3 grid gap-3">
          {DEFINITIONS.map((item) => (
            <div key={item.key}><dt className="font-semibold">{item.label}</dt><dd className="text-ink">{item.detail}</dd></div>
          ))}
        </dl>
        <p className="mt-3 text-ink">Counts are first-party and cookieless. We keep a daily one-way hash to count each visitor once per day, and never store IP addresses.</p>
      </section>
    </div>
  );
}
