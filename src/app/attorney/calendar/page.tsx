import type { Metadata } from 'next';
import { AttorneyCalendar } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Calendar' };
export default function Page() { return <AttorneyCalendar />; }
