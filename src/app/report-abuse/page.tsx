import type { Metadata } from 'next';
import { ReportView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Report a listing' };
export default function Page() { return <ReportView />; }
