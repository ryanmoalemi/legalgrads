'use client';
import { useMemo, useState } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const usd = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US')}`);

export function calc(input: string) {
  const [y, m, day] = input.split('-').map(Number);
  if (!y || !m || !day) return null;
  const oath = new Date(y, m - 1, day);
  const mo = oath.getMonth();
  const fee = mo === 11 ? 0 : mo >= 5 ? 299 : 598;
  const band = mo === 11 ? 'dec' : mo >= 5 ? 'half' : 'full';
  const invoiceEst = addDays(oath, 45);
  const annual = new Date(oath.getFullYear() + 1, 2, 30);
  const natp = new Date(oath.getFullYear() + 1, oath.getMonth() + 1, 0);
  const dec1 = new Date(oath.getFullYear(), 11, 1);
  const waitDays = band === 'half' ? Math.round((dec1.getTime() - oath.getTime()) / 86400000) : 0;
  return { oath, fee, band, invoiceEst, annual, natp, waitDays, total: fee + 598 };
}

function ics(r: NonNullable<ReturnType<typeof calc>>) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ev = (d: Date, title: string, desc: string, id: string) => [
    'BEGIN:VEVENT', `UID:${id}-${ymd(d)}@legalgrads.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(d)}`, `DTEND;VALUE=DATE:${ymd(addDays(d, 1))}`,
    `SUMMARY:${title}`, `DESCRIPTION:${desc}`, 'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'END:VALARM', 'END:VEVENT',
  ];
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Legalgrads//Post-Bar Tracker//EN', 'CALSCALE:GREGORIAN',
    ...ev(addDays(r.oath, 30), `Pay CA State Bar initial license fee (${usd(r.fee)})`, 'Rule 2.12: due 45 days from your invoice date. Check your invoice for the exact date. legalgrads.com/resources/post-bar-licensing-tracker/california/', 'calbar-fee'),
    ...ev(new Date(r.oath.getFullYear(), r.oath.getMonth() + 11, r.oath.getDate()), 'Finish 10-hour CalBar New Attorney Training', `Deadline: ${fmt(r.natp)} (last day of the month of your 1-year anniversary).`, 'calbar-natp-reminder'),
    ...ev(r.natp, 'DEADLINE: CalBar New Attorney Training (10 hrs)', 'Miss it and you can be enrolled inactive.', 'calbar-natp'),
    ...ev(r.annual, 'CA State Bar annual license fee due', 'Annual fees are due March 30. 2026 active rate: $598.', 'calbar-annual'),
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'california-bar-deadlines.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function SwearingInCalculator() {
  const [date, setDate] = useState('2026-11-15');
  const r = useMemo(() => calc(date), [date]);
  const tone = !r ? '' : r.band === 'dec' ? 'bg-mint/15 text-[#00735E] ring-mint/40' : r.band === 'half' ? (r.oath.getMonth() === 10 ? 'bg-pink/10 text-[#B0124F] ring-pink/40' : 'bg-amber-100 text-amber-900 ring-amber-300') : 'bg-navy/5 text-navy ring-navy/10';
  return (
    <section id="swearing-in-calculator" className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="swearing-in-calculator">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">December swearing-in fee optimizer</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">When should you take the oath?</h2>
      <p className="mt-2 text-ink">Pick your planned swearing-in date. We apply Rule 2.12 and show every deadline that follows.</p>
      <label className="mt-5 block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/70">Planned swearing-in date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 block min-h-12 w-full max-w-xs rounded-2xl border border-navy/15 bg-cream px-4 font-display text-lg font-bold text-navy" data-testid="oath-date" />
      </label>
      {r && (
        <>
          <div className={`mt-6 rounded-3xl p-5 ring-1 sm:p-6 ${tone}`} data-testid="calc-result">
            {r.band === 'dec' && (<><p className="font-display text-3xl font-extrabold">$0 first license fee</p><p className="mt-1 font-semibold">December admission. Rule 2.12(C) and the fee schedule list no first-year license fee. Your first bill is the $598 annual fee on {fmt(r.annual)}.</p></>)}
            {r.band === 'half' && (<><p className="font-display text-3xl font-extrabold">{r.waitDays <= 31 ? `Wait ${r.waitDays} days, save $299` : '$299 half-year fee'}</p><p className="mt-1 font-semibold">Admitted June 1 to November 30 means a $299 half-year fee, due 45 days from your invoice, then $598 more on {fmt(r.annual)} ({usd(r.total)} total). Take the oath on December 1 or later and the first-year fee is $0.</p></>)}
            {r.band === 'full' && (<><p className="font-display text-3xl font-extrabold">$598 full-year fee</p><p className="mt-1 font-semibold">Admitted January 1 to May 31 means the full annual fee, due 45 days from your invoice. Then $598 again on {fmt(r.annual)}.</p></>)}
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">First license fee</dt><dd className="mt-1 font-display text-3xl font-extrabold text-navy">{usd(r.fee)}</dd><dd className="text-sm text-ink">Due 45 days from invoice. If invoiced on oath day: {fmt(r.invoiceEst)}</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">New Attorney Training</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy" data-testid="natp-deadline">{fmt(r.natp)}</dd><dd className="text-sm text-ink">10 hours. Last day of the month of your 1-year anniversary.</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">Next annual fee</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy">{fmt(r.annual)}</dd><dd className="text-sm text-ink">$598 at the 2026 active rate.</dd></div>
          </dl>
          <button type="button" onClick={() => ics(r)} className="mt-5 inline-flex min-h-12 items-center rounded-full bg-pink px-6 font-display font-bold text-white shadow-pill hover:opacity-90" data-testid="ics-download">+ Add deadlines to Google / Apple Calendar (.ics)</button>
          <p className="mt-3 text-xs text-ink/70">No email needed. The file is built in your browser. Your MCLE compliance group depends on your last name; check your CalBar profile after admission.</p>
        </>
      )}
    </section>
  );
}
