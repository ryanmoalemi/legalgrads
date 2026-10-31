type School = {
  name: string;
  href: string;
  linkLabel: string;
  when: string;
  who: string;
  fee: string | null;
};

const SCHOOLS: School[] = [
  { name: 'California Western School of Law', href: 'https://www.cwsl.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'Chapman University Fowler School of Law', href: 'https://www.chapman.edu/law', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  {
    name: 'Loyola Law School',
    href: 'https://www.lls.edu/alumni/alumnievents/2026-2027alumnievents/swearing-inceremonydecember2026/',
    linkLabel: 'LLS ceremony page',
    when: 'Dec. 6, 2026, 10:00 a.m. Lawn, 919 Albany Street, Los Angeles. Location is on the LMU event calendar. The LLS page states the time and that registration opens Nov. 6.',
    who: 'Listed as an alumni event for new attorneys. A guest limit is not stated on the pages checked.',
    fee: 'After Dec. 1. A same-day oath is the $0 Rule 2.12 first-year license fee on the 2026 schedule.',
  },
  { name: 'Pepperdine Caruso School of Law', href: 'https://law.pepperdine.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'Santa Clara University School of Law', href: 'https://www.scu.edu/law', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'Southwestern Law School', href: 'https://www.swlaw.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'Stanford Law School', href: 'https://www.law.stanford.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  {
    name: 'UC Berkeley Law',
    href: 'https://www.law.berkeley.edu/academics/registrar/bar-information/state-bar-admission-ceremony-information/',
    linkLabel: 'Berkeley ceremony page',
    when: 'Dec. 8, 2026, 5:30 p.m. Chevron Auditorium, International House, 2299 Piedmont Ave, Berkeley.',
    who: 'Berkeley Law graduates. Up to two guests. In person is required to be sworn in. Already sworn graduates may attend.',
    fee: 'After Dec. 1. A same-day oath is the $0 Rule 2.12 first-year license fee on the 2026 schedule.',
  },
  { name: 'UC Davis School of Law', href: 'https://www.law.ucdavis.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'UC Irvine School of Law', href: 'https://www.law.uci.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'UC Law San Francisco', href: 'https://www.uclawsf.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  {
    name: 'UCLA School of Law',
    href: 'https://libguides.law.ucla.edu/calbarexam/barresults',
    linkLabel: 'UCLA bar results guide',
    when: 'TBA. The library guide says an alumni ceremony is in early December and does not give a 2026 date or place.',
    who: 'The guide says the ceremony is for UCLA Law graduates who pass the July exam. No 2026 guest rule is published.',
    fee: null,
  },
  { name: 'University of San Diego School of Law', href: 'https://www.sandiego.edu/usdlaw', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'University of San Francisco School of Law', href: 'https://www.usfca.edu/law', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  {
    name: 'USC Gould School of Law',
    href: 'https://events.law.usc.edu/event/copy-of-2025-usc-gould-bar-admission-ceremony',
    linkLabel: 'USC ceremony page',
    when: 'Dec. 2, 2026, 6:00 to 8:00 p.m. Bovard Auditorium, 3551 Trousdale Parkway, Los Angeles.',
    who: 'USC Gould alumni only. Recent graduates who passed the July 2026 California bar. State Bar and federal court oaths.',
    fee: 'After Dec. 1. A same-day oath is the $0 Rule 2.12 first-year license fee on the 2026 schedule.',
  },
  { name: 'University of the Pacific, McGeorge', href: 'https://www.mcgeorge.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
  { name: 'Western State College of Law', href: 'https://www.wsulaw.edu', linkLabel: 'School site', when: 'TBA', who: 'Not published', fee: null },
];

export function CaLawSchools() {
  const dated = SCHOOLS.filter((s) => s.fee);
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="ca-law-schools">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Swearing-in calendar</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">California ABA law schools</h2>
      <p className="mt-2 text-ink">CalBar&apos;s law-school directory lists 17 ABA-approved schools. The education page still says the ABA accredits 18 schools in California. Golden Gate is in the California-accredited section as a former ABA school teaching out through 2027, so it is not in this table.</p>
      <div className="mt-4 rounded-2xl bg-mint/15 p-4 text-sm text-navy" data-testid="december-fee-callout">
        <p className="font-display font-extrabold">Early December ceremonies with a published date</p>
        <p className="mt-1">These three are after December 1. If you take the oath that day, Rule 2.12 lists no first-year license fee on the 2026 schedule. Estimated using 2026 fees. A November oath is still $299 even if the party is later.</p>
        <ul className="mt-2 space-y-1">
          {dated.map((s) => <li key={s.name}><b>{s.name}:</b> {s.when}</li>)}
        </ul>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-ink">
          <thead>
            <tr className="border-b border-navy/10 font-display text-xs uppercase tracking-wide text-navy">
              <th className="py-2 pr-3">School</th>
              <th className="py-2 pr-3">Dec 2026 swearing-in</th>
              <th className="py-2 pr-3">Who can attend</th>
              <th className="py-2">Official link</th>
            </tr>
          </thead>
          <tbody>
            {SCHOOLS.map((s) => (
              <tr key={s.name} className="border-b border-navy/5 align-top">
                <td className="py-3 pr-3 font-semibold text-navy">{s.name}</td>
                <td className="py-3 pr-3">{s.when}{s.fee ? <><br /><span className="text-xs text-ink/80">{s.fee}</span></> : null}</td>
                <td className="py-3 pr-3">{s.who}</td>
                <td className="py-3"><a className="font-semibold text-purple underline" href={s.href} target="_blank" rel="noopener noreferrer">{s.linkLabel}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-ink">No date here was guessed. UCLA&apos;s guide mentions early December without a 2026 day, so it is TBA and not a fee callout. Sources: <a className="text-purple underline" href="https://www.calbar.ca.gov/admissions/law-schools/law-schools-directory" target="_blank" rel="noopener noreferrer">CalBar directory</a> and <a className="text-purple underline" href="https://www.calbar.ca.gov/education" target="_blank" rel="noopener noreferrer">CalBar education page</a>.</p>
    </section>
  );
}
