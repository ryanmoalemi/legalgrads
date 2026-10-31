import type { Metadata } from 'next';
import { AdminReviewView } from '@/views/Phase2';
export const metadata: Metadata = { title: 'Review applications', robots: { index: false } };
export default function Page() { return <AdminReviewView />; }
