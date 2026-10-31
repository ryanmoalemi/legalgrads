'use client';
import { useMemo, useState } from 'react';
import { ANNUAL, DEFAULT_BONUS, DEFAULT_HOURLY, HOURS_PER_DAY, SCALED_ANNUAL, WAIVED_ANNUAL, annualFor, type Relief } from '@/lib/caFees';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const usd = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`);
const reportLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${SHORT_MONTHS[m - 1]} ${d}, ${y}`;
};

export { ANNUAL, SCALED_ANNUAL, WAIVED_ANNUAL, annualFor };
export type { Relief };

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
  return { oath, fee, band, invoiceEst, annual, natp, waitDays, total: fee + ANNUAL };
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

export type Who = 'solo' | 'bump' | 'reimb';
export function workdaysBetween(a: Date, b: Date) {
  let n = 0;
  for (let d = new Date(a); d < b; d = addDays(d, 1)) { const w = d.getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}
export type McleGroup = { id: string; letters: string; periodEnd: string; report: string };
export function mcleFor(oath: Date, g: McleGroup) {
  const [y, m, d] = g.periodEnd.split('-').map(Number);
  let end = new Date(y, m - 1, d);
  const start = new Date(oath.getFullYear(), oath.getMonth(), 1);
  while (end < start) end = new Date(end.getFullYear() + 3, end.getMonth(), end.getDate());
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const hours = Math.min(25, Math.round(((25 * months) / 36) * 2) / 2);
  return { start, end, report: addDays(end, 1), months, hours };
}

const WHO: { id: Who; label: string; sub: string }[] = [
  { id: 'solo', label: 'Paying myself', sub: 'Solo, job hunting, no raise on admission' },
  { id: 'bump', label: 'Raise on admission', sub: 'Small firm or clerk, pay bumps when licensed' },
  { id: 'reimb', label: 'Employer pays dues', sub: 'BigLaw, MidLaw, government' },
];

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

export function SwearingInCalculator({ mcle, compact = false }: { mcle?: { groups: McleGroup[]; source: { label: string; url: string } }; compact?: boolean } = {}) {
  const [date, setDate] = useState('2026-11-20');
  const [who, setWho] = useState<Who>('bump');
  const [hourly, setHourly] = useState(DEFAULT_HOURLY);
  const [bonus, setBonus] = useState(DEFAULT_BONUS);
  const [group, setGroup] = useState<string>('');
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
  const showDecision = !!r && !!dec1 && r.band === 'half' && r.oath.getMonth() === 10;
  const workdays = r && dec1 && showDecision ? workdaysBetween(r.oath, dec1) : 0;
  const wageLoss = who === 'bump' ? Math.round(hourly * HOURS_PER_DAY * workdays) : 0;
  const bonusLoss = who === 'bump' ? bonus : 0;
  const feeSaved = !r || who === 'reimb' ? 0 : r.fee;
  const net = feeSaved - wageLoss - bonusLoss;
  const wait = who !== 'reimb' && net > 0;
  return (
    <section id="swearing-in-calculator" className={compact ? 'rounded-3xl bg-white p-4 sm:p-6' : 'mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8'} data-testid="swearing-in-calculator">
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
          <span><b className="text-navy">25% Fee Scaling</b><br />Individual income under $60,478.35. March 30 annual fee becomes {usd(SCALED_ANNUAL)} (Rule 2.15(B)).</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-3 text-sm text-ink">
          <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} className="mt-1 h-4 w-4 accent-pink" data-testid="fee-waiver" />
          <span><b className="text-navy">50% Fee Waiver</b><br />Household income $20,000 or less. March 30 annual fee becomes {usd(WAIVED_ANNUAL)} (Rule 2.16(C)).</span>
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

          {showDecision && (
            <div className="mt-4 rounded-3xl bg-cream p-5 sm:p-6" data-testid="decision-engine">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Decision engine</p>
              <p className="mt-1 font-display text-lg font-extrabold text-navy">Who pays your dues, and does admission bump your pay?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="Your situation" data-testid="who-toggle">
                {WHO.map((w) => (
                  <button key={w.id} type="button" onClick={() => setWho(w.id)} aria-pressed={who === w.id} data-testid={`who-${w.id}`} className={`rounded-2xl p-3 text-left ring-1 transition ${who === w.id ? 'bg-navy text-white ring-navy' : 'bg-white text-navy ring-navy/10 hover:ring-navy/40'}`}>
                    <span className="block font-display text-sm font-bold">{w.label}</span><span className={`block text-xs ${who === w.id ? 'text-white/80' : 'text-ink'}`}>{w.sub}</span>
                  </button>
                ))}
              </div>
              {who === 'bump' && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block rounded-2xl bg-white p-3 text-sm text-ink ring-1 ring-navy/10">
                    <span className="font-bold text-navy">Hourly pay increase upon admission ($/hr)</span>
                    <input type="number" min={0} step={1} value={hourly} onChange={(e) => setHourly(Math.max(0, Number(e.target.value) || 0))} className="mt-2 block h-11 w-full rounded-xl bg-cream px-3 font-display text-lg font-bold text-navy outline-none ring-1 ring-navy/15" data-testid="hourly-input" />
                  </label>
                  <label className="block rounded-2xl bg-white p-3 text-sm text-ink ring-1 ring-navy/10">
                    <span className="font-bold text-navy">One-time bar passage bonus ($)</span>
                    <input type="number" min={0} step={1} value={bonus} onChange={(e) => setBonus(Math.max(0, Number(e.target.value) || 0))} className="mt-2 block h-11 w-full rounded-xl bg-cream px-3 font-display text-lg font-bold text-navy outline-none ring-1 ring-navy/15" data-testid="bonus-input" />
                  </label>
                  <p className="text-xs text-ink sm:col-span-2">Count the bonus only if waiting until December 1 means you lose it. If you get the same bonus either way, leave it at $0. Pay given up uses {workdays} workdays × {HOURS_PER_DAY} hrs × ${hourly}/hr + {usd(bonus)} bonus.</p>
                </div>
              )}
              <div className={`mt-4 rounded-2xl p-4 ring-1 ${wait ? 'bg-mint/15 text-[#00735E] ring-mint/40' : 'bg-pink/10 text-[#B0124F] ring-pink/40'}`} data-testid="verdict">
                <p className="font-display text-2xl font-extrabold sm:text-3xl">{wait ? 'Verdict: wait until December 1' : 'Verdict: swear in now'}</p>
                {who === 'solo' && <p className="mt-1 font-semibold">You keep {usd(r.fee)} in cash, and waiting {daysToDec} days costs $0 in lost wages.</p>}
                {who === 'bump' && <p className="mt-1 font-semibold" data-testid="verdict-net">Waiting saves {usd(r.fee)} in fees but costs {usd(wageLoss + bonusLoss)} ({workdays} workdays × {HOURS_PER_DAY} hrs × ${hourly}/hr + {usd(bonus)} bonus). Net if you wait: {net >= 0 ? '+' : '-'}{usd(Math.abs(net))}.</p>}
                {who === 'reimb' && <p className="mt-1 font-semibold">Your employer covers the {usd(r.fee)}, so waiting saves you $0 and pushes back your admission date and seniority.</p>}
              </div>
            </div>
          )}
          {relief !== 'none' && (
            <div className="mt-4 rounded-2xl bg-purple/5 p-4 text-sm text-ink ring-1 ring-purple/20" data-testid="relief-note">
              {relief === 'waiver' ? (
                <p><b className="text-navy">50% Fee Waiver: March 30 annual fee drops from $598 to {usd(WAIVED_ANNUAL)}.</b> Request it by the fee deadline (Rule 2.16(C)) with the State Bar.</p>
              ) : (
                <p><b className="text-navy">25% Fee Scaling: March 30 annual fee drops from $598 to {usd(SCALED_ANNUAL)}.</b> Request it by the March 30 fee deadline (Rule 2.15(B)) with the State Bar.</p>
              )}
              {r.band === 'half' && <p className="mt-2">Your $299 first license fee stays at $299. CalBar says new licensees admitted after May 31 do not qualify for Fee Scaling in their first year.</p>}
              {r.band === 'dec' && <p className="mt-2">Your first license fee is already $0, so relief only matters for the March 30 annual fee.</p>}
              {r.band === 'full' && <p className="mt-2">Admitted January to May? Ask CalBar whether relief also applies to your $598 first license fee before it is due. We do not discount it here.</p>}
            </div>
          )}
        </>
      )}

      {mcle && (
        <div className="mt-4 rounded-3xl bg-white p-5 ring-1 ring-navy/10 sm:p-6" data-testid="mcle-group">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">MCLE compliance group</p>
          <p className="mt-1 font-display text-lg font-extrabold text-navy">First letter of your last name</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3" role="group" aria-label="Last name" data-testid="mcle-cards">
            {mcle.groups.map((g) => (
              <button key={g.id} type="button" onClick={() => setGroup(g.id)} aria-pressed={group === g.id} data-testid={`mcle-${g.id}`} className={`rounded-2xl p-4 text-left ring-1 transition ${group === g.id ? 'bg-purple text-white ring-purple' : 'bg-cream text-navy ring-navy/15 hover:ring-navy/40'}`}>
                <span className={`block text-xs font-bold uppercase tracking-wide ${group === g.id ? 'text-white/80' : 'text-ink/70'}`}>Last names</span>
                <span className="mt-1 block font-display text-3xl font-extrabold">{g.letters}</span>
                <span className="mt-1 block text-sm font-semibold">Report due {reportLabel(g.report)}</span>
              </button>
            ))}
          </div>
          {r && (() => {
            const g = mcle.groups.find((x) => x.id === group);
            if (!g) return <p className="mt-3 text-sm text-ink">Select a group to see prorated hours for this oath date. The report dates above are the group deadlines.</p>;
            const m = mcleFor(r.oath, g);
            return (
              <div className="mt-4 grid gap-3 sm:grid-cols-3" data-testid="mcle-result">
                <div className="rounded-2xl bg-cream p-4"><p className="text-xs font-bold uppercase tracking-wide text-ink/70">Your group</p><p className="mt-1 font-display text-3xl font-extrabold text-navy">Group {g.id}</p><p className="text-sm text-ink">Last names {g.letters}</p></div>
                <div className="rounded-2xl bg-cream p-4"><p className="text-xs font-bold uppercase tracking-wide text-ink/70">First report due</p><p className="mt-1 font-display text-2xl font-extrabold text-navy" data-testid="mcle-report">{fmt(m.report)}</p><p className="text-sm text-ink">Period {fmt(m.start)} to {fmt(m.end)}</p></div>
                <div className="rounded-2xl bg-cream p-4"><p className="text-xs font-bold uppercase tracking-wide text-ink/70">Prorated hours, est.</p><p className="mt-1 font-display text-3xl font-extrabold text-navy" data-testid="mcle-hours">~{m.hours} of 25</p><p className="text-sm text-ink">{m.months} months in your first period</p></div>
                <p className="text-sm text-ink sm:col-span-3">{m.hours <= 10 ? 'Good news: your 10 hours of New Attorney Training can count toward this first period, so it may cover you entirely.' : 'Your 10 hours of New Attorney Training can count toward this first period, which cuts what is left.'} Estimate uses 25 hours × months ÷ 36 (Rule 2.53). CalBar&apos;s proportional chart controls. <a className="text-purple underline" href={mcle.source.url} target="_blank" rel="noopener noreferrer">Group dates source</a></p>
              </div>
            );
          })()}
        </div>
      )}

      {r && (
        <>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">First license fee</dt><dd className="mt-1 font-display text-3xl font-extrabold text-navy">{usd(r.fee)}</dd><dd className="text-sm text-ink">Due 45 days from invoice. If invoiced on oath day: {fmt(r.invoiceEst)}</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">New Attorney Training</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy" data-testid="natp-deadline">{fmt(r.natp)}</dd><dd className="text-sm text-ink">10 hours. Last day of the month of your 1-year anniversary.</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">Next annual fee</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy">{fmt(r.annual)}</dd><dd className="text-sm text-ink" data-testid="annual-amount">{usd(annual)}{relief === 'none' ? ' at the 2026 active rate.' : relief === 'scaling' ? ' with 25% Fee Scaling.' : ' with the 50% waiver.'}</dd></div>
          </dl>
          <button type="button" onClick={() => ics(r)} className="mt-5 inline-flex min-h-12 items-center rounded-full bg-pink px-6 font-display font-bold text-white shadow-pill hover:opacity-90" data-testid="ics-download">+ Add deadlines to Google / Apple Calendar (.ics)</button>
          <p className="mt-3 text-xs text-ink/70">No email needed. The file is built in your browser.</p>
        </>
      )}
    </section>
  );
}
