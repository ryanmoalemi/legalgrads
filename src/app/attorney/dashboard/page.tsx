import type { Metadata } from 'next';
import { AttorneyDashboard } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Attorney dashboard' };
export default function Page() { return <AttorneyDashboard />; }
