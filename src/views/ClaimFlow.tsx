'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  type DirectoryListing,
  type ClaimOptions,
  IDENTITY_NOTE,
  attestationFor,
  claimHref,
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
import { US_STATES, stateName } from '@/lib/states';
import { lookupRoster } from '@/lib/rosterLookup';
import { knownCity } from '@/lib/places';

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
      setLookup(params.get('profile') ? 'bad' : 'ready');
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
  const stateLabel = listing ? stateName(listing.stateCode) || listing.stateCode : '';
  const initials = listing ? listing.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '';
  const lookupMode = !profilePath && !reportMode;

  return (
    <div className="lg-claim">
      <section className="lg-band">
        <div className="lg-container lg-claim__band">
          <h1>{reportMode ? 'Report a wrong claim' : lookupMode ? 'Find your profile to claim it.' : 'Make this profile yours.'}</h1>
          <p className="lg-sub">{reportMode ? 'Tell us if this profile was claimed by the wrong person.' : lookupMode ? 'Your standard listing is free. Always.' : 'Show business owners what you offer and how to contact you.'}</p>
          <span className="lg-accent" aria-hidden="true" />
        </div>
      </section>
      <div className="lg-claim__body">
        {lookupMode ? <ClaimLookup /> : null}
        {!lookupMode && !reportMode ? (
          <ol className="lg-claim__steps" aria-label="Steps">
            <li aria-current={codeStep ? undefined : 'step'} className={codeStep ? '' : 'is-current'}>1. Get a code</li>
            <li aria-current={codeStep ? 'step' : undefined} className={codeStep ? 'is-current' : ''}>2. Enter the code</li>
            <li>3. Edit your profile</li>
          </ol>
        ) : null}
        {profilePath && lookup === 'loading' ? <p role="status" className="lg-claim__card">Loading this listing…</p> : null}
        {lookup === 'bad' && profilePath ? <p role="alert" className="lg-notice lg-notice--error">That profile link is not valid. Look up your profile below.</p> : null}
        {lookup === 'missing' ? <p role="alert" className="lg-notice lg-notice--error">That listing is not in the directory. Look up your profile below, or apply for a new listing.</p> : null}
        {profilePath && (lookup === 'bad' || lookup === 'missing') ? <ClaimLookup /> : null}
        {listing ? (
          <div data-testid="claim-listing" className="lg-claim__card lg-claim__who">
            <div className="lg-claim__id">
              <span className="lg-avatar" aria-hidden="true">{initials}</span>
              <div>
                <p className="lg-claim__name">{listing.name}</p>
                <p data-testid="claim-place">{knownCity(listing.city, listing.stateCode) ? `${listing.city} · Licensed in ${stateLabel}` : `Licensed in ${stateLabel}`}</p>
                <p>Bar number {listing.barNumber}{listing.admitted ? ` · admitted ${listing.admitted}` : ''}</p>
              </div>
            </div>
            {reportMode ? null : <p data-testid="claim-free" className="lg-notice"><span>Your standard listing is free. Always. <a href={`/free-listing-promise/?profile=${encodeURIComponent(listing.profilePath)}`}>Our free listing promise</a></span></p>}
          </div>
        ) : null}
        {listing && reportMode && !reported ? (
          <form data-testid="report-form" className="lg-claim__card lg-claim__form" onSubmit={(event) => void sendReport(event)}>
            <h2>Report a wrong claim</h2>
            <p>If someone else claimed this profile, tell us. We hide their edits while we check the official bar record.</p>
            <label className="lg-field"><span>Your email (optional)</span>
              <input data-testid="report-email" type="email" value={reportEmail} onChange={(event) => setReportEmail(event.target.value)} className="lg-input" />
            </label>
            <label className="lg-field"><span>What is wrong</span>
              <textarea data-testid="report-note" rows={3} value={reportNote} onChange={(event) => setReportNote(event.target.value)} className="lg-input" />
            </label>
            <button data-testid="report-submit" type="submit" disabled={busy} className="lg-btn lg-btn--primary lg-btn--full">Report this claim</button>
          </form>
        ) : null}
        {listing && !codeStep && (!reportMode || reported) ? (
          <form className="lg-claim__card lg-claim__form" onSubmit={(event) => void sendCode(event)}>
            <h2>Confirm this is your profile</h2>
            <label className="lg-check">
              <input data-testid="claim-attest" type="checkbox" required checked={attest} onChange={(event) => setAttest(event.target.checked)} />
              <span>{attestationFor(listing.name)}</span>
            </label>
            {useBar ? (
              <>
                <p data-testid="claim-bar-email">We will send a confirmation code to the email address in your official licensing record: <b>{options?.barEmailMasked}</b>.</p>
                <button type="submit" disabled={busy} className="lg-btn lg-btn--primary lg-btn--full">{busy ? 'Sending…' : 'Email my confirmation code'}</button>
                <button type="button" data-testid="claim-other-email" className="lg-claim__link" onClick={() => setOtherEmail(true)}>I no longer use that address</button>
              </>
            ) : (
              <>
                <label className="lg-field"><span>Your email</span>
                  <input data-testid="claim-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="lg-input" />
                </label>
                <p data-testid="claim-how">We will email a confirmation code to this address.</p>
                {options?.firmDomain ? <p data-testid="claim-firm-hint">A work email at <b>{options.firmDomain}</b> is matched to your official record without manual review.</p> : null}
                {options?.lawSchoolDomain ? <p data-testid="claim-school-hint">New lawyer? A law school email at <b>{options.lawSchoolDomain}</b> is also matched without manual review.</p> : null}
                <p>If your email does not match the official bar record, your claim goes to manual review and your edits stay hidden from the public until we confirm it.</p>
                <button type="submit" disabled={busy} className="lg-btn lg-btn--primary lg-btn--full">{busy ? 'Sending…' : 'Email my confirmation code'}</button>
              </>
            )}
            <p data-testid="claim-identity" className="lg-claim__fine">{IDENTITY_NOTE} Misuse rules are in the <a href="/attorney-terms/">Attorney Terms</a>.</p>
          </form>
        ) : null}
        {shownCode ? <p data-testid="claim-code" className="lg-notice">Test code: {shownCode}</p> : null}
        {listing && codeStep ? (
          <form className="lg-claim__card lg-claim__form" onSubmit={(event) => void verify(event)}>
            <h2>Enter your code</h2>
            <label className="lg-field"><span>Confirmation code</span>
              <input data-testid="claim-code-input" autoFocus inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="lg-input lg-claim__code" />
            </label>
            <button type="submit" disabled={busy || code.length !== 6} className="lg-btn lg-btn--primary lg-btn--full">Confirm and sign in</button>
            <div className="lg-claim__row">
              <button type="button" data-testid="claim-resend" disabled={busy || wait > 0} onClick={() => void sendCode()} className="lg-claim__link">{wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}</button>
              <button type="button" data-testid="claim-change-email" onClick={changeEmail} className="lg-claim__link">Use a different email</button>
            </div>
          </form>
        ) : null}
        {error ? <p role="alert" data-testid="claim-error" className="lg-notice lg-notice--error">{error}</p> : null}
        {status && !error ? <p role="status" data-testid="claim-status" className="lg-notice">{status}</p> : null}
        {listing && !reportMode ? <p className="lg-claim__next">Next: add your details and review your profile.</p> : null}
      </div>
    </div>
  );
}

/** Generic /claim/ entry: find the existing record by state and license number (same lookup /join/ uses). */
function ClaimLookup() {
  const [state, setState] = useState('CA');
  const [bar, setBar] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<'' | 'none' | 'error'>('');
  async function find(event: FormEvent) {
    event.preventDefault();
    if (!bar.trim()) return;
    setBusy(true);
    setResult('');
    try {
      const hit = await lookupRoster(state, bar);
      if (hit?.path) {
        window.location.assign(claimHref(hit.path));
        return;
      }
      setResult('none');
    } catch {
      setResult('error');
    }
    setBusy(false);
  }
  return (
    <form data-testid="claim-lookup" className="lg-claim__card lg-claim__form" onSubmit={(event) => void find(event)}>
      <h2>Find your profile</h2>
      <p>Choose the state that licensed you and enter your license or bar number. We open the claim for that exact profile.</p>
      <label className="lg-field"><span>Licensing state</span>
        <select data-testid="claim-lookup-state" className="lg-input" value={state} onChange={(event) => setState(event.target.value)}>
          {US_STATES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </label>
      <label className="lg-field"><span>License or bar number</span>
        <input data-testid="claim-lookup-bar" className="lg-input" inputMode="text" autoComplete="off" required value={bar} onChange={(event) => setBar(event.target.value)} />
      </label>
      <button type="submit" disabled={busy} className="lg-btn lg-btn--primary lg-btn--full">{busy ? 'Looking up…' : 'Find my profile'}</button>
      {result === 'none' ? <p role="alert" data-testid="claim-lookup-none" className="lg-notice">We could not find a public profile with that number in {stateName(state) || state}. Check the number, <a href="/find-lawyer/">search the directory by name</a>, or <a href="/join/">apply for a new listing</a>.</p> : null}
      {result === 'error' ? <p role="alert" className="lg-notice lg-notice--error">The lookup did not load. Check your connection and try again.</p> : null}
      <p className="lg-claim__fine">Not listed yet? <a href="/join/">Apply for a free listing</a>.</p>
    </form>
  );
}

export function ProfileEditorGate() {
  const params = useSearchParams();
  if (params.get('profile')) return <OwnerEditorView />;
  return <ProfileEditorView />;
}

