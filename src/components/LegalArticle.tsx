import Link from 'next/link';
import type { LegalDoc } from '@/lib/legal';

export function LegalArticle({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {doc.draft ? <p className="demo-pill">DRAFT</p> : null}
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">{doc.title}</h1>
      <p className="mt-3 text-ink">{doc.description}</p>
      <p className="mt-2 text-sm text-ink">Updated {doc.updated.slice(0, 10)} · Legalgrads</p>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="font-display text-2xl font-extrabold">{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.heading}-${index}`} className="mt-3 leading-7 text-ink">{paragraph}</p>
          ))}
        </section>
      ))}
      <p className="mt-10 text-sm">
        <Link className="font-semibold text-purple" href="/legal/">All draft policies</Link>
      </p>
    </article>
  );
}
