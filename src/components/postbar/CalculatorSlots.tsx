import { DEFAULT_BONUS, DEFAULT_HOURLY, SCALED_ANNUAL, WAIVED_ANNUAL } from '@/lib/caFees';
import { reportLabel, usd, type McleGroup } from '@/lib/caCalc';

const PRESETS = [
  { label: 'Nov 20, 2026', value: '2026-11-20', pressed: true },
  { label: 'Dec 1, 2026', value: '2026-12-01', pressed: false },
  { label: 'Jan 5, 2027', value: '2027-01-05', pressed: false },
];

const WHO = [
  { id: 'solo', label: 'Paying myself', sub: 'Solo, job hunting, no raise on admission', pressed: false },
  { id: 'bump', label: 'Raise on admission', sub: 'Small firm or clerk, pay bumps when licensed', pressed: true },
  { id: 'reimb', label: 'Employer pays dues', sub: 'BigLaw, MidLaw, government', pressed: false },
];

const oathOn = 'min-h-11 rounded-full px-4 font-display text-sm font-bold ring-1 transition bg-navy text-white ring-navy';
const oathOff = 'min-h-11 rounded-full px-4 font-display text-sm font-bold ring-1 transition bg-cream text-navy ring-navy/15 hover:ring-navy/40';
const whoOn = 'rounded-2xl p-3 text-left ring-1 transition bg-navy text-white ring-navy';
const whoOff = 'rounded-2xl p-3 text-left ring-1 transition bg-white text-navy ring-navy/10 hover:ring-navy/40';

export function CalculatorHead() {
  return (
    <>
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">December swearing-in fee optimizer</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">Should I wait until December 1?</h2>
      <p className="mt-2 text-ink">Pick your planned swearing-in date. We apply Rule 2.12, compare it with a December 1 oath, and show every deadline that follows.</p>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Quick dates" data-testid="oath-presets">
        {PRESETS.map((p) => (
          <button key={p.value} type="button" data-oath={p.value} aria-pressed={p.pressed} className={p.pressed ? oathOn : oathOff}>{p.label}</button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/70">Or pick any swearing-in date</span>
        <input type="date" name="oath" defaultValue="2026-11-20" data-field="date" className="mt-2 block min-h-12 w-full max-w-xs rounded-2xl border border-navy/15 bg-cream px-4 font-display text-lg font-bold text-navy" data-testid="oath-date" />
      </label>
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink/70">Invoice date, if you have it</span>
        <input type="date" name="invoice" data-field="invoice" className="mt-2 block min-h-12 w-full max-w-xs rounded-2xl border border-navy/15 bg-cream px-4 font-display text-lg font-bold text-navy" data-testid="invoice-date" />
        <span className="mt-1 block text-xs text-ink/70">Rule 2.12 starts the 45 days on the invoice date. Leave this blank and the calendar only says to check for the invoice.</span>
      </label>
      <fieldset className="mt-5 grid gap-2 sm:grid-cols-2" data-testid="fee-relief">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/70">Low-income fee relief (optional)</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-3 text-sm text-ink">
          <input type="checkbox" name="scale" data-field="scaling" className="mt-1 h-4 w-4 accent-pink" data-testid="fee-scaling" />
          <span><b className="text-navy">25% Fee Scaling</b><br />Individual income under $60,478.35. March 30 annual fee becomes {usd(SCALED_ANNUAL)} (Rule 2.15(B)).</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream p-3 text-sm text-ink">
          <input type="checkbox" name="waive" data-field="waiver" className="mt-1 h-4 w-4 accent-pink" data-testid="fee-waiver" />
          <span><b className="text-navy">50% Fee Waiver</b><br />Household income $20,000 or less. March 30 annual fee becomes {usd(WAIVED_ANNUAL)} (Rule 2.16(C)).</span>
        </label>
      </fieldset>
    </>
  );
}

export function CalculatorDecision() {
  return (
    <>
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Decision engine</p>
      <p className="mt-1 font-display text-lg font-extrabold text-navy">Who pays your dues, and does admission bump your pay?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="Your situation" data-testid="who-toggle">
        {WHO.map((w) => (
          <button key={w.id} type="button" data-who={w.id} aria-pressed={w.pressed} data-testid={`who-${w.id}`} className={w.pressed ? whoOn : whoOff}>
            <span className="block font-display text-sm font-bold">{w.label}</span>
            <span data-who-sub={w.id} className={`block text-xs ${w.pressed ? 'text-white/80' : 'text-ink'}`}>{w.sub}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2" data-testid="pay-inputs">
        <label className="block rounded-2xl bg-white p-3 text-sm text-ink ring-1 ring-navy/10">
          <span className="font-bold text-navy">Hourly pay increase upon admission ($/hr)</span>
          <input type="number" name="hourly" min={0} step={1} defaultValue={DEFAULT_HOURLY} data-field="hourly" className="mt-2 block h-11 w-full rounded-xl bg-cream px-3 font-display text-lg font-bold text-navy outline-none ring-1 ring-navy/15" data-testid="hourly-input" />
        </label>
        <label className="block rounded-2xl bg-white p-3 text-sm text-ink ring-1 ring-navy/10">
          <span className="font-bold text-navy">One-time bar passage bonus ($)</span>
          <input type="number" name="bonus" min={0} step={1} defaultValue={DEFAULT_BONUS} data-field="bonus" className="mt-2 block h-11 w-full rounded-xl bg-cream px-3 font-display text-lg font-bold text-navy outline-none ring-1 ring-navy/15" data-testid="bonus-input" />
        </label>
        <label className="block rounded-2xl bg-white p-3 text-sm text-ink ring-1 ring-navy/10">
          <span className="font-bold text-navy">Paid hours a day affected by the raise</span>
          <input type="number" name="hours" min={0} step={1} defaultValue={8} data-field="hours" className="mt-2 block h-11 w-full rounded-xl bg-cream px-3 font-display text-lg font-bold text-navy outline-none ring-1 ring-navy/15" data-testid="hours-input" />
        </label>
        <label className="block rounded-2xl bg-white p-3 text-sm text-ink ring-1 ring-navy/10">
          <span className="font-bold text-navy">Employer effective date</span>
          <input type="date" name="effective" data-field="effective" className="mt-2 block h-11 w-full rounded-xl bg-cream px-3 font-display text-lg font-bold text-navy outline-none ring-1 ring-navy/15" data-testid="effective-date" />
        </label>
        <p className="text-xs text-ink sm:col-span-2">Used when you pick Raise on admission. Leave the effective date blank if the raise starts the day you are sworn in. Count the bonus only if waiting until December 1 means you lose it.</p>
      </div>
    </>
  );
}

export function CalculatorMcle({ mcle }: { mcle?: { groups: McleGroup[]; source: { label: string; url: string } } }) {
  if (!mcle) return null;
  return (
    <>
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">MCLE compliance group</p>
      <p className="mt-1 font-display text-lg font-extrabold text-navy">First letter of your last name</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3" role="group" aria-label="Last name" data-testid="mcle-cards">
        {mcle.groups.map((g) => (
          <button key={g.id} type="button" data-mcle={g.id} aria-pressed={false} data-testid={`mcle-${g.id}`} className="rounded-2xl bg-cream p-4 text-left text-navy ring-1 ring-navy/15 transition hover:ring-navy/40">
            <span className="block text-xs font-bold uppercase tracking-wide text-ink/70">Last names</span>
            <span className="mt-1 block font-display text-3xl font-extrabold">{g.letters}</span>
            <span className="mt-1 block text-sm font-semibold">Report due {reportLabel(g.report)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
