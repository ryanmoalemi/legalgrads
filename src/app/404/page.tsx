import type { Metadata } from 'next';
import { NotFoundView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Page not found' };
export default function Page() { return <NotFoundView />; }
