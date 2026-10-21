import type { Metadata } from 'next';
import { SpecialtiesView } from '@/views/MarketingViews';
export const metadata: Metadata = { title: 'Practice areas' };
export default function Page() { return <SpecialtiesView />; }
