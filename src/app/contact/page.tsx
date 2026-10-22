import type { Metadata } from 'next';
import { ContactView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Contact' };
export default function Page() { return <ContactView />; }
