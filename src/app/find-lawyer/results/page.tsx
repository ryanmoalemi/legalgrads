import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResultsView } from '@/views/ResultsView';
export const metadata: Metadata = { title: 'Search results' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><ResultsView /></Suspense>;
}
