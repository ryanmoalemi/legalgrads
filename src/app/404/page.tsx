import type { Metadata } from 'next';
import { NotFoundView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Not found' };
export default function Page() { return <NotFoundView />; }
