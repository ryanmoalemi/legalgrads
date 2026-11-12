import type { Metadata } from 'next';
import Link from 'next/link';
import { type AttorneyProfile, type CityGroup, cityGroups, cityListLabel, cityUnknown, cityPath, hasLegacyProfiles, profilePath } from '@/lib/profiles';

/** City pages show this many compact rows; the rest are on /page/{n}/ so every profile stays linked. */
export const CITY_PAGE_SIZE = 100;

export const findCity = (state: string, city: string) => cityGroups().find((g) => g.state === state && g.city === city);
export const cityPageCount = (g: CityGroup) => Math.max(1, Math.ceil(g.profiles.length / CITY_PAGE_SIZE));
export const cityPageHref = (g: CityGroup, page: number) => (page <= 1 ? cityPath(g.state, g.city) : `${cityPath(g.state, g.city)}page/${page}/`);

function countLead(n: number): string {
  return n === 1 ? '1 attorney was admitted' : `These ${n.toLocaleString('en-US')} attorneys were admitted`;
}

export const unknownGroup = (g: CityGroup) => g.kind === 'U';

export function cityHeading(g: CityGroup): string {
  if (g.kind === 'U') return `${g.stateName} attorneys with no office city listed`;
  if (g.kind === 'I') return `${g.stateName} attorneys with offices outside the U.S.`;
  if (g.kind === 'O') return `${cityListLabel(g)} offices of ${g.stateName} attorneys`;
  return `${g.cityName}, ${g.stateCode} attorneys admitted 2024 or later`;
}

export function cityIntro(g: CityGroup): string {
  const n = g.profiles.length;
  const lead = countLead(n);
  const list = n === 1 ? 'lists' : 'list';
  const legacy = hasLegacyProfiles(g.profiles);
  const authority = g.profiles.find((p) => p.sourceAuthority)?.sourceAuthority || `${g.stateName} licensing authority`;
  if (g.kind === 'U') {
    return `${lead} in ${g.stateName} in 2024 or later. No office city was published on the licensing record, or the published location could not be confirmed, so these profiles say Licensed in ${g.stateName}. Each profile shows license details from ${legacy ? 'public State Bar' : authority} records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  if (g.kind === 'I') {
    return `${lead} in ${g.stateName} in 2024 or later. The licensing record does not confirm a U.S. office city. Each profile shows the license status from ${authority} records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  if (g.kind === 'O') {
    return `${lead} in ${g.stateName} in 2024 or later and ${list} an office in ${cityListLabel(g)}. Each profile shows license details from ${legacy ? 'public State Bar' : authority} records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  if (legacy) {
    return `${lead} to the State Bar of ${g.stateName} in 2024 or later and ${list} a ${g.cityName} address. Each profile shows license details from public State Bar records. LegalGrads doesn't rank or recommend attorneys.`;
  }
  return `${lead} in ${g.stateName} in 2024 or later and ${list} a ${g.cityName} address. Each profile shows license details from ${authority} records. LegalGrads doesn't rank or recommend attorneys.`;
}

function visibleHeading(g: CityGroup): string {
  return g.kind !== 'L' || !hasLegacyProfiles(g.profiles) ? cityHeading(g) : `Newly licensed attorneys in ${g.cityName}, ${g.stateCode}`;
}

export function cityMetadata(g: CityGroup, page: number): Metadata {
  const n = g.profiles.length;
  const legacy = hasLegacyProfiles(g.profiles);
  const place = cityListLabel(g);
  const suffix = page > 1 ? ` (page ${page})` : '';
  const title = `${cityHeading(g)}${suffix} | LegalGrads`;
  const description = g.kind === 'U' || g.kind === 'I'
    ? `Browse ${n} attorney${n === 1 ? '' : 's'} licensed in ${g.stateName} and admitted in 2024 or later whose record lists no office city. Contact attorneys directly; no referral fees.`
    : g.kind === 'O'
    ? `Browse ${n} attorney${n === 1 ? '' : 's'} admitted in ${g.stateName} in 2024 or later with an office in ${place}. Contact attorneys directly; no referral fees.`
    : legacy
    ? `Browse ${n} newly licensed ${g.cityName}, ${g.stateCode} attorney${n === 1 ? '' : 's'} with license details from ${g.stateName} State Bar records. Contact attorneys directly; no referral fees.`
    : `Browse ${n} attorney${n === 1 ? '' : 's'} admitted in ${g.stateName} in 2024 or later. License details come from public licensing records. Contact attorneys directly; no referral fees.`;
  const href = cityPageHref(g, page);
  return { title: { absolute: title }, description, alternates: { canonical: href }, openGraph: { title, description, url: href } };
}

function pagerPages(page: number, total: number): number[] {
  if (total <= 12) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total - 1, total, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= total));
  return [...set].sort((a, b) => a - b);
}

function Pager({ g, page, where }: { g: CityGroup; page: number; where: 'top' | 'bottom' }) {
  const total = cityPageCount(g);
  if (total <= 1) return null;
  const list = pagerPages(page, total);
  return (
    <nav className="lg-hub__pager" aria-label={`Result pages, ${where}`}>
      {page > 1 ? <Link href={cityPageHref(g, page - 1)} rel="prev">Previous</Link> : null}
      {list.map((n, i) => (
        <span key={n} style={{ display: 'contents' }}>
          {i > 0 && n - list[i - 1] > 1 ? <span aria-hidden="true">…</span> : null}
          {n === page ? <span aria-current="page">{n}</span> : <Link href={cityPageHref(g, n)} aria-label={`Page ${n}`}>{n}</Link>}
        </span>
      ))}
      {page < total ? <Link href={cityPageHref(g, page + 1)} rel="next">Next</Link> : null}
    </nav>
  );
}

function admitted(p: AttorneyProfile): string {
  return p.admitted ? `Admitted ${p.admitted}` : '';
}

function rowPlace(g: CityGroup, p: AttorneyProfile): string {
  if (g.kind !== 'I') return '';
  const label = (p.locationLabel || '').trim();
  return label && !/unconfirmed|not listed/i.test(label) ? label : 'Office city not confirmed';
}

export function CityDirectory({ g, page }: { g: CityGroup; page: number }) {
  const total = cityPageCount(g);
  const start = (page - 1) * CITY_PAGE_SIZE;
  const rows = g.profiles.slice(start, start + CITY_PAGE_SIZE);
  const url = `https://legalgrads.com${cityPageHref(g, page)}`;
  const heading = visibleHeading(g);
  const ldName = g.kind !== 'L' || !hasLegacyProfiles(g.profiles) ? cityHeading(g) : `${g.cityName}, ${g.stateCode} attorneys`;
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url, name: page > 1 ? `${ldName}, page ${page}` : ldName, url,
      mainEntity: { '@type': 'ItemList', numberOfItems: g.profiles.length, itemListElement: rows.map((p, i) => ({ '@type': 'ListItem', position: start + i + 1, url: `https://legalgrads.com${profilePath(p)}`, name: p.name })) } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://legalgrads.com/' },
      { '@type': 'ListItem', position: 2, name: g.stateName, item: `https://legalgrads.com/attorneys/${g.state}/` },
      { '@type': 'ListItem', position: 3, name: cityListLabel(g), item: `https://legalgrads.com${cityPath(g.state, g.city)}` }] },
  ] };
  return (
    <div className="lg-hub">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="lg-band">
        <div className="lg-container">
          <nav className="lg-hub__crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href={`/attorneys/${g.state}/`}>{g.stateName}</Link> › {cityListLabel(g)}</nav>
          <h1 className="lg-hub__title">{heading}</h1>
          <p className="lg-sub lg-hub__lead">{cityIntro(g)}</p>
          <span className="lg-accent" aria-hidden="true" />
        </div>
      </section>
      <div className="lg-container lg-hub__body">
        <form className="lg-hub__namesearch" action="/find-lawyer/" method="get" role="search">
          <input type="hidden" name="state" value={g.stateCode} />
          {g.kind === 'L' || g.kind === 'O' ? <input type="hidden" name="city" value={g.cityName} /> : null}
          <label className="lg-label" htmlFor="name-q">Search {g.kind === 'L' || g.kind === 'O' ? cityListLabel(g) : 'these'} profiles by name</label>
          <div className="lg-hub__namerow"><input id="name-q" className="lg-input" type="search" name="q" autoComplete="off" data-testid="city-name-search" /><button type="submit" className="lg-btn lg-btn--secondary">Search</button></div>
          <p className="lg-dir__fine">Leave the name blank to open these results in the directory search.</p>
        </form>
        {g.profiles.length < 3 && g.nearby?.length ? (
          <nav aria-label={g.nearbyByDistance ? 'Nearby cities' : `Other cities in ${g.stateName}`} className="lg-hub__group">
            <h2>{g.nearbyByDistance ? 'Nearby cities' : `Other cities in ${g.stateName}`}</h2>
            <ul className="lg-hub__tiles">
              {g.nearby.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
            </ul>
          </nav>
        ) : null}
        <section className="lg-hub__group" aria-labelledby="profiles-h">
          <h2 id="profiles-h">Attorney profiles</h2>
          <Pager g={g} page={page} where="top" />
          <p className="lg-hub__note" data-testid="city-count">{g.profiles.length === 1 ? '1 profile' : `${g.profiles.length.toLocaleString('en-US')} profiles`}{total > 1 ? `. Showing ${(start + 1).toLocaleString('en-US')} to ${(start + rows.length).toLocaleString('en-US')}, page ${page} of ${total}` : ''}. Sorted A to Z by first name, not ranked.</p>
          <ul className="lg-hub__rows" data-testid="city-rows">
            {rows.map((p) => {
              const where = rowPlace(g, p);
              return <li key={p.slug}><a href={profilePath(p)}><b>{p.name}</b><span>{[where, admitted(p)].filter(Boolean).join(' · ')}</span></a></li>;
            })}
          </ul>
          <Pager g={g} page={page} where="bottom" />
        </section>
      </div>
    </div>
  );
}
