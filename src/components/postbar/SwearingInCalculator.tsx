'use client';
import { useMemo, useState } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const usd = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`);

// CA fee relief, from src/data/post-bar-licensing.json (Rules 2.15(B), 2.16(C)).
export const ANNUAL = 598;
export const SCALED_ANNUAL = 460.25; // Rule 2.15(B), 25% fee scaling, individual income under $60,478.35
export const WAIVED_ANNUAL = 323; // Rule 2.16(C), 50% waiver, household income $20,000 or less
export type Relief = 'none' | 'scaling' | 'waiver';
export const annualFor = (relief: Relief) => (relief === 'waiver' ? WAIVED_ANNUAL : relief === 'scaling' ? SCALED_ANNUAL : ANNUAL);

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

const PRESETS = [
  { label: 'Nov 20, 2026', value: '2026-11-20' },
  { label: 'Dec 1, 2026', value: '2026-12-01' },
  { label: 'Jan 5, 2027', value: '2027-01-05' },
];

function Bar({ label, sub, first, annual, max, accent, testid }: { label: string; sub: string; first: number; annual: number; max: number; accent: string; testid: string }) {
  const total = first + annual;
  return (
    <div className="rounded-2xl bg-cream p-4" data-testid={testid}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display font-bold text-navy">{label}</p>
        <p className="font-display text-2xl font-extrabold text-navy">{usd(total)}</p>
      </div>
      <p className="text-sm text-ink">{sub}</p>
      <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-navy/5" aria-hidden>
        {first > 0 && <div className={accent} style={{ width: `${(first / max) * 100}%` }} />}
        <div className="bg-navy" style={{ width: `${(annual / max) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs text-ink/70">First license fee {usd(first)} + March 30 annual fee {usd(annual)}</p>
    </div>
  );
}

export function SwearingInCalculator() {
  const [date, setDate] = useState('2026-11-20');
  const [scaling, setScaling] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const r = useMemo(() => calc(date), [date]);
  const relief: Relief = waiver ? 'waiver' : scaling ? 'scaling' : 'none';
  const annual = annualFor(relief);
  const tone = !r ? '' : r.band === 'dec' ? 'bg-mint/15 text-[#00735E] ring-mint/40' : r.band === 'half' ? (r.oath.getMonth() === 10 ? 'bg-pink/10 text-[#B0124F] ring-pink/40' : 'bg-amber-100 text-amber-900 ring-amber-300') : 'bg-navy/5 text-navy ring-navy/10';
  const dec1 = r ? new Date(r.oath.getFullYear(), 11, 1) : null;
  const showCompare = !!r && r.band !== 'dec';
  const decAnnual = dec1 ? new Date(dec1.getFullYear() + 1, 2, 30) : null;
  const daysToDec = r && dec1 ? Math.round((dec1.getTime() - r.oath.getTime()) / 86400000) : 0;
  return (
    <section id="swearing-in-calculator" className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="swearing-in-calculator">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">December swearing-in fee optimizer</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">Should I wait until December 1?</h2>
      <p className="mt-2 text-ink">Pick your planned swearing-in date. We apply Rule 2.12, compare it with a December 1 oath, and show every deadline that follows.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Quick dates" data-testid="oath-presets">
        {PRESETS.map((p) => (
          <button key={p.value} type="button" onClick={() => setDate(p.value)} aria-pressed={date === p.value} className={`min-h-11 rounded-full px-4 font-display text-sm font-bold ring-1 transition ${date === p.value ? 'bg-navy text-white ring-navy' : 'bg-cream text-navy ring-navy/15 hover:ring-navy/40'}`}>{p.label}</button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/70">Or pick any swearing-in date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 block min-h-12 w-full max-w-xs rounded-2xl border border-navy/15 bg-cream px-4 font-display text-lg font-bold text-navy" data-testid="oath-date" />
      </label>
      <fieldset className="mt-5 grid gap-2 sm:grid-cols-2" data-testid="fee-relief">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/70">Low-income fee relief (optional)</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-3 text-sm text-ink">
          <input type="checkbox" checked={scaling} onChange={(e) => setScaling(e.target.checked)} className="mt-1 h-4 w-4 accent-pink" data-testid="fee-scaling" />
          <span><b className="text-navy">My individual income is under $60,478</b><br />Solo, part-time, or lower paid. 25% Fee Scaling, Rule 2.15(B).</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-3 text-sm text-ink">
          <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} className="mt-1 h-4 w-4 accent-pink" data-testid="fee-waiver" />
          <span><b className="text-navy">My household income is $20,000 or less</b><br />50% waiver, Rule 2.16(C).</span>
        </label>
      </fieldset>
      {r && (
        <>
          <div className={`mt-6 rounded-3xl p-5 ring-1 sm:p-6 ${tone}`} data-testid="calc-result">
            {r.band === 'dec' && (<><p className="font-display text-3xl font-extrabold">$0 first license fee</p><p className="mt-1 font-semibold">December admission. Rule 2.12(C) and the fee schedule list no first-year license fee. Your first bill is the {usd(annual)} annual fee on {fmt(r.annual)}.</p></>)}
            {r.band === 'half' && (<><p className="font-display text-3xl font-extrabold">{r.waitDays <= 31 ? `Wait ${r.waitDays} days, save $299` : '$299 half-year fee'}</p><p className="mt-1 font-semibold">Admitted June 1 to November 30 means a $299 half-year fee, due 45 days from your invoice, then {usd(annual)} more on {fmt(r.annual)} ({usd(299 + annual)} total). Take the oath on December 1 or later and the first-year fee is $0.</p></>)}
            {r.band === 'full' && (<><p className="font-display text-3xl font-extrabold">$598 full-year fee</p><p className="mt-1 font-semibold">Admitted January 1 to May 31 means the full annual fee, due 45 days from your invoice. Then {usd(annual)} on {fmt(r.annual)}.</p></>)}
          </div>
          {showCompare && dec1 && decAnnual && (
            <div className="mt-4" data-testid="cost-compare">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Swear in now vs. wait until December 1</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Bar testid="compare-now" label={`Sworn in ${fmt(r.oath)}`} sub={`Through ${fmt(r.annual)}`} first={r.fee} annual={annual} max={r.fee + annual} accent="bg-pink" />
                <Bar testid="compare-dec1" label={`Sworn in ${fmt(dec1)}`} sub={`Through ${fmt(decAnnual)}`} first={0} annual={annual} max={r.fee + annual} accent="bg-mint" />
              </div>
              <p className="mt-3 rounded-2xl bg-mint/15 p-3 font-display font-bold text-[#00735E]" data-testid="compare-savings">Waiting {daysToDec} days saves {usd(r.fee)} on your first license fee.</p>
              {r.band === 'full' && <p className="mt-2 text-xs text-ink/70">Note: a January to May oath and a December oath land on different March 30 renewals ({fmt(r.annual)} vs. {fmt(decAnnual)}). Waiting also means months without a license.</p>}
            </div>
          )}
          {relief !== 'none' && (
            <div className="mt-4 rounded-2xl bg-purple/5 p-4 text-sm text-ink ring-1 ring-purple/20" data-testid="relief-note">
              {relief === 'waiver' ? (
                <p><b className="text-navy">50% waiver: March 30 annual fee drops from $598 to $323.</b> Request it by the fee deadline (Rule 2.16(C)) with the State Bar.</p>
              ) : (
                <p><b className="text-navy">Fee Scaling: March 30 annual fee drops from $598 to $460.25.</b> Request it by the March 30 fee deadline (Rule 2.15(B)) with the State Bar.</p>
              )}
              {r.band === 'half' && <p className="mt-2">Your $299 first license fee stays at $299. CalBar says new licensees admitted after May 31 do not qualify for Fee Scaling in their first year.</p>}
              {r.band === 'dec' && <p className="mt-2">Your first license fee is already $0, so relief only matters for the March 30 annual fee.</p>}
              {r.band === 'full' && <p className="mt-2">Admitted January to May? Ask CalBar whether relief also applies to your $598 first license fee before it is due. We do not discount it here.</p>}
            </div>
          )}
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">First license fee</dt><dd className="mt-1 font-display text-3xl font-extrabold text-navy">{usd(r.fee)}</dd><dd className="text-sm text-ink">Due 45 days from invoice. If invoiced on oath day: {fmt(r.invoiceEst)}</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">New Attorney Training</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy" data-testid="natp-deadline">{fmt(r.natp)}</dd><dd className="text-sm text-ink">10 hours. Last day of the month of your 1-year anniversary.</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">Next annual fee</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy">{fmt(r.annual)}</dd><dd className="text-sm text-ink" data-testid="annual-amount">{usd(annual)}{relief === 'none' ? ' at the 2026 active rate.' : relief === 'scaling' ? ' with 25% Fee Scaling.' : ' with the 50% waiver.'}</dd></div>
          </dl>
          <button type="button" onClick={() => ics(r)} className="mt-5 inline-flex min-h-12 items-center rounded-full bg-pink px-6 font-display font-bold text-white shadow-pill hover:opacity-90" data-testid="ics-download">+ Add deadlines to Google / Apple Calendar (.ics)</button>
          <p className="mt-3 text-xs text-ink/70">No email needed. The file is built in your browser. Your MCLE compliance group depends on your last name; check your CalBar profile after admission.</p>
        </>
      )}
    </section>
  );
}
