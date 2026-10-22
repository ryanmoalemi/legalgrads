import type { Metadata } from 'next';
import { LegalIndex } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Legal' };
export default function Page() { return <LegalIndex />; }
