import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['terms'];
export const metadata: Metadata = { title: doc.title, description: 'The terms of use for legalgrads.com, covering directory listings, messaging, acceptable use and limitations of liability.', alternates: { canonical: '/terms/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
