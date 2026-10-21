import type { Metadata } from 'next';
import { DeletionView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Data deletion' };
export default function Page() { return <DeletionView />; }
