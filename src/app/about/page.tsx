import type { Metadata } from 'next';
import { AboutView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'About' };
export default function Page() { return <AboutView />; }
