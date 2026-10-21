import type { Metadata } from 'next';
import { ClientSettings } from '@/views/ClientViews';
export const metadata: Metadata = { title: 'Account' };
export default function Page() { return <ClientSettings />; }
