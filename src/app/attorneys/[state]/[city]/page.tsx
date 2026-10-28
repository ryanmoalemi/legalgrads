import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cityGroups, cityPath, profilePath } from '@/lib/profiles';
import '@/app/attorneys/profile-template.css';

type Params = { state: string; city: string };
export const dynamicParams = false;
export function generateStaticParams() { return cityGroups().map(({ state, city }) => ({ state, city })); }
const find = (q: Params) => cityGroups().find((g) => g.state === q.state && g.city === q.city);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const g = find(await params);
  if (!g) return {};
  const n = g.profiles.length;
  const title = `${g.cityName}, ${g.stateCode} attorneys admitted 2024 or later | LegalGrads`;
  const description = `Browse ${n} newly licensed ${g.cityName}, ${g.stateCode} attorney${n === 1 ? '' : 's'} with license details from ${g.stateName} State Bar records. Contact attorneys directly; no referral fees.`;
  return { title: { absolute: title }, description, alternates: { canonical: cityPath(g.state, g.city) }, openGraph: { title, description, url: cityPath(g.state, g.city) } };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const g = find(await params);
  if (!g) notFound();
  const url = `https://legalgrads.com${cityPath(g.state, g.city)}`;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url, name: `${g.cityName}, ${g.stateCode} attorneys`, url,
      mainEntity: { '@type': 'ItemList', numberOfItems: g.profiles.length, itemListElement: g.profiles.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://legalgrads.com${profilePath(p)}`, name: p.name })) } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://legalgrads.com/' },
      { '@type': 'ListItem', position: 2, name: g.stateName, item: `https://legalgrads.com/attorneys/${g.state}/` },
      { '@type': 'ListItem', position: 3, name: g.cityName, item: url }] },
  ] };
  return (
    <div className="lgp"><main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href={`/attorneys/${g.state}/`}>{g.stateName}</Link> › {g.cityName}</nav>
      <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.15 }}>Newly licensed attorneys in {g.cityName}, {g.stateCode}</h1>
      <p style={{ margin: '10px 0 20px', maxWidth: 720 }}>These {g.profiles.length} attorneys were admitted to the State Bar of {g.stateName} in 2024 or later and list a {g.cityName} address. Each profile shows license details from public State Bar records. LegalGrads doesn&apos;t rank or recommend attorneys. <Link href="/find-lawyer/">Search the full directory</Link>.</p>
      <ul className="card" style={{ listStyle: 'none', columns: '260px' }}>
        {g.profiles.map((p) => <li key={p.slug} style={{ padding: '6px 0', breakInside: 'avoid' }}><Link href={profilePath(p)}>{p.name}</Link> <span className="small" style={{ color: '#6b6b8f' }}>· admitted {p.admitted}</span></li>)}
      </ul>
    </main></div>
  );
}
