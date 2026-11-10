import Link from 'next/link';
import { EmbedBox } from '@/components/postbar/EmbedBox';
import { StateFeeTool } from '@/components/postbar/StateTools';
import { prettyDate, TRACKER_PATH } from '@/lib/postBar';
import { money, NOT_PUBLISHED, upfrontText, type NationalState } from '@/lib/nationalPostBar';

function Fact({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/70">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-navy">{value}</p>
      {detail ? <p className="mt-1 text-sm text-ink">{detail}</p> : null}
    </div>
  );
}

export function StatePostBar({ s }: { s: NationalState }) {
  const path = `${TRACKER_PATH}${s.slug}/`;
  const title = `${s.name} Post-Bar Licensing Costs, Deadlines & 1st-Year CLE (2026-2027)`;
  const numbered = s.costs.filter((line) => line.amount !== null);
  const max = Math.max(1, ...numbered.map((line) => line.amount ?? 0));
  const faqLd = s.faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: s.faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
  } : null;
  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Post-Bar Licensing Tracker', item: `https://legalgrads.com${TRACKER_PATH}` },
      { '@type': 'ListItem', position: 2, name: s.name, item: `https://legalgrads.com${path}` },
    ],
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16" data-testid="state-postbar">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} /> : null}
      <nav className="text-sm text-ink"><Link className="font-semibold text-purple underline" href={TRACKER_PATH}>Post-bar tracker</Link> / {s.name}</nav>
      <p className="mt-4 font-display text-sm font-bold uppercase tracking-wide text-purple" data-testid="state-eyebrow">{s.name}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">{title}</h1>
      <p className="mt-2 text-lg text-ink">After the bar: what you pay, what you take, and when results came out. Missing figures stay blank on purpose.</p>
      <p className="mt-2 text-sm text-ink/70">{s.licensingBody} · Data through {prettyDate(s.lastVerified)}</p>
      {s.heldRoster ? <p className="mt-3 rounded-2xl bg-cream p-4 text-sm text-navy">Louisiana admission rules only. This page does not list attorneys or bar numbers.</p> : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-navy p-4 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/70">Upfront</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl" data-testid="upfront">{upfrontText(s)}</p></div>
        <div className="rounded-3xl bg-pink p-4 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/80">Year 1 CLE</p><p className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{s.firstYearCle.short}</p></div>
        <div className="rounded-3xl bg-purple p-4 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-white/80">UBE</p><p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{s.ubeShort}</p></div>
      </div>

      <section className="mt-8 rounded-3xl bg-navy p-6 text-white sm:p-8" data-testid="gatekeeping-receipt">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-white/70">Gatekeeping receipt</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold">Published fees only</h2>
        <p className="mt-2 text-white/80">Each line is a figure from the linked official page. A line without a dollar amount is left as not published. Lines are not added into a made-up total.</p>
        <ul className="mt-4 divide-y divide-white/15">
          {s.costs.length === 0 && <li className="py-3">Post-bar fee schedule: {NOT_PUBLISHED}</li>}
          {s.costs.map((line) => (
            <li key={line.label} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0 max-w-xl">
                <p className="font-semibold">{line.label}</p>
                <p className="text-sm text-white/75">{line.note}</p>
                <a className="text-sm text-pink underline" href={line.source.url} target="_blank" rel="noopener noreferrer">{line.source.label}</a>
              </div>
              <p className="font-display text-2xl font-extrabold">{line.amount === null ? NOT_PUBLISHED : money(line.amount)}</p>
            </li>
          ))}
        </ul>
      </section>

      {s.feeTool ? <StateFeeTool tool={s.feeTool} /> : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Fact label="July 2026 results released" value={s.resultsRelease} detail="Data through the source listed below." />
        <Fact label="July 2026 pass rate" value={s.passRate} detail={s.passRate === NOT_PUBLISHED ? 'Not on the official page checked for this state.' : s.passRateDetail} />
        <Fact label="Passing score" value={s.passScore} detail={s.passScoreDetail} />
        <Fact label="UBE transfers" value={s.ubeShort} detail={s.ubeDetail} />
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">First-year CLE</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">{s.firstYearCle.short}</h2>
        <p className="mt-2 text-ink">{s.cleDetail}</p>
        {s.groups ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2" data-testid="mcle-groups">
            {s.groups.map((group) => (
              <li key={group.id} className="rounded-2xl bg-cream p-4">
                <p className="font-display font-extrabold text-navy">{group.name}</p>
                <p className="mt-1 text-sm text-ink">{group.detail}</p>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-sm text-ink">Letter or ID compliance groups: {NOT_PUBLISHED}</p>}
        {s.groupNote ? <p className="mt-3 text-sm text-ink">{s.groupNote}</p> : null}
      </section>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="ceremony-table">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Swearing-in</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Ceremony dates and fees</h2>
        <ul className="mt-4 space-y-3">
          {(s.ceremonies.length ? s.ceremonies : [{ name: 'Statewide ceremony', when: NOT_PUBLISHED, fee: NOT_PUBLISHED, href: null }]).map((row) => (
            <li key={row.name} className="rounded-2xl bg-cream p-4">
              <p className="font-semibold text-navy">{row.name}</p>
              <p className="mt-1 text-sm text-ink">Date: {row.when}</p>
              <p className="text-sm text-ink">Fee: {row.fee}</p>
              {row.href ? <a className="mt-1 inline-block text-sm font-semibold text-purple underline" href={row.href} target="_blank" rel="noopener noreferrer">Official page</a> : null}
            </li>
          ))}
        </ul>
      </section>

      {numbered.length > 0 && (
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy/5 sm:p-8" data-testid="fee-chart">
          <p className="font-display text-xs font-bold uppercase tracking-wide text-purple">Link chart</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Published dollar amounts</h2>
          <p className="mt-2 text-sm text-ink">Bar length is the published amount. Lines without a dollar amount are omitted. Do not add the bars unless the notes say they are part of the same bill.</p>
          <ul className="mt-4 space-y-3">
            {numbered.map((line) => (
              <li key={line.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm"><span className="text-navy">{line.label}</span><span className="font-display font-extrabold text-navy">{money(line.amount ?? 0)}</span></div>
                <div className="mt-1 h-3 rounded-full bg-cream"><div className="h-3 rounded-full bg-purple" style={{ width: `${Math.max(4, ((line.amount ?? 0) / max) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {s.faqs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold text-navy">Quick answers</h2>
          <div className="mt-4 space-y-3">
            {s.faqs.map((faq) => (
              <details key={faq.q} className="rounded-2xl bg-white p-5 shadow-pill ring-1 ring-navy/5">
                <summary className="cursor-pointer font-display font-bold text-navy">{faq.q}</summary>
                <p className="mt-3 text-ink">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-3xl bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-navy">Official sources</h2>
        <p className="mt-2 text-sm text-ink">Checked {prettyDate(s.lastVerified)}. If a figure is not on the linked page, this tracker says {NOT_PUBLISHED}.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {s.sources.map((src) => <li key={src.url}><a className="text-purple underline" href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a></li>)}
        </ul>
        <p className="mt-5 text-sm text-ink">Bar exam fees are separate unless a line above includes them. Fees change, so confirm with the licensing body before you pay. General information, not legal advice.</p>
      </section>

      <EmbedBox
        src={`https://legalgrads.com/embed/post-bar-licensing-tracker/${s.slug}/`}
        height={520}
        label={`${s.name} post-bar fees and first-year CLE`}
        heading={`Embed or cite the ${s.name} page`}
        pageUrl={`https://legalgrads.com${path}`}
        title={title}
      />

      <div className="mt-10">
        <Link href={TRACKER_PATH} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 font-display text-sm font-semibold text-navy ring-1 ring-navy/10">Compare states</Link>
      </div>
    </div>
  );
}
