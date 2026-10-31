import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['accessibility'];
export const metadata: Metadata = { title: doc.title, description: 'Our accessibility commitment for legalgrads.com, the standards we target, and how to report a barrier you run into.', alternates: { canonical: '/accessibility/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
