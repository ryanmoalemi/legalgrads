import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';
import { DOCS } from '@/lib/legal';
// Old URL kept so existing links still work; same content as /directory-disclosure/.
const doc = DOCS['directory-disclosure'];
export const metadata: Metadata = { title: doc.title, alternates: { canonical: '/directory-disclosure/' }, robots: { index: false } };
export default function Page() { return <LegalArticle doc={doc} />; }
