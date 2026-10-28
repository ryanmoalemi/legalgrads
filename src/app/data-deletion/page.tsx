import type { Metadata } from 'next';
import { DeletionView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Data deletion', description: 'Ask LegalGrads to delete your account data or take down an attorney listing created from public State Bar records.', alternates: { canonical: '/data-deletion/' } };
export default function Page() { return <DeletionView />; }
