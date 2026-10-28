import Link from 'next/link';
import { type AttorneyProfile, calbarUrl, firstName, initials, profileJsonLd } from '@/lib/profiles';
import '@/app/attorneys/profile-template.css';
import { ProfileViews } from './ProfileViews';

const Disclaimer = () => (
  <div className="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. We are not a law firm and not a lawyer referral service. We don&apos;t recommend, rank, match or endorse any attorney, and we don&apos;t receive any part of an attorney&apos;s fees. You contact attorneys directly. Information on unclaimed profiles comes from public State Bar records; always confirm license status on the official State Bar website. Listing is not a guarantee of quality. Attorney advertising.</div>
);

function License({ p }: { p: AttorneyProfile }) {
  const href = calbarUrl(p.barNumber);
  return (
    <div className="card"><h2>🎓 License (from the State Bar)</h2><div className="lic">
      <div><small>State bar</small><b>{p.stateName}</b></div><div><small>Bar number</small><b><a href={href} target="_blank" rel="nofollow noopener">#{p.barNumber} ↗</a></b></div>
      <div><small>Admitted</small><b>{p.admitted}</b></div><div><small>Status</small><b className={p.status === 'Active' ? 'ok' : undefined}>● {p.status}</b></div>
      <div><small>Public discipline</small><b>{p.discipline}</b></div><div><small>Law school</small><b>{p.lawSchool}</b></div></div>
      <p className="verified">✓ Last verified from State Bar of {p.stateName} records on {p.lastVerified}. <a href={href} target="_blank" rel="nofollow noopener">Check the official profile</a></p></div>
  );
}

export function AttorneyProfilePage({ p }: { p: AttorneyProfile }) {
  const c = p.claimed;
  const fn = firstName(p);
  return (
    <div className="lgp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd(p)) }} />
      <main className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> › <Link href="/find-lawyer/">{p.stateName}</Link> › <Link href="/find-lawyer/">{p.cityName}</Link> › <Link href="/specialties/">Business &amp; contracts</Link> › {p.name}</nav>
        <section className="hero">
          {c ? (
            <div style={{ position: 'relative' }}><img className="avatar" src={c.photo} alt={p.name} /><span className="tassel">🎓</span></div>
          ) : (
            <div className="avatar" aria-label="No photo">{initials(p)}<span className="tassel">🎓</span></div>
          )}
          <div>
            <h1>{p.name}</h1>
            <div className="head">{c ? `${c.headline} · ` : 'Attorney · '}{p.cityName}, {p.stateCode}</div>
            <div className="chips">
              {c ? (<>
                <span className="chip gold">⭐ Founding Member · Joined {c.joinedYear}</span>
                <span className="chip mint">✓ Verified {p.stateCode} Bar #{p.barNumber}</span>
                <span className="chip">🎓 Admitted {p.admittedYear}</span>
                <span className="chip">🗣 {c.languages.join(', ')}</span>
                {c.remote && <span className="chip">💻 {c.remote}</span>}
                {c.inPerson && <span className="chip">🤝 In-person · visits your business</span>}
              </>) : (<>
                <span className="chip solid">Unclaimed profile</span>
                <span className="chip">📍 {p.cityName}, {p.stateCode}</span>
                <span className="chip">🎓 Admitted {p.admittedYear}</span>
                <span className="chip">● {p.status} license</span>
              </>)}
            </div>
            <ProfileViews slug={p.slug} />
          </div>
        </section>
        {c ? (
          <div className="grid"><div>
            <div className="card"><h2>👋 About {fn}</h2><p>{c.bio}</p></div>
            <div className="card"><h2>Services</h2><div className="svc">{c.services.map((s) => <div key={s.title}><b>{s.icon} {s.title}</b><span>{s.detail}</span></div>)}</div>
              <p className="note">Outside-court work only. {fn} doesn&apos;t take court appearances or litigation through LegalGrads.</p></div>
            <div className="card"><h2>Practice areas</h2><div className="tags">{c.practiceAreas.map((a) => <span key={a}>{a}</span>)}</div></div>
            <License p={p} /><Disclaimer />
          </div>
          <aside>
            <div className="card cta"><h2>Talk to {fn} directly</h2><p className="small" style={{ opacity: 0.85 }}>You reach {fn} directly. LegalGrads isn&apos;t part of the conversation and takes no fee.</p>
              <a className="btn pink" href={`mailto:${c.email}`}>✉️ Email {fn}</a>
              {c.website && <a className="btn ghost" href={c.website} target="_blank" rel="nofollow noopener">🌐 Visit website</a>}
              {c.phone && <a className="btn ghost" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>📞 {c.phone}</a>}</div>
            <div className="card"><h2>Quick facts</h2><ul className="facts">
              <li><span>Location</span><span>{p.cityName}, {p.stateCode}</span></li><li><span>Licensed in</span><span>{p.stateName}</span></li>
              <li><span>Admitted</span><span>{p.admitted}</span></li><li><span>Law school</span><span>{p.lawSchool}</span></li>
              <li><span>Languages</span><span>{c.languages.join(', ')}</span></li><li><span>Meets</span><span>{c.meets}</span></li></ul></div>
            <p className="small" style={{ textAlign: 'center' }}><Link href="/report-abuse/">Report this profile</Link></p>
          </aside></div>
        ) : (
          <div className="grid"><div>
            <License p={p} />
            <div className="card"><h2>What we know</h2><p>This basic listing was created from public State Bar of {p.stateName} records. {fn} hasn&apos;t added a photo, services, or contact details yet. Contact details shown by the State Bar are available on the <a href={calbarUrl(p.barNumber)} rel="nofollow noopener" target="_blank">official profile</a>.</p></div>
            <Disclaimer />
            <p className="small" style={{ marginTop: 12 }}>Are you {fn} and want this listing taken down? <Link href="/data-deletion/">Request removal</Link></p>
          </div>
          <aside>
            <div className="card claim"><h2>Are you this attorney?<br />Claim your free profile 🎉</h2><ul><li>Add your photo, bio &amp; services</li><li>Get a verified bar badge</li><li>Become a Founding Member: always free</li></ul>
              <Link className="btn pink" href="/join/">Claim my free profile</Link>
              <p className="small" style={{ marginTop: 8 }}>We confirm it&apos;s you with a code mailed to your State Bar address.</p></div>
            <div className="card"><h2>Need a lawyer for your business?</h2><p className="small">Browse newly licensed attorneys who have set up their profiles and contact them directly.</p><Link className="btn out" href="/find-lawyer/">Browse the directory</Link></div>
          </aside></div>
        )}
        <div className="sticky">
          {c ? (<><a className="btn pink" href={`mailto:${c.email}`}>✉️ Email</a>{c.website && <a className="btn out" href={c.website} target="_blank" rel="nofollow noopener">🌐 Website</a>}</>)
            : <Link className="btn pink" href="/join/">Claim this free profile</Link>}
        </div>
      </main>
    </div>
  );
}
