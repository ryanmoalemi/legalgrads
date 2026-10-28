import type { Metadata } from 'next';
import { ContactView } from '@/views/Forms';
export const metadata: Metadata = { title: 'Contact', description: 'Contact LegalGrads with questions about listings, attorney profiles, corrections or partnerships. We reply by email.', alternates: { canonical: '/contact/' } };
export default function Page() { return <ContactView />; }
