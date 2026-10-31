import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['security'];
export const metadata: Metadata = { title: doc.title, description: 'How LegalGrads protects attorney applications, messages and account data, and how to report a security issue.', alternates: { canonical: '/security/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
