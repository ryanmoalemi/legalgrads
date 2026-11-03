'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SPECIALTIES, specialtyName } from '@/lib/catalog';
import {
  type DirectoryListing,
  type MailCopy,
  type OwnerClaim,
  type ClaimOptions,
  ATTESTATION,
  loadClaim as loadOwnerClaim,
  readProofFile,
  uploadClaimProof,
  confirmClaimCode,
  claimHref,
  fetchClaimOptions,
  reportWrongClaim,
  editorHref,
  listingFromDirectoryRow,
  loadClaim,
  normalizeProfilePath,
  pendingFor,
  readPhotoFile,
  requestClaimCode,
  saveOwnerEdit,
} from '@/lib/claim';
import { contactProblem, phoneProblem } from '@/lib/applications';
import { ProfileEditorView } from '@/views/Phase2';
import { stateName } from '@/lib/states';
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
  const [welcome, setWelcome] = useState<MailCopy | null>(null);
  const [editHref, setEditHref] = useState('');
  const [codeStep, setCodeStep] = useState(false);
  const [options, setOptions] = useState<ClaimOptions | null>(null);
  const [otherEmail, setOtherEmail] = useState(false);
  const reportMode = params.get('report') === '1';
  const [reportEmail, setReportEmail] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reported, setReported] = useState(false);
  const [barTyped, setBarTyped] = useState('');
  const [attest, setAttest] = useState(false);
  const [needsProof, setNeedsProof] = useState(false);

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

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    if (!listing) return;
    setBusy(true);
    setError('');
    setWelcome(null);
    const useBar = Boolean(options?.barEmailMasked) && !otherEmail;
    const result = await requestClaimCode(listing, email, { useBarEmail: useBar, maskedBarEmail: options?.barEmailMasked, barTyped, attest });
    setBusy(false);
    setStatus(result.message);
    if (!result.ok) {
      setError(result.message);
      setShownCode('');
      return;
    }
    setShownCode(result.code || '');
    setCodeStep(true);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!listing) return;
    setBusy(true);
    setError('');
    const result = await confirmClaimCode(listing, code);
    setBusy(false);
    setStatus(result.message);
    if (!result.ok || !result.editUrl || !result.welcome) {
      setError(result.message);
      return;
    }
    setWelcome(result.welcome);
    setNeedsProof(result.approved === false);
    setEditHref(editorHref(listing.profilePath));
    setShownCode('');
    setCodeStep(false);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro
        kicker="Attorneys"
        title="Claim this profile"
        body={reportMode ? 'Tell us if this profile was claimed by the wrong person.' : 'We email a confirmation code to confirm you are this attorney.'}
      />
      {lookup === 'loading' ? <p className="mt-6 text-sm">Loading this listing…</p> : null}
      {lookup === 'bad' ? <p role="alert" className="mt-6 text-sm text-pink">That profile link is not valid.</p> : null}
      {lookup === 'missing' ? <p role="alert" className="mt-6 text-sm">That listing is not in the directory.</p> : null}
      {listing ? (
        <div data-testid="claim-listing" className="mt-6 rounded-3xl bg-white p-4 text-sm">
          <p className="font-display text-2xl font-extrabold text-navy">{listing.name}</p>
          <p>{listing.city} · {stateName(listing.stateCode) || listing.stateCode}</p>
          <p>Bar {listing.barNumber}{listing.admitted ? ` · admitted ${listing.admitted}` : ''}</p>
          <p className="break-all">{listing.profilePath}</p>
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
      {listing && !welcome && (!reportMode || reported) ? (
        <form className="mt-6 grid gap-3" onSubmit={(event) => void sendCode(event)}>
          <label className="text-sm font-medium">Your bar number
            <input data-testid="claim-bar-number" required autoComplete="off" value={barTyped} onChange={(event) => setBarTyped(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input data-testid="claim-attest" type="checkbox" required checked={attest} onChange={(event) => setAttest(event.target.checked)} className="mt-1" />
            <span>{ATTESTATION}</span>
          </label>
          {options?.barEmailMasked && !otherEmail ? (
            <>
              <p data-testid="claim-bar-email" className="text-sm">The State Bar lists an email for this attorney: <b>{options.barEmailMasked}</b>. We send the code only to that address, which verifies you right away.</p>
              <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-pink font-display font-semibold text-white disabled:opacity-50">Email a code to {options.barEmailMasked}</button>
              <button type="button" data-testid="claim-other-email" className="text-sm font-semibold text-purple" onClick={() => setOtherEmail(true)}>I no longer use that address</button>
            </>
          ) : (
            <>
              {options?.firmDomain ? <p data-testid="claim-firm-hint" className="text-sm">Use your work email at <b>{options.firmDomain}</b> to be verified right away.</p> : null}
              {options?.lawSchoolDomain ? <p data-testid="claim-school-hint" className="text-sm">New lawyer? Your law school email at <b>{options.lawSchoolDomain}</b> also verifies you right away.</p> : null}
              <p className="text-sm">If your email does not match the official bar record, your claim goes to manual review and your edits stay hidden from the public until we confirm it.</p>
              <label className="text-sm font-medium">Email
                <input data-testid="claim-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
              </label>
              <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-pink font-display font-semibold text-white disabled:opacity-50">Email me a code</button>
            </>
          )}
        </form>
      ) : null}
      {shownCode ? <p data-testid="claim-code" className="mt-4 text-sm">Test code: {shownCode}</p> : null}
      {listing && codeStep && !welcome ? (
        <form className="mt-4 grid gap-3" onSubmit={(event) => void verify(event)}>
          <label className="text-sm font-medium">Confirmation code
            <input data-testid="claim-code-input" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" />
          </label>
          <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-navy font-display font-semibold text-white disabled:opacity-50">Confirm and sign in</button>
        </form>
      ) : null}
      {error ? <p role="alert" data-testid="claim-error" className="mt-3 text-sm text-pink">{error}</p> : null}
      {status && !error ? <p role="status" data-testid="claim-status" className="mt-3 text-sm">{status}</p> : null}
      {welcome && editHref ? (
        <div className="mt-6 rounded-3xl bg-white p-4 text-sm" data-testid="welcome-email">
          <p>From: {welcome.from}</p>
          <p className="mt-2 font-semibold">{welcome.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans">{welcome.text}</pre>
          <a data-testid="claim-edit-link" className="mt-4 inline-flex min-h-11 items-center font-semibold text-purple" href={editHref}>Edit your profile</a>
          <p className="mt-3" role="status">{status}</p>
        </div>
      ) : null}
      {welcome && needsProof && listing ? <ProofUpload profilePath={listing.profilePath} /> : null}
    </div>
  );
}

function ProofUpload({ profilePath }: { profilePath: string }) {
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
    const claim = loadOwnerClaim(profilePath);
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
    <form data-testid="proof-form" className="mt-6 grid gap-3 rounded-3xl bg-white p-4 text-sm" onSubmit={(event) => void submit(event)}>
      <p className="font-semibold">Speed up your review</p>
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

export function ProfileEditorGate() {
  const params = useSearchParams();
  if (params.get('profile')) return <OwnerEditorView />;
  return <ProfileEditorView />;
}

export function OwnerEditorView() {
  const params = useSearchParams();
  const profilePath = normalizeProfilePath(params.get('profile'));
  const [claim, setClaim] = useState<OwnerClaim | null>(null);
  const [ready, setReady] = useState(false);
  const [bio, setBio] = useState('');
  const [services, setServices] = useState('');
  const [phone, setPhone] = useState('');
  const [contactLink, setContactLink] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [photo, setPhoto] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profilePath) {
      setReady(true);
      return;
    }
    const saved = loadClaim(profilePath);
    setClaim(saved);
    if (saved) {
      setBio(saved.bio);
      setServices(saved.services);
      setPhone(saved.phone);
      setContactLink(saved.contactLink);
      setAreas(saved.practiceAreas);
      setPhoto(saved.photoDataUrl);
    }
    setReady(true);
  }, [profilePath]);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      setPhoto(await readPhotoFile(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not read that image.');
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!claim) return;
    if (bio.length > 600) {
      setError('Keep the bio to 600 characters.');
      return;
    }
    if (services.length > 600) {
      setError('Keep services to 600 characters.');
      return;
    }
    const phoneError = phone.trim() ? phoneProblem(phone) : null;
    if (phoneError) {
      setError(phoneError);
      return;
    }
    const linkError = contactProblem(contactLink);
    if (linkError) {
      setError(linkError);
      return;
    }
    const next: OwnerClaim = { ...claim, bio: bio.trim(), services: services.trim(), phone: phone.trim(), contactLink: contactLink.trim(), practiceAreas: areas, photoDataUrl: photo };
    setError('');
    const result = await saveOwnerEdit(next);
    setClaim(next);
    setStatus(result.message);
  }

  if (!ready) return <p className="px-4 py-10">Loading editor…</p>;
  if (!profilePath) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageIntro title="Profile link is not valid" body="Open the claim page from the attorney listing, then confirm the code." />
      </div>
    );
  }
  if (!claim) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageIntro title="Verify this profile first" body="The confirmation code signs you in on this device. Enter it on the claim page, then come back here to edit." />
        <p className="mt-4"><a className="font-semibold text-purple" href={claimHref(profilePath)}>Go to the claim page</a></p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageIntro title="Edit your profile" body={`Signed in on this device as ${claim.email} for ${claim.name}. ${claim.approved === false ? 'Your claim is pending review, so your edits stay hidden from the public until we confirm it against the official bar record.' : 'Your edits show on your public profile.'}`} />
      <form className="mt-6 grid gap-3" onSubmit={(event) => void save(event)}>
        <label className="text-sm font-medium">Photo
          <input data-testid="owner-photo" type="file" accept="image/*" className="mt-1 block w-full text-sm" onChange={(event) => void onPhoto(event.target.files?.[0])} />
        </label>
        {photo ? <img src={photo} alt="" className="h-24 w-24 rounded-full object-cover" /> : null}
        <label className="text-sm font-medium">Bio
          <textarea data-testid="owner-bio" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" rows={5} value={bio} onChange={(event) => setBio(event.target.value)} />
        </label>
        <label className="text-sm font-medium">Services
          <textarea data-testid="owner-services" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" rows={3} value={services} onChange={(event) => setServices(event.target.value)} />
        </label>
        <label className="text-sm font-medium">Phone
          <input data-testid="owner-phone" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="text-sm font-medium">Contact link
          <input data-testid="owner-link" className="mt-1 w-full rounded-2xl border border-navy/10 px-3 py-3" value={contactLink} onChange={(event) => setContactLink(event.target.value)} placeholder="https://" />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Practice areas</legend>
          {SPECIALTIES.map((item) => (
            <label key={item.slug} className="flex items-center gap-2 text-sm">
              <input
                data-testid={`owner-area-${item.slug}`}
                type="checkbox"
                checked={areas.includes(item.slug)}
                onChange={(event) => setAreas((current) => event.target.checked ? [...current, item.slug] : current.filter((slug) => slug !== item.slug))}
              />
              {specialtyName(item.slug)}
            </label>
          ))}
        </fieldset>
        <button data-testid="owner-save" type="submit" className="min-h-11 rounded-full bg-pink font-display font-semibold text-white">Save</button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-pink">{error}</p> : null}
      {status ? <p role="status" data-testid="owner-status" className="mt-3 text-sm">{status}</p> : null}
    </div>
  );
}
