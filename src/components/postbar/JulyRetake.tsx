const MBE_IN = [
  ['Alabama', ''],
  ['Florida', ''],
  ['Idaho', ''],
  ['Kansas', ''],
  ['Michigan', 'Reciprocal only'],
  ['Minnesota', ''],
  ['Mississippi', ''],
  ['Missouri', ''],
  ['North Dakota', ''],
  ['Northern Mariana Islands', ''],
  ['Oklahoma', 'Concurrent only'],
  ['Palau', ''],
  ['South Dakota', ''],
  ['Virgin Islands', ''],
  ['Virginia', ''],
  ['West Virginia', ''],
  ['Wisconsin', ''],
] as const;

export function JulyRetake() {
  return (
    <div className="space-y-5 text-ink" data-testid="july-retake">
      <p className="rounded-2xl bg-pink/10 p-4 text-navy ring-1 ring-pink/30">
        <b>July 2026 results:</b> the State Bar released scores to applicants on October 30, 2026, through the Applicant Portal. The public pass list was set for November 2, 2026, at 8:00 a.m. On the two-day General Bar Exam, 48.3% passed (3,838 of 7,942). First-time takers: 64.7%. Repeat takers: 14.1%. California ABA schools as a group had a preliminary first-time rate of 78.1%. School-by-school July 2026 rates are not on the exam statistics page yet.
      </p>
      <p>California is not a UBE state. A score under 1390 is not passing. The essays and the MBE are not portable as a UBE score, and California does not accept an MBE score transferred in from another state.</p>
      <div>
        <h3 className="font-display text-lg font-extrabold text-navy">February 2027 retake: fees and deadlines</h3>
        <p className="mt-2">The exam is February 23 and 24, 2027. A general applicant pays <b className="text-navy">$878</b> (Rule 4.61(A)) plus <b className="text-navy">$153</b> if you type on a laptop. We did not find a Rule 2.15 or 2.16 discount on the exam fee. Those rules scale the annual license fee, not this application.</p>
        <ul className="mt-3 space-y-2">
          <li><b className="text-navy">Sat every session of July 2026 (immediate repeater):</b> application opened October 30 after 4:00 p.m. Timely filing is November 13, 2026. A $50 late fee runs November 14 through December 8. A $250 late fee runs December 9, 2026 through January 4, 2027.</li>
          <li><b className="text-navy">Did not sit July 2026, or missed a session:</b> timely filing is November 2, 2026. A $50 late fee runs November 3 through 30. A $250 late fee runs December 1, 2026 through January 4, 2027.</li>
        </ul>
      </div>
      <div>
        <h3 className="font-display text-lg font-extrabold text-navy">AccessLex fee credit</h3>
        <p className="mt-2">AccessLex ran a sweepstakes credit for the $878 application and $153 laptop (about $1,031). The September drawing, for February 2027, closed its entry window on September 3, 2026. Those credits expire at the November 2 timely deadline and do not cover late fees. The entry window that is open from October 1, 2026 through February 1, 2027 is for the July 2027 exam, and the rules limit it to people sitting for the first time. A July 2026 retake is not that drawing.</p>
      </div>
      <div>
        <h3 className="font-display text-lg font-extrabold text-navy">Where a California MBE score can be sent</h3>
        <p className="mt-2">NCBE lists California as a state that lets NCBE transfer an MBE score out. NCBE&apos;s separate list of places that accept a transferred MBE score, updated June 3, 2026, is below. This is not a UBE transfer, and it is not a promise that your score will qualify. Each place sets its own minimum and how old a score can be. An official transcript is $30 from NCBE. Ask the destination before you rely on it.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {MBE_IN.map(([name, note]) => (
            <li key={name} className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-navy">{name}{note ? ` (${note})` : ''}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm">Canada&apos;s FLSC is also on NCBE&apos;s accept list. It is not a U.S. state bar.</p>
      </div>
      <ul className="space-y-1 text-sm">
        <li><a className="text-purple underline" href="https://www.calbar.ca.gov/news/state-bar-announces-july-2026-bar-exam-results" target="_blank" rel="noopener noreferrer">CalBar: July 2026 results (48.3%, 64.7%, 14.1%)</a></li>
        <li><a className="text-purple underline" href="https://www.calbar.ca.gov/admissions/examinations/california-bar-examination/california-bar-exam-results" target="_blank" rel="noopener noreferrer">CalBar: results release and November 2 pass list</a></li>
        <li><a className="text-purple underline" href="https://www.calbar.ca.gov/admissions/examinations/california-bar-examination/february-2027-california-bar-exam" target="_blank" rel="noopener noreferrer">CalBar: February 2027 dates and filing deadlines</a></li>
        <li><a className="text-purple underline" href="https://www.calbar.ca.gov/admissions/examinations/california-bar-examination/california-bar-exam-grading" target="_blank" rel="noopener noreferrer">CalBar: no inbound MBE transfer</a></li>
        <li><a className="text-purple underline" href="https://help2.ncbex.org/hc/en-us/articles/47606153787291-Which-jurisdictions-authorize-NCBE-to-perform-MBE-Score-Transfers" target="_blank" rel="noopener noreferrer">NCBE: California authorizes outbound MBE transfers</a></li>
        <li><a className="text-purple underline" href="https://help2.ncbex.org/hc/en-us/articles/47592157318171-Which-jurisdictions-accept-transferred-MBE-scores" target="_blank" rel="noopener noreferrer">NCBE: who accepts a transferred MBE score</a></li>
        <li><a className="text-purple underline" href="https://www.accesslex.org/tools-and-resources/accesslex-california-bar-exam-application-fee-sweepstakes-official-rules" target="_blank" rel="noopener noreferrer">AccessLex sweepstakes rules</a></li>
      </ul>
    </div>
  );
}
