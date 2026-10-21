import type { Metadata } from 'next';
import { VerifyEmailView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Verify email' };
export default function Page() { return <VerifyEmailView />; }
