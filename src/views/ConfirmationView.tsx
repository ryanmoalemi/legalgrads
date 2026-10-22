'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SubmitResult } from '@/lib/applications';
import { SharePanel } from '@/components/SharePanel';
import { PageIntro } from '@/components/ui';
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageIntro
        kicker="Application received"
        title="We'll verify your State Bar record within 2 business days and email you"
        body="Your listing is not live yet. A person checks the California State Bar record. We email the address you entered after that review. This page cannot send that email by itself."
      />
      <div data-testid="verification-explainer" className="mt-6 space-y-3 rounded-3xl bg-white p-5 text-sm leading-7 text-ink">
        <p>Verification is a manual California State Bar review. Submitting this form does not publish your name.</p>
        {result?.reference ? <p>Reference <span data-testid="application-reference" className="font-semibold text-navy">{result.reference}</span></p> : null}
        {result?.message ? <p role="status">{result.message}</p> : null}
        {result?.channel === 'mailto' && result.mailto ? (
          <p><a data-testid="application-mailto" className="inline-flex min-h-11 items-center rounded-full bg-pink px-4 font-display font-semibold text-white" href={result.mailto}>Email us your application</a></p>
        ) : null}
        {result?.channel === 'mailto' ? <p>The email already contains every field you entered. If you added a photo, attach that file before you send. Sending the email is how we receive the application.</p> : null}
        {result?.channel === 'supabase' ? <p>We have the application. You do not need to send a second copy unless we ask.</p> : null}
        <p>To change details or remove your listing, email <a className="font-semibold text-purple" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> until attorney login is available.</p>
        {result?.insured ? <p className="inline-flex rounded-full bg-mint/20 px-3 py-1 text-xs font-bold text-navy">Insured</p> : null}
        <p className="inline-flex rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">{joinedLabel(result?.joinedYear)}</p>
        <p>{joinedLabel(result?.joinedYear)} is only the year you joined Legalgrads. It is not a rating and not a benefit to clients.</p>
      </div>
      <div className="mt-6">
        <SharePanel name={result?.name || 'Your name'} joined={result?.joinedYear} />
      </div>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-display font-semibold text-purple">Back to the homepage</Link>
    </div>
  );
}
