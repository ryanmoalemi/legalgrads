import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['how-we-build-legalgrads'];
export const metadata: Metadata = { title: doc.title, description: doc.description, alternates: { canonical: '/how-we-build-legalgrads/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
