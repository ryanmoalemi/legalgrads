import type { Metadata } from 'next';
import { PrivacyRequestView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Privacy request' };
export default function Page() { return <PrivacyRequestView />; }
