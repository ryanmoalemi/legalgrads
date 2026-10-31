import type { Metadata } from 'next';
import { AttorneyLoginView } from '@/views/Phase2';
export const metadata: Metadata = { title: 'Attorney sign in', robots: { index: false } };
export default function Page() { return <AttorneyLoginView />; }
