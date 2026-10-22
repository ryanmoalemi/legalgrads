import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['do-not-sell-or-share'];
export const metadata: Metadata = { title: doc.title };
export default function Page() { return <LegalArticle doc={doc} />; }
