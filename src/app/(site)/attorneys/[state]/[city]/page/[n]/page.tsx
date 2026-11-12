import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CityDirectory, cityMetadata, cityPageCount, findCity } from '@/components/CityDirectory';
import { cityGroups } from '@/lib/profiles';

// Page 2 and later of large city directories. Page 1 stays at the existing city URL.
type Params = { state: string; city: string; n: string };
export const dynamicParams = false;
export function generateStaticParams() {
  return cityGroups().flatMap((g) => Array.from({ length: cityPageCount(g) - 1 }, (_, i) => ({ state: g.state, city: g.city, n: String(i + 2) })));
}

function resolve(q: Params) {
  const g = findCity(q.state, q.city);
  const page = Number(q.n);
  if (!g || !Number.isInteger(page) || page < 2 || page > cityPageCount(g)) return null;
  return { g, page };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const hit = resolve(await params);
  return hit ? cityMetadata(hit.g, hit.page) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const hit = resolve(await params);
  if (!hit) notFound();
  return <CityDirectory g={hit.g} page={hit.page} />;
}
