'use client';
import { useState } from 'react';
import Link from 'next/link';

const OPTIONS = [
  { id: 'clearance', label: 'Passed, waiting on clearance' },
  { id: 'oath', label: 'Cleared for the oath' },
  { id: 'sworn', label: 'Already sworn in' },
  { id: 'retake', label: 'Planning a retake' },
] as const;

type Status = (typeof OPTIONS)[number]['id'];

export function CaStatus() {
  const [status, setStatus] = useState<Status>('clearance');
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="ca-status">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Next step</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Where are you right now?</h2>
      <p className="mt-2 text-ink">The oath-date calculator is a planning tool. Use it after you are allowed to be sworn in. It does not clear moral character or move the Supreme Court order.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Where you are">
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" aria-pressed={status === o.id} onClick={() => setStatus(o.id)} className={`min-h-11 rounded-full px-4 font-display text-sm font-bold ring-1 ${status === o.id ? 'bg-navy text-white ring-navy' : 'bg-cream text-navy ring-navy/15'}`}>{o.label}</button>
        ))}
      </div>
      {status === 'clearance' && (
        <ul className="mt-4 space-y-2 text-ink" data-testid="status-clearance">
          <li>Check the Applicant Portal for anything still open, including moral character.</li>
          <li>You cannot be sworn in until your name is on the Supreme Court order and the DocuSign oath form arrives.</li>
          <li>Do not book a ceremony date from the calculator until that form is in your inbox.</li>
        </ul>
      )}
      {status === 'oath' && (
        <ul className="mt-4 space-y-2 text-ink" data-testid="status-oath">
          <li>Pick who swears you in. A notary must do it in person, on paper, with an ink seal.</li>
          <li>Your signature date and the officer&apos;s jurat date must be the same day.</li>
          <li>Then use the calculator to compare that date with December 1. The fee is due 45 days from the invoice, not from a date we guess.</li>
        </ul>
      )}
      {status === 'sworn' && (
        <ul className="mt-4 space-y-2 text-ink" data-testid="status-sworn">
          <li>Watch for the license-fee invoice. Pay within 45 days of that invoice date.</li>
          <li>Buy the $55 New Attorney Training bundle and finish it by the last day of your anniversary month. That is not your MCLE report.</li>
          <li>The March 30 annual fee below is estimated using 2026 fees.</li>
        </ul>
      )}
      {status === 'retake' && (
        <div className="mt-4 text-ink" data-testid="status-retake">
          <p>If you scored under 1390, the oath calculator is not your next form. Immediate repeaters who sat every July 2026 session have a November 13, 2026 timely filing deadline for February 23 to 24, 2027.</p>
          <p className="mt-3"><Link className="font-semibold text-purple underline" href="/resources/post-bar-licensing-tracker/california/retake/">February 2027 retake costs, deadlines, and MBE transfers</Link></p>
        </div>
      )}
    </section>
  );
}
