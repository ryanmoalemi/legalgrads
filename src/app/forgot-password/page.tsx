import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ForgotPasswordView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Forgot password' };
export default function Page() {
  return <Suspense fallback={<p className="px-4 py-8">Loading…</p>}><ForgotPasswordView /></Suspense>;
}
