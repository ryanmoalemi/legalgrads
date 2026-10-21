import type { Metadata } from 'next';
import { ReportView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Report abuse' };
export default function Page() { return <ReportView />; }
