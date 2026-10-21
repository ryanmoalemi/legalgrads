import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ATTORNEY_SLUGS } from '@/lib/catalog';
import { ProfileView } from '@/views/ProfileView';
export const dynamicParams = false;
export function generateStaticParams() { return ATTORNEY_SLUGS.map((slug) => ({ slug })); }
export const metadata: Metadata = { title: 'Attorney profile' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><ProfileView /></Suspense>;
}
