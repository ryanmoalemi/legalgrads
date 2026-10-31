const SCHOOLS: { name: string; href: string; linkLabel: string; ceremony: string; fee: string }[] = [
  { name: 'California Western School of Law', href: 'https://www.cwsl.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'Chapman University Fowler School of Law', href: 'https://www.chapman.edu/law', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'Loyola Law School', href: 'https://www.lls.edu/alumni/alumnievents/2026-2027alumnievents/swearing-inceremonydecember2026/', linkLabel: 'Dec 6, 2026 ceremony', ceremony: 'Dec. 6, 2026, 10 a.m.', fee: 'After Dec. 1, so a same-day oath is the $0 Rule 2.12 first license fee' },
  { name: 'Pepperdine Caruso School of Law', href: 'https://law.pepperdine.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'Santa Clara University School of Law', href: 'https://www.scu.edu/law', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'Southwestern Law School', href: 'https://www.swlaw.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'Stanford Law School', href: 'https://www.law.stanford.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'UC Berkeley Law', href: 'https://www.law.berkeley.edu/academics/registrar/bar-information/state-bar-admission-ceremony-information/', linkLabel: 'Dec 8, 2026 ceremony', ceremony: 'Dec. 8, 2026, 5:30 p.m., Chevron Auditorium, International House', fee: 'After Dec. 1, so a same-day oath is the $0 Rule 2.12 first license fee' },
  { name: 'UC Davis School of Law', href: 'https://www.law.ucdavis.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'UC Irvine School of Law', href: 'https://www.law.uci.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'UC Law San Francisco', href: 'https://www.uclawsf.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No December 2026 date found, so no December fee claim' },
  { name: 'UCLA School of Law', href: 'https://libguides.law.ucla.edu/calbarexam/barresults', linkLabel: 'Bar results guide', ceremony: 'TBA / check school. The library guide says an alumni ceremony is in early December and does not give a 2026 date.', fee: 'No exact date, so no December fee claim' },
  { name: 'University of San Diego School of Law', href: 'https://www.sandiego.edu/usdlaw', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'University of San Francisco School of Law', href: 'https://www.usfca.edu/law', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'USC Gould School of Law', href: 'https://events.law.usc.edu/event/copy-of-2025-usc-gould-bar-admission-ceremony', linkLabel: 'Dec 2, 2026 ceremony', ceremony: 'Dec. 2, 2026, 6:00 p.m., Bovard Auditorium', fee: 'After Dec. 1, so a same-day oath is the $0 Rule 2.12 first license fee' },
  { name: 'University of the Pacific, McGeorge', href: 'https://www.mcgeorge.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
  { name: 'Western State College of Law', href: 'https://www.wsulaw.edu', linkLabel: 'School site', ceremony: 'TBA / check school', fee: 'No 2026 date found, so no December fee claim' },
];

export function CaLawSchools() {
  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="ca-law-schools">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Swearing-in calendar</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">California ABA law schools</h2>
      <p className="mt-2 text-ink">CalBar&apos;s law-school directory lists these 17 ABA-approved schools. The State Bar education page still says the ABA accredits 18 schools in California. Golden Gate is not on the directory list we checked, so it is not in this table. July 2026 pass rates by school are not posted. The latest statistics index still stops at July 2025.</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm text-ink">
          <thead>
            <tr className="border-b border-navy/10 font-display text-xs uppercase tracking-wide text-navy">
              <th className="py-2 pr-3">School</th>
              <th className="py-2 pr-3">Dec 2026 swearing-in</th>
              <th className="py-2 pr-3">First-time pass rate</th>
              <th className="py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {SCHOOLS.map((s) => (
              <tr key={s.name} className="border-b border-navy/5 align-top">
                <td className="py-3 pr-3 font-semibold text-navy">{s.name}</td>
                <td className="py-3 pr-3">{s.ceremony}<br /><span className="text-xs text-ink/80">{s.fee}</span></td>
                <td className="py-3 pr-3">July 2026 by school: not posted</td>
                <td className="py-3"><a className="font-semibold text-purple underline" href={s.href} target="_blank" rel="noopener noreferrer">{s.linkLabel}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-ink">A December ceremony saves the $299 half-year fee only if you actually take the oath on that December date. Swearing in during November is still $299 even if your school&apos;s party is later. Sources: <a className="text-purple underline" href="https://www.calbar.ca.gov/admissions/law-schools/law-schools-directory" target="_blank" rel="noopener noreferrer">CalBar law school directory</a>, <a className="text-purple underline" href="https://www.calbar.ca.gov/admissions/applicant-resources/exam-statistics" target="_blank" rel="noopener noreferrer">exam statistics</a>, and the ceremony pages linked in the table.</p>
    </section>
  );
}
