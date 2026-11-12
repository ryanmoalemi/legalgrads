'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  type DirectoryListing,
  type ClaimOptions,
  IDENTITY_NOTE,
  attestationFor,
  confirmClaimCode,
  fetchClaimOptions,
  reportWrongClaim,
  editorHref,
  listingFromDirectoryRow,
  normalizeProfilePath,
  pendingFor,
  requestClaimCode,
} from '@/lib/claim';
import { ProfileEditorView } from '@/views/Phase2';
import { OwnerEditorView } from '@/views/OwnerEditor';
import { stateName } from '@/lib/states';
import { knownCity } from '@/lib/places';
import { PageIntro } from '@/components/ui';

export function ClaimView() {
  const params = useSearchParams();
  const profilePath = normalizeProfilePath(params.get('profile'));
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [lookup, setLookup] = useState<'loading' | 'ready' | 'missing' | 'bad'>('loading');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [shownCode, setShownCode] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [codeStep, setCodeStep] = useState(false);
  const [options, setOptions] = useState<ClaimOptions | null>(null);
  const [otherEmail, setOtherEmail] = useState(false);
  const reportMode = params.get('report') === '1';
  const [reportEmail, setReportEmail] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reported, setReported] = useState(false);
  const [attest, setAttest] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  useEffect(() => {
    if (!profilePath) return;
    let cancelled = false;
    void fetchClaimOptions(profilePath).then((found) => {
      if (!cancelled) setOptions(found);
    });
    return () => {
      cancelled = true;
    };
  }, [profilePath]);

  async function sendReport(event: FormEvent) {
    event.preventDefault();
    if (!profilePath) return;
    setBusy(true);
    setError('');
    const ok = await reportWrongClaim(profilePath, reportEmail, reportNote);
    setBusy(false);
    if (!ok) {
      setError('We could not save the report. Try again in a minute.');
      return;
    }
    setReported(true);
    setStatus('Thanks. The claim is flagged and its edits are hidden while we review it. If this is your profile, you can claim it below.');
  }

  useEffect(() => {
    if (!profilePath) {
      setLookup('bad');
      return;
    }
    const pending = pendingFor(profilePath);
    if (pending) {
      setEmail(pending.email);
      setCodeStep(true);
      if (pending.code) setShownCode(pending.code);
    }
    let cancelled = false;
    void fetch('/data/unclaimed-directory.json')
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('directory'))))
      .then((rows: { id?: string; n?: string; c?: string; a?: string; u?: string; s?: string }[]) => {
        if (cancelled) return;
        const match = rows.map(listingFromDirectoryRow).find((row) => row?.profilePath === profilePath) || null;
        setListing(match);
        setLookup(match ? 'ready' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setLookup('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [profilePath]);

  const useBar = Boolean(options?.barEmailMasked) && !otherEmail;

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    if (!listing) return;
    setBusy(true);
    setError('');
    const result = await requestClaimCode(listing, email, { useBarEmail: useBar, maskedBarEmail: options?.barEmailMasked, barTyped: listing.barNumber, attest });
    setBusy(false);
    if (!result.ok) {
      setStatus('');
      setError(result.message);
      setShownCode('');
      return;
    }
    setStatus(result.message);
    setShownCode(result.code || '');
    setCode('');
    setCodeStep(true);
    setResendAt(Date.now() + 30_000);
    setNow(Date.now());
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!listing) return;
    setBusy(true);
    setError('');
    const result = await confirmClaimCode(listing, code);
    setBusy(false);
    if (!result.ok) {
      setStatus('');
      setError(result.message);
      return;
    }
    setStatus('Confirmed. Opening your profile editor.');
    window.location.assign(`${editorHref(listing.profilePath)}&welcome=1`);
  }

  function changeEmail() {
    setCodeStep(false);
    setShownCode('');
    setCode('');
    setStatus('');
    setError('');
  }

  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro
        kicker="Attorneys"
        title={reportMode ? 'Report a wrong claim' : 'Make this profile yours.'}
        body={reportMode ? 'Tell us if this profile was claimed by the wrong person.' : 'Show small business owners what you do and how to contact you.'}
      />
      {!reportMode ? (
        <ol className="mt-4 flex flex-wrap gap-2 text-xs font-semibold" aria-label="Steps">
          <li className={`rounded-full px-3 py-1 ${codeStep ? 'bg-white text-ink' : 'bg-navy text-white'}`} aria-current={codeStep ? undefined : 'step'}>1. Get a code</li>
          <li className={`rounded-full px-3 py-1 ${codeStep ? 'bg-navy text-white' : 'bg-white text-ink'}`} aria-current={codeStep ? 'step' : undefined}>2. Enter the code</li>
          <li className="rounded-full bg-white px-3 py-1 text-ink">3. Edit your profile</li>
        </ol>
      ) : null}
      {lookup === 'loading' ? <p className="mt-6 text-sm">Loading this listing…</p> : null}
      {lookup === 'bad' ? <p role="alert" className="mt-6 text-sm text-pinkdark">That profile link is not valid.</p> : null}
      {lookup === 'missing' ? <p role="alert" className="mt-6 text-sm">That listing is not in the directory.</p> : null}
      {listing ? (
        <div data-testid="claim-listing" className="mt-6 rounded-3xl bg-white p-4 text-sm">
          <p className="font-display text-2xl font-extrabold text-navy">{listing.name}</p>
          <p data-testid="claim-place">{knownCity(listing.city, listing.stateCode) ? `${listing.city} · Licensed in ${stateName(listing.stateCode) || listing.stateCode}` : `Licensed in ${stateName(listing.stateCode) || listing.stateCode}`}</p>
          <p>Bar number {listing.barNumber}{listing.admitted ? ` · admitted ${listing.admitted}` : ''}</p>
          {reportMode ? null : <p data-testid="claim-free" className="mt-3 font-semibold text-navy">Your standard listing is free. Always. <a className="font-semibold text-purple underline" href={`/free-listing-promise/?profile=${encodeURIComponent(listing.profilePath)}`}>Our free listing promise</a></p>}
        </div>
      ) : null}
      {listing && reportMode && !reported ? (
        <form data-testid="report-form" className="mt-6 grid gap-3 rounded-3xl bg-white p-4" onSubmit={(event) => void sendReport(event)}>
          <p className="font-semibold">Report a wrong claim</p>
          <p className="text-sm">If someone else claimed this profile, tell us. We hide their edits while we check the official bar record.</p>
          <label className="text-sm font-medium">Your email (optional)
            <input data-testid="report-email" type="email" value={reportEmail} onChange={(event) => setReportEmail(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
          </label>
          <label className="text-sm font-medium">What is wrong
            <textarea data-testid="report-note" rows={3} value={reportNote} onChange={(event) => setReportNote(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
          </label>
          <button data-testid="report-submit" type="submit" disabled={busy} className="min-h-11 rounded-full bg-navy font-display font-semibold text-white disabled:opacity-50">Report this claim</button>
        </form>
      ) : null}
      {listing && !codeStep && (!reportMode || reported) ? (
        <form className="mt-6 grid gap-3" onSubmit={(event) => void sendCode(event)}>
          <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm">
            <input data-testid="claim-attest" type="checkbox" required checked={attest} onChange={(event) => setAttest(event.target.checked)} className="mt-1 h-5 w-5 flex-none" />
            <span>{attestationFor(listing.name)}</span>
          </label>
          <p data-testid="claim-identity" className="text-sm">{IDENTITY_NOTE} Misuse rules are in the <a className="font-semibold text-purple underline" href="/attorney-terms/">Attorney Terms</a>.</p>
          {useBar ? (
            <>
              <p data-testid="claim-bar-email" className="text-sm">We will send a confirmation code to the email address in your State Bar record: <b>{options?.barEmailMasked}</b>.</p>
              <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-pinkdark font-display font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Email my confirmation code'}</button>
              <button type="button" data-testid="claim-other-email" className="min-h-11 text-sm font-semibold text-purple" onClick={() => setOtherEmail(true)}>I no longer use that address</button>
            </>
          ) : (
            <>
              <label className="text-sm font-medium">Your email
                <input data-testid="claim-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
              </label>
              <p data-testid="claim-how" className="text-sm">We will email a confirmation code to this address.</p>
              {options?.firmDomain ? <p data-testid="claim-firm-hint" className="text-sm">A work email at <b>{options.firmDomain}</b> is matched to your official record without manual review.</p> : null}
              {options?.lawSchoolDomain ? <p data-testid="claim-school-hint" className="text-sm">New lawyer? A law school email at <b>{options.lawSchoolDomain}</b> is also matched without manual review.</p> : null}
              <p className="text-sm">If your email does not match the official bar record, your claim goes to manual review and your edits stay hidden from the public until we confirm it.</p>
              <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-pinkdark font-display font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Email my confirmation code'}</button>
            </>
          )}
        </form>
      ) : null}
      {shownCode ? <p data-testid="claim-code" className="mt-4 text-sm">Test code: {shownCode}</p> : null}
      {listing && codeStep ? (
        <form className="mt-6 grid gap-3" onSubmit={(event) => void verify(event)}>
          <label className="text-sm font-medium">Confirmation code
            <input data-testid="claim-code-input" autoFocus inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3 text-2xl tracking-[0.4em]" />
          </label>
          <button type="submit" disabled={busy || code.length !== 6} className="min-h-12 rounded-full bg-navy font-display font-semibold text-white disabled:opacity-50">Confirm and sign in</button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button type="button" data-testid="claim-resend" disabled={busy || wait > 0} onClick={() => void sendCode()} className="min-h-11 font-semibold text-purple disabled:text-ink">{wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}</button>
            <button type="button" data-testid="claim-change-email" onClick={changeEmail} className="min-h-11 font-semibold text-purple">Use a different email</button>
          </div>
        </form>
      ) : null}
      {error ? <p role="alert" data-testid="claim-error" className="mt-3 rounded-2xl bg-[#F8E8EE] px-3 py-2 text-sm font-medium text-[#6E123F]">{error}</p> : null}
      {status && !error ? <p role="status" data-testid="claim-status" className="mt-3 text-sm">{status}</p> : null}
    </div>
  );
}

export function ProfileEditorGate() {
  const params = useSearchParams();
  if (params.get('profile')) return <OwnerEditorView />;
  return <ProfileEditorView />;
}

