import type { Metadata } from 'next';
import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { cityGroups } from '@/lib/profiles';
import { LEGAL_LINKS } from '@/lib/legal';
export const metadata: Metadata = { title: 'Site map', description: 'Every main section of Legalgrads in one place.', alternates: { canonical: '/sitemap/' } };
const MAIN = [['/', 'Home'], ['/find-lawyer/', 'Find an attorney'], ['/specialties/', 'Practice areas'], ['/how-it-works/', 'How it works'], ['/about/', 'About'], ['/faq/', 'FAQ'], ['/contact/', 'Contact'], ['/for-attorneys/', 'For attorneys'], ['/join/', 'Join free'], ['/pricing/', 'Pricing'], ['/resources/post-bar-licensing-tracker/', 'Post-bar licensing tracker']];
export default function Page() {
  const states = [...new Set(cityGroups().map((g) => g.state))].sort();
  const sec = (t: string, items: [string, string][]) => (<section className="mt-8"><h2 className="font-display text-xl font-bold text-navy">{t}</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{items.map(([h, l]) => <li key={h}><Link className="text-purple underline" href={h}>{l}</Link></li>)}</ul></section>);
  return (<div className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-display text-4xl font-extrabold text-navy">Site map</h1>
    {sec('Main pages', MAIN as [string, string][])}
    {sec('Practice areas', SPECIALTIES.map((s) => [`/specialties/${s.slug}/`, s.name] as [string, string]))}
    {sec('Attorneys by state', states.map((s) => [`/attorneys/${s}/`, s.toUpperCase()] as [string, string]))}
    {sec('Legal and policies', LEGAL_LINKS.map((l) => [l.href, l.title] as [string, string]))}
  </div>);
}
