import { cityGroups, cityListLabel, cityPath } from '@/lib/profiles';

/** Server-rendered roster index. The find page is a client search, so this list is the crawlable fallback. */
export function PublicRecordIndex() {
  const byState = new Map<string, ReturnType<typeof cityGroups>>();
  for (const group of cityGroups()) {
    const list = byState.get(group.state) ?? [];
    list.push(group);
    byState.set(group.state, list);
  }
  const states = [...byState.values()].sort((a, b) => a[0].stateName.localeCompare(b[0].stateName));

  return (
    <section id="public-record-index" data-testid="public-record-index" className="mx-auto max-w-6xl px-4 pb-12" aria-labelledby="public-record-heading">
      <h2 id="public-record-heading" className="font-display text-2xl font-extrabold text-navy">Public-record listings</h2>
      <p className="mt-2 max-w-3xl text-sm text-ink">
        These pages are Unclaimed public profiles from official licensing rosters. They are live. They are not a referral, and they do not list a practice area.
      </p>
      <div className="mt-4 space-y-3">
        {states.map((groups) => {
          const state = groups[0];
          const total = groups.reduce((sum, group) => sum + group.profiles.length, 0);
          const cities = [...groups].sort((a, b) => cityListLabel(a).localeCompare(cityListLabel(b)));
          return (
            <details key={state.state} className="rounded-3xl bg-white p-4">
              <summary className="cursor-pointer font-display text-lg font-extrabold text-navy">
                {state.stateName} <span className="text-sm font-semibold text-ink">({total})</span>
              </summary>
              <p className="mt-2 text-sm">
                <a className="font-semibold text-purple" href={`/attorneys/${state.state}/`}>{state.stateName} hub</a>
              </p>
              <ul className="mt-2 columns-2 gap-x-6 text-sm sm:columns-3 lg:columns-4">
                {cities.map((group) => (
                  <li key={group.city} className="break-inside-avoid py-0.5">
                    <a className="text-navy underline decoration-purple/30" href={cityPath(group.state, group.city)}>{cityListLabel(group)}</a>
                    <span className="text-ink"> ({group.profiles.length})</span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
