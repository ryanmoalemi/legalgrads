import type { Metadata } from 'next';
import { ApplyView } from '@/views/ApplyView';
export const metadata: Metadata = { title: 'Apply as a Founding Member' };
export default function Page() { return <ApplyView />; }
