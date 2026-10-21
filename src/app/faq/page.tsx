import type { Metadata } from 'next';
import { FaqView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'FAQ' };
export default function Page() { return <FaqView />; }
