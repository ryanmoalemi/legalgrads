import type { Metadata } from 'next';
import { ForAttorneysView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'For attorneys' };
export default function Page() { return <ForAttorneysView />; }
