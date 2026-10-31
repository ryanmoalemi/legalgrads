import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
const doc = DOCS['attorney-terms'];
export const metadata: Metadata = { title: doc.title, description: 'Terms for attorneys who list on LegalGrads, including verification, profile content rules and messaging.', alternates: { canonical: '/attorney-terms/' } };
export default function Page() { return <LegalArticle doc={doc} />; }
