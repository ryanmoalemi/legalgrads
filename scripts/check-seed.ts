import { buildSeed } from '../src/lib/seed';
import { searchAttorneys } from '../src/lib/search';

const db = buildSeed();
const problems: string[] = [];
if (db.attorneyProfiles.length !== 12) problems.push(`attorneys ${db.attorneyProfiles.length}`);
if (db.services.length !== 20) problems.push(`services ${db.services.length}`);
if (db.inquiries.length !== 8) problems.push(`inquiries ${db.inquiries.length}`);
if (db.appointments.length !== 4) problems.push(`appointments ${db.appointments.length}`);
if (db.matters.filter((m) => m.status === 'active').length !== 3) problems.push('active matters');
if (db.conversations.length !== 6) problems.push(`conversations ${db.conversations.length}`);
if (db.users.filter((u) => u.role === 'client').length !== 2) problems.push('clients');
const bookable = searchAttorneys(db, {});
const names = bookable.map((a) => a.displayName).join('|');
for (const blocked of ['Kevin', 'Daniel', 'Ryan P']) {
  if (names.includes(blocked)) problems.push(`bookable includes ${blocked}`);
}
if (bookable.length !== 9) problems.push(`bookable ${bookable.length}`);
const contracts = searchAttorneys(db, { specialties: ['contracts'] });
if (!contracts.some((a) => a.slug === 'maya-r')) problems.push('maya missing from contracts');
if (contracts.some((a) => a.slug === 'jordan-k')) problems.push('jordan in contracts');
const ca = searchAttorneys(db, { jurisdiction: 'CA' });
if (ca.some((a) => !a.licenseJurisdictions.includes('CA'))) problems.push('non-CA in CA');
if (ca.length !== 4) problems.push(`CA count ${ca.length}`);
const nicole = bookable.find((a) => a.slug === 'nicole-a');
if (!nicole) problems.push('nicole not bookable');
if (db.reviews.some((r) => r.attorneyId === 'user_nicole')) problems.push('nicole has a review');
if (!problems.length) console.log('seed ok', { bookable: bookable.length, contracts: contracts.length, ca: ca.length });
else {
  console.error(problems.join('\n'));
  process.exit(1);
}
