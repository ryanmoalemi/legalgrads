import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['do-not-sell-or-share'];
export const metadata: Metadata = { title: doc.title, description: 'LegalGrads does not sell personal information. Learn your California privacy rights and how to opt out of sharing.', alternates: { canonical: '/do-not-sell-or-share/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
