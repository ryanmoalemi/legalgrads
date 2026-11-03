import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DeletionView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Data deletion', description: 'Ask LegalGrads to delete your account data or take down an attorney listing created from public State Bar records.', alternates: { canonical: '/data-deletion/' } };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading deletion request…</p>}><DeletionView /></Suspense>;
}
