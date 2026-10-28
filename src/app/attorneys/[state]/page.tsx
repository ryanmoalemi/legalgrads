import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cityGroups, cityPath } from '@/lib/profiles';
import '@/app/attorneys/profile-template.css';

type Params = { state: string };
export const dynamicParams = false;
export function generateStaticParams() { return [...new Set(cityGroups().map((g) => g.state))].map((state) => ({ state })); }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { state } = await params;
  const gs = cityGroups().filter((g) => g.state === state);
  if (!gs.length) return {};
  const total = gs.reduce((n, g) => n + g.profiles.length, 0);
  const title = `${gs[0].stateName} attorneys admitted 2024 or later, by city | LegalGrads`;
  const description = `Find ${total} newly licensed ${gs[0].stateName} attorneys across ${gs.length} cities, with license details from State Bar records. Browse by city and contact attorneys directly.`;
  return { title: { absolute: title }, description, alternates: { canonical: `/attorneys/${state}/` }, openGraph: { title, description, url: `/attorneys/${state}/` } };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { state } = await params;
  const gs = cityGroups().filter((g) => g.state === state);
  if (!gs.length) notFound();
  const total = gs.reduce((n, g) => n + g.profiles.length, 0);
  return (
    <div className="lgp"><main className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › {gs[0].stateName}</nav>
      <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.15 }}>Newly licensed {gs[0].stateName} attorneys by city</h1>
      <p style={{ margin: '10px 0 20px', maxWidth: 720 }}>{total} attorneys admitted in 2024 or later, grouped by the city on their State Bar record. <Link href="/find-lawyer/">Search the directory</Link> to sort by distance.</p>
      <ul className="card" style={{ listStyle: 'none', columns: '220px' }}>
        {gs.map((g) => <li key={g.city} style={{ padding: '6px 0' }}><Link href={cityPath(g.state, g.city)}>{g.cityName}</Link> <span className="small" style={{ color: '#6b6b8f' }}>({g.profiles.length})</span></li>)}
      </ul>
    </main></div>
  );
}
