import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ClaimView } from '@/views/ClaimFlow';

export const metadata: Metadata = {
  title: 'Claim your profile',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading claim page…</p>}><ClaimView /></Suspense>;
}
