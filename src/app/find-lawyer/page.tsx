import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FindLawyerView } from '@/views/FindLawyerView';
export const metadata: Metadata = { title: 'Find a lawyer' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><FindLawyerView /></Suspense>;
}
