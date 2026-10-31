import type { Metadata } from 'next';
import { PrivacyRequestView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Privacy request', description: 'Submit a privacy request to LegalGrads to access, correct or delete your personal information.', alternates: { canonical: '/privacy-request/' } };
export default function Page() { return <PrivacyRequestView />; }
