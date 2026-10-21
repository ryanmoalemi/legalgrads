import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ClientRequests } from '@/views/ClientViews';
export const metadata: Metadata = { title: 'Requests' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><ClientRequests /></Suspense>;
}
