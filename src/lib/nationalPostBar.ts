import { applyDeep } from '@/lib/postBarDeep';

// National post-bar facts checked on Nov 10, 2026.
// California stays in post-bar-licensing.json and is not repeated here.
// A figure is "Not published" when the official page we opened did not state it.

export const CHECKED = '2026-11-10';
export const NOT_PUBLISHED = 'Not published';

export type Src = { label: string; url: string };

export function sourceKey(src: Src) {
  return src.url || src.label;
}

export type CostLine = {
  label: string;
  amount: number | null;
  note: string;
  source: Src;
};

export type CeremonyRow = {
  name: string;
  when: string;
  fee: string;
  href: string | null;
};

export type NameGroup = { id: string; name: string; detail: string };

export type Faq = { q: string; a: string };

export type FeeTool =
  | { kind: 'florida' }
  | {
      kind: 'texas';
      license: number;
      legalServices: number;
      months: { id: string; label: string; dues: number; note?: string }[];
    }
  | { kind: 'illinois' };

export type NationalState = {
  slug: string;
  name: string;
  abbr: string;
  licensingBody: string;
  lastVerified: string;
  upfront: { low: number; high: number; label: string } | null;
  upfrontNote: string;
  ube: boolean;
  ubeShort: string;
  ubeDetail: string;
  passScore: string;
  passScoreDetail: string;
  firstYearCle: { required: boolean | null; hours: number | null; short: string };
  cleDetail: string;
  feeRelief: boolean;
  feeReliefShort: string;
  inPersonFirstYear: boolean;
  resultsRelease: string;
  passRate: string;
  passRateDetail: string;
  costs: CostLine[];
  ceremonies: CeremonyRow[];
  groups: NameGroup[] | null;
  groupNote: string | null;
  feeTool: FeeTool | null;
  faqs: Faq[];
  sources: Src[];
  heldRoster: boolean;
  gaps?: { field: string; detail: string }[];
};

const UBE_LIST: Src = {
  label: 'NCBE list of UBE jurisdictions',
  url: 'https://www.ncbex.org/exams/ube/list-ube-jurisdictions',
};
const UBE_SCORES: Src = {
  label: 'NCBE minimum passing UBE scores',
  url: 'https://www.ncbex.org/exams/ube/ube-minimum-scores',
};
const NEXTGEN: Src = {
  label: 'NCBE NextGen adoption table, updated Nov 6, 2026',
  url: 'https://www.ncbex.org/exams/nextgen/nextgen-ube-scores-score-portability/nextgen-ube-adoption-jurisdiction',
};

const LEGACY_NOTE = 'NCBE minimum passing score for the legacy UBE. The same chart says jurisdictions that have moved to the NextGen UBE may still accept older scores. Checked Nov 10, 2026. Confirm with the board before you transfer a score.';

type Seed = {
  abbr: string;
  name: string;
  body: string;
  bodyUrl?: string;
  ube: boolean;
  score: string | null;
  scoreDetail?: string;
  scoreSource?: Src;
};

const SCORE_260 = '260';
const SCORE_264 = '264';
const SCORE_266 = '266';
const SCORE_268 = '268';
const SCORE_270 = '270';

const SEEDS: Seed[] = [
  { abbr: 'AL', name: 'Alabama', body: 'Alabama State Bar', bodyUrl: 'https://admissions.alabar.org/', ube: true, score: SCORE_260 },
  { abbr: 'AK', name: 'Alaska', body: 'Alaska Bar Association', bodyUrl: 'https://alaskabar.org/', ube: true, score: SCORE_270 },
  { abbr: 'AZ', name: 'Arizona', body: 'Arizona Supreme Court, attorney admissions', bodyUrl: 'https://www.azcourts.gov/cld/Attorney-Admissions', ube: true, score: SCORE_270 },
  { abbr: 'AR', name: 'Arkansas', body: 'Arkansas Judiciary', bodyUrl: 'https://arcourts.gov/', ube: true, score: SCORE_270 },
  { abbr: 'CO', name: 'Colorado', body: 'Colorado bar admissions', ube: true, score: SCORE_270 },
  { abbr: 'CT', name: 'Connecticut', body: 'Connecticut Bar Examining Committee', bodyUrl: 'https://www.jud.ct.gov/cbec/', ube: true, score: '616', scoreSource: NEXTGEN, scoreDetail: 'NCBE lists Connecticut\'s first NextGen UBE as July 2026, with a minimum passing score of 616. Table updated Nov 6, 2026. Checked Nov 10, 2026.' },
  { abbr: 'DE', name: 'Delaware', body: 'Delaware Board of Bar Examiners', bodyUrl: 'https://courts.delaware.gov/bbe/', ube: false, score: null },
  { abbr: 'DC', name: 'District of Columbia', body: 'District of Columbia Bar', bodyUrl: 'https://dcbar.org/for-lawyers/membership/membership-classes-fees', ube: true, score: SCORE_266 },
  { abbr: 'FL', name: 'Florida', body: 'The Florida Bar', bodyUrl: 'https://www.floridabar.org/member/cle/general-cle-info-and-requirements/bscr-faq/', ube: false, score: null },
  { abbr: 'GA', name: 'Georgia', body: 'State Bar of Georgia', bodyUrl: 'https://www.gabar.org/lawyers/how-to-join-the-bar/new-membership-(by-exam)-enrollment-information', ube: false, score: null },
  { abbr: 'HI', name: 'Hawaii', body: 'Hawaii State Judiciary bar applications', bodyUrl: 'https://www.courts.state.hi.us/legal_references/bar_application', ube: false, score: null },
  { abbr: 'ID', name: 'Idaho', body: 'Idaho State Bar admissions', bodyUrl: 'https://isb.idaho.gov/admissions/', ube: true, score: '616', scoreSource: NEXTGEN, scoreDetail: 'NCBE lists Idaho\'s first NextGen UBE as July 2026, with a minimum passing score of 616. Table updated Nov 6, 2026. Checked Nov 10, 2026.' },
  { abbr: 'IL', name: 'Illinois', body: 'ARDC and the Illinois MCLE Board', bodyUrl: 'https://registration.iardc.org/attyreg/Registration/Registration_Department/FAQs/Registration/regdept/2026_Fee_Schedule.aspx', ube: true, score: SCORE_266 },
  { abbr: 'IN', name: 'Indiana', body: 'Indiana Office of Admissions and Continuing Education', bodyUrl: 'https://www.in.gov/courts/ace/', ube: true, score: SCORE_264 },
  { abbr: 'IA', name: 'Iowa', body: 'Iowa Judicial Branch, attorney admissions', bodyUrl: 'https://www.iowacourts.gov/opr/attorneys/admissions', ube: true, score: SCORE_260, scoreDetail: 'NCBE lists 260 for the July 2026 legacy UBE and later legacy administrations. The same footnote says the score is 266 for exams before July 2026. Iowa\'s first NextGen administration on the Nov 6, 2026 table is July 2027. Checked Nov 10, 2026.' },
  { abbr: 'KS', name: 'Kansas', body: 'Kansas Board of Law Examiners', ube: true, score: SCORE_266 },
  { abbr: 'KY', name: 'Kentucky', body: 'Kentucky Bar Association', bodyUrl: 'https://kybar.org/', ube: true, score: SCORE_266 },
  { abbr: 'LA', name: 'Louisiana', body: 'Louisiana Supreme Court Committee on Bar Admissions', bodyUrl: 'https://www.lascba.org/', ube: false, score: null },
  { abbr: 'ME', name: 'Maine', body: 'Maine Board of Bar Examiners', bodyUrl: 'https://mainebarexaminers.org/', ube: true, score: SCORE_270 },
  { abbr: 'MD', name: 'Maryland', body: 'Maryland State Board of Law Examiners', ube: true, score: '616', scoreSource: NEXTGEN, scoreDetail: 'NCBE lists Maryland\'s first NextGen UBE as July 2026, with a minimum passing score of 616. Table updated Nov 6, 2026. Checked Nov 10, 2026.' },
  { abbr: 'MA', name: 'Massachusetts', body: 'Massachusetts Supreme Judicial Court and Board of Bar Overseers', bodyUrl: 'https://www.mass.gov/news/supreme-judicial-court-repeals-rule-316-requiring-newly-admitted-lawyers-to-complete-practicing-with-professionalism-course', ube: true, score: SCORE_270 },
  { abbr: 'MI', name: 'Michigan', body: 'Michigan Supreme Court committees and boards', bodyUrl: 'https://www.courts.michigan.gov/administration/committees-boards/', ube: true, score: SCORE_268 },
  { abbr: 'MN', name: 'Minnesota', body: 'Minnesota Board of Law Examiners', bodyUrl: 'https://www.ble.mn.gov/', ube: true, score: SCORE_260 },
  { abbr: 'MS', name: 'Mississippi', body: 'Mississippi bar admissions', bodyUrl: 'https://courts.ms.gov/bar/baradmissions/baradmissions.php', ube: false, score: null },
  { abbr: 'MO', name: 'Missouri', body: 'Missouri Board of Law Examiners', ube: true, score: '610', scoreSource: NEXTGEN, scoreDetail: 'NCBE lists Missouri\'s first NextGen UBE as July 2026, with a minimum passing score of 610. Table updated Nov 6, 2026. Checked Nov 10, 2026.' },
  { abbr: 'MT', name: 'Montana', body: 'State Bar of Montana', bodyUrl: 'https://www.montanabar.org/', ube: true, score: SCORE_266 },
  { abbr: 'NE', name: 'Nebraska', body: 'Nebraska Judicial Branch', bodyUrl: 'https://nebraskajudicial.gov/', ube: true, score: SCORE_270 },
  { abbr: 'NV', name: 'Nevada', body: 'State Bar of Nevada', bodyUrl: 'https://nvbar.org/', ube: false, score: null },
  { abbr: 'NH', name: 'New Hampshire', body: 'New Hampshire Bar Association', bodyUrl: 'https://www.nhbar.org/', ube: true, score: SCORE_270 },
  { abbr: 'NJ', name: 'New Jersey', body: 'New Jersey Courts and Board of Bar Examiners', bodyUrl: 'https://www.njcourts.gov/attorneys/attorney-registration', ube: true, score: SCORE_266 },
  { abbr: 'NM', name: 'New Mexico', body: 'New Mexico Board of Bar Examiners', ube: true, score: SCORE_260 },
  { abbr: 'NY', name: 'New York', body: 'New York State Board of Law Examiners and the Attorney Registration Unit', bodyUrl: 'https://www.nybarexam.org/', ube: true, score: SCORE_266, scoreSource: { label: 'New York transferred UBE score rules', url: 'https://www.nybarexam.org/TUBE.html' }, scoreDetail: 'The New York State Board of Law Examiners says the passing UBE score is 266 on a 400-point scale. Checked Nov 10, 2026.' },
  { abbr: 'NC', name: 'North Carolina', body: 'North Carolina Board of Law Examiners', ube: true, score: SCORE_270 },
  { abbr: 'ND', name: 'North Dakota', body: 'North Dakota Board of Law Examiners', bodyUrl: 'https://www.ndcourts.gov/supreme-court/committees/board-of-law-examiners', ube: true, score: SCORE_260 },
  { abbr: 'OH', name: 'Ohio', body: 'Supreme Court of Ohio', bodyUrl: 'https://www.supremecourt.ohio.gov/attorneys/admission-to-the-practice-of-law-in-ohio/', ube: true, score: SCORE_270 },
  { abbr: 'OK', name: 'Oklahoma', body: 'Oklahoma Board of Bar Examiners', ube: true, score: SCORE_260 },
  { abbr: 'OR', name: 'Oregon', body: 'Oregon State Bar admissions', bodyUrl: 'https://www.osbar.org/admissions', ube: true, score: '615', scoreSource: NEXTGEN, scoreDetail: 'NCBE says the Oregon Supreme Court set the July 2026 NextGen pass score at 615, and the score after July 2026 at 620. Table updated Nov 6, 2026. Checked Nov 10, 2026.' },
  { abbr: 'PA', name: 'Pennsylvania', body: 'Disciplinary Board of the Supreme Court of Pennsylvania and the PA CLE Board', bodyUrl: 'https://padisciplinaryboard.org/for-attorneys/resources', ube: true, score: SCORE_270 },
  { abbr: 'RI', name: 'Rhode Island', body: 'Rhode Island Judiciary attorney resources', bodyUrl: 'https://www.courts.ri.gov/attorney-resources/Pages/default.aspx', ube: true, score: SCORE_270 },
  { abbr: 'SC', name: 'South Carolina', body: 'South Carolina bar admissions', ube: true, score: SCORE_266 },
  { abbr: 'SD', name: 'South Dakota', body: 'South Dakota Unified Judicial System', bodyUrl: 'https://ujs.sd.gov/', ube: false, score: null },
  { abbr: 'TN', name: 'Tennessee', body: 'Tennessee Board of Law Examiners', bodyUrl: 'https://tnble.org/announcements/update-regarding-release-of-july-2026-bar-examination-results/', ube: true, score: SCORE_270 },
  { abbr: 'TX', name: 'Texas', body: 'State Bar of Texas and the Board of Law Examiners', bodyUrl: 'https://www.texasbar.com/AM/Template.cfm?ContentID=29060&Section=New_Lawyer_Forms_and_Fees1&Template=/CM/ContentDisplay.cfm', ube: true, score: SCORE_270 },
  { abbr: 'UT', name: 'Utah', body: 'Utah State Bar', bodyUrl: 'https://www.utahbar.org/', ube: true, score: SCORE_260 },
  { abbr: 'VT', name: 'Vermont', body: 'Vermont Judiciary, attorneys', bodyUrl: 'https://www.vtcourts.gov/attorneys', ube: true, score: SCORE_270 },
  { abbr: 'VA', name: 'Virginia', body: 'Virginia Board of Bar Examiners', bodyUrl: 'https://barexam.virginia.gov/results', ube: false, score: null },
  { abbr: 'WA', name: 'Washington', body: 'Washington State Bar Association', bodyUrl: 'https://www.wsba.org/', ube: true, score: '610', scoreSource: NEXTGEN, scoreDetail: 'NCBE lists Washington\'s first NextGen UBE as July 2026, with a minimum passing score of 610. Table updated Nov 6, 2026. Checked Nov 10, 2026.' },
  { abbr: 'WV', name: 'West Virginia', body: 'West Virginia Judiciary bar admissions', bodyUrl: 'https://www.courtswv.gov/legal-community/bar-admissions', ube: true, score: SCORE_270 },
  { abbr: 'WI', name: 'Wisconsin', body: 'Wisconsin Court System, attorney licensing', bodyUrl: 'https://www.wicourts.gov/services/attorney/bar.htm', ube: true, score: null, scoreDetail: 'NCBE lists Wisconsin as a UBE jurisdiction with a first administration in July 2026. Wisconsin is not on the legacy minimum-score table checked Nov 10, 2026.' },
  { abbr: 'WY', name: 'Wyoming', body: 'Wyoming State Bar', ube: true, score: SCORE_270 },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function fromSeed(seed: Seed): NationalState {
  const sources: Src[] = [UBE_LIST];
  if (seed.score) sources.push(seed.scoreSource ?? UBE_SCORES);
  else sources.push(UBE_SCORES);
  if (seed.bodyUrl) sources.push({ label: seed.body, url: seed.bodyUrl });
  const sdNote = seed.abbr === 'SD'
    ? ' South Dakota is not on the legacy UBE list. NCBE\'s Nov 6, 2026 NextGen table says it accepts transferred NextGen scores from July 2026 at 620 and will first give the NextGen UBE in July 2027.'
    : '';
  return {
    slug: slugify(seed.name),
    name: seed.name,
    abbr: seed.abbr,
    licensingBody: seed.body,
    lastVerified: CHECKED,
    upfront: null,
    upfrontNote: NOT_PUBLISHED,
    ube: seed.ube,
    ubeShort: seed.ube ? 'Yes' : 'No',
    ubeDetail: seed.ube
      ? 'Listed by NCBE as a UBE jurisdiction. Checked Nov 10, 2026.'
      : `Not on the NCBE list of UBE jurisdictions checked Nov 10, 2026.${sdNote}`,
    passScore: seed.score ?? NOT_PUBLISHED,
    passScoreDetail: seed.scoreDetail ?? (seed.score ? LEGACY_NOTE : 'No passing score was on the NCBE UBE score chart for this jurisdiction. Checked Nov 10, 2026.'),
    firstYearCle: { required: null, hours: null, short: NOT_PUBLISHED },
    cleDetail: NOT_PUBLISHED,
    feeRelief: false,
    feeReliefShort: NOT_PUBLISHED,
    inPersonFirstYear: false,
    resultsRelease: NOT_PUBLISHED,
    passRate: NOT_PUBLISHED,
    passRateDetail: NOT_PUBLISHED,
    costs: [],
    ceremonies: [],
    groups: null,
    groupNote: null,
    feeTool: null,
    faqs: [],
    sources,
    heldRoster: seed.abbr === 'LA',
  };
}

const TX_FEES: Src = {
  label: 'State Bar of Texas 2026-2027 licensing fees schedule',
  url: 'https://www.texasbar.com/AM/Template.cfm?ContentID=29060&Section=New_Lawyer_Forms_and_Fees1&Template=/CM/ContentDisplay.cfm',
};
const TX_BAKER: Src = {
  label: 'Justice James A. Baker Guide to Ethics and Professionalism in Texas',
  url: 'https://www.legalethicstexas.com/cle-courses/justice-james-a-baker-guide-to-ethics-and-professionalism-in-texas/',
};
const FL_RULE: Src = {
  label: 'Florida Rule 1-7.3, membership fees (June 2026 chapter)',
  url: 'https://www-media.floridabar.org/uploads/2026/06/2026_12-JUNE-Chapter-1-RRTFB-1.pdf',
};
const FL_BSCR: Src = {
  label: 'Florida Bar Basic Skills Course Requirement FAQ',
  url: 'https://www.floridabar.org/member/cle/general-cle-info-and-requirements/bscr-faq/',
};
const IL_FEE: Src = {
  label: 'ARDC 2026 registration fee schedule',
  url: 'https://registration.iardc.org/attyreg/Registration/Registration_Department/FAQs/Registration/regdept/2026_Fee_Schedule.aspx',
};
const IL_MCLE: Src = {
  label: 'Illinois MCLE Board, newly admitted requirements',
  url: 'https://www.mcleboard.org/files/FAQs/Attorney_FAQs/Post_Transcript_NAA_Requirements/As_a_newly_admitted_attorney_what_are_my_MCLE_requirements_and_deadlines.aspx',
};
const NY_REG: Src = {
  label: 'New York biennial attorney registration',
  url: 'https://www.nycourts.gov/biennial-attorney-registration/biennial-attorney-registration',
};
const NY_CLE: Src = {
  label: 'New York CLE FAQs for newly admitted attorneys',
  url: 'https://www.nycourts.gov/continuing-legal-education-cle/faqs-newly-admitted-attorneys',
};
const NY_TUBE: Src = {
  label: 'New York application by transferred UBE score',
  url: 'https://www.nybarexam.org/TUBE.html',
};
const NY_HOME: Src = {
  label: 'New York Board of Law Examiners',
  url: 'https://www.nybarexam.org/',
};
const NY_PRESS: Src = {
  label: 'New York July 2026 exam results press release (Oct 23, 2026)',
  url: 'https://www.nybarexam.org/Press/20261023%20FinalPressRelease_ExamResults.pdf',
};
const NY_ADMISSION: Src = {
  label: 'New York admission information',
  url: 'https://www.nybarexam.org/admission/admission.htm',
};
const DC_FEES: Src = {
  label: 'DC Bar membership classes and fees (July 1, 2026 to June 30, 2027)',
  url: 'https://dcbar.org/for-lawyers/membership/membership-classes-fees',
};
const DC_COURSE: Src = {
  label: 'DC Bar mandatory course',
  url: 'https://www.dcbar.org/for-lawyers/mandatory-course',
};
const NJ_REG: Src = {
  label: 'New Jersey annual attorney registration',
  url: 'https://www.njcourts.gov/attorneys/attorney-registration',
};
const NJ_NEWS: Src = {
  label: 'New Jersey Board of Bar Examiners, July 2026 results notice',
  url: 'https://www.njbarexams.org/news.action?id=2563',
};
const PA_RES: Src = {
  label: 'Disciplinary Board of Pennsylvania attorney resources',
  url: 'https://padisciplinaryboard.org/for-attorneys/resources',
};
const PA_CLE: Src = {
  label: 'Pennsylvania CLE Board FAQ',
  url: 'https://www.pacle.org/faq',
};
const GA_JOIN: Src = {
  label: 'State Bar of Georgia new membership by exam',
  url: 'https://www.gabar.org/lawyers/how-to-join-the-bar/new-membership-(by-exam)-enrollment-information',
};
const GA_FEE: Src = {
  label: 'State Bar of Georgia new member license fee notice',
  url: 'https://www.gabar.org/docs/default-source/membership/join/licensefeenoticeprorationschedule.pdf',
};
const GA_TILPP: Src = {
  label: 'Georgia Transition Into Law Practice Program',
  url: 'https://www.gabar.org/programs/transition-into-law-practice-program',
};
const MA_REPEAL: Src = {
  label: 'SJC press release repealing Rule 3:16 (Aug 19, 2024)',
  url: 'https://www.mass.gov/news/supreme-judicial-court-repeals-rule-316-requiring-newly-admitted-lawyers-to-complete-practicing-with-professionalism-course',
};
const TN_RESULTS: Src = {
  label: 'Tennessee Board of Law Examiners, July 2026 results release update',
  url: 'https://tnble.org/announcements/update-regarding-release-of-july-2026-bar-examination-results/',
};
const VA_RESULTS: Src = {
  label: 'Virginia Board of Bar Examiners results',
  url: 'https://barexam.virginia.gov/results',
};
const VA_EMAIL: Src = {
  label: 'Virginia State Bar, Regulatory Compliance/Membership, email to LegalGrads, Nov 11, 2026',
  url: '',
};

const TX_MONTHS: { id: string; label: string; dues: number; note?: string }[] = [
  ['2026-06', 'Jun 2026', 74],
  ['2026-07', 'Jul 2026', 74],
  ['2026-08', 'Aug 2026', 74],
  ['2026-09', 'Sep 2026', 74],
  ['2026-10', 'Oct 2026', 74],
  ['2026-11', 'Nov 2026', 74],
  ['2026-12', 'Dec 2026', 37],
  ['2027-01', 'Jan 2027', 37],
  ['2027-02', 'Feb 2027', 37],
  ['2027-03', 'Mar 2027', 37],
  ['2027-04', 'Apr 2027', 37],
  ['2027-05', 'May 2027', 111],
].map(([id, label, dues]) => ({
  id: String(id),
  label: String(label),
  dues: Number(dues),
  note: id === '2027-05' ? 'The schedule says the May payment includes prorated dues for FY 2026-2027 and full dues for FY 2027-2028.' : undefined,
}));

function patch(list: NationalState[], abbr: string, edit: (row: NationalState) => void) {
  const row = list.find((s) => s.abbr === abbr);
  if (!row) throw new Error(abbr);
  edit(row);
}

function addSource(row: NationalState, src: Src) {
  if (!row.sources.some((s) => sourceKey(s) === sourceKey(src))) row.sources.push(src);
}

function build(): NationalState[] {
  const rows = SEEDS.map(fromSeed);
  if (rows.find((s) => s.abbr === 'SD')) addSource(rows.find((s) => s.abbr === 'SD')!, NEXTGEN);

  patch(rows, 'NY', (s) => {
    s.upfront = { low: 375, high: 375, label: 'Biennial attorney registration fee' };
    s.upfrontNote = 'The court registration page states a $375 biennial fee. Of that, $60 goes to the Lawyers\' Fund for Client Protection, $50 to the Indigent Legal Services Fund, and $25 to the Legal Services Assistance Fund. Renewal is every two years, within 30 days after the attorney\'s birthday.';
    s.firstYearCle = { required: true, hours: 16, short: '16 hrs in year 1 (32 over 2 years)' };
    s.cleDetail = 'Newly admitted attorneys complete 32 transitional credits, 16 each year: 7 in law practice management, areas of professional practice, and/or cybersecurity general; 6 skills; 3 ethics and professionalism. At least 1 cybersecurity credit is required across the 32. Skills credit must be in a traditional live classroom or a fully interactive videoconference approved for newly admitted attorneys. Up to 8 extra year-1 credits can carry into year 2.';
    s.feeRelief = false;
    s.feeReliefShort = 'No new-admittee waiver on the registration page';
    s.resultsRelease = 'Oct 23, 2026';
    s.passRate = '67%';
    s.passRateDetail = '6,688 of 9,936 July 2026 examinees passed (67%). First-time takers from ABA-approved schools: 84% of 5,941. The press release is dated Oct 23, 2026.';
    s.costs = [
      { label: 'Biennial attorney registration', amount: 375, note: 'Required of attorneys admitted in New York. Renew every two years, within 30 days after your birthday.', source: NY_REG },
      { label: 'Transferred UBE application, ABA J.D.', amount: 250, note: 'Judiciary Law section 465, as stated for section 520.3. Foreign-educated applicants are listed at $750 on the same page.', source: NY_TUBE },
    ];
    s.groups = [
      { id: 'practice', name: 'Practice, 7 hrs', detail: 'Law practice management, areas of professional practice, and/or cybersecurity general in each of year 1 and year 2.' },
      { id: 'skills', name: 'Skills, 6 hrs', detail: 'Traditional live classroom, or a fully interactive videoconference approved for newly admitted attorneys.' },
      { id: 'ethics', name: 'Ethics, 3 hrs', detail: 'Live classroom, approved fully interactive video, or a live webinar or teleconference where questions are allowed during the program.' },
    ];
    s.groupNote = 'These are credit categories, not last-name compliance groups. New York does not publish A to Z MCLE groups on the newly admitted FAQ.';
    s.faqs = [
      { q: 'What is the New York attorney registration fee?', a: 'The court registration page states $375 every two years, due within 30 days after the attorney\'s birthday. $60 is allocated to the Lawyers\' Fund for Client Protection, $50 to the Indigent Legal Services Fund, and $25 to the Legal Services Assistance Fund.' },
      { q: 'How many CLE hours do newly admitted New York attorneys need?', a: '32 transitional hours over two years, 16 in each year: 7 practice or cybersecurity general, 6 skills, and 3 ethics and professionalism, plus at least 1 cybersecurity credit somewhere in the 32.' },
      { q: 'When were July 2026 New York bar results released, and what was the pass rate?', a: 'Results were posted to applicant accounts on Oct 23, 2026. The Board\'s press release that day says 6,688 of 9,936 examinees passed, an overall rate of 67%.' },
      { q: 'Can a UBE score transfer to New York?', a: 'Yes. The Board says a score of 266 or higher is accepted for three years from the date the applicant sat. An ABA J.D. transfer application is $250.' },
    ];
    [NY_REG, NY_CLE, NY_TUBE, NY_HOME, NY_PRESS, NY_ADMISSION].forEach((src) => addSource(s, src));
  });

  patch(rows, 'TX', (s) => {
    s.upfront = { low: 127, high: 201, label: 'New active lawyer, licensed on or after June 1, 2023' };
    s.upfrontNote = 'Dues are $74 for a June through November license, $37 for December through April, and $111 for May. Add the $25 license fee and the $65 legal services fee in every month. May includes the next fiscal year. This is the 0 to 3 year row for fiscal year June 1, 2026 to May 31, 2027.';
    s.firstYearCle = { required: true, hours: 4, short: '4 hrs ethics within 12 months' };
    s.cleDetail = 'The Justice James A. Baker course is mandatory for newly licensed Texas attorneys. It is 4.00 ethics hours. The deadline is 12 months from licensing. The course fee on the Center\'s page is $150, with an added $150 administrative late fee if a practicing attorney misses the deadline.';
    s.feeRelief = true;
    s.feeReliefShort = 'Dues drop to $37 in Dec through Apr';
    s.costs = [
      { label: 'Membership dues, 0 to 3 years', amount: null, note: 'Not a single number. $74, $37, or $111 by the month of licensing. See the month tool.', source: TX_FEES },
      { label: 'One-time license fee', amount: 25, note: 'Due in every month on the 2026-2027 new-lawyer schedule.', source: TX_FEES },
      { label: 'Legal services fee', amount: 65, note: 'Due in every month on the active new-lawyer schedule.', source: TX_FEES },
      { label: 'Baker ethics course', amount: 150, note: '4 ethics hours. Complete within 12 months. A $150 late administrative fee applies if it is missed while practicing.', source: TX_BAKER },
    ];
    s.feeTool = { kind: 'texas', license: 25, legalServices: 65, months: TX_MONTHS };
    s.faqs = [
      { q: 'What does a newly licensed Texas lawyer pay the State Bar?', a: 'On the 2026-2027 schedule, a lawyer licensed on or after June 1, 2023 pays $74, $37, or $111 in dues by month, plus a $25 license fee and a $65 legal services fee. The total is $164, $127, or $201.' },
      { q: 'Is there a required first-year ethics course in Texas?', a: 'Yes. The Baker course is 4 ethics hours, costs $150, and is due within 12 months of licensing.' },
    ];
    addSource(s, TX_FEES);
    addSource(s, TX_BAKER);
  });

  patch(rows, 'FL', (s) => {
    s.upfront = { low: 0, high: 265, label: 'Annual membership fee for new members' };
    s.upfrontNote = 'Rule 1-7.3(b): a new member admitted April 1 through June 30 pays no membership fee for that membership period. Every other new member pays $265 within 60 days of admission. Inactive membership fees are $175 a year on the same rule. That inactive figure is not the new-member path.';
    s.firstYearCle = { required: true, hours: null, short: 'PWP in year 1, then 21 basic hrs in 3 years' };
    s.cleDetail = 'Phase I is Practicing with Professionalism within the first year of admission. Phase II is 21 credit hours of basic-level courses within the first three years. The FAQ does not state a PWP hour count. Only the online or downloadable audio versions count toward the basic skills requirement.';
    s.feeRelief = true;
    s.feeReliefShort = '$0 if admitted Apr 1 through Jun 30';
    s.costs = [
      { label: 'New member fee, April 1 through June 30 admission', amount: 0, note: 'Exempt from membership fees for that membership period. Rule 1-7.3(b)(1).', source: FL_RULE },
      { label: 'New member fee, any other admission date', amount: 265, note: 'Due within 60 days of admission. Rule 1-7.3(b)(2).', source: FL_RULE },
    ];
    s.feeTool = { kind: 'florida' };
    s.faqs = [
      { q: 'What is the Florida Bar fee for a new member?', a: 'Rule 1-7.3 sets $265, due within 60 days of admission, unless the lawyer is admitted April 1 through June 30. Those new members pay no membership fee for that period.' },
      { q: 'What CLE do new Florida lawyers have to take?', a: 'Practicing with Professionalism in the first year, then 21 hours of basic-level courses in the first three years. The FAQ does not publish a PWP hour count.' },
    ];
    addSource(s, FL_RULE);
    addSource(s, FL_BSCR);
  });

  patch(rows, 'IL', (s) => {
    s.upfront = { low: 0, high: 0, label: 'ARDC registration for lawyers admitted since Jan 1, 2025' };
    s.upfrontNote = 'The 2026 ARDC schedule lists no fee for active lawyers admitted between January 1, 2025 and the present. The footnote says they will not be assessed a fee as a matter of course. Lawyers admitted before January 1, 2025 are listed at $385.';
    s.firstYearCle = { required: true, hours: 15, short: '15 hrs, including Basic Skills or mentoring' };
    s.cleDetail = 'Newly admitted attorneys complete 15 Illinois-approved hours by one year after the last day of the admission month. A Basic Skills course carries at least 6 professional responsibility hours. The Commission on Professionalism mentoring program is 6 hours: 4 professional responsibility, 1 diversity and inclusion, and 1 mental health and substance abuse. Report compliance 31 days after the completion deadline. The late fee is $250.';
    s.feeRelief = true;
    s.feeReliefShort = 'No ARDC fee for lawyers admitted since Jan 1, 2025';
    s.costs = [
      { label: 'ARDC active registration, admitted Jan 1, 2025 or later', amount: 0, note: '2026 fee schedule. No fee as a matter of course.', source: IL_FEE },
      { label: 'MCLE late fee if the new-lawyer deadline is missed', amount: 250, note: 'Charged when the transcript does not show the 15 hours on time. Not part of the admission bill.', source: IL_MCLE },
    ];
    s.groups = [
      { id: 'am', name: 'A to M', detail: 'The two-year reporting period starts on the July 1 after the new-lawyer completion deadline, in an even-numbered year.' },
      { id: 'nz', name: 'N to Z', detail: 'The two-year reporting period starts on the July 1 after the new-lawyer completion deadline, in an odd-numbered year.' },
    ];
    s.groupNote = 'Last name picks the parity of the year. The completion deadline itself is one year after the last day of the admission month. The tool below applies that sentence from the MCLE Board FAQ.';
    s.feeTool = { kind: 'illinois' };
    s.faqs = [
      { q: 'Do new Illinois lawyers pay an ARDC registration fee?', a: 'Not on the 2026 schedule if they were admitted on or after January 1, 2025. The schedule says no fee as a matter of course.' },
      { q: 'What is the Illinois newly admitted CLE requirement?', a: '15 hours, due one year after the last day of the admission month, including a Basic Skills course or the approved mentoring program. Reporting is 31 days after that completion date.' },
    ];
    addSource(s, IL_FEE);
    addSource(s, IL_MCLE);
  });

  patch(rows, 'DC', (s) => {
    s.upfrontNote = 'The classes page publishes an active member fee of $357 for July 1, 2026 to June 30, 2027. It defines "New Admit" but does not state a separate new-admittee dollar amount. The mandatory course is $229.';
    s.firstYearCle = { required: true, hours: 4, short: '4 hr mandatory course within 12 months' };
    s.cleDetail = 'New admittees must finish the Mandatory Course on the D.C. Rules of Professional Conduct and D.C. Practice within 12 months of being sworn in. The Bar lists it as 4 hours and $229, online and on demand. Missing it can bring an administrative suspension.';
    s.feeRelief = false;
    s.feeReliefShort = NOT_PUBLISHED;
    s.costs = [
      { label: 'Active member license fee', amount: 357, note: 'Published active rate for July 1, 2026 to June 30, 2027. The page does not say this is, or is not, the new-admittee rate.', source: DC_FEES },
      { label: 'Mandatory course', amount: 229, note: '4 hours, due within 12 months of the oath.', source: DC_COURSE },
    ];
    s.faqs = [
      { q: 'What does the D.C. Bar charge for the required new-lawyer course?', a: 'The mandatory course page lists 4 hours for $229, due within 12 months of being sworn in.' },
      { q: 'Is the new-admittee license fee prorated?', a: 'Not published on the membership classes page checked Nov 10, 2026. That page lists $357 for active members and defines New Admit without a separate price.' },
    ];
    addSource(s, DC_FEES);
    addSource(s, DC_COURSE);
  });

  patch(rows, 'NJ', (s) => {
    s.upfront = { low: 0, high: 0, label: '2026 registration for lawyers admitted in 2026' };
    s.upfrontNote = 'The New Jersey Courts registration page says lawyers in plenary admission in 2026 must register online and that no payment is due for 2026 because it is the first calendar year of admission.';
    s.feeRelief = true;
    s.feeReliefShort = 'No 2026 fee in the first calendar year';
    s.resultsRelease = 'Nov 3, 2026';
    s.costs = [
      { label: '2026 attorney registration, admitted in 2026', amount: 0, note: 'No payment is due for the first calendar year. Registration is still required.', source: NJ_REG },
    ];
    s.faqs = [
      { q: 'What does a lawyer admitted in New Jersey in 2026 pay to register?', a: 'The courts\' registration page says no payment is due for 2026. The lawyer still has to complete registration online.' },
      { q: 'When did New Jersey release July 2026 bar results?', a: 'The Board of Bar Examiners posted results to user home pages on Nov 3, 2026. A July 2026 pass rate is not on that notice.' },
    ];
    addSource(s, NJ_REG);
    addSource(s, NJ_NEWS);
  });

  patch(rows, 'PA', (s) => {
    s.upfrontNote = 'The Disciplinary Board publishes an active assessment of $275 ($195 Disciplinary Board, $50 Lawyers Fund for Client Security, $30 IOLTA). The same resources page says only the license fee for the registration year of admission is waived. It does not state the dollar amount a new admittee still pays.';
    s.firstYearCle = { required: true, hours: null, short: 'Bridge the Gap before the first CLE deadline' };
    s.cleDetail = 'Newly admitted lawyers must complete Bridge the Gap before the first CLE compliance deadline. The FAQ does not state the program\'s hour count. After that, every compliance group owes 12 hours a year, including at least 2 ethics hours. Groups are assigned by lawyer ID, not by last name.';
    s.feeRelief = true;
    s.feeReliefShort = 'Admission-year license fee waived';
    s.costs = [
      { label: 'Active annual assessment', amount: 275, note: 'Published active assessment. Not stated as the new-admittee bill. $195, $50, and $30 are the three parts.', source: PA_RES },
      { label: 'License fee in the registration year of admission', amount: 0, note: 'The Board says this fee is waived. It does not publish a remaining new-admittee total.', source: PA_RES },
    ];
    s.groups = [
      { id: '1', name: 'Group I', detail: 'May 1 through April 30 every year. Assigned by lawyer ID.' },
      { id: '2', name: 'Group II', detail: 'September 1 through August 31 every year. Assigned by lawyer ID.' },
      { id: '3', name: 'Group III', detail: 'January 1 through December 31 every year. Assigned by lawyer ID.' },
    ];
    s.groupNote = 'The CLE Board assigns the group. This page cannot tell you which group you are in.';
    s.faqs = [
      { q: 'Do new Pennsylvania lawyers pay the annual assessment?', a: 'The Disciplinary Board says lawyers admitted less than one year before July 1 still register, and that only the license fee for the registration year of admission is waived. The active assessment is published at $275. The page does not give a single new-admittee total.' },
      { q: 'What is Bridge the Gap?', a: 'A required program for newly admitted Pennsylvania lawyers, due before the first CLE compliance deadline. The FAQ does not publish an hour count.' },
    ];
    addSource(s, PA_RES);
    addSource(s, PA_CLE);
  });

  patch(rows, 'GA', (s) => {
    s.upfrontNote = 'License fees are prorated by the swearing-in month. The fee notice says prorated amounts apply to oaths between August 1 and May 14, and that a July oath owes the full annual fee. The proration chart on the PDF did not extract as text, so the month-by-month dollars are not published on this page. Enroll within 60 days or pay a $100 late registration fee.';
    s.firstYearCle = { required: true, hours: null, short: 'TILPP mentoring and CLE' };
    s.cleDetail = 'TILPP is the mentoring and continuing legal education requirement for most lawyers newly admitted to the State Bar of Georgia. The program page does not state an hour count.';
    s.feeRelief = false;
    s.feeReliefShort = 'Prorated by oath month. Chart not published here';
    s.costs = [
      { label: 'Late registration fee', amount: 100, note: 'Due if you do not enroll within 60 days after the oath.', source: GA_JOIN },
      { label: 'Prorated license fee by swearing-in month', amount: null, note: 'The notice says the amount depends on the month. The chart figures are not published here.', source: GA_FEE },
    ];
    s.faqs = [
      { q: 'Does the Georgia license fee change with the oath date?', a: 'Yes. The Bar says a July oath owes the full annual fee, and oaths from August 1 through May 14 are prorated. The month-by-month chart did not come through as text, so those dollars are marked not published here. Enrolling more than 60 days after the oath adds a $100 late fee.' },
    ];
    addSource(s, GA_JOIN);
    addSource(s, GA_FEE);
    addSource(s, GA_TILPP);
  });

  patch(rows, 'MA', (s) => {
    s.firstYearCle = { required: false, hours: 0, short: 'No mandatory new-lawyer course' };
    s.cleDetail = 'The Supreme Judicial Court repealed Rule 3:16 effective August 14, 2024. That rule had required a Practicing with Professionalism course within 18 months of admission. The Aug 19, 2024 press release says the mandatory course is no longer required.';
    s.feeReliefShort = NOT_PUBLISHED;
    s.faqs = [
      { q: 'Does Massachusetts still require a new-lawyer professionalism course?', a: 'No. The Supreme Judicial Court repealed Rule 3:16 effective August 14, 2024. The registration fee for a new lawyer is not published on this page.' },
    ];
    addSource(s, MA_REPEAL);
  });

  patch(rows, 'TN', (s) => {
    s.resultsRelease = 'Oct 6, 2026';
    s.faqs = [
      { q: 'When did Tennessee release July 2026 bar results?', a: 'The Board announced on Sept 25, 2026 that results would be released Oct 6, 2026, between 5:00 and 6:00 p.m. CT, on the Board\'s exam results page. A pass rate, swearing-in fee, and first-year CLE figure are not on that announcement.' },
    ];
    addSource(s, TN_RESULTS);
  });

  patch(rows, 'VA', (s) => {
    s.lastVerified = '2026-11-11';
    s.resultsRelease = 'Oct 9, 2026';
    s.upfront = { low: 0, high: 160, label: 'Prorated dues for newly admitted (bar exam) attorneys' };
    s.upfrontNote = 'The Virginia State Bar says newly admitted (bar exam) attorneys pay prorated dues: Active $160; Associate (inactive) $62.50. Dues are waived for anyone admitted or licensed in April, May or June.';
    s.feeRelief = true;
    s.feeReliefShort = 'Dues waived if admitted or licensed in April, May or June';
    s.costs = [
      { label: 'Active prorated dues, newly admitted by bar exam', amount: 160, note: 'Prorated dues for newly admitted (bar exam) attorneys. Waived if admitted or licensed in April, May or June.', source: VA_EMAIL },
      { label: 'Associate (inactive) prorated dues, newly admitted by bar exam', amount: 62.5, note: 'Prorated dues for newly admitted (bar exam) attorneys who choose Associate (inactive) status. Waived if admitted or licensed in April, May or June.', source: VA_EMAIL },
      { label: 'Dues if admitted or licensed in April, May or June', amount: 0, note: 'The Virginia State Bar says dues are waived for anyone admitted or licensed in April, May or June.', source: VA_EMAIL },
    ];
    s.ceremonies = [
      { name: 'Admission & Orientation (A&O) Ceremony', when: 'Dec 2, 2026', fee: '$0', href: VA_RESULTS.url },
    ];
    s.faqs = [
      { q: 'When did Virginia release July 2026 results, and when is the ceremony?', a: 'The Board says List One lawyers are licensed effective Oct 9, 2026, with results in the portal by 5:00 p.m. that day. The same notice schedules an admission ceremony for Dec 2, 2026. The Virginia State Bar says it charges no fee to attend the Admission & Orientation (A&O) Ceremony.' },
      { q: 'What does a newly admitted Virginia lawyer pay in dues?', a: 'The Virginia State Bar says newly admitted (bar exam) attorneys pay prorated dues: Active $160; Associate (inactive) $62.50. Dues are waived for anyone admitted or licensed in April, May or June.' },
    ];
    addSource(s, VA_RESULTS);
    addSource(s, VA_EMAIL);
    s.sources = [VA_EMAIL, ...s.sources.filter((src) => sourceKey(src) !== sourceKey(VA_EMAIL))];
  });

  applyDeep(rows);
  return rows;
}

export const NATIONAL_STATES: NationalState[] = build();
export const nationalBySlug = (slug: string) => NATIONAL_STATES.find((s) => s.slug === slug);

export function money(n: number) {
  if (n === 0) return '$0';
  const digits = Number.isInteger(n) ? 0 : 2;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 })}`;
}

export function upfrontText(s: Pick<NationalState, 'upfront'>) {
  if (!s.upfront) return NOT_PUBLISHED;
  return s.upfront.low === s.upfront.high ? money(s.upfront.low) : `${money(s.upfront.low)} to ${money(s.upfront.high)}`;
}

export type KeyField = 'upfront' | 'cle' | 'results' | 'passRate' | 'ceremonyDate' | 'ceremonyFee';

export function missingKeyFields(s: NationalState): KeyField[] {
  const missing: KeyField[] = [];
  if (!s.upfront) missing.push('upfront');
  if (s.firstYearCle.required === null || s.firstYearCle.short === NOT_PUBLISHED) missing.push('cle');
  if (s.resultsRelease === NOT_PUBLISHED) missing.push('results');
  if (s.passRate === NOT_PUBLISHED) missing.push('passRate');
  if (s.ceremonies.length === 0 || s.ceremonies.every((c) => c.when === NOT_PUBLISHED)) missing.push('ceremonyDate');
  if (s.ceremonies.length === 0 || s.ceremonies.every((c) => c.fee === NOT_PUBLISHED)) missing.push('ceremonyFee');
  return missing;
}

export function floridaExempt(iso: string): boolean | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return month === 4 || month === 5 || month === 6;
}

export type IllinoisPlan = {
  completion: string;
  reporting: string;
  periodStart: string;
};

function utc(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m, d));
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  return utc(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days);
}

/** MCLE Board rule: completion is one year after the last day of the admission month. */
export function illinoisPlan(isoDate: string, group: 'am' | 'nz'): IllinoisPlan | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const admitted = utc(year, month - 1, day);
  if (admitted.getUTCFullYear() !== year || admitted.getUTCMonth() !== month - 1 || admitted.getUTCDate() !== day) return null;
  const monthEnd = utc(year, month, 0);
  const completion = utc(monthEnd.getUTCFullYear() + 1, monthEnd.getUTCMonth(), monthEnd.getUTCDate());
  const reporting = addDays(completion, 31);
  let julyYear = completion.getUTCMonth() < 6 ? completion.getUTCFullYear() : completion.getUTCFullYear() + 1;
  const even = group === 'am';
  if ((julyYear % 2 === 0) !== even) julyYear += 1;
  return { completion: iso(completion), reporting: iso(reporting), periodStart: iso(utc(julyYear, 6, 1)) };
}
