import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PublicProfileView } from '@/views/Phase2';
export const metadata: Metadata = { title: 'Attorney profile', robots: { index: false } };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading profile…</p>}><PublicProfileView /></Suspense>;
}
