import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PrivacyRequestView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Privacy request' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><PrivacyRequestView /></Suspense>;
}
