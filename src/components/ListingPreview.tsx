import { publicContactHref } from '@/lib/applications';
import { joinedLabel, joinedYear } from '@/lib/joined';
import { MessageAttorneyForm } from '@/components/MessageAttorneyForm';

export function ListingPreview({
  name,
  cities,
  state,
  languages,
  areas,
  bio,
  insured,
  joined,
  photoUrl,
  contact,
  profileId,
  sample = false,
  staticPreview = false,
}: {
  name: string;
  cities: string;
  state?: string;
  languages?: string;
  areas: string[];
  bio: string;
  insured: boolean;
  joined?: string | number | Date | null;
  photoUrl?: string;
  contact?: string;
  profileId?: string;
  sample?: boolean;
  /** Review step only. No inputs — the live message form stays on public listings. */
  staticPreview?: boolean;
}) {
  const year = joinedYear(joined);
  const label = joinedLabel(year);
  const booking = contact ? publicContactHref(contact) : null;
  return (
    <article className="rounded-3xl bg-white p-5 shadow-card" data-testid={sample ? 'sample-listing' : 'listing-preview'}>
      {sample ? <p className="text-xs font-bold uppercase tracking-wide text-purple">Sample listing</p> : null}
      <div className="mt-2 flex items-start gap-3">
        {photoUrl ? <img src={photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4EEFF] font-display text-lg font-extrabold text-purple" aria-hidden="true">{name.slice(0, 1) || 'Y'}</span>}
        <div>
          <h3 className="font-display text-xl font-extrabold">{name || 'Your name'}</h3>
          <p className="text-sm text-ink" data-testid="listing-location">{[state, cities || 'Your cities'].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">{label}</span>
        {insured ? <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-bold text-navy">Insured</span> : null}
      </div>
      <p className="mt-2 text-sm text-ink">{bio || 'Your short bio appears here.'}</p>
      {languages ? <p className="mt-2 text-sm text-ink" data-testid="listing-languages"><span className="font-semibold text-navy">Languages:</span> {languages}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1">
        {areas.map((area) => <span key={area} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-xs font-semibold text-purple">{area}</span>)}
      </div>
      {booking ? <p className="mt-3 text-sm"><a className="font-semibold text-purple" href={booking}>Website</a></p> : null}
      {staticPreview ? (
        <div className="mt-4" data-testid="listing-message-preview">
          <span className="inline-flex min-h-11 w-full cursor-default items-center justify-center rounded-full bg-navy/5 px-4 font-display text-sm font-semibold text-ink/70" aria-disabled="true">Message this attorney</span>
          <p className="mt-2 text-xs text-ink">Clients message you privately from this button. Your email stays hidden.</p>
        </div>
      ) : (
        <MessageAttorneyForm profileId={profileId} />
      )}
      {staticPreview ? null : <p className="mt-3 text-sm text-ink">Clients find this card on Find an attorney after your state bar record is verified. {label} is only the year you joined Legalgrads. It is not a rating and not a benefit to clients. Your email is not on this card.</p>}
    </article>
  );
}
