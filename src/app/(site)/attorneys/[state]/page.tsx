import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CityFilter } from '@/components/CityFilter';
import { type CityGroup, cityGroups, cityListLabel, cityPath, hasLegacyProfiles } from '@/lib/profiles';

type Params = { state: string };
export const dynamicParams = false;
export function generateStaticParams() { return [...new Set(cityGroups().map((g) => g.state))].map((state) => ({ state })); }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { state } = await params;
  const gs = cityGroups().filter((g) => g.state === state);
  if (!gs.length) return {};
  const total = gs.reduce((n, g) => n + g.profiles.length, 0);
  const legacy = hasLegacyProfiles(gs.flatMap((g) => g.profiles));
  const title = `${gs[0].stateName} attorneys admitted 2024 or later, by city | LegalGrads`;
  const description = legacy
    ? `Find ${total} newly licensed ${gs[0].stateName} attorneys across ${gs.length} cities, with license details from State Bar records. Browse by city and contact attorneys directly.`
    : `Find ${total} attorneys admitted in ${gs[0].stateName} in 2024 or later, across ${gs.length} office locations, with details from public licensing records. Browse by city and contact attorneys directly.`;
  return { title: { absolute: title }, description, alternates: { canonical: `/attorneys/${state}/` }, openGraph: { title, description, url: `/attorneys/${state}/` } };
}


function checkedRange(gs: CityGroup[]): string {
  const times = gs.flatMap((g) => g.profiles.map((p) => Date.parse(p.lastVerified))).filter((t) => Number.isFinite(t));
  if (!times.length) return '';
  const fmt = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const lo = fmt(Math.min(...times));
  const hi = fmt(Math.max(...times));
  return lo === hi ? `License records checked ${hi}.` : `License records checked between ${lo} and ${hi}.`;
}

function Tile({ g }: { g: CityGroup }) {
  const label = cityListLabel(g);
  const keys = [label, g.cityName, ...g.aliases].map((v) => v.toLowerCase());
  return <li data-city={[...new Set(keys)].join('|')}><Link href={cityPath(g.state, g.city)}>{label} <span>{g.profiles.length.toLocaleString('en-US')}</span></Link></li>;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { state } = await params;
  const gs = cityGroups().filter((g) => g.state === state);
  if (!gs.length) notFound();
  const stateName = gs[0].stateName;
  const total = gs.reduce((n, g) => n + g.profiles.length, 0);
  const legacy = hasLegacyProfiles(gs.flatMap((g) => g.profiles));
  const byLabel = (a: CityGroup, b: CityGroup) => cityListLabel(a).localeCompare(cityListLabel(b));

  const unlisted = gs.filter((g) => g.kind === 'U');
  const abroad = gs.filter((g) => g.kind === 'I');
  const elsewhere = gs.filter((g) => g.kind === 'O').sort(byLabel);
  const local = gs.filter((g) => g.kind === 'L').sort(byLabel);
  const letters = new Map<string, CityGroup[]>();
  for (const g of local) {
    const key = cityListLabel(g).charAt(0).toUpperCase();
    letters.set(key, [...(letters.get(key) ?? []), g]);
  }
  const big = local.length + elsewhere.length > 40;
  const count = (gsx: CityGroup[]) => gsx.reduce((n, g) => n + g.profiles.length, 0).toLocaleString('en-US');

  return (
    <div className="lg-hub">
      <section className="lg-band">
        <div className="lg-container">
          <nav className="lg-hub__crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › {stateName}</nav>
          <h1 className="lg-hub__title">Attorneys licensed in {stateName}</h1>
          <p className="lg-sub lg-hub__lead">{legacy
            ? <>{total.toLocaleString('en-US')} attorneys admitted in 2024 or later, grouped by the city on their State Bar record.</>
            : <>{total.toLocaleString('en-US')} attorneys admitted in 2024 or later, grouped by the office city on the licensing record.</>}</p>
          <span className="lg-accent" aria-hidden="true" />
        </div>
      </section>
      <div className="lg-container lg-hub__body" id="hub-cities">
        <p className="lg-hub__note">{checkedRange(gs)} Office places come from the address on each licensing record; spelling variants are combined only when the ZIP code confirms the same city. LegalGrads doesn&apos;t rank or recommend attorneys. <Link href={`/find-lawyer/?state=${gs[0].stateCode}`}>Search {stateName} profiles</Link> to filter or sort by distance.</p>
        {big ? <CityFilter target="hub-cities" /> : null}
        {local.length ? (
          <section className="lg-hub__group" aria-labelledby="cities-h" data-filter-section="">
            <h2 id="cities-h">Office cities in {stateName}</h2>
            {big ? (
              <nav aria-label="Cities by first letter" className="lg-hub__letters" data-letter-nav="">
                {[...letters.keys()].map((k) => <a key={k} href={`#letter-${k}`}>{k}</a>)}
              </nav>
            ) : null}
            {big ? [...letters.entries()].map(([k, list]) => (
              <div key={k} id={`letter-${k}`} data-letter={k} className="lg-hub__group">
                <h3 className="lg-dir__empty-title">{k}</h3>
                <ul className="lg-hub__tiles">{list.map((g) => <Tile key={g.city} g={g} />)}</ul>
              </div>
            )) : <ul className="lg-hub__tiles">{local.map((g) => <Tile key={g.city} g={g} />)}</ul>}
          </section>
        ) : null}
        {elsewhere.length ? (
          <section className="lg-hub__group" aria-labelledby="elsewhere-h" data-filter-section="">
            <h2 id="elsewhere-h">Offices outside {stateName} ({count(elsewhere)})</h2>
            <p className="lg-hub__note">Licensed in {stateName}, with an office address in another state according to the record&apos;s state or ZIP code.</p>
            <ul className="lg-hub__tiles">{elsewhere.map((g) => <Tile key={g.city} g={g} />)}</ul>
          </section>
        ) : null}
        {abroad.length ? (
          <section className="lg-hub__group" aria-labelledby="abroad-h" data-filter-section="">
            <h2 id="abroad-h">Offices outside the U.S. ({count(abroad)})</h2>
            <ul className="lg-hub__tiles">{abroad.map((g) => <Tile key={g.city} g={g} />)}</ul>
          </section>
        ) : null}
        {unlisted.length ? (
          <section className="lg-hub__group" aria-labelledby="unlisted-h" data-filter-section="" data-unlisted="">
            <h2 id="unlisted-h">Office location not listed ({count(unlisted)})</h2>
            <p className="lg-hub__note">The licensing record did not publish an office city, or the published location could not be confirmed. These profiles say Licensed in {stateName}.</p>
            <p>{unlisted.map((g) => <Link key={g.city} className="lg-btn lg-btn--secondary" href={cityPath(g.state, g.city)}>View {count([g])} {g.profiles.length === 1 ? 'profile' : 'profiles'} with no office location</Link>)}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
