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
}
