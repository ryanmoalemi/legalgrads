import type { Metadata } from 'next';
import { FaqView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'FAQ', description: 'Answers to common questions about LegalGrads: how attorneys are verified, what listings cost, and how to contact an attorney.', alternates: { canonical: '/faq/' } };
export default function Page() { return <FaqView />; }
