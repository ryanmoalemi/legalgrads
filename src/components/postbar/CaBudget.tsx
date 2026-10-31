'use client';
import { useState } from 'react';
import { FEE_YEAR_LABEL, MORAL_CHARACTER, NAT_BUNDLE } from '@/lib/caFees';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

export function CaBudget() {
  const [paid, setPaid] = useState(false);
  const licenseLow = 0;
  const licenseHigh = 598;
  const remainingLow = (paid ? 0 : MORAL_CHARACTER) + licenseLow + NAT_BUNDLE;
  const remainingHigh = (paid ? 0 : MORAL_CHARACTER) + licenseHigh + NAT_BUNDLE;
  return (
    <section className="mt-8" data-testid="ca-budget">
      <label className="flex cursor-pointer items-start gap-3 rounded-3xl bg-white p-4 text-ink shadow-card ring-1 ring-navy/5">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="mt-1 h-4 w-4 accent-pink" data-testid="moral-paid" />
        <span><b className="text-navy">Have you already paid the $900 moral character fee?</b><br />Most general applicants pay this during law school, before results. It is not a new bill on oath day unless it is still open.</span>
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-navy p-4 text-white sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Still to pay</p>
          <p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl" data-testid="budget-remaining">{usd(remainingLow)} to {usd(remainingHigh)}</p>
          <p className="mt-2 text-sm text-white/80">{paid ? 'First license fee $0, $299, or $598, plus the $55 New Attorney Training bundle.' : 'Moral character $900, if it is still unpaid, plus the license fee ($0, $299, or $598) and the $55 training bundle.'} {FEE_YEAR_LABEL} for the license fee.</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-navy shadow-card ring-1 ring-navy/5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/70">Previously paid</p>
          <p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl" data-testid="budget-paid">{paid ? usd(MORAL_CHARACTER) : '$0'}</p>
          <p className="mt-2 text-sm text-ink">{paid ? 'Moral character, Rule 4.41(B), counted as already paid.' : 'Nothing moved here yet. Check the box if moral character is already paid.'}</p>
        </div>
        <div className="rounded-3xl bg-pink p-4 text-white sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-white/80">Upcoming annual</p>
          <p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">$598</p>
          <p className="mt-2 text-sm text-white/80">March 30. This is the 2026 active rate, not a verified 2027 price. {FEE_YEAR_LABEL}. The $55 training bundle is not part of this annual fee.</p>
        </div>
      </div>
    </section>
  );
}
