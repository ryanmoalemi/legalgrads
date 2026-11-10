'use client';

import { useState } from 'react';
import { floridaExempt, illinoisPlan, money, type FeeTool } from '@/lib/nationalPostBar';

function pretty(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function StateFeeTool({ tool }: { tool: FeeTool }) {
  if (tool.kind === 'florida') return <FloridaTool />;
  if (tool.kind === 'texas') return <TexasTool tool={tool} />;
  return <IllinoisTool />;
}

function FloridaTool() {
  const [date, setDate] = useState('2026-11-10');
  const exempt = floridaExempt(date);
  const fee = exempt === null ? null : exempt ? 0 : 265;
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="fee-tool">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Admission-date fee</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Does this admission date owe $265?</h2>
      <p className="mt-2 text-ink">Rule 1-7.3(b) exempts new members admitted April 1 through June 30 from that membership period&apos;s fee. Every other new member pays $265 within 60 days. This is the membership fee only.</p>
      <label className="mt-4 block text-sm font-semibold text-navy">Admission date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block min-h-11 rounded-2xl border border-navy/15 px-3" data-testid="fl-date" />
      </label>
      <p className="mt-4 font-display text-4xl font-extrabold text-navy" data-testid="fl-fee">{fee === null ? 'Not published' : money(fee)}</p>
      <p className="mt-1 text-sm text-ink">{exempt === null ? 'Enter a real calendar date.' : exempt ? 'This date falls in the April 1 through June 30 exemption.' : 'This date is outside the exemption, so the published new-member fee is $265.'}</p>
    </section>
  );
}

function TexasTool({ tool }: { tool: Extract<FeeTool, { kind: 'texas' }> }) {
  const [month, setMonth] = useState('2026-11');
  const row = tool.months.find((item) => item.id === month) ?? tool.months[0];
  const total = row.dues + tool.license + tool.legalServices;
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="fee-tool">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Licensing-month fee</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">New Texas lawyer, 0 to 3 years</h2>
      <p className="mt-2 text-ink">Uses the schedule row for attorneys licensed on or after June 1, 2023. Dues plus the $25 license fee plus the $65 legal services fee. The 3 to 5 year and 5 year rows are higher and are not calculated here.</p>
      <label className="mt-4 block text-sm font-semibold text-navy">Month licensed
        <select value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1 block min-h-11 w-full max-w-xs rounded-2xl border border-navy/15 px-3" data-testid="tx-month">
          {tool.months.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <p className="mt-4 font-display text-4xl font-extrabold text-navy" data-testid="tx-total">{money(total)}</p>
      <p className="mt-1 text-sm text-ink">Dues {money(row.dues)} + license {money(tool.license)} + legal services {money(tool.legalServices)}.</p>
      {row.note ? <p className="mt-2 text-sm text-ink">{row.note}</p> : null}
    </section>
  );
}

function IllinoisTool() {
  const [date, setDate] = useState('2026-11-10');
  const [group, setGroup] = useState<'am' | 'nz'>('am');
  const plan = illinoisPlan(date, group);
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="fee-tool">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">New-lawyer CLE dates</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Illinois deadlines from the admission month</h2>
      <p className="mt-2 text-ink">The MCLE Board says the completion deadline is one year after the last day of the admission month, and the report is 31 days later. The two-year reporting period then starts on the July 1 after that deadline, in an even year for A to M and an odd year for N to Z.</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="text-sm font-semibold text-navy">Admission date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block min-h-11 rounded-2xl border border-navy/15 px-3" data-testid="il-date" />
        </label>
        <div className="flex flex-wrap gap-2 self-end" role="group" aria-label="Last name group">
          {([['am', 'A to M'], ['nz', 'N to Z']] as const).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={group === id} onClick={() => setGroup(id)} className={`min-h-11 rounded-full px-4 font-display text-sm font-bold ${group === id ? 'bg-navy text-white' : 'bg-cream text-navy'}`}>{label}</button>
          ))}
        </div>
      </div>
      {plan ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-3" data-testid="il-plan">
          <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase text-ink/70">Complete 15 hours</dt><dd className="mt-1 font-display text-xl font-extrabold text-navy">{pretty(plan.completion)}</dd></div>
          <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase text-ink/70">Report compliance</dt><dd className="mt-1 font-display text-xl font-extrabold text-navy">{pretty(plan.reporting)}</dd></div>
          <div className="rounded-2xl bg-cream p-4"><dt className="text-xs font-bold uppercase text-ink/70">Two-year period starts</dt><dd className="mt-1 font-display text-xl font-extrabold text-navy">{pretty(plan.periodStart)}</dd></div>
        </dl>
      ) : <p className="mt-4 text-ink">Enter a real calendar date.</p>}
    </section>
  );
}
