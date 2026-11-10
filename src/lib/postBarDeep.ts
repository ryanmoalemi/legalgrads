import { NOT_PUBLISHED, type NationalState, type Src } from '@/lib/nationalPostBar';

const RATES: Src = {
  label: 'NCBE July 2026 bar exam pass rates (table updated Nov 4, 2026)',
  url: 'https://www.ncbex.org/jurisdictions/bar-pass-rates-jurisdiction',
};
const CLE: Src = {
  label: 'NCBE Comprehensive Guide chart 13, post-admission requirements and CLE',
  url: 'https://reports.ncbex.org/charts/chart-13/',
};
const AZ_FEE: Src = {
  label: 'State Bar of Arizona 2026 membership fees',
  url: 'https://www.azbar.org/licensing-compliance/membership-fees/membership-fees-deadline',
};
const AZ_CLE: Src = {
  label: 'State Bar of Arizona new member checklist',
  url: 'https://azbar.org/licensing-compliance/new-members/new-member-checklist',
};
const AZ_PRO: Src = {
  label: 'State Bar of Arizona new member compliance FAQ',
  url: 'https://azbar.org/licensing-compliance/new-members/compliance-requirements-faqs',
};
const AK_PDF: Src = {
  label: 'Alaska Bar new member packet (September 2026)',
  url: 'https://alaskabar.org/wp-content/uploads/AK-Bar-New-Member-packet.pdf',
};
const MI: Src = {
  label: 'State Bar of Michigan new attorney registration',
  url: 'https://e.michbar.org/Member-Type/New-Attorney-Info/Member-Type/Registration/P',
};
const MN: Src = {
  label: 'Minnesota Lawyer Registration Office annual fees',
  url: 'https://lro.mn.gov/for-lawyers/annual-lawyer-registration-fees/',
};
const NH: Src = {
  label: 'New Hampshire Bar Association membership status chart, 2025-2026',
  url: 'https://www.nhbar.org/about-the-bar/membership-statuses/',
};
const NH_NEW: Src = {
  label: 'New Hampshire Bar Association new admittees',
  url: 'https://www.nhbar.org/new-lawyers-resources/new-admittees/',
};
const WA: Src = {
  label: 'WSBA Keller compliance option for 2026',
  url: 'https://www.wsba.org/docs/default-source/licensing/keller/2026-keller-compliance-option-for-the-year.pdf?sfvrsn=412de1f1_5',
};
const UT: Src = {
  label: 'Utah State Bar licensing fees',
  url: 'https://www.utahbar.org/licensing/',
};
const MN_CEREMONY: Src = {
  label: 'Minnesota Supreme Court July 2026 ceremony instructions (Oct 2026 PDF)',
  url: 'https://ble.mn.gov/wp-content/uploads/2026/10/Ceremony-Info-10-26.pdf',
};
const IL_CEREMONY: Src = {
  label: 'Illinois Courts bar admission ceremonies',
  url: 'https://www.illinoiscourts.gov/eservices/attorney-bar-matters/',
};
const OH_CEREMONY: Src = {
  label: 'Supreme Court of Ohio admission ceremony FAQ',
  url: 'https://www.supremecourt.ohio.gov/attorneys/admission-to-the-practice-of-law-in-ohio/admission-ceremony-faq/',
};
const MD_CEREMONY: Src = {
  label: 'Maryland Courts November 20 and December 1, 2026 bar admissions',
  url: 'https://www.mdcourts.gov/scm/baradmissions',
};
const DE_CEREMONY: Src = {
  label: 'Delaware Board of Bar Examiners, July 2026 class dates',
  url: 'https://courts.delaware.gov/bbe/index.aspx',
};
const OR: Src = {
  label: 'Oregon State Bar 2026 licensing fee FAQ',
  url: 'https://www.osbar.org/fees/feeFAQ.html',
};

type Exam = { rate?: string; day?: string; n?: string };
// Overall pass rate and release day from NCBE's July 2026 table. Blank cells stay omitted.
const JULY: Record<string, Exam> = {
  AL: { rate: '52%', day: 'Sep 25, 2026', n: '548' },
  AK: { rate: '58%', n: '60' },
  AZ: { rate: '64%', day: 'Sep 16, 2026', n: '450' },
  AR: { rate: '65%', day: 'Aug 31, 2026', n: '249' },
  CO: { rate: '70%', day: 'Sep 17, 2026', n: '700' },
  CT: { rate: '63%', day: 'Oct 9, 2026', n: '436' },
  DE: { rate: '66%', day: 'Oct 1, 2026', n: '201' },
  DC: { rate: '75%', day: 'Oct 23, 2026', n: '2,222' },
  FL: { rate: '64%', day: 'Sep 18, 2026', n: '2,750' },
  GA: { rate: '64%', day: 'Sep 18, 2026', n: '1,157' },
  HI: { rate: '73%', day: 'Sep 18, 2026', n: '160' },
  ID: { rate: '80%', day: 'Oct 6, 2026', n: '177' },
  IL: { rate: '71%', day: 'Oct 1, 2026', n: '2,259' },
  IN: { rate: '65%', day: 'Sep 16, 2026', n: '465' },
  IA: { rate: '84%', day: 'Sep 4, 2026', n: '190' },
  KS: { rate: '74%', day: 'Sep 3, 2026', n: '177' },
  KY: { rate: '76%', day: 'Sep 30, 2026', n: '332' },
  LA: { rate: '70%', day: 'Oct 2, 2026', n: '520' },
  ME: { rate: '64%', day: 'Sep 11, 2026', n: '143' },
  MD: { rate: '69%', day: 'Oct 9, 2026', n: '811' },
  MA: { rate: '73%', day: 'Oct 9, 2026', n: '1,541' },
  MI: { rate: '62%', day: 'Oct 20, 2026', n: '778' },
  MN: { rate: '77%', day: 'Oct 2, 2026', n: '650' },
  MO: { rate: '77%', day: 'Oct 2, 2026', n: '653' },
  MT: { rate: '78%', day: 'Sep 14, 2026', n: '94' },
  NE: { rate: '75%', day: 'Sep 3, 2026', n: '191' },
  NV: { rate: '50%', day: 'Oct 2, 2026', n: '305' },
  NH: { day: 'Sep 25, 2026' },
  NJ: { rate: '54%', day: 'Nov 3, 2026', n: '1,109' },
  NM: { rate: '55%', day: 'Sep 2, 2026', n: '177' },
  NY: { rate: '67%', day: 'Oct 23, 2026', n: '9,936' },
  NC: { rate: '76%', day: 'Sep 2, 2026', n: '765' },
  ND: { rate: '63%', day: 'Sep 1, 2026', n: '62' },
  OH: { rate: '71%', day: 'Oct 16, 2026', n: '1,011' },
  OK: { rate: '73%', day: 'Sep 10, 2026', n: '335' },
  OR: { rate: '80%', n: '429' },
  PA: { rate: '73%', day: 'Oct 9, 2026', n: '1,473' },
  RI: { rate: '66%', day: 'Oct 23, 2026', n: '108' },
  SC: { rate: '78%', day: 'Oct 14, 2026', n: '435' },
  SD: { rate: '73%', day: 'Sep 4, 2026', n: '71' },
  TN: { rate: '72%', day: 'Oct 6, 2026', n: '719' },
  TX: { rate: '70%', day: 'Oct 6, 2026', n: '3,230' },
  UT: { rate: '89%', day: 'Sep 11, 2026', n: '279' },
  VT: { rate: '63%', day: 'Sep 15, 2026', n: '60' },
  VA: { rate: '72%', day: 'Oct 9, 2026', n: '558' },
  WA: { rate: '74%', day: 'Oct 9, 2026', n: '280' },
  WV: { rate: '62%', day: 'Aug 28, 2026', n: '117' },
  WI: { rate: '53%', day: 'Sep 1, 2026', n: '122' },
  WY: { rate: '69%', day: 'Sep 11, 2026', n: '65' },
};

type Cle = { required: boolean; hours: number | null; short: string; detail: string };
const CHART = 'NCBE Comprehensive Guide chart 13, checked Nov 10, 2026. The chart page does not print its own revision date.';

const CLE_BY_STATE: Record<string, Cle> = {
  AL: { required: false, hours: null, short: 'No separate new-lawyer course. 12 hours a year.', detail: `${CHART} Alabama has no separate post-admission course on the chart. Ongoing CLE is 12 hours per year.` },
  AR: { required: true, hours: null, short: 'Law-license course within 2 years', detail: `${CHART} Each person admitted by examination must complete a mandatory course on maintaining an Arkansas law license within 2 years after certification for admission. Ongoing CLE is 12 hours per year. The course hour count is not stated.` },
  CO: { required: true, hours: null, short: 'Practicing with Professionalism within 6 months', detail: `${CHART} Lawyers admitted on motion or by transferred UBE score must complete Practicing with Professionalism within the first six months. Ongoing CLE is 45 hours per 3 years, including 5 ethics hours and 2 equity, diversity, and inclusivity hours. The course hour count is not stated.` },
  CT: { required: false, hours: null, short: 'No separate new-lawyer course. 12 hours a year.', detail: `${CHART} Connecticut has no separate post-admission course on the chart. Ongoing CLE is 12 hours per year.` },
  DE: { required: true, hours: 7, short: '7 fundamentals courses by the second CLE year', detail: `${CHART} New admittees complete 7 fundamental CLE courses by the end of the second CLE compliance year. The compliance year starts January 1 of the year after admission. Ongoing CLE is 24 hours per 2 years.` },
  HI: { required: true, hours: null, short: 'Professionalism course by Dec 31 of the next year', detail: `${CHART} Complete the State Bar professionalism course no later than December 31 of the year following the year of election of active status. Ongoing CLE is 3 hours per year. The course hour count is not stated.` },
  ID: { required: true, hours: 10, short: '10 Idaho-law credits within 12 months', detail: `${CHART} Complete 10 continuing legal education credits addressing Idaho law within 12 months of admission. Ongoing CLE is 30 hours per 3 years.` },
  IN: { required: true, hours: 6, short: '6 hours of applied professionalism in 3 years', detail: `${CHART} New admittees complete 6 hours of applied professionalism in the first 3 years. Admission on a UBE score also requires the Indiana Law Course within 6 months. Ongoing CLE is 36 hours per 3 years.` },
  IA: { required: false, hours: null, short: 'No separate new-lawyer course. 15 hours a year.', detail: `${CHART} Iowa has no separate post-admission course on the chart. Ongoing CLE is 15 hours per year.` },
  KS: { required: false, hours: null, short: 'No separate new-lawyer course. 12 hours a year.', detail: `${CHART} Kansas has no separate post-admission course on the chart. Ongoing CLE is 12 hours per year.` },
  KY: { required: true, hours: null, short: 'New Lawyer Program within 12 months', detail: `${CHART} The New Lawyer Program is required within 12 months of admission and also fulfills that year's CLE. Ongoing CLE is 12 hours per year. The program hour count is not stated.` },
  LA: { required: false, hours: null, short: 'No separate new-lawyer course. 12.5 hours a year.', detail: `${CHART} Louisiana has no separate post-admission course on the chart. Ongoing CLE is 12.5 hours per year. This page does not use the attorney roster.` },
  ME: { required: false, hours: null, short: 'No separate new-lawyer course. 12 hours a year.', detail: `${CHART} Maine has no separate post-admission course on the chart. Ongoing CLE is 12 hours per year.` },
  MD: { required: false, hours: 0, short: 'No mandatory CLE', detail: `${CHART} Maryland's row says there is no post-admission mandatory CLE.` },
  MI: { required: false, hours: 0, short: 'No mandatory CLE', detail: `${CHART} Michigan's row says there is no post-admission mandatory CLE.` },
  MN: { required: false, hours: null, short: 'No separate new-lawyer course. 45 hours per 3 years.', detail: `${CHART} Minnesota has no separate post-admission course on the chart. Ongoing CLE is 45 hours per 3 years.` },
  MS: { required: false, hours: null, short: 'No separate new-lawyer course. 12 hours a year.', detail: `${CHART} Mississippi has no separate post-admission course on the chart. Ongoing CLE is 12 hours per year.` },
  MO: { required: false, hours: null, short: 'No separate new-lawyer course. 15 hours a year.', detail: `${CHART} Missouri has no separate post-admission course on the chart. Ongoing CLE is 15 hours per year.` },
  MT: { required: false, hours: null, short: 'No separate new-lawyer course. 15 hours a year.', detail: `${CHART} Montana has no separate post-admission course on the chart. Ongoing CLE is 15 hours per year.` },
  NE: { required: false, hours: null, short: 'No separate new-lawyer course. 10 hours a year.', detail: `${CHART} Nebraska has no separate post-admission course on the chart. Ongoing CLE is 10 hours per year, of which 2 must be ethics.` },
  NV: { required: true, hours: null, short: 'New-lawyer training in the first year', detail: `${CHART} Nevada requires a mandatory new lawyer training program during the first year of admission. The hour count of that program is not stated. Ongoing CLE is 13 hours: 10 general, 2 ethics, and 1 substance abuse or mental health.` },
  NH: { required: true, hours: null, short: 'Practical skills course in the first 2 years', detail: `${CHART} A practical skills course given by the State Bar must be completed during the first 2 years of practice. The hour count is not stated. The Bar's new-admittee page, checked the same day, says Rule 53 requires 12 hours, including 2 ethics, once a member has been active for 6 cumulative months in the June 1 to May 31 reporting year.` },
  NJ: { required: true, hours: 16, short: '16 hours in the first full 2-year period', detail: `${CHART} The first CLE period is deferred until January 1 of the year after admission. During the first full 2-year period, a new lawyer must obtain 16 credit hours in 6 of 12 New Jersey subject areas, including at least 1 credit in New Jersey trust and business accounting. Ongoing CLE is 24 hours per 2 years.` },
  NM: { required: true, hours: null, short: '1-year Bridge the Gap mentorship', detail: `${CHART} New attorneys practicing in New Mexico who have practiced law for less than 2 years must join the 1-year Bridge the Gap Mentorship Program. Ongoing CLE is 12 hours per year.` },
  NC: { required: true, hours: null, short: 'Professionalism program in the first CLE year', detail: `${CHART} Active members complete the Professionalism for New Admittees program in the year they are first required to meet CLE requirements. Lawyers licensed in another state for 5 or more years at admission are exempt if they notify the State Bar. Ongoing CLE is 24 hours per 2 years. The program hour count is not stated.` },
  ND: { required: false, hours: null, short: 'No separate new-lawyer course. 36 hours per 3 years.', detail: `${CHART} North Dakota has no separate post-admission course on the chart. Ongoing CLE is 36 hours per 3 years.` },
  OH: { required: true, hours: null, short: 'New Lawyer Training', detail: `${CHART} New admittees must comply with New Lawyer Training requirements. The hour count is not stated on the chart. Ongoing CLE is 24 hours per 2 years.` },
  OK: { required: false, hours: null, short: 'No separate new-lawyer course. 12 hours a year.', detail: `${CHART} Oklahoma has no separate post-admission course on the chart. Ongoing CLE is 12 hours per year.` },
  OR: { required: true, hours: 15, short: '15 credits in the first year, plus mentoring', detail: `${CHART} In the first year after admission, complete 15 CLE credits: 1 Oregon ethics and professionalism hour, 4 hours of Oregon practice and procedure, and 3 credits from an approved access-to-justice course. New lawyers are also in the New Lawyer Mentoring Program for the first year. Ongoing CLE is 45 hours per 3 years.` },
  RI: { required: true, hours: null, short: 'Bar training course within 1 year', detail: `${CHART} Complete a training course sponsored by the bar association and approved by the Supreme Court within 1 year of admission. The hour count is not stated. Ongoing CLE is 10 hours per year.` },
  SC: { required: false, hours: null, short: 'No separate post-admission course. 14 hours a year.', detail: `${CHART} South Carolina's online course on South Carolina law is required before admission, not after. Ongoing CLE is 14 hours per year.` },
  SD: { required: false, hours: 0, short: 'No mandatory CLE', detail: `${CHART} South Dakota's row says there is no post-admission mandatory CLE.` },
  TN: { required: false, hours: null, short: 'No separate new-lawyer course. 15 hours a year.', detail: `${CHART} Tennessee has no separate post-admission course on the chart. The online Tennessee Law Course is required before licensing. Ongoing CLE is 15 hours per year.` },
  UT: { required: true, hours: null, short: 'New-lawyer training in the first year', detail: `${CHART} Active new admittees with less than 2 years of legal practice must complete a mandatory new lawyer training program within the first year. The hour count is not stated. Ongoing CLE is 12 hours per year.` },
  VT: { required: true, hours: 15, short: '15 Vermont hours plus a 6-month mentorship', detail: `${CHART} Newly admitted attorneys complete 15 hours of Vermont-specific CLE within the first year. Lawyers admitted by examination or transferred UBE score also complete a six-month mentorship with a Vermont judge or attorney in that first year. Ongoing CLE is 24 hours per 2 years.` },
  VA: { required: true, hours: null, short: 'Professionalism course within 12 months', detail: `${CHART} The Rules of the Supreme Court of Virginia require a mandatory professionalism course within 12 months of becoming licensed. The hour count is not stated. Ongoing CLE is 12 hours per year.` },
  WA: { required: false, hours: null, short: 'No separate post-admission course. 45 hours per 3 years.', detail: `${CHART} The free 4-hour Washington Law Component is required before admission. The chart lists no separate post-admission course. Ongoing CLE is 45 hours per 3 years.` },
  WV: { required: true, hours: null, short: 'Bridge the Gap, in person, within 2 years', detail: `${CHART} Within 2 years of admission, complete the mandatory Bridge the Gap seminar in person. The hour count is not stated. Ongoing CLE is 24 hours per 2 years.` },
  WI: { required: false, hours: null, short: 'No separate new-lawyer course. 30 hours per 2 years.', detail: `${CHART} Wisconsin has no separate post-admission course on the chart. Ongoing CLE is 30 hours per 2 years.` },
  WY: { required: false, hours: null, short: 'No separate new-lawyer course. 15 hours a year.', detail: `${CHART} Wyoming has no separate post-admission course on the chart. Ongoing CLE is 15 hours per year.` },
};

function add(s: NationalState, src: Src) {
  if (!s.sources.some((item) => item.url === src.url)) s.sources.push(src);
}

function rateDetail(exam: Exam) {
  const who = exam.n ? ` (${exam.n} examinees)` : '';
  const when = exam.day ? ` The table lists the results release date as ${exam.day.replace(', 2026', '')}.` : ' The table does not list a results release date.';
  return `NCBE's July 2026 table, updated Nov 4, 2026, reports an overall pass rate of ${exam.rate}${who}.${when} NCBE says each jurisdiction reported the rate. Checked Nov 10, 2026.`;
}

export function applyDeep(rows: NationalState[]) {
  for (const s of rows) {
    const exam = JULY[s.abbr];
    if (exam) {
      if (exam.rate && s.passRate === NOT_PUBLISHED) {
        s.passRate = exam.rate;
        s.passRateDetail = rateDetail(exam);
      }
      if (exam.day && s.resultsRelease === NOT_PUBLISHED) s.resultsRelease = exam.day;
      add(s, RATES);
    } else if (s.abbr === 'MS') {
      s.passRateDetail = 'NCBE\'s July 2026 table, updated Nov 4, 2026, leaves the overall pass rate, examinee count, and results release date blank for Mississippi. Checked Nov 10, 2026.';
      add(s, RATES);
    }
    if (s.abbr === 'NH' && s.passRate === NOT_PUBLISHED) {
      s.passRateDetail = 'NCBE\'s July 2026 table, updated Nov 4, 2026, lists a September 25 release date and leaves the overall pass rate blank. Checked Nov 10, 2026.';
    }
    if (s.abbr === 'AK' && s.resultsRelease === NOT_PUBLISHED) {
      s.passRateDetail = rateDetail({ rate: '58%', n: '60' }).replace('The table does not list a results release date.', 'The release-date cell is blank.');
    }
    if (s.abbr === 'OR' && exam?.rate) {
      s.passRateDetail = rateDetail(exam);
    }

    const cle = CLE_BY_STATE[s.abbr];
    if (cle && s.firstYearCle.short === NOT_PUBLISHED) {
      s.firstYearCle = { required: cle.required, hours: cle.hours, short: cle.short };
      s.cleDetail = cle.detail;
      add(s, CLE);
      if (s.abbr === 'NH') add(s, NH_NEW);
    }
    if (s.abbr === 'WV') s.inPersonFirstYear = true;
    if (s.abbr === 'WI') {
      s.passScore = '260';
      s.passScoreDetail = 'NCBE\'s July 2026 results table lists a passing score of 260 and Legacy UBE. The February 2026 table on the same page lists 258 and not UBE. Table updated Nov 4, 2026. Checked Nov 10, 2026.';
      add(s, RATES);
    }
  }

  const az = rows.find((s) => s.abbr === 'AZ');
  if (az) {
    az.upfront = { low: 345, high: 345, label: '2026 active fee, admitted fewer than 3 years in any jurisdiction' };
    az.upfrontNote = 'The 2026 State Bar schedule is $345 by February 1 for active members admitted fewer than 3 years in any jurisdiction. Members admitted 3 or more years pay $505. Late fees raise the under-3-year amount to $445 from February 2 through March 1, and to $545 after March 2.';
    az.feeRelief = true;
    az.feeReliefShort = '$345 if admitted fewer than 3 years';
    az.firstYearCle = { required: true, hours: null, short: '4.25 hr professionalism course, plus 0 or 10 CLE hours' };
    az.cleDetail = 'The new member checklist requires the Professionalism Course within one year (Rule 34(n)). The compliance FAQ says that course is 4.25 hours, live on Zoom. For the educational year of admission, July 1 through December 31 admittees complete 10 CLE hours, including 2 professional responsibility. January 1 through June 30 admittees have no MCLE requirement that year. Later years are 15 hours, including 3 professional responsibility.';
    az.costs = [
      { label: '2026 active membership, admitted fewer than 3 years', amount: 345, note: 'Due February 1. Based on the first year of admission in any jurisdiction.', source: AZ_FEE },
      { label: '2026 active membership, admitted 3 or more years', amount: 505, note: 'Not the new-lawyer rate. Shown because the under-3-year rate is measured against it.', source: AZ_FEE },
    ];
    add(az, AZ_FEE); add(az, AZ_CLE); add(az, AZ_PRO);
  }

  const ak = rows.find((s) => s.abbr === 'AK');
  if (ak) {
    ak.upfrontNote = 'The September 2026 new member packet says new members pay prorated dues for the rest of the calendar year, due by February 1. It does not print the dollar schedule.';
    ak.feeReliefShort = 'Prorated for the rest of the calendar year. Dollar schedule not printed.';
    ak.firstYearCle = { required: false, hours: 0, short: 'Exempt in the admission year' };
    ak.cleDetail = 'The September 2026 packet quotes Bar Rule 65: 12 credit hours a year, including 3 ethics. New admittees are exempt during the year of admission and must meet the requirement the following year, with a report by February 1 of the year after that.';
    add(ak, AK_PDF);
  }

  const mi = rows.find((s) => s.abbr === 'MI');
  if (mi) {
    mi.upfront = { low: 207.5, high: 415, label: 'Active license fee by the month you join' };
    mi.upfrontNote = 'The State Bar fiscal year is October 1 through September 30. Active members who join October 1 through March 31 pay $415. Active members who join April 1 through September 30 pay $207.50. Inactive is $277.50 or $138.75 on the same split.';
    mi.feeRelief = true;
    mi.feeReliefShort = '$207.50 if you join Apr 1 through Sep 30';
    mi.costs = [
      { label: 'Active, join October 1 through March 31', amount: 415, note: 'State Bar fiscal year October 1 through September 30.', source: MI },
      { label: 'Active, join April 1 through September 30', amount: 207.5, note: 'Half of the October through March active amount.', source: MI },
    ];
    add(mi, MI);
  }

  const mn = rows.find((s) => s.abbr === 'MN');
  if (mn) {
    mn.upfront = { low: 40, high: 40, label: 'One-time new lawyer fee, due at the oath' };
    mn.upfrontNote = 'The October 30, 2026 ceremony instructions say the initial Lawyer Registration fee is $40, due at registration, and that it covers active status until the first registration statement plus the wall certificate. The Lawyer Registration Office then lists $153 a year for a lawyer admitted less than 3 years in any jurisdiction, for statements due beginning January 1, 2025.';
    mn.feeRelief = true;
    mn.feeReliefShort = '$40 at the oath, then $153 a year if under 3 years';
    mn.costs = [
      { label: 'Initial lawyer registration at the oath', amount: 40, note: 'Check or exact cash to the Minnesota Supreme Court. Covers active status until the first registration statement and the wall certificate.', source: MN_CEREMONY },
      { label: 'Later annual registration, admitted less than 3 years', amount: 153, note: 'Statements due beginning January 1, 2025. This is not the same bill as the $40 oath fee.', source: MN },
    ];
    mn.ceremonies = [{ name: 'July 2026 admission ceremony', when: 'Oct 30, 2026', fee: '$40', href: MN_CEREMONY.url }];
    add(mn, MN); add(mn, MN_CEREMONY);
  }

  const nh = rows.find((s) => s.abbr === 'NH');
  if (nh) {
    nh.upfront = { low: 615, high: 615, label: 'Full newly admitted dues and court fees, 2025-2026' };
    nh.upfrontNote = 'The 2025-2026 status chart lists newly admitted members at $615: $260 NHBA dues, $295 Professional Conduct Committee, $30 Lawyers Assistance, and $30 Public Protection Fund. Active members are $665. The new-admittee page says those dues and court fees are prorated, so a partial year can be lower. A 2026-2027 chart was not on the page checked Nov 10, 2026.';
    nh.feeRelief = true;
    nh.feeReliefShort = 'Newly admitted total $615, then prorated';
    nh.costs = [
      { label: 'NHBA dues, newly admitted', amount: 260, note: '2025-2026 chart. Invoices are prorated.', source: NH },
      { label: 'Supreme Court Professional Conduct Committee', amount: 295, note: 'Same newly admitted column.', source: NH },
      { label: 'Lawyers Assistance Program', amount: 30, note: 'Same newly admitted column.', source: NH },
      { label: 'Public Protection Fund', amount: 30, note: 'Same newly admitted column.', source: NH },
    ];
    add(nh, NH); add(nh, NH_NEW);
  }

  const wa = rows.find((s) => s.abbr === 'WA');
  if (wa) {
    wa.upfront = { low: 117, high: 234, label: '2026 new active lawyer license fee' };
    wa.upfrontNote = 'The 2026 Keller sheet lists a new active lawyer admittee at $234 for a January 1 through June 30 admission and $117 for July 1 through December 31. Those are license-fee lines. The separate fee schedule adds a $20 client protection remittance for other active categories and does not print that $20 on the new-admittee line.';
    wa.feeRelief = true;
    wa.feeReliefShort = '$117 if admitted July 1 through Dec 31';
    wa.costs = [
      { label: 'New active lawyer, admitted Jan 1 through Jun 30', amount: 234, note: '2026 Keller compliance sheet, license fee column.', source: WA },
      { label: 'New active lawyer, admitted Jul 1 through Dec 31', amount: 117, note: '2026 Keller compliance sheet, license fee column.', source: WA },
    ];
    add(wa, WA);
  }

  const ut = rows.find((s) => s.abbr === 'UT');
  if (ut) {
    ut.upfront = { low: 250, high: 250, label: 'Active Under 3 yearly license' };
    ut.upfrontNote = 'The licensing page lists Active Under 3, a lawyer admitted no more than three years in any jurisdiction, at $250 a year. Active status is $425. Both active categories also carry a Fund for Client Protection assessment that the rules cap at $20. The page does not state this year\'s exact assessment.';
    ut.feeRelief = true;
    ut.feeReliefShort = '$250 if admitted 3 years or less';
    ut.costs = [
      { label: 'Active Under 3 yearly license', amount: 250, note: 'Admitted no more than three years in any jurisdiction. Client protection assessment is capped at $20 and is not given as a single current amount.', source: UT },
    ];
    add(ut, UT);
  }

  const ore = rows.find((s) => s.abbr === 'OR');
  if (ore && !ore.upfront) {
    ore.upfrontNote = 'The 2026 fee FAQ lists $683 for an active licensee admitted in any jurisdiction before January 1, 2026. It says someone admitted during 2026 must pay within 30 days, and that the $15 Client Security Fund assessment is not prorated. It does not print the license-fee dollar for a 2026 admission.';
    add(ore, OR);
  }

  const ceremony: Record<string, { name: string; when: string; fee: string; href: string }> = {
    IL: { name: 'July 2026 bar admission ceremonies', when: 'Nov 4, 2026', fee: NOT_PUBLISHED, href: IL_CEREMONY.url },
    OH: { name: 'Admissions ceremony, Palace Theatre, Columbus', when: 'Nov 16, 2026', fee: NOT_PUBLISHED, href: OH_CEREMONY.url },
    MD: { name: 'Supreme Court bar admission sessions', when: 'Nov 20, 2026 and Dec 1, 2026', fee: '$20', href: MD_CEREMONY.url },
    DE: { name: 'Bar admission ceremony, Delaware State University, Dover', when: 'Dec 9, 2026', fee: NOT_PUBLISHED, href: DE_CEREMONY.url },
  };
  for (const [abbr, row] of Object.entries(ceremony)) {
    const state = rows.find((s) => s.abbr === abbr);
    if (!state || state.ceremonies.length) continue;
    state.ceremonies = [row];
  }
  const il = rows.find((s) => s.abbr === 'IL');
  if (il) add(il, IL_CEREMONY);
  const oh = rows.find((s) => s.abbr === 'OH');
  if (oh) {
    add(oh, OH_CEREMONY);
    oh.costs.push({ label: 'Replacement wall certificate if the oath is after Nov 16, 2026', amount: 30, note: 'Not a ceremony ticket. The FAQ says admittees may not be sworn in before November 16.', source: OH_CEREMONY });
  }
  const md = rows.find((s) => s.abbr === 'MD');
  if (md) {
    add(md, MD_CEREMONY);
    md.costs.push({ label: 'Check-in at the admission ceremony', amount: 20, note: 'Photo ID and $20 cash or check. Parking at the court lot is a separate $11.', source: MD_CEREMONY });
  }
  const de = rows.find((s) => s.abbr === 'DE');
  if (de) add(de, DE_CEREMONY);

  applyFeeSchedules(rows);
}

const ID_STATUTE: Src = { label: 'Idaho Code 3-409, license fees (2026 amounts)', url: 'https://legislature.idaho.gov/statutesrules/idstat/Title3/T3CH4/SECT3-409/' };
const IN_RULE: Src = { label: 'Indiana Admission and Discipline Rule 2, registration fees', url: 'https://rules.incourts.gov/pdf/PDF%20-%20Admission%20Discipline/admission-discipline.pdf' };
const ME_FEE: Src = { label: 'Maine Board of Overseers fee schedule, adopted October 2026', url: 'https://www.mebaroverseers.org/attorney_services/registration/fee_schedule.html' };
const LA_DUES: Src = { label: 'Louisiana State Bar Association dues and LADB assessment', url: 'https://www.lsba.org/members/MemberDues.aspx' };
const MT_QA: Src = { label: 'State Bar of Montana attorney dues table', url: 'https://www.montanabar.org/For-Attorneys/Attorney-Q-A' };
const NV_FEE: Src = { label: 'State Bar of Nevada annual fees', url: 'https://nvbar.org/licensing-compliance/membership-records/annual-fees-and-disclosures/' };
const GA_CHART: Src = { label: 'State Bar of Georgia new member license fee notice and proration chart', url: 'https://www.gabar.org/docs/default-source/membership/join/licensefeenoticeprorationschedule.pdf' };
const HI_FEE: Src = { label: 'Hawaii State Bar 2026 licensing fee schedule', url: 'https://cdn.sailamx.com/14/cms_uploads/9461cce28ebe3e76fb4b931c35a169b0/2026-Licensing-Dues-and-Fees.pdf' };
const NC_RULE: Src = { label: 'North Carolina State Bar rule .0203, annual membership fees', url: 'https://www.ncbar.gov/for-lawyers/ethics-and-governing-rules/governing-rules/1a-organization-of-the-north-carolina-state-bar/0200-membership-annual-membership-fees/0203-annual-membership-fees-when-due/' };
const CO_FEE: Src = { label: 'Colorado attorney registration fees, 2026 schedule', url: 'https://www.coloradolegalregulation.com/current-lawyers/fees_registration/' };
const CO_RULE: Src = { label: 'Colorado Rule 227, registration fee', url: 'https://www.coloradolegalregulation.com/wp-content/uploads/PDF/Registration/Rule%20227.pdf' };
const CO_OATH: Src = { label: 'Colorado Office of Attorney Registration, oath schedule', url: 'https://www.coloradolegalregulation.com/current-lawyers/newlyadmitted/' };
const MA_FEE: Src = { label: 'Board of Bar Overseers in-house registration instructions (Rules 4:02 and 4:03 fee table)', url: 'https://bbopublic.blob.core.windows.net/web/f/InHouseInitial.pdf' };

function setFee(rows: NationalState[], abbr: string, edit: (s: NationalState) => void) {
  const s = rows.find((row) => row.abbr === abbr);
  if (!s || s.upfront) return;
  edit(s);
}

function applyFeeSchedules(rows: NationalState[]) {
  setFee(rows, 'ID', (s) => {
    s.upfront = { low: 130, high: 200, label: '2026 license fee in the calendar year of Idaho admission' };
    s.upfrontNote = 'Idaho Code 3-409 sets 2026 active and house-counsel fees at $200 if admitted before July 1 and $130 if admitted after July 1. The next three calendar years are $350, then $485. A clients\' assistance fund assessment, not to exceed $20, is separate. The statute does not set this year\'s exact assessment.';
    s.feeRelief = true;
    s.feeReliefShort = '$130 if admitted after July 1';
    s.costs = [
      { label: '2026 license fee, admitted before July 1', amount: 200, note: 'Calendar year of admission. Idaho Code 3-409(3)(a)(i).', source: ID_STATUTE },
      { label: '2026 license fee, admitted after July 1', amount: 130, note: 'Calendar year of admission. Idaho Code 3-409(3)(a)(ii).', source: ID_STATUTE },
    ];
    add(s, ID_STATUTE);
  });
  setFee(rows, 'IN', (s) => {
    s.upfront = { low: 180, high: 180, label: 'Annual active registration fee' };
    s.upfrontNote = 'Admission and Discipline Rule 2, effective July 1, 2023: active attorneys pay $180. A lawyer admitted after August 1 pays the same $180 within 10 days of admission or by October 1, whichever is later. The rule does not prorate that $180. Inactive is half if an inactivity affidavit is filed by October 1.';
    s.feeReliefShort = 'No proration. Inactive is half with an affidavit.';
    s.costs = [
      { label: 'Active registration', amount: 180, note: 'Same amount if admitted after August 1. Due within 10 days or by October 1, whichever is later.', source: IN_RULE },
    ];
    add(s, IN_RULE);
  });
  setFee(rows, 'ME', (s) => {
    s.upfront = { low: 215, high: 215, label: 'License fee, admitted less than 3 years' };
    s.upfrontNote = 'The Board of Overseers schedule, adopted October 2026, lists $215 for attorneys admitted less than 3 years and $320 for those admitted more than 3 and less than 50 years. The fees include the mandatory Lawyers\' Fund for Client Protection and MAP assessments. Maine Bar Rule 4(a).';
    s.feeRelief = true;
    s.feeReliefShort = '$215 if admitted less than 3 years';
    s.costs = [
      { label: 'License fee, admitted less than 3 years', amount: 215, note: 'Schedule adopted October 2026. Includes LFCP and MAP.', source: ME_FEE },
    ];
    add(s, ME_FEE);
  });
  setFee(rows, 'LA', (s) => {
    s.upfront = { low: 250, high: 250, label: 'LSBA dues plus LADB assessment, admitted 3 years or less' };
    s.upfrontNote = 'The LSBA dues page lists $80 in dues and a $170 Louisiana Attorney Disciplinary Board assessment for members admitted 3 years or less. Members admitted more than 3 years are $200 plus $235. The table does not print a year. Checked Nov 10, 2026. This page does not use the attorney roster.';
    s.feeRelief = true;
    s.feeReliefShort = '$250 total if admitted 3 years or less';
    s.costs = [
      { label: 'LSBA dues, admitted 3 years or less', amount: 80, note: 'Current dues table. No roster data.', source: LA_DUES },
      { label: 'LADB assessment, admitted 3 years or less', amount: 170, note: 'Listed beside the dues on the same table.', source: LA_DUES },
    ];
    add(s, LA_DUES);
  });
  setFee(rows, 'MT', (s) => {
    s.upfront = { low: 220, high: 220, label: 'Listed New-Active total before the footnote' };
    s.upfrontNote = 'The State Bar table lists New-Active at $220: $50 dues, $25 license tax, $20 Lawyers\' Fund, $0 CLE fee, and $125 discipline counsel. The footnote says a pro-rated amount applies to the remainder of the fiscal year of admission (April 1 to March 31) and must be paid before swearing in. The page does not print the monthly fraction.';
    s.feeRelief = true;
    s.feeReliefShort = 'New-Active $220, then prorated. Formula not printed.';
    s.costs = [
      { label: 'New-Active total on the dues table', amount: 220, note: 'Footnote: prorated for the rest of the fiscal year of admission, due before the oath.', source: MT_QA },
    ];
    add(s, MT_QA);
  });
  setFee(rows, 'NV', (s) => {
    s.upfront = { low: 250, high: 250, label: 'Active renewal, admitted less than 5 years in any jurisdiction' };
    s.upfrontNote = 'The State Bar annual-fees page lists $250 for an active member admitted in any jurisdiction less than 5 years, counted from the first calendar year of admission anywhere. Five years or more is $450. Due January 1. A $100 late fee attaches March 2. The page does not print a separate proration rule.';
    s.feeRelief = true;
    s.feeReliefShort = '$250 if admitted less than 5 years';
    s.costs = [
      { label: 'Active renewal, less than 5 years', amount: 250, note: 'Due January 1. First calendar year of admission in any jurisdiction.', source: NV_FEE },
    ];
    add(s, NV_FEE);
  });
  setFee(rows, 'GA', (s) => {
    s.upfront = { low: 211, high: 260, label: 'Active license plus $15 assessments, September through November chart' };
    s.upfrontNote = 'The new-member notice says prorated fees apply to oaths from August 1 through May 14, and the chart prints three months: September $245 license plus $15 assessments, total $260 active; October $220 plus $15, total $235; November $196 plus $15, total $211. Other months say to call. A July oath owes the full annual license fee, and that full-year dollar is not printed on the chart. Enroll within 60 days or add $100.';
    s.feeRelief = true;
    s.feeReliefShort = 'Chart: $260 Sep, $235 Oct, $211 Nov';
    s.costs = [
      { label: 'September oath, active total', amount: 260, note: '$245 license fee plus $15 mandatory assessments.', source: GA_CHART },
      { label: 'October oath, active total', amount: 235, note: '$220 license fee plus $15 assessments.', source: GA_CHART },
      { label: 'November oath, active total', amount: 211, note: '$196 license fee plus $15 assessments.', source: GA_CHART },
    ];
    add(s, GA_CHART);
  });
  setFee(rows, 'HI', (s) => {
    s.upfront = { low: 444, high: 444, label: '2026 active private practice, admitted 2023 through 2026' };
    s.upfrontNote = 'The 2026 licensing fee schedule, calendar year January 1 to December 31, lists active private practitioners and in-house counsel with 1 to 4 years of practice (admitted 2023 through 2026) at $444: $150 HSBA, $15 processing, $200 Disciplinary Board, $35 Lawyers\' Fund for Client Protection, and $44 Attorneys and Judges Assistance Program. The Supreme Court sets the assessments. Government lawyers in that band are $409. The year of admission to any bar counts as a full year. No mid-year proration is printed.';
    s.feeRelief = true;
    s.feeReliefShort = '$444 for 1 to 4 years, not the $689 rate';
    s.costs = [
      { label: '2026 active private, admitted 2023-2026', amount: 444, note: 'Mandatory dues and Supreme Court assessments on the 2026 schedule.', source: HI_FEE },
    ];
    add(s, HI_FEE);
  });
  setFee(rows, 'NC', (s) => {
    s.upfront = { low: 0, high: 0, label: 'Dues in the year of first admission by examination' };
    s.upfrontNote = 'North Carolina State Bar rule .0203 says fees are not prorated, with this exception: a person licensed in North Carolina for the first time by examination is not liable for dues or the Client Security Fund assessment during the year of admission. The rule does not print the later-year dollar on that page.';
    s.feeRelief = true;
    s.feeReliefShort = '$0 dues in the year of admission by exam';
    s.costs = [
      { label: 'Dues and Client Security Fund, year of first admission by exam', amount: 0, note: 'Rule .0203(c)(1). Not prorated in other cases.', source: NC_RULE },
    ];
    add(s, NC_RULE);
  });
  setFee(rows, 'CO', (s) => {
    s.upfront = { low: 0, high: 190, label: 'No fee until the January after admission, then $190' };
    s.upfrontNote = 'Rule 227 says a lawyer files a registration statement at admission, and no annual fee is payable until January 1 following admission. The 2026 fee page then charges $190 active if first admission in Colorado or any other state was after January 1, 2023, and $395 if it was before that date. Due February 28.';
    s.feeRelief = true;
    s.feeReliefShort = '$0 until the January after admission, then $190';
    s.costs = [
      { label: 'Annual fee in the year of admission', amount: 0, note: 'Rule 227: no annual fee until January 1 following admission.', source: CO_RULE },
      { label: 'Active fee if first admission anywhere was after Jan 1, 2023', amount: 190, note: '2026 schedule. Due February 28 once the fee year starts.', source: CO_FEE },
    ];
    s.ceremonies = [{
      name: 'Remote Zoom oath, Office of Attorney Registration',
      when: 'Dec 2, Dec 10, Dec 17, Dec 23, and Dec 30, 2026, at 2:00 p.m. The usual Thursday 2:00 p.m. Zoom oath is skipped on Nov 26, Dec 3, Dec 24, and Dec 31.',
      fee: NOT_PUBLISHED,
      href: CO_OATH.url,
    }];
    add(s, CO_FEE); add(s, CO_RULE); add(s, CO_OATH);
  });
  setFee(rows, 'MA', (s) => {
    s.upfront = { low: 220, high: 271, label: 'Registration fee, fewer than five years' };
    s.upfrontNote = 'The Board of Bar Overseers states the registration fee under Supreme Judicial Court Rules 4:02 and 4:03, including a $51 optional Access to Justice fee, is $271 for attorneys registered fewer than five years. Opting out of the $51 leaves $220. Fees are not prorated for a partial year. The billing cycle is June 1 to May 31.';
    s.feeReliefShort = 'Not prorated. $51 Access to Justice fee is optional.';
    s.costs = [
      { label: 'Registration, fewer than five years, with the optional $51', amount: 271, note: 'Rules 4:02 and 4:03, as printed on the BBO registration instructions.', source: MA_FEE },
      { label: 'Same fee if the $51 is declined', amount: 220, note: 'The instructions say to subtract $51 to opt out.', source: MA_FEE },
    ];
    add(s, MA_FEE);
  });

  const note = (abbr: string, field: string, detail: string) => {
    const s = rows.find((row) => row.abbr === abbr);
    if (!s) return;
    s.gaps = s.gaps ?? [];
    s.gaps.push({ field, detail });
  };
  note('AK', 'Dues', 'The September 2026 new-member packet says dues are prorated and due February 1, and it does not print the dollar schedule. Checked Nov 10, 2026. Alaska Bar Association, (907) 272-7469.');
  note('OR', 'Dues for a 2026 admission', 'The 2026 fee FAQ prints $683 only for lawyers admitted before January 1, 2026, and a 30-day deadline for 2026 admissions, not the dollar. Checked Nov 10, 2026. Oregon State Bar, (503) 620-0222.');
  note('CO', 'Ceremony fee', 'The oath page says registration includes an online card payment and does not print that amount. Checked Nov 10, 2026. attorney_registration@coloradosupremecourt.us.');
  note('IL', 'Ceremony fee', 'The Supreme Court ceremony page for November 4, 2026 does not print a fee. Checked Nov 10, 2026. SC_BarMatters@IllinoisCourts.gov.');
  note('DE', 'Dues and ceremony fee', 'Rule 69 says the registration assessment is set by the Supreme Court and does not print the dollar. The July 2026 class page sets the December 9, 2026 ceremony and does not print a ceremony fee. Checked Nov 10, 2026. ARMS_BBE@delaware.gov.');
  note('OH', 'Registration fee', 'The ceremony FAQ prints the November 16, 2026 date and a $30 wall certificate only if the oath is later. It does not print the annual registration dollar. Checked Nov 10, 2026.');
}
