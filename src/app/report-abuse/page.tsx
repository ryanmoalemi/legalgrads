import type { Metadata } from 'next';
import { ReportView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Report a listing', description: 'Report an incorrect, outdated or abusive LegalGrads attorney listing so we can review it and correct or remove it.', alternates: { canonical: '/report-abuse/' } };
export default function Page() { return <ReportView />; }
