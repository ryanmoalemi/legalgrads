import type { Metadata } from 'next';
import { DataDeletionView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Data deletion' };
export default function Page() { return <DataDeletionView />; }
