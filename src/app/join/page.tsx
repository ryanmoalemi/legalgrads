import type { Metadata } from 'next';
import { ApplyView } from '@/views/ApplyView';
export const metadata: Metadata = { title: 'Apply for a free listing' };
export default function Page() { return <ApplyView />; }
