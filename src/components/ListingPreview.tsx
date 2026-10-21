import { contactHref } from '@/lib/applications';

export function ListingPreview({
  name,
  cities,
  rate,
  areas,
  bio,
  insured,
  earlyAttorney = true,
  photoUrl,
  contact,
  sample = false,
}: {
  name: string;
  cities: string;
  rate: string;
  areas: string[];
  bio: string;
  insured: boolean;
  earlyAttorney?: boolean;
  photoUrl?: string;
  contact?: string;
  sample?: boolean;
}) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-card" data-testid={sample ? 'sample-listing' : 'listing-preview'}>
      {sample ? <p className="text-xs font-bold uppercase tracking-wide text-purple">Sample listing</p> : null}
      <div className="mt-2 flex items-start gap-3">
        {photoUrl ? <img src={photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4EEFF] font-display text-lg font-extrabold text-purple" aria-hidden="true">{name.slice(0, 1) || 'Y'}</span>}
        <div>
          <h3 className="font-display text-xl font-extrabold">{name || 'Your name'}</h3>
          <p className="text-sm text-ink">{cities || 'Your cities'}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {earlyAttorney ? <span className="rounded-full bg-[#F3E9FF] px-3 py-1 text-xs font-bold text-purple">Early Attorney</span> : null}
        {insured ? <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-bold text-navy">Insured</span> : null}
      </div>
      <p className="mt-3 font-display font-extrabold">{rate}</p>
      <p className="mt-2 text-sm text-ink">{bio || 'Your short bio appears here.'}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {areas.map((area) => <span key={area} className="rounded-full bg-[#F4EEFF] px-2 py-1 text-xs font-semibold text-purple">{area}</span>)}
      </div>
      {contact ? <p className="mt-3 text-sm"><a className="font-semibold text-purple" href={contactHref(contact)}>Contact this attorney</a></p> : null}
      <p className="mt-3 text-sm text-ink">Clients find this card on Find an attorney after your State Bar record is verified.</p>
    </article>
  );
}
