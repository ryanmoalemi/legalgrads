import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['disclaimers'];
export const metadata: Metadata = { title: doc.title };
export default function Page() { return <LegalArticle doc={doc} />; }
