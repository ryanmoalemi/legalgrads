'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SubmitResult } from '@/lib/applications';
import { PageIntro } from '@/components/ui';

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
        title="We still have to check the State Bar"
        body="Your listing is not live. A person at Legalgrads will manually verify your California State Bar record. We email you after that review. A profile is published only if the check succeeds."
      />
      <div data-testid="verification-explainer" className="mt-6 rounded-3xl bg-white p-5 text-sm leading-7 text-ink">
        <p>Verification is a manual California State Bar review. It is not automatic, and submitting this form does not publish your name.</p>
        {result?.id ? <p className="mt-3">Saved application reference: <span data-testid="application-id">{result.id}</span></p> : null}
        {result?.error ? <p className="mt-3" role="status">{result.error}</p> : null}
        {result?.channel === 'mailto' && result.mailto ? (
          <p className="mt-3">
            <a data-testid="application-mailto" className="font-semibold text-purple" href={result.mailto}>Email this application to ryan@legalgrads.com</a>
          </p>
        ) : null}
        {result?.channel === 'mailto' ? <p className="mt-3">The link already contains every field you entered. If you chose a photo, attach that file in your email app. The photo itself cannot travel inside the link.</p> : null}
        {result?.channel === 'supabase' ? <p className="mt-3">The application is stored for review. You do not need to send a second copy unless we ask.</p> : null}
      </div>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center font-display font-semibold text-purple">Back to the homepage</Link>
    </div>
  );
}
