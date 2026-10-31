'use client';
import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent, type ReactNode } from 'react';
import { ANNUAL, DEFAULT_BONUS, DEFAULT_HOURLY, FEE_YEAR_LABEL, HOURS_PER_DAY, SCALED_ANNUAL, WAIVED_ANNUAL, annualFor, type Relief } from '@/lib/caFees';
import { CA_PLAN_PATH, addDays, calc, fmt, icsDownload, mcleFor, planSearch, usd, workdaysBetween, type McleGroup } from '@/lib/caCalc';

export type Who = 'solo' | 'bump' | 'reimb';

const oathOn = 'min-h-11 rounded-full px-4 font-display text-sm font-bold ring-1 transition bg-navy text-white ring-navy';
const oathOff = 'min-h-11 rounded-full px-4 font-display text-sm font-bold ring-1 transition bg-cream text-navy ring-navy/15 hover:ring-navy/40';
const whoOn = 'rounded-2xl p-3 text-left ring-1 transition bg-navy text-white ring-navy';
const whoOff = 'rounded-2xl p-3 text-left ring-1 transition bg-white text-navy ring-navy/10 hover:ring-navy/40';
const mcleOn = 'rounded-2xl bg-purple p-4 text-left text-white ring-1 ring-purple';
const mcleOff = 'rounded-2xl bg-cream p-4 text-left text-navy ring-1 ring-navy/15 transition hover:ring-navy/40';

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

function readQuery() {
  const sp = new URLSearchParams(window.location.search);
  const oath = sp.get('oath') || '';
  const who = sp.get('who') || '';
  const hourly = sp.get('hourly');
  const bonus = sp.get('bonus');
  const mcle = sp.get('mcle') || '';
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(oath) && calc(oath) ? oath : null,
    who: who === 'solo' || who === 'bump' || who === 'reimb' ? who as Who : null,
    hourly: hourly != null && hourly !== '' && Number.isFinite(Number(hourly)) ? Math.max(0, Number(hourly)) : null,
    bonus: bonus != null && bonus !== '' && Number.isFinite(Number(bonus)) ? Math.max(0, Number(bonus)) : null,
    group: mcle,
    scaling: sp.get('scale') === '1',
    waiver: sp.get('waive') === '1',
    has: sp.has('oath') || sp.has('who') || sp.has('hourly') || sp.has('bonus') || sp.has('mcle') || sp.has('scale') || sp.has('waive'),
  };
}

export function CalculatorLive({
  mcle, compact = false, head, decision, mcleCards,
}: {
  mcle?: { groups: McleGroup[]; source: { label: string; url: string } };
  compact?: boolean;
  head: ReactNode;
  decision: ReactNode;
  mcleCards: ReactNode;
}) {
  const [date, setDate] = useState('2026-11-20');
  const [who, setWho] = useState<Who>('bump');
  const [hourly, setHourly] = useState(DEFAULT_HOURLY);
  const [bonus, setBonus] = useState(DEFAULT_BONUS);
  const [group, setGroup] = useState('');
  const [hours, setHours] = useState(HOURS_PER_DAY);
  const [effective, setEffective] = useState('');
  const [invoice, setInvoice] = useState('');
  const [scaling, setScaling] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const r = useMemo(() => calc(date), [date]);
  const relief: Relief = waiver ? 'waiver' : scaling ? 'scaling' : 'none';
  const annual = annualFor(relief);
  const tone = !r ? '' : r.band === 'dec' ? 'bg-mint/15 text-[#00735E] ring-mint/40' : r.band === 'half' ? (r.oath.getMonth() === 10 ? 'bg-pink/10 text-[#B0124F] ring-pink/40' : 'bg-amber-100 text-amber-900 ring-amber-300') : 'bg-navy/5 text-navy ring-navy/10';
  const dec1 = r ? new Date(r.oath.getFullYear(), 11, 1) : null;
  const showCompare = !!r && r.band !== 'dec';
  const decAnnual = dec1 ? new Date(dec1.getFullYear() + 1, 2, 30) : null;
  const daysToDec = r && dec1 ? Math.round((dec1.getTime() - r.oath.getTime()) / 86400000) : 0;
  const showDecision = !!r && !!dec1 && r.band === 'half' && r.oath.getMonth() === 10;
  const effectiveDate = effective ? calc(effective)?.oath ?? null : null;
  const raiseStartNow = r && dec1 ? (effectiveDate && effectiveDate > r.oath ? effectiveDate : r.oath) : null;
  const raiseStartWait = dec1 ? (effectiveDate && effectiveDate > dec1 ? effectiveDate : dec1) : null;
  const workdays = raiseStartNow && raiseStartWait && raiseStartNow < raiseStartWait ? workdaysBetween(raiseStartNow, raiseStartWait) : 0;
  const wageLoss = who === 'bump' ? Math.round(hourly * hours * workdays) : 0;
  const bonusLoss = who === 'bump' ? bonus : 0;
  const feeSaved = !r || who === 'reimb' ? 0 : r.fee;
  const net = feeSaved - wageLoss - bonusLoss;
  const wait = who !== 'reimb' && net > 0;

  useEffect(() => {
    const q = readQuery();
    if (q.date) setDate(q.date);
    if (q.who) setWho(q.who);
    if (q.hourly != null) setHourly(q.hourly);
    if (q.bonus != null) setBonus(q.bonus);
    if (q.group && mcle?.groups.some((g) => g.id === q.group)) setGroup(q.group);
    if (q.has) {
      setScaling(q.scaling);
      setWaiver(q.waiver);
    }
    setHydrated(true);
  }, [mcle]);

  useEffect(() => {
    const root = document.getElementById('swearing-in-calculator');
    if (!root) return;
    root.querySelectorAll<HTMLButtonElement>('[data-oath]').forEach((b) => {
      const on = b.dataset.oath === date;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.className = on ? oathOn : oathOff;
    });
    root.querySelectorAll<HTMLButtonElement>('[data-who]').forEach((b) => {
      const on = b.dataset.who === who;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.className = on ? whoOn : whoOff;
      const sub = b.querySelector('[data-who-sub]');
      if (sub) sub.className = `block text-xs ${on ? 'text-white/80' : 'text-ink'}`;
    });
    root.querySelectorAll<HTMLButtonElement>('[data-mcle]').forEach((b) => {
      const on = b.dataset.mcle === group;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.className = on ? mcleOn : mcleOff;
    });
    const dateInput = root.querySelector<HTMLInputElement>('[data-field="date"]');
    if (dateInput && dateInput.value !== date) dateInput.value = date;
    const hourlyInput = root.querySelector<HTMLInputElement>('[data-field="hourly"]');
    if (hourlyInput && document.activeElement !== hourlyInput) hourlyInput.value = String(hourly);
    const bonusInput = root.querySelector<HTMLInputElement>('[data-field="bonus"]');
    if (bonusInput && document.activeElement !== bonusInput) bonusInput.value = String(bonus);
    const hoursInput = root.querySelector<HTMLInputElement>('[data-field="hours"]');
    if (hoursInput && document.activeElement !== hoursInput) hoursInput.value = String(hours);
    const effectiveInput = root.querySelector<HTMLInputElement>('[data-field="effective"]');
    if (effectiveInput && document.activeElement !== effectiveInput && effectiveInput.value !== effective) effectiveInput.value = effective;
    const invoiceInput = root.querySelector<HTMLInputElement>('[data-field="invoice"]');
    if (invoiceInput && document.activeElement !== invoiceInput && invoiceInput.value !== invoice) invoiceInput.value = invoice;
    const scale = root.querySelector<HTMLInputElement>('[data-field="scaling"]');
    if (scale) scale.checked = scaling;
    const waive = root.querySelector<HTMLInputElement>('[data-field="waiver"]');
    if (waive) waive.checked = waiver;
  }, [date, who, group, hourly, bonus, hours, effective, invoice, scaling, waiver]);

  useEffect(() => {
    if (!hydrated) return;
    const qs = planSearch({ date, who, hourly, bonus, group, scaling, waiver });
    const path = window.location.pathname;
    window.history.replaceState(null, '', `${path}?${qs}`);
  }, [hydrated, date, who, hourly, bonus, group, scaling, waiver]);

  function onClick(e: MouseEvent) {
    const t = (e.target as HTMLElement).closest('button');
    if (!t) return;
    if (t.dataset.oath) setDate(t.dataset.oath);
    if (t.dataset.who === 'solo' || t.dataset.who === 'bump' || t.dataset.who === 'reimb') setWho(t.dataset.who);
    if (t.dataset.mcle) setGroup(t.dataset.mcle);
  }
  function onChange(e: ChangeEvent<HTMLElement>) {
    const t = e.target as HTMLInputElement;
    if (t.dataset.field === 'date' && calc(t.value)) setDate(t.value);
    if (t.dataset.field === 'hourly') setHourly(Math.max(0, Number(t.value) || 0));
    if (t.dataset.field === 'bonus') setBonus(Math.max(0, Number(t.value) || 0));
    if (t.dataset.field === 'hours') setHours(Math.max(0, Number(t.value) || 0));
    if (t.dataset.field === 'effective') setEffective(t.value);
    if (t.dataset.field === 'invoice') setInvoice(t.value);
    if (t.dataset.field === 'scaling') setScaling(t.checked);
    if (t.dataset.field === 'waiver') setWaiver(t.checked);
  }
  async function copyPlan() {
    const qs = planSearch({ date, who, hourly, bonus, group, scaling, waiver });
    const url = `${window.location.origin}${CA_PLAN_PATH}?${qs}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  }

  return (
    <section id="swearing-in-calculator" onClick={onClick} onChange={onChange} className={compact ? 'rounded-3xl bg-white p-4 sm:p-6' : 'mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8'} data-testid="swearing-in-calculator">
      {head}
      {r && (
        <>
          <div className={`mt-6 rounded-3xl p-5 ring-1 sm:p-6 ${tone}`} data-testid="calc-result">
            {r.band === 'dec' && (<><p className="font-display text-3xl font-extrabold">$0 first license fee</p><p className="mt-1 font-semibold">December admission. Rule 2.12(C) and the 2026 fee schedule list no first-year license fee. Your next bill is the {usd(annual)} annual fee on {fmt(r.annual)}. {FEE_YEAR_LABEL}.</p></>)}
            {r.band === 'half' && (<><p className="font-display text-3xl font-extrabold">{r.waitDays <= 31 ? `Wait ${r.waitDays} days, save $299` : '$299 half-year fee'}</p><p className="mt-1 font-semibold">Admitted June 1 to November 30 means a $299 half-year fee, due 45 days from the invoice date, then {usd(annual)} more on {fmt(r.annual)} ({usd(299 + annual)} total). {FEE_YEAR_LABEL}. Take the oath on December 1 or later and the first-year fee on the 2026 schedule is $0.</p></>)}
            {r.band === 'full' && (<><p className="font-display text-3xl font-extrabold">$598 full-year fee</p><p className="mt-1 font-semibold">Admitted January 1 to May 31 means the full annual fee on the 2026 schedule, due 45 days from the invoice date. Then {usd(annual)} on {fmt(r.annual)}. {FEE_YEAR_LABEL}.</p></>)}
          </div>
          {showCompare && dec1 && decAnnual && (
            <div className="mt-4" data-testid="cost-compare">
              <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Swear in now vs. wait until December 1</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Bar testid="compare-now" label={`Sworn in ${fmt(r.oath)}`} sub={`Through ${fmt(r.annual)}`} first={r.fee} annual={annual} max={Math.max(r.fee + annual, 1)} accent="bg-pink" />
                <Bar testid="compare-dec1" label={`Sworn in ${fmt(dec1)}`} sub={`Through ${fmt(decAnnual)}`} first={0} annual={annual} max={Math.max(r.fee + annual, 1)} accent="bg-mint" />
              </div>
              <p className="mt-3 rounded-2xl bg-mint/15 p-3 font-display font-bold text-[#00735E]" data-testid="compare-savings">Waiting {daysToDec} days saves {usd(r.fee)} on your first license fee.</p>
              {r.band === 'full' && <p className="mt-2 text-xs text-ink/70">Note: a January to May oath and a December oath land on different March 30 renewals ({fmt(r.annual)} vs. {fmt(decAnnual)}). Waiting also means months without a license.</p>}
            </div>
          )}
          {showDecision && (
            <div className="mt-4 rounded-3xl bg-cream p-5 sm:p-6" data-testid="decision-engine">
              {decision}
              <div className={`mt-4 rounded-2xl p-4 ring-1 ${wait ? 'bg-mint/15 text-[#00735E] ring-mint/40' : 'bg-pink/10 text-[#B0124F] ring-pink/40'}`} data-testid="verdict">
                <p className="font-display text-2xl font-extrabold sm:text-3xl">{wait ? 'Verdict: wait until December 1' : 'Verdict: swear in now'}</p>
                {who === 'solo' && <p className="mt-1 font-semibold">You keep {usd(r.fee)} in cash, and waiting {daysToDec} days costs $0 in lost wages.</p>}
                {who === 'bump' && <p className="mt-1 font-semibold" data-testid="verdict-net">Waiting saves {usd(r.fee)} in fees but costs {usd(wageLoss + bonusLoss)} ({workdays} workdays × {hours} hrs × ${hourly}/hr + {usd(bonus)} bonus). Net if you wait: {net >= 0 ? '+' : '-'}{usd(Math.abs(net))}.</p>}
                {who === 'bump' && <p className="mt-2 text-sm" data-testid="verdict-assumptions">Assumptions: weekdays only, not court holidays. The raise applies to {hours} paid hours a day and does not start before {effectiveDate ? fmt(effectiveDate) : 'the day you are sworn in'}. The bonus counts only if waiting means you lose it. License amounts: {FEE_YEAR_LABEL}.</p>}
                {who === 'reimb' && <p className="mt-1 font-semibold">Your employer covers the {usd(r.fee)}, so waiting saves you $0 and pushes back your admission date and seniority.</p>}
              </div>
            </div>
          )}
          {relief !== 'none' && (
            <div className="mt-4 rounded-2xl bg-purple/5 p-4 text-sm text-ink ring-1 ring-purple/20" data-testid="relief-note">
              {relief === 'waiver' ? (
                <p><b className="text-navy">50% Fee Waiver: March 30 annual fee drops from ${ANNUAL} to {usd(WAIVED_ANNUAL)}.</b> Request it by the fee deadline (Rule 2.16(C)) with the State Bar.</p>
              ) : (
                <p><b className="text-navy">25% Fee Scaling: March 30 annual fee drops from ${ANNUAL} to {usd(SCALED_ANNUAL)}.</b> Request it by the March 30 fee deadline (Rule 2.15(B)) with the State Bar.</p>
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
          {mcleCards}
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
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">First license fee</dt><dd className="mt-1 font-display text-3xl font-extrabold text-navy">{usd(r.fee)}</dd><dd className="text-sm text-ink" data-testid="fee-due">{invoice && calc(invoice) ? `Due ${fmt(addDays(calc(invoice)!.oath, 45))}, 45 days after the invoice date you entered. ${FEE_YEAR_LABEL}.` : 'Due 45 days from the invoice date. No invoice date yet, so this is not a payment deadline.'}</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">New Attorney Training</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy" data-testid="natp-deadline">{fmt(r.natp)}</dd><dd className="text-sm text-ink">10 hours. $55 State Bar bundle. Not your MCLE report. Last day of the month of your 1-year anniversary.</dd></div>
            <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase tracking-wide text-ink/70">Next annual fee</dt><dd className="mt-1 font-display text-2xl font-extrabold text-navy">{fmt(r.annual)}</dd><dd className="text-sm text-ink" data-testid="annual-amount">{usd(annual)}{relief === 'none' ? ' at the 2026 active rate.' : relief === 'scaling' ? ' with 25% Fee Scaling.' : ' with the 50% waiver.'} {FEE_YEAR_LABEL}.</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => icsDownload(r, invoice || null)} className="inline-flex min-h-12 items-center rounded-full bg-pink px-6 font-display font-bold text-white shadow-pill hover:opacity-90" data-testid="ics-download">+ Add deadlines to Google / Apple Calendar (.ics)</button>
            <button type="button" onClick={copyPlan} className="inline-flex min-h-12 items-center rounded-full bg-navy px-6 font-display font-bold text-white" data-testid="copy-plan">{copied ? 'Copied' : 'Copy link to my custom 1st-year plan'}</button>
          </div>
          <p className="mt-3 text-xs text-ink/70">No email needed. The file is built in your browser. The link stores your date, MCLE group, pay inputs, and fee relief in the URL.</p>
        </>
      )}
    </section>
  );
}
