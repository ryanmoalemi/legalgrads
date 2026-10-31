import type { Metadata } from 'next';
import { SpecialtiesView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Practice areas', description: 'Browse practice areas covered by newly licensed attorneys on LegalGrads, from contracts and business formation to family law and estate planning.', alternates: { canonical: '/specialties/' } };
export default function Page() { return <SpecialtiesView />; }
