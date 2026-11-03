import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileEditorGate } from '@/views/ClaimFlow';
export const metadata: Metadata = { title: 'Edit listing', robots: { index: false, follow: false } };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading editor…</p>}><ProfileEditorGate /></Suspense>;
}
