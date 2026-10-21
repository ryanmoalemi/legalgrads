import type { Metadata } from 'next';
import { ClientDashboard } from '@/views/ClientViews';
export const metadata: Metadata = { title: 'Dashboard' };
export default function Page() { return <ClientDashboard />; }
