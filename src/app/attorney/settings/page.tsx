import type { Metadata } from 'next';
import { AttorneySettings } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Settings' };
export default function Page() { return <AttorneySettings />; }
