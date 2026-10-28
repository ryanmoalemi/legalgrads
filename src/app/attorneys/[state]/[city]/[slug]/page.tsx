import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AttorneyProfilePage } from '@/components/AttorneyProfilePage';
import { PROFILES, profilePath, seoDescription, seoTitle } from '@/lib/profiles';

type Params = { state: string; city: string; slug: string };
export const dynamicParams = false;
export function generateStaticParams() { return PROFILES.map(({ state, city, slug }) => ({ state, city, slug })); }
const find = (q: Params) => PROFILES.find((p) => p.state === q.state && p.city === q.city && p.slug === q.slug);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = find(await params);
  if (!p) return {};
  const title = seoTitle(p);
  const description = seoDescription(p);
  return {
    title: { absolute: title }, description,
    alternates: { canonical: profilePath(p) },
    // Real profiles are indexable; fictional demo profiles are always noindex.
    robots: p.demo ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url: profilePath(p), type: 'profile', ...(p.claimed ? { images: [p.claimed.photo] } : {}) },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = find(await params);
  if (!p) notFound();
  return <AttorneyProfilePage p={p} />;
}
