import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AttorneyLeads } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Leads' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><AttorneyLeads /></Suspense>;
}
