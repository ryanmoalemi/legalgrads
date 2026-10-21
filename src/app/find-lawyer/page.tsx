import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DirectoryView } from '@/views/DirectoryView';
export const metadata: Metadata = { title: 'Find an attorney' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-10">Loading listings…</p>}><DirectoryView /></Suspense>;
}
