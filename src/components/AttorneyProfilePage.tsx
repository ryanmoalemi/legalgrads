import Link from 'next/link';
import { claimHref, removalHref } from '@/lib/claim';
import { type AttorneyProfile, calbarUrl, cityPath, cityUnknown, firstName, initials, officialHref, officialLinkLabel, placeLabel, profileJsonLd, profilePath } from '@/lib/profiles';
import '@/app/(site)/attorneys/profile-template.css';

// Same layout as the static pages from scripts/emit_profile_pages.py. Next renders only the two demo profiles.

const LegacyDisclaimer = () => (
  <div className="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. We are not a law firm and not a lawyer referral service. We don&apos;t recommend, rank, match or endorse any attorney, and we don&apos;t receive any part of an attorney&apos;s fees. You contact attorneys directly. Information on unclaimed profiles comes from public State Bar records; always confirm license status on the official State Bar website. Listing is not a guarantee of quality. Attorney advertising.</div>
);

const NeutralDisclaimer = () => (
  <div className="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. We are not a law firm and not a lawyer referral service. We don&apos;t recommend, rank, match or endorse any attorney, and we don&apos;t receive any part of an attorney&apos;s fees. You contact attorneys directly. Information on unclaimed profiles comes from public licensing records. Always confirm license status with the regulator linked on this page. Listing is not a guarantee of quality. Attorney advertising.</div>
);

const PATHS: Record<string, React.ReactNode> = {
  shield: <><path d="M12 3 19 6v5c0 4.5-2.9 7.7-7 9.5C7.9 18.7 5 15.5 5 11V6Z" /><path d="m9 12 2 2 4-4" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6.5 16c.6-1.4 1.5-2 2.5-2s1.9.6 2.5 2M14 10h4M14 14h3" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  scale: <><path d="M12 4v16M7 20h10M5 8h14" /><path d="m5 8-3 6a3 3 0 0 0 6 0Zm14 0-3 6a3 3 0 0 0 6 0Z" /></>,
  cap: <><path d="m2 9 10-5 10 5-10 5Z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></>,
  building: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

function Icon({ name }: { name: keyof typeof PATHS }) {
  return <svg className={`ic ic-${name}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATHS[name]}</svg>;
}

const legacy = (p: AttorneyProfile) => !p.recordLinkType || (p.stateCode === 'CA' && p.recordLinkType === 'individual_official_profile');

function schoolLabel(p: AttorneyProfile): string {
  if (p.lawSchool === 'Foreign Law School') return 'Outside the U.S. (per State Bar record)';
  if (!p.lawSchool || p.lawSchool === 'Not listed') return 'Not listed on the record';
  return p.lawSchool;
}

function barValue(p: AttorneyProfile): string {
  return legacy(p) ? `${p.stateCode} Bar #${p.barNumber}` : `#${p.barNumber}`;
}

function LicenseDetails({ p }: { p: AttorneyProfile }) {
  const href = p.recordLinkType ? officialHref(p) : calbarUrl(p.barNumber);
  const caProfile = legacy(p);
  const label = officialLinkLabel(p);
  const check = caProfile ? 'View official State Bar record' : label === 'official profile' || label === 'official record' ? 'View official record' : 'Search official records';
  const verifiedFrom = caProfile ? `State Bar of ${p.stateName}` : p.sourceAuthority || p.stateName;
  return (
    <>
      <h3 className="lic-h">License details</h3>
      <ul className="lic">
        <li><Icon name="shield" /><span className="k">License status</span><span className={p.status === 'Active' ? 'v ok' : 'v'}>{p.status} <small>Status checked {p.lastVerified}</small></span></li>
        <li><Icon name="calendar" /><span className="k">Admitted in {p.stateName}</span><span className="v">{p.admitted}</span></li>
        <li><Icon name="card" /><span className="k">{caProfile ? `${p.stateName} Bar Number` : 'License number'}</span><span className="v">{barValue(p)}</span></li>
        {p.recordLinkType && !caProfile ? <li><Icon name="building" /><span className="k">Regulator</span><span className="v">{p.sourceAuthority || p.stateName}</span></li> : null}
        <li><Icon name="scale" /><span className="k">Public discipline</span><span className="v">{p.discipline}</span></li>
        <li><Icon name="cap" /><span className="k">Law school</span><span className="v">{schoolLabel(p)}</span></li>
        {href ? <li><Icon name="link" /><span className="k">Official record</span><span className="v"><a href={href} target="_blank" rel="nofollow noopener">{check} ↗</a></span></li> : null}
      </ul>
      <p className="verified">License status checked {p.lastVerified} from {verifiedFrom} records.</p>
    </>
  );
}

const correctionHref = (path: string) => `mailto:ryan@legalgrads.com?subject=${encodeURIComponent(`Correction for ${path}`)}`;
const promiseHref = (path: string) => `/free-listing-promise/?profile=${encodeURIComponent(path)}`;

export function AttorneyProfilePage({ p }: { p: AttorneyProfile }) {
  const c = p.claimed;
  const fn = firstName(p);
  const place = cityUnknown(p) ? '' : placeLabel(p);
  const crumbCity = cityUnknown(p) ? 'Office city not listed' : p.officeState && p.officeState !== p.stateCode && p.locationLabel ? p.locationLabel : p.cityName;
  const path = profilePath(p);
  return (
    <div className="lgp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd(p)) }} />
      <section className="band"><div className="band-in">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href={`/attorneys/${p.state}/`}>{p.stateName}</Link> › <Link href={cityPath(p.state, p.city)}>{crumbCity}</Link> › {c ? <><Link href="/specialties/">Business &amp; contracts</Link> › </> : null}<span>{p.name}</span></nav>
        <div className="band-row">
          {c ? <img className="avatar" src={c.photo} alt={p.name} /> : <div className="avatar" aria-hidden="true">{initials(p)}</div>}
          <div className="who"><h1>{p.name}</h1><p className="where"><span>Licensed in {p.stateName}</span></p><p className="office">{c ? `${c.headline} · ` : ''}{place ? `Office: ${place}` : 'Office location not listed.'}</p></div>
          <div className="meta">
            <span className="chip solid">{c ? 'Claimed profile' : 'Profile not yet claimed'}</span>
            <p className="barline">{barValue(p)} <span aria-hidden="true">|</span> Admitted {p.admitted}</p>
          </div>
        </div>
      </div></section>
      <div className="wrap">
        {c ? (
          <div className="grid"><div>
            <div className="card"><h2>About {fn}</h2><p>{c.bio}</p></div>
            <div className="card"><h2>Services</h2><div className="svc">{c.services.map((s) => <div key={s.title}><b>{s.icon} {s.title}</b><span>{s.detail}</span></div>)}</div>
              <p className="note">Outside-court work only. {fn} doesn&apos;t take court appearances or litigation through LegalGrads.</p></div>
            <div className="card"><h2>Practice areas</h2><div className="tags">{c.practiceAreas.map((a) => <span key={a}>{a}</span>)}</div></div>
            <div className="card"><h2>About this profile</h2><p className="info"><Icon name="info" /><span>{fn} claimed this profile and confirmed the details above.</span></p>
              <ul className="facts"><li><span>Languages</span><span>{c.languages.join(', ')}</span></li><li><span>Meets</span><span>{c.meets}</span></li>{c.remote ? <li><span>Remote</span><span>{c.remote}</span></li> : null}</ul>
              <LicenseDetails p={p} /></div>
            <LegacyDisclaimer />
          </div>
          <aside>
            <div className="card cta"><h2>Talk to {fn} directly</h2><p className="small">You reach {fn} directly. LegalGrads isn&apos;t part of the conversation and takes no fee.</p>
              <a className="btn pink" href={`mailto:${c.email}`}>Email {fn}</a>
              {c.website && <a className="btn ghost" href={c.website} target="_blank" rel="nofollow noopener">Visit website</a>}
              {c.phone && <a className="btn ghost" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a>}</div>
            <p className="small" style={{ textAlign: 'center' }}><Link href="/report-abuse/">Report this profile</Link></p>
          </aside></div>
        ) : (
          <>
            <div className="grid">
            <aside aria-label="Claim this profile">
              <div className="card claim" id="claim">
                <span className="pill">{fn}, is this your profile?</span>
                <h2>Make this profile <span className="u">yours.</span></h2>
                <p className="lead">Show small business owners what you do and how to contact you.</p>
                <ul className="ticks">
                  <li><Icon name="person" /><span>Add your photo and background</span></li>
                  <li><Icon name="layers" /><span>Describe your services and fees</span></li>
                  <li><Icon name="mail" /><span>Choose how clients contact you</span></li>
                  <li><Icon name="chart" /><span>See your profile views and contact activity.</span></li>
                </ul>
                <Link className="btn pink" href={claimHref(path)}>Claim my free profile</Link>
                <p className="promise">Free for life. Your standard listing stays free.</p>
                <p className="small"><Link href={promiseHref(path)}>Our free listing promise</Link></p>
                <p className="small muted">Optional paid promotion may be offered later.</p>
              </div>
            </aside>
            <div className="about-col">
              <div className="card about"><h2>About this profile</h2>
                <p className="info"><Icon name="info" /><span id="about-claim">This profile was created from {legacy(p) ? 'public State Bar records' : `public ${p.sourceAuthority || p.stateName} records`}. {p.name} has not yet confirmed services, fees or availability on LegalGrads.</span></p>
                <ul className="facts" />
                <LicenseDetails p={p} />
              </div>
            </div>
            </div>
            <section className="steps" id="claim-benefits" aria-labelledby="steps-h">
              <h2 id="steps-h">How claiming works</h2>
              <ol>
                <li><b>Confirm it is you</b><span>We email a one-time code, normally to the address on your official licensing record. Another address goes to manual review first.</span></li>
                <li><b>Add your details</b><span>Photo, services, fees and contact options appear only after you add them.</span></li>
                <li><b>License status stays separate</b><span>It comes from the official record, with the date we last checked it. Claiming does not change it.</span></li>
              </ol>
            </section>
            <div id="example-slot" data-example="1" />
            <p className="browse">Looking for legal help? <Link href="/find-lawyer/">Browse attorneys</Link></p>
            {legacy(p) ? <LegacyDisclaimer /> : <NeutralDisclaimer />}
            <p className="small fixes">Something wrong? <a href={correctionHref(path)}>Suggest a correction</a>. Want this listing taken down? <Link href={removalHref(path)}>Request removal</Link></p>
          </>
        )}
        <script src="/js/owner-edits.js" defer />
      </div>
    </div>
  );
}
