const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmt = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
export const reportLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${SHORT_MONTHS[m - 1]} ${d}, ${y}`;
};
const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const usd = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`);

export function calc(input: string) {
  const [y, m, day] = input.split('-').map(Number);
  if (!y || !m || !day) return null;
  const oath = new Date(y, m - 1, day);
  if (oath.getFullYear() !== y || oath.getMonth() !== m - 1 || oath.getDate() !== day) return null;
  const mo = oath.getMonth();
  const fee = mo === 11 ? 0 : mo >= 5 ? 299 : 598;
  const band = mo === 11 ? 'dec' : mo >= 5 ? 'half' : 'full';
  const invoiceEst = addDays(oath, 45);
  const annual = new Date(oath.getFullYear() + 1, 2, 30);
  const natp = new Date(oath.getFullYear() + 1, oath.getMonth() + 1, 0);
  const dec1 = new Date(oath.getFullYear(), 11, 1);
  const waitDays = band === 'half' ? Math.round((dec1.getTime() - oath.getTime()) / 86400000) : 0;
  return { oath, fee, band, invoiceEst, annual, natp, waitDays, total: fee + 598 };
}

export function workdaysBetween(a: Date, b: Date) {
  let n = 0;
  for (let d = new Date(a); d < b; d = addDays(d, 1)) { const w = d.getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}

export type McleGroup = { id: string; letters: string; periodEnd: string; report: string };
export function mcleFor(oath: Date, g: McleGroup) {
  const [y, m, d] = g.periodEnd.split('-').map(Number);
  let end = new Date(y, m - 1, d);
  const start = new Date(oath.getFullYear(), oath.getMonth(), 1);
  while (end < start) end = new Date(end.getFullYear() + 3, end.getMonth(), end.getDate());
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const hours = Math.min(25, Math.round(((25 * months) / 36) * 2) / 2);
  return { start, end, report: addDays(end, 1), months, hours };
}

export function icsDownload(r: NonNullable<ReturnType<typeof calc>>) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ev = (d: Date, title: string, desc: string, id: string) => [
    'BEGIN:VEVENT', `UID:${id}-${ymd(d)}@legalgrads.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(d)}`, `DTEND;VALUE=DATE:${ymd(addDays(d, 1))}`,
    `SUMMARY:${title}`, `DESCRIPTION:${desc}`, 'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'END:VALARM', 'END:VEVENT',
  ];
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Legalgrads//Post-Bar Tracker//EN', 'CALSCALE:GREGORIAN',
    ...ev(addDays(r.oath, 30), `Pay CA State Bar initial license fee (${usd(r.fee)})`, 'Rule 2.12: due 45 days from your invoice date. Check your invoice for the exact date. legalgrads.com/resources/post-bar-licensing-tracker/california/', 'calbar-fee'),
    ...ev(new Date(r.oath.getFullYear(), r.oath.getMonth() + 11, r.oath.getDate()), 'Finish 10-hour CalBar New Attorney Training', `Deadline: ${fmt(r.natp)} (last day of the month of your 1-year anniversary).`, 'calbar-natp-reminder'),
    ...ev(r.natp, 'DEADLINE: CalBar New Attorney Training (10 hrs)', 'Miss it and you can be enrolled inactive.', 'calbar-natp'),
    ...ev(r.annual, 'CA State Bar annual license fee due', 'Annual fees are due March 30. 2026 active rate: $598.', 'calbar-annual'),
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'california-bar-deadlines.ics';
  a.click();
  URL.revokeObjectURL(a.href);
}

export const CA_PLAN_PATH = '/resources/post-bar-licensing-tracker/california/';

export function planSearch(state: { date: string; who: string; hourly: number; bonus: number; group: string; scaling: boolean; waiver: boolean }) {
  const sp = new URLSearchParams();
  sp.set('oath', state.date);
  sp.set('who', state.who);
  sp.set('hourly', String(state.hourly));
  sp.set('bonus', String(state.bonus));
  if (state.group) sp.set('mcle', state.group);
  if (state.scaling) sp.set('scale', '1');
  if (state.waiver) sp.set('waive', '1');
  return sp.toString();
}
