import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ClientMatters } from '@/views/ClientViews';
export const metadata: Metadata = { title: 'Matters' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><ClientMatters /></Suspense>;
}
