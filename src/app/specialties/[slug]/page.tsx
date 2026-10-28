import type { Metadata } from 'next';
import { SPECIALTIES } from '@/lib/catalog';
import { SpecialtyDetail } from '@/views/MarketingViews';
export const dynamicParams = false;
export function generateStaticParams() { return SPECIALTIES.map((s) => ({ slug: s.slug })); }
export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const name = SPECIALTIES.find((s) => s.slug === slug)?.name ?? 'Practice area';
    return { title: `${name} attorneys`, description: `Find newly licensed attorneys who help with ${name.toLowerCase()}. Check State Bar license details and contact attorneys directly on LegalGrads.`, alternates: { canonical: `/specialties/${slug}/` } };
  });
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SpecialtyDetail slug={slug} />;
}
