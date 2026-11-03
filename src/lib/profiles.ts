// Attorney profile data model for /attorneys/[state]/[city]/[slug]/.
// Existing California pages live in src/data/unclaimed-ca.json (scripts/import_unclaimed.py).
// Later states and the California additions live in src/data/unclaimed-added.json
// (scripts/import_directory_profiles.py). New rows are unclaimed template output.
import unclaimedCa from '@/data/unclaimed-ca.json';
import unclaimedAdded from '@/data/unclaimed-added.json';
export type ProfileService = { icon: string; title: string; detail: string };
export type RecordLinkType = 'individual_official_profile' | 'individual_official_data_record' | 'shared_official_roster_page';
export type AttorneyProfile = {
  slug: string;
  state: string; // URL segment, e.g. 'ca'
  stateCode: string; // 'CA'
  stateName: string; // 'California'
  city: string; // URL segment
  cityName: string;
  name: string;
  barNumber: string;
  admitted: string; // e.g. 'Dec 2025' or a year when the source published no day
  admittedYear: string;
  status: string; // preserved literally, e.g. 'Active'
  discipline: string;
  lawSchool: string;
  lastVerified: string; // e.g. 'Oct 27, 2026'
  demo?: boolean; // demo profiles are always noindex
  officeZip?: string;
  officeState?: string;
  admissionDate?: string;
  locationLabel?: string;
  recordLinkType?: RecordLinkType;
  registryRecordUrl?: string;
  sourceUrl?: string;
  officialLookupUrl?: string;
  sourceAuthority?: string;
  claimed?: {
    photo: string;
    headline: string;
    bio: string;
    joinedYear: string;
    languages: string[];
    remote?: string;
    meets: string;
    inPerson?: boolean; // Offers in-person meetings / will visit your business
    services: ProfileService[];
    practiceAreas: string[];
    knowsAbout: string[];
    email: string;
    website?: string;
    phone?: string;
  };
};

const base = {
  state: 'ca', stateCode: 'CA', stateName: 'California', city: 'san-diego', cityName: 'San Diego',
  name: 'Jordan Example', barNumber: '000000', admitted: 'Dec 2025', admittedYear: '2025', status: 'Active',
  discipline: 'None on record', lawSchool: 'Example School of Law', lastVerified: 'Oct 27, 2026', demo: true,
};

const DEMO_PROFILES: AttorneyProfile[] = [
  { ...base, slug: 'jordan-example-demo-unclaimed' },
  {
    ...base,
    slug: 'jordan-example-demo-claimed',
    claimed: {
      photo: '/images/profiles/demo-attorney.jpg',
      headline: 'Business & contracts attorney for small businesses',
      bio: "I help small business owners get their paperwork right the first time: contracts, LLC setup and the letters that get you paid. Before law school I ran the books for my family's restaurant, so I know what a surprise legal bill feels like. I keep things plain-English and responsive.",
      joinedYear: '2026',
      languages: ['English', 'Spanish'],
      remote: 'Remote across California',
      meets: 'Video, phone, in person',
      inPerson: true,
      services: [
        { icon: '📝', title: 'Contract drafting', detail: 'Vendor, client & service agreements' },
        { icon: '🔍', title: 'Contract review', detail: 'Plain-English redlines before you sign' },
        { icon: '✉️', title: 'Demand & business letters', detail: 'Collections, cease-and-desist, notices' },
        { icon: '🏢', title: 'Business formation', detail: 'LLC / corporation setup & operating agreements' },
        { icon: '💬', title: 'Legal advice sessions', detail: 'Quick answers for owners, by video or phone' },
        { icon: '📄', title: 'Policies & templates', detail: 'Website terms, privacy, contractor forms' },
      ],
      practiceAreas: ['Business & corporate', 'Contracts', 'Small business', 'Employment basics', 'Intellectual property basics'],
      knowsAbout: ['Contracts', 'Business formation', 'Small business law'],
      email: 'jordan@example.com',
      website: 'https://example.com',
      phone: '(619) 555-0100',
    },
  },
];

export const PROFILES: AttorneyProfile[] = [...DEMO_PROFILES, ...(unclaimedCa as AttorneyProfile[]), ...(unclaimedAdded as AttorneyProfile[])];

export const REAL_PROFILES = PROFILES.filter((p) => !p.demo);
export type CityGroup = { state: string; stateName: string; stateCode: string; city: string; cityName: string; profiles: AttorneyProfile[] };
let cityGroupCache: CityGroup[] | null = null;
export function cityGroups(): CityGroup[] {
  if (cityGroupCache) return cityGroupCache;
  const m = new Map<string, CityGroup>();
  for (const p of REAL_PROFILES) {
    const k = `${p.state}/${p.city}`;
    if (!m.has(k)) m.set(k, { state: p.state, stateName: p.stateName, stateCode: p.stateCode, city: p.city, cityName: p.cityName, profiles: [] });
    m.get(k)!.profiles.push(p);
  }
  for (const g of m.values()) g.profiles.sort((a, b) => a.name.localeCompare(b.name));
  cityGroupCache = [...m.values()].sort((a, b) => b.profiles.length - a.profiles.length || a.cityName.localeCompare(b.cityName));
  return cityGroupCache;
}
export const cityPath = (state: string, city: string) => `/attorneys/${state}/${city}/`;

export const calbarUrl = (n: string) => `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${n}`;

/** Visible place. Existing pages have no locationLabel, so they stay "City, ST". */
export function placeLabel(p: AttorneyProfile): string {
  if (p.city === 'office-unlisted') return 'Office unlisted';
  if (p.locationLabel) return p.locationLabel;
  return `${p.cityName}, ${p.stateCode}`;
}

/** State-index label. Existing California cities keep the city name already published. */
export function cityListLabel(g: CityGroup): string {
  if (g.city === 'office-unlisted') return 'Office unlisted';
  const officeStates = new Set(g.profiles.map((p) => p.officeState).filter(Boolean));
  const labels = new Set(g.profiles.map((p) => p.locationLabel).filter(Boolean));
  const outOfState = g.profiles.every((p) => p.officeState) && officeStates.size === 1 && [...officeStates][0] !== g.stateCode;
  if (outOfState && labels.size === 1) return [...labels][0] as string;
  return g.cityName;
}

export function hasLegacyProfiles(profiles: AttorneyProfile[]): boolean {
  return profiles.some((p) => !p.recordLinkType);
}

/** Individual HTML profile or New York official data record. A shared roster is not one of these. */
export function isIndividualRecord(p: AttorneyProfile): boolean {
  return p.recordLinkType === 'individual_official_profile' || p.recordLinkType === 'individual_official_data_record';
}

export function officialHref(p: AttorneyProfile): string {
  if (!p.recordLinkType) return calbarUrl(p.barNumber);
  if (isIndividualRecord(p)) return p.registryRecordUrl || p.sourceUrl || p.officialLookupUrl || '';
  return p.sourceUrl || p.officialLookupUrl || '';
}

export function officialLinkLabel(p: AttorneyProfile): string {
  if (p.recordLinkType === 'individual_official_data_record') return 'official record';
  if (p.recordLinkType === 'shared_official_roster_page') return 'official roster';
  return 'official profile';
}

export const profilePath = (p: AttorneyProfile) => `/attorneys/${p.state}/${p.city}/${p.slug}/`;
export const firstName = (p: AttorneyProfile) => p.name.split(' ')[0];
export const initials = (p: AttorneyProfile) => p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const seoTitle = (p: AttorneyProfile) => `${p.name}, ${p.claimed ? 'Business ' : ''}Attorney in ${p.city === 'office-unlisted' ? p.stateName : placeLabel(p)} | LegalGrads`;
export const seoDescription = (p: AttorneyProfile) => {
  if (p.claimed) return `${p.name} helps small businesses with contracts, formation and advice. Licensed in ${p.stateName} since ${p.admittedYear}.`;
  const school = p.lawSchool && p.lawSchool !== 'Not listed' ? ` (${p.lawSchool})` : '';
  const caInState = p.stateCode === 'CA' && p.recordLinkType === 'individual_official_profile' && (!p.officeState || p.officeState === 'CA');
  if (!p.recordLinkType || caInState) {
    return `${p.name} is a ${p.cityName}, ${p.stateCode} attorney admitted in ${p.admitted}${school}. License #${p.barNumber} from State Bar records.`;
  }
  const authority = p.sourceAuthority || `${p.stateName} licensing authority`;
  if (p.city === 'office-unlisted') {
    return `${p.name} is licensed in ${p.stateName} and was admitted in ${p.admitted}${school}. No office city was published. License #${p.barNumber} from ${authority} records.`;
  }
  return `${p.name} is licensed in ${p.stateName} and was admitted in ${p.admitted}${school}. Office: ${placeLabel(p)}. License #${p.barNumber} from ${authority} records.`;
};

export function profileJsonLd(p: AttorneyProfile) {
  const url = `https://legalgrads.com${profilePath(p)}`;
  const c = p.claimed;
  const person: Record<string, unknown> = !p.recordLinkType
    ? {
      '@type': 'Person', '@id': `${url}#p`, name: p.name, jobTitle: 'Attorney', url,
      address: { '@type': 'PostalAddress', addressLocality: p.cityName, addressRegion: p.stateCode, addressCountry: 'US', ...(p.officeZip ? { postalCode: p.officeZip } : {}) },
      alumniOf: { '@type': 'CollegeOrUniversity', name: p.lawSchool },
      hasCredential: {
        '@type': 'EducationalOccupationalCredential', credentialCategory: 'license',
        name: `State Bar of ${p.stateName} license #${p.barNumber}`,
        recognizedBy: { '@type': 'Organization', name: `The State Bar of ${p.stateName}` }, url: calbarUrl(p.barNumber),
      },
    }
    : {
      '@type': 'Person', '@id': `${url}#p`, name: p.name, jobTitle: 'Attorney', url,
      address: {
        '@type': 'PostalAddress', addressCountry: 'US',
        ...(p.city === 'office-unlisted' ? {} : { addressLocality: p.cityName }),
        ...(p.officeState ? { addressRegion: p.officeState } : p.city === 'office-unlisted' ? {} : { addressRegion: p.stateCode }),
        ...(p.officeZip ? { postalCode: p.officeZip } : {}),
      },
      ...(p.lawSchool && p.lawSchool !== 'Not listed' ? { alumniOf: { '@type': 'CollegeOrUniversity', name: p.lawSchool } } : {}),
      hasCredential: {
        '@type': 'EducationalOccupationalCredential', credentialCategory: 'license',
        name: `${p.sourceAuthority || p.stateName} license #${p.barNumber}`,
        recognizedBy: { '@type': 'Organization', name: p.sourceAuthority || `The State Bar of ${p.stateName}` },
        ...(officialHref(p) ? { url: officialHref(p) } : {}),
      },
    };
  const graph: Record<string, unknown>[] = [person];
  if (c) {
    Object.assign(person, { image: `https://legalgrads.com${c.photo}`, knowsLanguage: c.languages, knowsAbout: c.knowsAbout, worksFor: { '@id': `${url}#svc` } });
    if (c.website) person.sameAs = [c.website];
    graph.push({
      '@type': 'LegalService', '@id': `${url}#svc`, name: `${p.name}, Attorney at Law`, image: `https://legalgrads.com${c.photo}`,
      areaServed: p.stateName, address: { '@type': 'PostalAddress', addressLocality: p.cityName, addressRegion: p.stateCode },
      url: c.website ?? url, employee: { '@id': `${url}#p` },
    });
  }
  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://legalgrads.com/' },
      { '@type': 'ListItem', position: 2, name: p.stateName, item: `https://legalgrads.com/attorneys/${p.state}/` },
      { '@type': 'ListItem', position: 3, name: p.cityName, item: `https://legalgrads.com${cityPath(p.state, p.city)}` },
      { '@type': 'ListItem', position: 4, name: p.name, item: url },
    ],
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}
