// Attorney profile data model for /attorneys/[state]/[city]/[slug]/.
// Only fictional demo profiles live here for now. Do not add real attorneys until approved.
export type ProfileService = { icon: string; title: string; detail: string };
export type AttorneyProfile = {
  slug: string;
  state: string; // URL segment, e.g. 'ca'
  stateCode: string; // 'CA'
  stateName: string; // 'California'
  city: string; // URL segment
  cityName: string;
  name: string;
  barNumber: string;
  admitted: string; // e.g. 'Dec 2025'
  admittedYear: string;
  status: string; // 'Active'
  discipline: string;
  lawSchool: string;
  lastVerified: string; // e.g. 'Oct 27, 2026'
  demo?: boolean; // demo profiles are always noindex
  claimed?: {
    photo: string;
    headline: string;
    bio: string;
    joinedYear: string;
    languages: string[];
    remote?: string;
    meets: string;
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

export const PROFILES: AttorneyProfile[] = [
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

export const calbarUrl = (n: string) => `https://apps.calbar.ca.gov/attorney/Licensee/Detail/${n}`;
export const profilePath = (p: AttorneyProfile) => `/attorneys/${p.state}/${p.city}/${p.slug}/`;
export const firstName = (p: AttorneyProfile) => p.name.split(' ')[0];
export const initials = (p: AttorneyProfile) => p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const seoTitle = (p: AttorneyProfile) => `${p.name}, Business Attorney in ${p.cityName}, ${p.stateCode} | LegalGrads`;
export const seoDescription = (p: AttorneyProfile) => p.claimed
  ? `${p.name} helps small businesses with contracts, formation and advice. Licensed in ${p.stateName} since ${p.admittedYear}.`
  : `${p.name} is a ${p.stateName} attorney admitted in ${p.admittedYear}. License info from State Bar records.`;

export function profileJsonLd(p: AttorneyProfile) {
  const url = `https://legalgrads.com${profilePath(p)}`;
  const c = p.claimed;
  const person: Record<string, unknown> = {
    '@type': 'Person', '@id': `${url}#p`, name: p.name, jobTitle: 'Attorney', url,
    address: { '@type': 'PostalAddress', addressLocality: p.cityName, addressRegion: p.stateCode, addressCountry: 'US' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: p.lawSchool },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential', credentialCategory: 'license',
      name: `State Bar of ${p.stateName} license #${p.barNumber}`,
      recognizedBy: { '@type': 'Organization', name: `The State Bar of ${p.stateName}` }, url: calbarUrl(p.barNumber),
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
      { '@type': 'ListItem', position: 2, name: p.stateName, item: 'https://legalgrads.com/find-lawyer/' },
      { '@type': 'ListItem', position: 3, name: p.cityName, item: 'https://legalgrads.com/find-lawyer/' },
      { '@type': 'ListItem', position: 4, name: p.name, item: url },
    ],
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}
