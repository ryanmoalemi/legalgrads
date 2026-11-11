import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OwnerDashboardView } from '@/views/OwnerEditor';
export const metadata: Metadata = { title: 'Profile stats', robots: { index: false, follow: false } };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading stats…</p>}><OwnerDashboardView /></Suspense>;
}
