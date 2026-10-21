import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Log in' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><LoginView /></Suspense>;
}
