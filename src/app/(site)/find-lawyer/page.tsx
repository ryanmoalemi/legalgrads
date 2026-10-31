import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DirectoryView } from '@/views/DirectoryView';
export const metadata: Metadata = { title: 'Find an attorney', description: 'Search newly licensed attorneys by state, city, practice area or distance. Every listing links to State Bar records; contact attorneys directly.', alternates: { canonical: '/find-lawyer/' } };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading listings…</p>}><DirectoryView /></Suspense>;
}
