import { cityGroups } from '@/lib/profiles';

/** Server-rendered, crawlable entry to the public-record pages. Lists the jurisdiction hubs only;
 * each hub links every office city, so the search page no longer ships 4,400 city links. */
export function PublicRecordIndex() {
  const byState = new Map<string, { state: string; stateName: string; total: number; cities: number }>();
  for (const group of cityGroups()) {
    const item = byState.get(group.state) ?? { state: group.state, stateName: group.stateName, total: 0, cities: 0 };
    item.total += group.profiles.length;
    item.cities += 1;
    byState.set(group.state, item);
  }
  const states = [...byState.values()].sort((a, b) => a.stateName.localeCompare(b.stateName));

  return (
    <section id="public-record-index" data-testid="public-record-index" className="lg-container lg-hub__body pb-12" aria-labelledby="public-record-heading">
      <h2 id="public-record-heading">Browse by licensing state</h2>
      <p className="lg-hub__note">Public-record profiles from official licensing rosters, grouped by the state that licensed each attorney. Each state page lists its office cities. These profiles are not a referral and do not list a practice area.</p>
      <ul className="lg-hub__tiles">
        {states.map((item) => (
          <li key={item.state}>
            <a href={`/attorneys/${item.state}/`}>{item.stateName} <span>{item.total.toLocaleString('en-US')}</span></a>
          </li>
        ))}
      </ul>
    </section>
  );
}
