import type { Metadata } from 'next';
import { ForAttorneysView } from '@/views/ForAttorneysView';
export const metadata: Metadata = { title: 'For Attorneys' };
export default function Page() { return <ForAttorneysView />; }
