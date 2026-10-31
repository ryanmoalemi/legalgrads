import type { Metadata } from 'next';
import { HowItWorksView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'How It Works', description: 'How LegalGrads works: attorneys are checked against State Bar records, clients browse and contact them directly, and we take no fee.', alternates: { canonical: '/how-it-works/' } };
export default function Page() { return <HowItWorksView />; }
