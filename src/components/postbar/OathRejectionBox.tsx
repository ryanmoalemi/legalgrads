const COURTS = [
  { name: 'Los Angeles Superior Court', href: 'https://www.lacourt.ca.gov/pages/cp/gi-courthouses-all' },
  { name: 'San Francisco Superior Court', href: 'https://sf.courts.ca.gov/' },
  { name: 'San Diego Superior Court', href: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtlocations' },
  { name: 'Orange County Superior Court', href: 'https://www.occourts.org/general-information/locations-contact-info' },
  { name: 'Sacramento Superior Court', href: 'https://www.saccourt.ca.gov/general-information/court-locations' },
];

const CEREMONIES = [
  { name: 'USC Gould', when: 'December 2, 2026', href: 'https://events.law.usc.edu/event/copy-of-2025-usc-gould-bar-admission-ceremony' },
  { name: 'LMU Loyola Law School', when: 'December 6, 2026', href: 'https://www.lls.edu/alumni/alumnievents/2026-2027alumnievents/swearing-inceremonydecember2026/' },
  { name: 'Berkeley Law', when: 'December 8, 2026', href: 'https://www.law.berkeley.edu/academics/registrar/bar-information/state-bar-admission-ceremony-information/' },
];

export function OathRejectionBox() {
  return (
    <aside className="mt-6 rounded-3xl bg-pink/10 p-5 ring-2 ring-pink/40 sm:p-6" data-testid="oath-rejection">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-[#B0124F]">Before you upload</p>
      <h3 className="mt-1 font-display text-2xl font-extrabold text-navy">Don&apos;t get your Oath Packet rejected</h3>
      <p className="mt-2 text-sm text-ink">Two mistakes send the form back and delay your bar number. Both are on CalBar&apos;s own oath instructions.</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-pink/20">
          <p className="font-display font-extrabold text-navy">Date trap</p>
          <p className="mt-1 text-sm text-ink">Your signature date and the administering officer&apos;s jurat date must be the same day. That day is your admission date. Sign the licensee section on the day the oath is given, and make sure the officer dates it that same day. If the two dates differ, the packet does not match CalBar&apos;s rule.</p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-pink/20">
          <p className="font-display font-extrabold text-navy">Electronic seal trap</p>
          <p className="mt-1 text-sm text-ink">A California notary can give the oath only in person. In DocuSign, choose Print &amp; Sign, sign the paper form in front of the notary, and have them stamp an ink seal on the page. Scan that page to PDF and upload the scan. You cannot type a notary commission into DocuSign.</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-navy/10">
        <p className="font-display font-extrabold text-navy">Where to get sworn in free</p>
        <p className="mt-1 text-sm text-ink">A judge or a clerk of any California court of record can administer the oath, so you can skip a notary fee. Call the clerk&apos;s office before you go and ask when someone can swear you in. These are the courts&apos; own sites:</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {COURTS.map((c) => (
            <li key={c.href}><a className="inline-flex min-h-11 items-center rounded-full bg-cream px-3 font-display text-sm font-bold text-purple underline" href={c.href} target="_blank" rel="noopener noreferrer">{c.name}</a></li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink">Law schools also host ceremonies. CalBar says to print the form and follow the organizer. Schedules below are copied from each school&apos;s page. Confirm there before you rely on a date.</p>
        <ul className="mt-2 space-y-1 text-sm">
          {CEREMONIES.map((c) => (
            <li key={c.href}><a className="font-semibold text-purple underline" href={c.href} target="_blank" rel="noopener noreferrer">{c.name}: {c.when}</a></li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs text-ink/80">
        Sources:{' '}
        <a className="font-semibold text-purple underline" href="https://info.calbar.ca.gov/knowledge/en/frequently-asked-questions" target="_blank" rel="noopener noreferrer">CalBar oath FAQ (dates must match)</a>
        {' · '}
        <a className="font-semibold text-purple underline" href="https://info.calbar.ca.gov/knowledge/en/step-5" target="_blank" rel="noopener noreferrer">Step 5, Print &amp; Sign for a notary</a>
        {' · '}
        <a className="font-semibold text-purple underline" href="https://www.calbar.ca.gov/admissions/examinations/california-bar-examination/attorneys-oath" target="_blank" rel="noopener noreferrer">Who may administer the oath</a>
      </p>
    </aside>
  );
}
