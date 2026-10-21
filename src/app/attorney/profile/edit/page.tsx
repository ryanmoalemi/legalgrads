import type { Metadata } from 'next';
import { AttorneyProfileEdit } from '@/views/AttorneyViews';
export const metadata: Metadata = { title: 'Edit profile' };
export default function Page() { return <AttorneyProfileEdit />; }
