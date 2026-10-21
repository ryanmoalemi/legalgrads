import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AttorneyMessages } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Messages' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><AttorneyMessages /></Suspense>;
}
