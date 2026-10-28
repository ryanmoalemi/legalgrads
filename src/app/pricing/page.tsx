import type { Metadata } from 'next';
import { PricingView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Pricing', description: 'LegalGrads listings are free for newly licensed attorneys. See what is included and how any optional future features would be priced.', alternates: { canonical: '/pricing/' } };
export default function Page() { return <PricingView />; }
