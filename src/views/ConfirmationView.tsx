'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SubmitResult } from '@/lib/applications';
import { joinedLabel } from '@/lib/joined';
import { CONTACT_EMAIL } from '@/lib/site';

export function ConfirmationView() {
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem('legalgrads-application-result');
    if (!raw) return;
    try {
      setResult(JSON.parse(raw) as SubmitResult);
    } catch {
      setResult(null);
    }
  }, []);

  const joined = joinedLabel(result?.joinedYear);
  const extraStatus = result?.message && !/within 2 business days/i.test(result.message) ? result.message : '';

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <header>
        <p className="font-display text-sm font-bold text-purple">Application received</p>
        <h1 className="mt-2 max-w-lg font-display text-2xl font-extrabold leading-snug tracking-tight text-navy sm:text-3xl">
          We&apos;ll verify your state bar record within 2 business days and email you.
        </h1>
      </header>
      <div data-testid="verification-explainer" className="mt-6 space-y-3 rounded-3xl bg-white p-5 text-sm leading-7 text-ink">
        <p>Your listing is not live yet. A person checks your record with your state bar, then we email the address you entered. This page cannot send that email by itself.</p>
        {result?.reference ? <p>Reference <span data-testid="application-reference" className="font-semibold text-navy">{result.reference}</span></p> : null}
        {extraStatus ? <p role="status">{extraStatus}</p> : null}
        {result?.channel === 'mailto' && result.mailto ? (
          <p><a data-testid="application-mailto" className="inline-flex min-h-11 items-center rounded-full bg-pink px-4 font-display font-semibold text-white" href={result.mailto}>Email us your application</a></p>
        ) : null}
        {result?.channel === 'mailto' ? <p>The email already contains every field you entered. If you added a photo, attach that file before you send. Sending the email is how we receive the application.</p> : null}
        {result?.channel === 'supabase' ? <p>We have the application. You do not need to send a second copy unless we ask.</p> : null}
        <p>To change details or remove your listing, email <a className="font-semibold text-purple" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> until attorney login is available.</p>
        <p><span className="font-semibold text-purple">{joined}</span> is only the year you joined Legalgrads. It is not a rating and not a benefit to clients.</p>
        <p>Your share card, and a badge if you carry professional liability insurance, will be available after approval.</p>
      </div>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-display font-semibold text-purple">Back to the homepage</Link>
    </div>
  );
}
