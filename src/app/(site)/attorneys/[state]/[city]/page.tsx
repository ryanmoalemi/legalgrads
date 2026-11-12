import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CityDirectory, cityMetadata, findCity } from '@/components/CityDirectory';
import { cityGroups } from '@/lib/profiles';

type Params = { state: string; city: string };
export const dynamicParams = false;
export function generateStaticParams() { return cityGroups().map(({ state, city }) => ({ state, city })); }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const q = await params;
  const g = findCity(q.state, q.city);
  return g ? cityMetadata(g, 1) : {};
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const q = await params;
  const g = findCity(q.state, q.city);
  if (!g) notFound();
  return <CityDirectory g={g} page={1} />;
}
