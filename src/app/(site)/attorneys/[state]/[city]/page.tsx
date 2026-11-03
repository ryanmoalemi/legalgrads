import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type CityGroup, cityGroups, cityListLabel, cityPath, hasLegacyProfiles, profilePath } from '@/lib/profiles';
import '@/app/(site)/attorneys/profile-template.css';

type Params = { state: string; city: string };
export const dynamicParams = false;
export function generateStaticParams() { return cityGroups().map(({ state, city }) => ({ state, city })); }
const find = (q: Params) => cityGroups().find((g) => g.state === q.state && g.city === q.city);

function cityHeading(g: CityGroup): string {
  if (!hasLegacyProfiles(g.profiles) && g.city === 'office-unlisted') return `${g.stateName} attorneys with no office city listed`;
  if (!hasLegacyProfiles(g.profiles) && (g.city === 'location-not-listed' || g.city === 'international-offices')) return `${g.stateName} attorneys, ${g.cityName}`;
  const place = cityListLabel(g);
  if (!hasLegacyProfiles(g.profiles) && place !== g.cityName) return `${place} offices of ${g.stateName} attorneys`;
  return `${g.cityName}, ${g.stateCode} attorneys admitted 2024 or later`;
}

function cityIntro(g: CityGroup): string {
  const n = g.profiles.length;
  const authority = g.profiles.find((p) => p.sourceAuthority)?.sourceAuthority || `${g.stateName} licensing authority`;
  if (hasLegacyProfiles(g.profiles)) {
    return `These ${n} attorneys were admitted to the State Bar of ${g.stateName} in 2024 or later and list a ${g.cityName} address. Each profile shows license details from public State Bar records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  if (g.city === 'office-unlisted' || g.city === 'location-not-listed') {
    return `These ${n} attorneys were admitted in ${g.stateName} in 2024 or later. No office city was published on the licensing record. Each profile shows the license status from ${authority} records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  if (g.city === 'international-offices') {
    return `These ${n} attorneys were admitted in ${g.stateName} in 2024 or later. The licensing record does not confirm a U.S. office city. Each profile shows the license status from ${authority} records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  const place = cityListLabel(g);
  if (place !== g.cityName) {
    return `These ${n} attorneys were admitted in ${g.stateName} in 2024 or later and list an office in ${place}. Each profile shows license details from ${authority} records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  return `These ${n} attorneys were admitted in ${g.stateName} in 2024 or later and list a ${g.cityName} address. Each profile shows license details from ${authority} records. LegalGrads doesn't rank or recommend attorneys.`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const g = find(await params);
  if (!g) return {};
  const n = g.profiles.length;
  const legacy = hasLegacyProfiles(g.profiles);
  const title = `${cityHeading(g)} | LegalGrads`;
  const description = legacy
    ? `Browse ${n} newly licensed ${g.cityName}, ${g.stateCode} attorney${n === 1 ? '' : 's'} with license details from ${g.stateName} State Bar records. Contact attorneys directly; no referral fees.`
    : `Browse ${n} attorney${n === 1 ? '' : 's'} admitted in ${g.stateName} in 2024 or later. License details come from public licensing records. Contact attorneys directly; no referral fees.`;
  return { title: { absolute: title }, description, alternates: { canonical: cityPath(g.state, g.city) }, openGraph: { title, description, url: cityPath(g.state, g.city) } };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const g = find(await params);
  if (!g) notFound();
  const url = `https://legalgrads.com${cityPath(g.state, g.city)}`;
  const heading = cityHeading(g);
  const legacy = hasLegacyProfiles(g.profiles);
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url, name: legacy ? `${g.cityName}, ${g.stateCode} attorneys` : heading, url,
      mainEntity: { '@type': 'ItemList', numberOfItems: g.profiles.length, itemListElement: g.profiles.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://legalgrads.com${profilePath(p)}`, name: p.name })) } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://legalgrads.com/' },
      { '@type': 'ListItem', position: 2, name: g.stateName, item: `https://legalgrads.com/attorneys/${g.state}/` },
      { '@type': 'ListItem', position: 3, name: legacy ? g.cityName : cityListLabel(g), item: url }] },
  ] };
  return (
    <div className="lgp"><main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href={`/attorneys/${g.state}/`}>{g.stateName}</Link> › {cityListLabel(g)}</nav>
      <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.15 }}>{legacy ? `Newly licensed attorneys in ${g.cityName}, ${g.stateCode}` : heading}</h1>
      <p style={{ margin: '10px 0 20px', maxWidth: 720 }}>{cityIntro(g)} <Link href="/find-lawyer/">Search the full directory</Link>.</p>
      <ul className="card" style={{ listStyle: 'none', columns: '260px' }}>
        {g.profiles.map((p) => <li key={p.slug} style={{ padding: '6px 0', breakInside: 'avoid' }}><Link href={profilePath(p)}>{p.name}</Link> <span className="small" style={{ color: '#6b6b8f' }}>· admitted {p.admitted}</span></li>)}
      </ul>
    </main></div>
  );
}
