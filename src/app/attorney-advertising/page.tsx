import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['attorney-advertising'];
export const metadata: Metadata = { title: doc.title, description: 'How LegalGrads handles attorney advertising rules, what listings show, and why the directory does not rank or recommend attorneys.', alternates: { canonical: '/attorney-advertising/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
