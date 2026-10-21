import type { Metadata } from 'next';
import { HowView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'How it works' };
export default function Page() { return <HowView />; }
