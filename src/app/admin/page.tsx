import type { Metadata } from 'next';
import { AdminView } from '@/views/AdminAuthFlows';
export const metadata: Metadata = { title: 'Admin' };
export default function Page() { return <AdminView />; }
