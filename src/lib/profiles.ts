// Attorney profile data model for /attorneys/[state]/[city]/[slug]/.
// Existing California pages live in src/data/unclaimed-ca.json (scripts/import_unclaimed.py).
// Later states and the California additions live in src/data/unclaimed-added.json
// (scripts/import_directory_profiles.py). New rows are unclaimed template output.
import unclaimedCa from '@/data/unclaimed-ca.json';
import unclaimedAdded from '@/data/unclaimed-added.json';
import { isSuppressedRecord } from '@/lib/suppression';
import zipCentroids from '../../public/data/zip-centroids.json';
import { miles, type LatLng } from '@/lib/geo';
import { expandCityName, expandSchool, slugifyPlace, zipRegion } from '@/lib/places';
import { US_STATES } from '@/lib/states';

const STATE_SUFFIXES = new Set(US_STATES.map((item) => item.code.toLowerCase()));
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

const FROZEN_CITIES = new Set(['office-unlisted', 'location-not-listed', 'international-offices']);
export const SLUG_REDIRECTS: { from: string; to: string }[] = [];

function presentProfile(p: AttorneyProfile): AttorneyProfile {
  if (p.demo) return p;
  if (p.claimed) return { ...p, lawSchool: expandSchool(p.lawSchool) };
  const cityName = expandCityName(p.cityName);
  const region = zipRegion(p.officeZip);
  const out = Boolean(region && region !== p.stateCode);
  const next: AttorneyProfile = {
    ...p,
    cityName,
    lawSchool: expandSchool(p.lawSchool),
    ...(out ? { officeState: p.officeState || region || undefined, locationLabel: p.locationLabel || `${cityName}, ${region}` } : {}),
  };
  const suffix = p.city.match(/-([a-z]{2})$/);
  const newCityBase = slugifyPlace(cityName);
  const keep = suffix && STATE_SUFFIXES.has(suffix[1]) && !newCityBase.endsWith(`-${suffix[1]}`) ? `-${suffix[1]}` : '';
  const newCity = `${newCityBase}${keep}`;
  if (cityName !== p.cityName && !FROZEN_CITIES.has(p.city) && newCity && newCity !== p.city) {
    SLUG_REDIRECTS.push(
      { from: `/attorneys/${p.state}/${p.city}/${p.slug}/`, to: `/attorneys/${p.state}/${newCity}/${p.slug}/` },
      { from: `/attorneys/${p.state}/${p.city}/`, to: `/attorneys/${p.state}/${newCity}/` },
    );
    next.city = newCity;
  }
  return next;
}

function publishable(profile: AttorneyProfile): boolean {
  return !isSuppressedRecord(profile);
}

// Suppressed names, emails, and bar keys never become pages, hub listings, or sitemap URLs.
export const PROFILES: AttorneyProfile[] = [
  ...DEMO_PROFILES,
  ...(unclaimedCa as AttorneyProfile[]).filter(publishable),
  ...(unclaimedAdded as AttorneyProfile[]).filter(publishable),
].map(presentProfile);

export const REAL_PROFILES = PROFILES.filter((p) => !p.demo);
export type CityGroup = {
  state: string; stateName: string; stateCode: string; city: string; cityName: string; profiles: AttorneyProfile[];
  nearby?: { href: string; label: string }[];
  nearbyByDistance?: boolean;
};
let cityGroupCache: CityGroup[] | null = null;
export function cityGroups(): CityGroup[] {
  if (cityGroupCache) return cityGroupCache;
  const m = new Map<string, CityGroup>();
  for (const p of REAL_PROFILES) {
    const k = `${p.state}/${p.city}`;
    if (!m.has(k)) m.set(k, { state: p.state, stateName: p.stateName, stateCode: p.stateCode, city: p.city, cityName: displayCity(p.cityName), profiles: [] });
    m.get(k)!.profiles.push(p);
  }
  for (const g of m.values()) g.profiles.sort((a, b) => a.name.localeCompare(b.name));
  const groups = [...m.values()].sort((a, b) => b.profiles.length - a.profiles.length || a.cityName.localeCompare(b.cityName));
  const zips = zipCentroids as unknown as Record<string, LatLng>;
  const anchor = (g: CityGroup): LatLng | null => {
    for (const profile of g.profiles) {
      const point = profile.officeZip ? zips[profile.officeZip] : undefined;
      if (point) return point;
    }
    return null;
  };
  const points = new Map(groups.map((g) => [g, anchor(g)]));
  for (const g of groups) {
    if (g.profiles.length >= 3) continue;
    const origin = points.get(g);
    const same = groups.filter((other) => other !== g && other.state === g.state);
    if (origin) {
      g.nearbyByDistance = true;
      g.nearby = same
        .map((other) => ({ other, distance: points.get(other) ? miles(origin, points.get(other) as LatLng) : Infinity }))
        .filter((item) => item.distance < Infinity)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map((item) => ({ href: cityPath(item.other.state, item.other.city), label: cityListLabel(item.other) }));
    } else {
      g.nearbyByDistance = false;
      g.nearby = [...same].sort((a, b) => b.profiles.length - a.profiles.length).slice(0, 5)
        .map((other) => ({ href: cityPath(other.state, other.city), label: cityListLabel(other) }));
    }
  }
  cityGroupCache = groups;
  return cityGroupCache;
}
export const cityPath = (state: string, city: string) => `/attorneys/${state}/${city}/`;

export const calbarUrl = (n: string) => `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${n}`;

const UNKNOWN_CITY_SLUGS = new Set(['office-unlisted', 'location-not-listed', 'international-offices']);
// New York, NY is a real city. Any other "city" equal to its state name means the record had no office city.
const REAL_STATE_NAMED_CITIES = new Set(['NY:new york']);

/** True when the record has no verified office city (missing, unlisted, or filled with the state name). */
export function cityUnknown(p: Pick<AttorneyProfile, 'city' | 'cityName' | 'stateName' | 'stateCode' | 'locationLabel' | 'officeState'>): boolean {
  if (UNKNOWN_CITY_SLUGS.has(p.city)) return true;
  if (p.locationLabel && /not listed/i.test(p.locationLabel)) return true;
  const city = (p.cityName || '').trim().toLowerCase();
  if (!city) return true;
  if (city === 'washington' && p.officeState === 'DC') return false;
  for (const code of [p.stateCode, p.officeState]) {
    const name = code ? US_STATES.find((s) => s.code === code)?.name.toLowerCase() : '';
    if (name && city === name && !REAL_STATE_NAMED_CITIES.has(`${code}:${city}`)) return true;
  }
  return city === p.stateName.toLowerCase() && !REAL_STATE_NAMED_CITIES.has(`${p.stateCode}:${city}`);
}

/** "Columbus, Ohio" becomes "Columbus" so labels never read "Columbus, Ohio, OH". */
export function displayCity(name: string): string {
  const text = (name || '').trim();
  for (const s of US_STATES) {
    const suffix = `, ${s.name}`;
    if (text.endsWith(suffix) && text.length > suffix.length) return text.slice(0, -suffix.length);
  }
  return text;
}

/** Visible place. Unknown cities read "Licensed in State"; existing pages stay "City, ST". */
export function placeLabel(p: AttorneyProfile): string {
  if (cityUnknown(p)) return `Licensed in ${p.stateName}`;
  const city = displayCity(p.cityName);
  if (p.locationLabel) return city !== p.cityName ? p.locationLabel.replace(`${p.cityName},`, `${city},`) : p.locationLabel;
  return `${city}, ${p.stateCode}`;
}

/** State-index label. Existing California cities keep the city name already published. */
export function cityListLabel(g: CityGroup): string {
  if (g.city === 'office-unlisted') return 'Office unlisted';
  if (g.profiles.length && g.profiles.every((p) => cityUnknown(p))) return 'Office city not listed';
  const officeStates = new Set(g.profiles.map((p) => p.officeState).filter(Boolean));
  const labels = new Set(g.profiles.map((p) => p.locationLabel).filter(Boolean));
  const outOfState = g.profiles.every((p) => p.officeState) && officeStates.size === 1 && [...officeStates][0] !== g.stateCode;
  if (outOfState && labels.size === 1) return placeLabel(g.profiles[0]);
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
export const seoTitle = (p: AttorneyProfile) => `${p.name}, ${p.claimed ? 'Business ' : ''}Attorney in ${cityUnknown(p) ? p.stateName : placeLabel(p)} | LegalGrads`;
export const seoDescription = (p: AttorneyProfile) => {
  if (p.claimed) return `${p.name} helps small businesses with contracts, formation and advice. Licensed in ${p.stateName} since ${p.admittedYear}.`;
  const school = p.lawSchool && p.lawSchool !== 'Not listed' ? ` (${p.lawSchool})` : '';
  const caInState = p.stateCode === 'CA' && p.recordLinkType === 'individual_official_profile' && (!p.officeState || p.officeState === 'CA');
  if ((!p.recordLinkType || caInState) && p.officeState && p.officeState !== p.stateCode) {
    return `${p.name} is licensed in ${p.stateName} and was admitted in ${p.admitted}${school}. Office: ${placeLabel(p)}. License #${p.barNumber} from State Bar records.`;
  }
  if ((!p.recordLinkType || caInState) && cityUnknown(p)) {
    return `${p.name} is an attorney licensed in ${p.stateName}, admitted in ${p.admitted}${school}. License #${p.barNumber} from State Bar records.`;
  }
  if (!p.recordLinkType || caInState) {
    return `${p.name} is a ${displayCity(p.cityName)}, ${p.stateCode} attorney admitted in ${p.admitted}${school}. License #${p.barNumber} from State Bar records.`;
  }
  const authority = p.sourceAuthority || `${p.stateName} licensing authority`;
  if (cityUnknown(p)) {
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
      address: { '@type': 'PostalAddress', ...(cityUnknown(p) ? {} : { addressLocality: p.cityName }), addressRegion: p.stateCode, addressCountry: 'US', ...(p.officeZip ? { postalCode: p.officeZip } : {}) },
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
        ...(cityUnknown(p) ? {} : { addressLocality: p.cityName }),
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
      { '@type': 'ListItem', position: 3, name: cityUnknown(p) ? 'Office city not listed' : p.cityName, item: `https://legalgrads.com${cityPath(p.state, p.city)}` },
      { '@type': 'ListItem', position: 4, name: p.name, item: url },
    ],
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}
