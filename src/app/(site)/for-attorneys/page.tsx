import type { Metadata } from 'next';
import { ForAttorneysView } from '@/views/ForAttorneysView';
export const metadata: Metadata = { title: 'For attorneys: free listing for new lawyers', description: 'Newly licensed attorney? Get a free LegalGrads listing with a verified bar badge, your services and direct client contact. No referral fees.', alternates: { canonical: '/for-attorneys/' } };
export default function Page() { return <ForAttorneysView />; }
