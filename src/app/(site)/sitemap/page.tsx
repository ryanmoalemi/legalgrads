import type { Metadata } from 'next';
import Link from 'next/link';
import { SPECIALTIES } from '@/lib/catalog';
import { LEGAL_LINKS } from '@/lib/legal';
import { NATIONAL_STATES } from '@/lib/nationalPostBar';
import { TRACKER_PATH } from '@/lib/postBar';
import { cityGroups } from '@/lib/profiles';
export const metadata: Metadata = { title: 'Site map', description: 'Every main section of LegalGrads in one place.', alternates: { canonical: '/sitemap/' } };
const MAIN = [['/', 'Home'], ['/find-lawyer/', 'Find an attorney'], ['/specialties/', 'Practice areas'], ['/how-it-works/', 'How it works'], ['/about/', 'About'], ['/faq/', 'FAQ'], ['/contact/', 'Contact'], ['/for-attorneys/', 'For attorneys'], ['/join/', 'Join free'], ['/pricing/', 'Pricing'], ['/resources/post-bar-licensing-tracker/', 'Post-bar licensing tracker']];
export default function Page() {
  const states = [...new Set(cityGroups().map((g) => g.state))].sort();
  const postBar: [string, string][] = [['/resources/post-bar-licensing-tracker/california/', 'California']];
  for (const state of NATIONAL_STATES) postBar.push([`${TRACKER_PATH}${state.slug}/`, state.name]);
  postBar.sort((a, b) => a[1].localeCompare(b[1]));
  const sec = (t: string, items: [string, string][]) => (<section className="mt-8"><h2 className="font-display text-xl font-bold text-navy">{t}</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{items.map(([h, l]) => <li key={h}><Link className="text-purple underline" href={h}>{l}</Link></li>)}</ul></section>);
  return (<div className="mx-auto max-w-3xl px-4 py-16"><h1 className="font-display text-4xl font-extrabold text-navy">Site map</h1>
    {sec('Main pages', MAIN as [string, string][])}
    {sec('Post-bar by state', postBar)}
    {sec('Practice areas', SPECIALTIES.map((s) => [`/specialties/${s.slug}/`, s.name] as [string, string]))}
    {sec('Attorneys by state', states.map((s) => [`/attorneys/${s}/`, s.toUpperCase()] as [string, string]))}
    {sec('Legal and policies', LEGAL_LINKS.map((l) => [l.href, l.title] as [string, string]))}
  </div>);
}
