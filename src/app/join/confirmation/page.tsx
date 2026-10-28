import type { Metadata } from 'next';
import { ConfirmationView } from '@/views/ConfirmationView';
export const metadata: Metadata = { title: 'Application received', robots: { index: false } };
export default function Page() { return <ConfirmationView />; }
