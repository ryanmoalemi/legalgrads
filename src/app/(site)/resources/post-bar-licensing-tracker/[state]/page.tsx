import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SwearingInCalculator } from '@/components/postbar/SwearingInCalculator';
import { EmbedBox } from '@/components/postbar/EmbedBox';
import { StateStub } from '@/components/postbar/StateStub';
import { CaReceipt } from '@/components/postbar/CaReceipt';
import { OathRejectionBox } from '@/components/postbar/OathRejectionBox';
import { CaBudget } from '@/components/postbar/CaBudget';
import { CaLawSchools } from '@/components/postbar/CaLawSchools';
import { CaStatus } from '@/components/postbar/CaStatus';
import { RetakeHighlight } from '@/components/postbar/RetakeHighlight';
import { ALL_STATES, CA_EMBED_PATH, TRACKER_PATH, money, prettyDate, range, stateBySlug } from '@/lib/postBar';

export const dynamicParams = false;
export function generateStaticParams() { return ALL_STATES.map((s) => ({ state: s.slug })); }

type Props = { params: Promise<{ state: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = stateBySlug((await params).state);
  if (!s) return {};
  const title = s.slug === 'california' ? 'California Post-Bar Licensing Costs, Deadlines & 1st-Year CLE (2026-2027)' : `${s.name} Swearing-In Fees & First-Year CLE 2026-2027`;
  const description = s.slug === 'california'
    ? 'California costs after the bar, split into moral character you may already have paid, the license fee still due, the $55 New Attorney Training bundle, and the next annual fee. Estimated using 2026 fees.'
    : `${s.name} post-bar costs (${range(s)} upfront), ${s.cle?.headline ?? s.firstYearCle.short} of first-year CLE, and UBE rules. Verified against official sources.`;
  const path = `${TRACKER_PATH}${s.slug}/`;
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path } };
}

function Card({ n, title, children, className = '' }: { n: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8 ${className}`}>
      <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">{n}</p>
      <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function Page({ params }: Props) {
  const s = stateBySlug((await params).state);
  if (!s) notFound();
  if (!s.costs) return <StateStub s={s} />;
  if (!s.cle || !s.costs || !s.timeline || !s.portability || !s.faq) notFound();
  const cle = s.cle, portability = s.portability, faq = s.faq;
  const ca = s.slug === 'california';
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const crumbLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Post-Bar Licensing Tracker', item: `https://legalgrads.com${TRACKER_PATH}` },
    { '@type': 'ListItem', position: 2, name: s.name, item: `https://legalgrads.com${TRACKER_PATH}${s.slug}/` },
  ] };
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      <nav className="text-sm text-ink"><Link className="font-semibold text-purple underline" href={TRACKER_PATH}>Post-bar tracker</Link> / {s.name}</nav>
      <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-purple" data-testid="state-eyebrow">{s.name}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">{s.slug === 'california' ? 'California Post-Bar Licensing Costs, Deadlines & 1st-Year CLE (2026-2027)' : `${s.name} Post-Bar Licensing Costs & 1st-Year CLE (2026-2027)`}</h1>
      <p className="mt-2 text-lg text-ink">After the bar: what you pay, what you take, where your score goes.</p>
      <p className="mt-2 text-sm text-ink/70">{s.licensingBody} · Verified {prettyDate(s.lastVerified)}</p>

      {ca ? <CaStatus /> : null}
      {ca ? <CaBudget /> : (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-navy p-4 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/70">Upfront</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{range(s)}</p></div>
          <div className="rounded-3xl bg-pink p-4 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/80">Year 1 CLE</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{cle.headline}</p></div>
          <div className="rounded-3xl bg-purple p-4 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/80">UBE</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{s.ubeShort}</p></div>
        </div>
      )}

      {s.receipt && <CaReceipt r={s.receipt} />}
      {s.slug === 'california' && <SwearingInCalculator mcle={s.mcle} />}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {!ca && (
          <Card n="01" title="Costs">
            <ul className="divide-y divide-navy/5">
              {s.costs.map((c) => (
                <li key={c.label} className="flex items-start justify-between gap-4 py-3">
                  <div><p className="font-semibold text-navy">{c.label}</p><p className="text-sm text-ink">{c.note}</p></div>
                  <p className="shrink-0 font-display text-2xl font-extrabold text-navy">{money(c.amount)}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Card n={ca ? '01' : '02'} title="Timelines and scores">
          <div className="grid grid-cols-2 gap-3">
            {s.timeline.map((t) => (
              <div key={t.label} className="rounded-2xl bg-cream p-4"><p className="font-display text-3xl font-extrabold text-navy">{t.big}</p><p className="mt-1 text-sm text-ink">{t.label}</p></div>
            ))}
          </div>
        </Card>
        {ca && s.oath && (
          <Card n="02" title="Who can swear you in" className="lg:col-span-2">
            <ul className="flex flex-wrap gap-2">{s.oath.who.map((w) => <li key={w} className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-navy">{w}</li>)}</ul>
            <ol className="mt-5 space-y-3">{s.oath.steps.map((st, i) => <li key={st.t} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple font-display text-sm font-bold text-white">{i + 1}</span><div><p className="font-semibold text-navy">{st.t}</p><p className="text-sm text-ink">{st.d}</p></div></li>)}</ol>
            <div className="mt-5 flex flex-wrap gap-3 text-sm"><a className="font-semibold text-purple underline" href={s.oath.oathUrl} target="_blank" rel="noopener noreferrer">CalBar attorney oath page</a><a className="font-semibold text-purple underline" href={s.oath.faqUrl} target="_blank" rel="noopener noreferrer">CalBar oath FAQ</a></div>
            <OathRejectionBox />
          </Card>
        )}
        <Card n={ca ? '03' : '03'} title={ca ? 'First year: NAT, then MCLE' : 'First-year CLE'} className={ca ? 'lg:col-span-2' : ''}>
          {ca ? (
            <div className="space-y-4 text-ink" data-testid="nat-mcle">
              <div>
                <h3 className="font-display text-lg font-extrabold text-navy">New Attorney Training</h3>
                <p className="mt-1 font-display text-4xl font-extrabold text-pink">10 hours · $55</p>
                <p className="mt-2">Nine State Bar courses: 4 hours legal ethics, 3 basic skills, 1.5 competence, 1.5 elimination of bias. Deadline: the last day of the month of your one-year anniversary. CalBar&apos;s example: admitted December 1, 2024, due December 31, 2025. Only these courses count. The $55 bundle price is the figure published effective May 26, 2025.</p>
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-navy">MCLE, a separate requirement</h3>
                <p className="mt-1">25 hours in a compliance period, often prorated for a new licensee, with a report date from the first letter of your last name. NAT is not that report. NAT hours can count toward the first MCLE period if you finish them during that period.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="font-display text-5xl font-extrabold text-pink">{cle.headline}</p>
              <p className="mt-1 font-semibold text-navy">{cle.sub}</p>
              <p className="mt-1 text-sm text-ink">Deadline: {cle.deadline}</p>
              <ul className="mt-5 space-y-2">
                {cle.breakdown.map((b) => (
                  <li key={b.label} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3"><span className="text-navy">{b.label}</span><span className="font-display font-extrabold text-navy">{b.hours} hrs</span></li>
                ))}
              </ul>
              <ul className="mt-4 space-y-1 text-sm text-ink">{cle.notes.map((n) => <li key={n}>• {n}</li>)}</ul>
            </>
          )}
        </Card>
        {ca ? (
          <Card n="04" title="July 2026 pass rate, retake, and MBE transfer" className="lg:col-span-2">
            <RetakeHighlight />
          </Card>
        ) : (
          <Card n="04" title="UBE portability">
            <p className={`inline-flex rounded-full px-4 py-2 font-display text-lg font-extrabold ${s.ube ? 'bg-mint/15 text-[#00735E]' : 'bg-navy/5 text-navy'}`}>{portability.headline}</p>
            <ul className="mt-5 space-y-3">{portability.points.map((p) => <li key={p} className="flex gap-3 text-navy"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple" />{p}</li>)}</ul>
          </Card>
        )}
        {s.oath && !ca && (
          <Card n="05" title="Who can swear you in" className="lg:col-span-2">
            <ul className="flex flex-wrap gap-2">{s.oath.who.map((w) => <li key={w} className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-navy">{w}</li>)}</ul>
            <ol className="mt-5 space-y-3">{s.oath.steps.map((st, i) => <li key={st.t} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple font-display text-sm font-bold text-white">{i + 1}</span><div><p className="font-semibold text-navy">{st.t}</p><p className="text-sm text-ink">{st.d}</p></div></li>)}</ol>
            <div className="mt-5 flex flex-wrap gap-3 text-sm"><a className="font-semibold text-purple underline" href={s.oath.oathUrl} target="_blank" rel="noopener noreferrer">CalBar attorney oath page</a><a className="font-semibold text-purple underline" href={s.oath.faqUrl} target="_blank" rel="noopener noreferrer">CalBar oath FAQ</a></div>
          </Card>
        )}
      </div>

      {ca && <CaLawSchools />}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-extrabold text-navy">Quick answers</h2>
        <div className="mt-4 space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="rounded-2xl bg-white p-5 shadow-pill ring-1 ring-navy/5">
              <summary className="cursor-pointer font-display font-bold text-navy">{f.q}</summary>
              <p className="mt-3 text-ink">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-navy">Official sources</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {s.sources.map((src) => <li key={src.url}><a className="text-purple underline" href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a></li>)}
        </ul>
        <p className="mt-5 text-sm text-ink">{ca ? 'License and annual figures are estimated using 2026 fees. The 2027 schedule is not verified on this page. The four-state comparison chart is off this page until the Texas July 2026 exam increase is on the BLE FAQ. General information, not legal advice.' : 'Bar exam fees not included. Fees change, so confirm before you pay. General information, not legal advice.'}</p>
      </section>

      <EmbedBox {...(ca ? { src: `https://legalgrads.com${CA_EMBED_PATH}`, height: 680, label: 'California December 1 swearing-in fee and deadline calculator', heading: 'Embed the California fee calculator' } : {})} pageUrl={`https://legalgrads.com${TRACKER_PATH}${s.slug}/`} title={`${s.name} Post-Bar Licensing Costs & 1st-Year CLE (2026-2027)`} />

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={TRACKER_PATH} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 font-display text-sm font-semibold text-navy ring-1 ring-navy/10">Compare states</Link>
        <Link href="/join/" className="inline-flex min-h-11 items-center rounded-full bg-pink px-5 font-display text-sm font-semibold text-white">New attorney? Join free</Link>
      </div>
    </div>
  );
}
