import type { Metadata } from 'next';
import { ProfileEditorView } from '@/views/Phase2';
export const metadata: Metadata = { title: 'Edit listing', robots: { index: false } };
export default function Page() { return <ProfileEditorView />; }
