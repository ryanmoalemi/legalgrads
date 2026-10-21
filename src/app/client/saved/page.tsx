import type { Metadata } from 'next';
import { ClientSaved } from '@/views/ClientViews';
export const metadata: Metadata = { title: 'Saved attorneys' };
export default function Page() { return <ClientSaved />; }
