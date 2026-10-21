import type { Metadata } from 'next';
import { AttorneyServices } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Services and pricing' };
export default function Page() { return <AttorneyServices />; }
