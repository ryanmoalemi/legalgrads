import type { Metadata } from 'next';
import { HowItWorksView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'How It Works' };
export default function Page() { return <HowItWorksView />; }
