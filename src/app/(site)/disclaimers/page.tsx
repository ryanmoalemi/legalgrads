import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['disclaimers'];
export const metadata: Metadata = { title: doc.title, description: 'Important disclaimers: LegalGrads is not a law firm, does not give legal advice and does not endorse any listed attorney.', alternates: { canonical: '/disclaimers/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
