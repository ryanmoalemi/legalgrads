import type { Metadata } from 'next';
import { LegalIndex } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Legal', description: 'Legal notices for LegalGrads, including terms, privacy, disclaimers and attorney advertising disclosures.', alternates: { canonical: '/legal/' } };
export default function Page() { return <LegalIndex />; }
