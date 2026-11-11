import Link from 'next/link';
import { claimHref, removalHref } from '@/lib/claim';
import { type AttorneyProfile, calbarUrl, cityPath, firstName, initials, officialHref, officialLinkLabel, placeLabel, profileJsonLd, profilePath } from '@/lib/profiles';
import '@/app/(site)/attorneys/profile-template.css';

const LegacyDisclaimer = () => (
  <div className="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. We are not a law firm and not a lawyer referral service. We don&apos;t recommend, rank, match or endorse any attorney, and we don&apos;t receive any part of an attorney&apos;s fees. You contact attorneys directly. Information on unclaimed profiles comes from public State Bar records; always confirm license status on the official State Bar website. Listing is not a guarantee of quality. Attorney advertising.</div>
);

const NeutralDisclaimer = () => (
  <div className="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. We are not a law firm and not a lawyer referral service. We don&apos;t recommend, rank, match or endorse any attorney, and we don&apos;t receive any part of an attorney&apos;s fees. You contact attorneys directly. Information on unclaimed profiles comes from public licensing records. Always confirm license status with the regulator linked on this page. Listing is not a guarantee of quality. Attorney advertising.</div>
);

function License({ p }: { p: AttorneyProfile }) {
  if (!p.recordLinkType) {
    const href = calbarUrl(p.barNumber);
    return (
      <div className="card"><h2>License (from the State Bar)</h2><div className="lic">
        <div><small>State bar</small><b>{p.stateName}</b></div><div><small>Bar number</small><b><a href={href} target="_blank" rel="nofollow noopener">#{p.barNumber} ↗</a></b></div>
        <div><small>Admitted in {p.stateName}</small><b>{p.admitted}</b></div><div><small>License status</small><b className={p.status === 'Active' ? 'ok' : undefined}>{p.status}</b></div>
        <div><small>Public discipline</small><b>{p.discipline}</b></div><div><small>Law school</small><b>{p.lawSchool}</b></div></div>
        <p className="verified">License status checked {p.lastVerified} from State Bar of {p.stateName} records. <a href={href} target="_blank" rel="nofollow noopener">Check the official profile</a></p></div>
    );
  }
  const href = officialHref(p);
  const label = officialLinkLabel(p);
  const authority = p.sourceAuthority || p.stateName;
  const caProfile = p.stateCode === 'CA' && p.recordLinkType === 'individual_official_profile';
  const lookup = p.recordLinkType === 'shared_official_roster_page' && p.officialLookupUrl && p.officialLookupUrl !== href ? p.officialLookupUrl : '';
  return (
    <div className="card"><h2>License (from the regulator)</h2><div className="lic">
      <div><small>Regulator</small><b>{authority}</b></div><div><small>Bar number</small><b>{href ? <a href={href} target="_blank" rel="nofollow noopener">#{p.barNumber} ↗</a> : <>#{p.barNumber}</>}</b></div>
      <div><small>Admitted in {p.stateName}</small><b>{p.admitted}</b></div><div><small>License status</small><b className={p.status === 'Active' ? 'ok' : undefined}>{p.status}</b></div>
      <div><small>Public discipline</small><b>{p.discipline}</b></div><div><small>Law school</small><b>{p.lawSchool}</b></div></div>
      <p className="verified">License status checked {p.lastVerified} from {caProfile ? `State Bar of ${p.stateName}` : authority} records. {href ? <a href={href} target="_blank" rel="nofollow noopener">{caProfile ? 'Check the official profile' : label === 'official profile' ? 'Check the official profile' : label === 'official record' ? 'Check the official record' : 'Open the official roster'}</a> : null}{lookup ? <> <a href={lookup} target="_blank" rel="nofollow noopener">Regulator lookup</a></> : null}</p></div>
  );
}

function recordSource(p: AttorneyProfile): { source: string; href: string; label: string; note: string } {
  const href = officialHref(p);
  const authority = p.sourceAuthority || p.stateName;
  if (!p.recordLinkType || (p.stateCode === 'CA' && p.recordLinkType === 'individual_official_profile')) {
    return { source: `public State Bar of ${p.stateName} records`, href: p.recordLinkType ? href : calbarUrl(p.barNumber), label: 'View official State Bar record', note: '' };
  }
  if (!p.registryRecordUrl) return { source: `public ${authority} records`, href: p.officialLookupUrl || '', label: 'Search the official lookup', note: '' };
  if (p.recordLinkType === 'shared_official_roster_page') return { source: `a public roster published by ${authority}`, href, label: 'View the official roster', note: ' It is a shared roster, not an individual record.' };
  return { source: `public ${authority} records`, href, label: 'View official record', note: '' };
}

function AboutProfile({ p, fn }: { p: AttorneyProfile; fn: string }) {
  const r = recordSource(p);
  return (
    <div className="card"><h2>About this profile</h2>
      <p>This profile was created from {r.source}. <span id="about-claim">{fn} has not yet claimed it or confirmed services, fees, or availability on LegalGrads.</span></p>
      <ul className="facts"><li><span>Profile claimed</span><span id="claim-state">Not yet</span></li><li><span>Fees</span><span id="fees-state">Ask about fees</span></li></ul>
      {r.href || r.note ? <p className="small" style={{ marginTop: 12 }}>{r.href ? <a href={r.href} target="_blank" rel="nofollow noopener">{r.label}</a> : null}{r.note}</p> : null}
    </div>
  );
}

const correctionHref = (path: string) => `mailto:ryan@legalgrads.com?subject=${encodeURIComponent(`Correction for ${path}`)}`;

export function AttorneyProfilePage({ p }: { p: AttorneyProfile }) {
  const c = p.claimed;
  const fn = firstName(p);
  const place = placeLabel(p);
  const crumbCity = p.officeState && p.officeState !== p.stateCode && p.locationLabel ? p.locationLabel : p.cityName;
  return (
    <div className="lgp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd(p)) }} />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href={`/attorneys/${p.state}/`}>{p.stateName}</Link> › <Link href={cityPath(p.state, p.city)}>{crumbCity}</Link> › {c ? <><Link href="/specialties/">Business &amp; contracts</Link> › </> : null}{p.name}</nav>
        <section className="hero">
          {c ? (
            <img className="avatar" src={c.photo} alt={p.name} />
          ) : (
            <div className="avatar" aria-label="No photo">{initials(p)}</div>
          )}
          <div>
            <h1>{p.name}</h1>
            <div className="head">{c ? `${c.headline} · ` : 'Attorney · '}{place}</div>
            <div className="chips">
              {c ? (<>
                <span className="chip solid">Claimed profile</span>
                <span className="chip">Admitted in {p.stateName} {p.admittedYear}</span>
                <span className="chip">{c.languages.join(', ')}</span>
                {c.remote && <span className="chip">{c.remote}</span>}
                {c.inPerson && <span className="chip">In-person meetings</span>}
              </>) : (<>
                <span className="chip solid">Unclaimed profile</span>
                <span className="chip">{place}</span>
                <span className="chip">Admitted in {p.stateName} {p.admittedYear}</span>
                <span className="chip">{p.status} license</span>
              </>)}
            </div>
          </div>
        </section>
        {c ? (
          <div className="grid"><div>
            <div className="card"><h2>About {fn}</h2><p>{c.bio}</p></div>
            <div className="card"><h2>Services</h2><div className="svc">{c.services.map((s) => <div key={s.title}><b>{s.icon} {s.title}</b><span>{s.detail}</span></div>)}</div>
              <p className="note">Outside-court work only. {fn} doesn&apos;t take court appearances or litigation through LegalGrads.</p></div>
            <div className="card"><h2>Practice areas</h2><div className="tags">{c.practiceAreas.map((a) => <span key={a}>{a}</span>)}</div></div>
            <License p={p} /><LegacyDisclaimer />
          </div>
          <aside>
            <div className="card cta"><h2>Talk to {fn} directly</h2><p className="small" style={{ opacity: 0.85 }}>You reach {fn} directly. LegalGrads isn&apos;t part of the conversation and takes no fee.</p>
              <a className="btn pink" href={`mailto:${c.email}`}>Email {fn}</a>
              {c.website && <a className="btn ghost" href={c.website} target="_blank" rel="nofollow noopener">Visit website</a>}
              {c.phone && <a className="btn ghost" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a>}</div>
            <div className="card"><h2>Quick facts</h2><ul className="facts">
              <li><span>Profile claimed</span><span>Yes</span></li><li><span>Location</span><span>{place}</span></li><li><span>Licensed in</span><span>{p.stateName}</span></li>
              <li><span>Admitted in {p.stateName}</span><span>{p.admitted}</span></li><li><span>Law school</span><span>{p.lawSchool}</span></li>
              <li><span>Languages</span><span>{c.languages.join(', ')}</span></li><li><span>Meets</span><span>{c.meets}</span></li><li><span>Fees</span><span>Ask about fees</span></li></ul></div>
            <p className="small" style={{ textAlign: 'center' }}><Link href="/report-abuse/">Report this profile</Link></p>
          </aside></div>
        ) : (
          <div className="grid"><div>
            <AboutProfile p={p} fn={fn} />
            <License p={p} />
            {p.recordLinkType && !(p.stateCode === 'CA' && p.recordLinkType === 'individual_official_profile') ? <NeutralDisclaimer /> : <LegacyDisclaimer />}
            <p className="small" style={{ marginTop: 12 }}>Are you {fn} and want this listing taken down? <Link href={removalHref(profilePath(p))}>Request removal</Link></p>
          </div>
          <aside>
            <div className="card claim"><h2>{fn}, is this your profile?</h2><p className="lead">Help local business owners find you.</p>
              <p className="small">Claim your free profile to show small business owners in {p.city === 'office-unlisted' ? p.stateName : crumbCity} what legal services you offer, how you work, and how to contact you.</p>
              <ul><li>Describe the services you offer.</li><li>Add your photo and background.</li><li>Share your phone number and website.</li></ul>
              <Link className="btn pink" href={claimHref(profilePath(p))}>Claim my free profile</Link>
              <p className="small promise">Free for life. Never pay for your standard listing.</p>
              <p className="small">Optional sponsored placements may be offered in the future.</p>
              <p className="small"><Link href="/free-listing-promise/">Our free listing promise</Link></p></div>
            <div className="card"><h2>Need a lawyer for your business?</h2><p className="small">Browse attorney profiles, review the services they offer, and choose whom to contact.</p><Link className="btn out" href="/find-lawyer/">Explore attorney profiles</Link>
              <p className="small" style={{ marginTop: 10 }}><Link href={cityPath(p.state, p.city)}>More attorneys in {crumbCity}</Link></p>
              <p className="small" style={{ marginTop: 6 }}><a href={correctionHref(profilePath(p))}>Suggest a correction</a></p></div>
          </aside></div>
        )}
        <script src="/js/owner-edits.js" defer />
        <div className="sticky">
          {c ? (<><a className="btn pink" href={`mailto:${c.email}`}>Email</a>{c.website && <a className="btn out" href={c.website} target="_blank" rel="nofollow noopener">Website</a>}</>)
            : <Link className="btn pink" href={`/join/?state=${encodeURIComponent(p.stateCode)}&bar=${encodeURIComponent(p.barNumber)}`}>Claim this free profile</Link>}
        </div>
      </main>
    </div>
  );
}
