import type { Metadata } from 'next';
import { PricingView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Pricing' };
export default function Page() { return <PricingView />; }
