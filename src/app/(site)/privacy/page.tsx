import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['privacy'];
export const metadata: Metadata = { title: doc.title, description: 'How LegalGrads collects, uses and protects personal information from visitors, attorneys and people who send messages.', alternates: { canonical: '/privacy/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
