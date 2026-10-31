import data from '@/data/post-bar-licensing.json';

type Src = { label: string; url: string };
export type PostBarState = {
  slug: string; name: string; abbr: string; page: boolean; licensingBody?: string; lastVerified: string;
  upfront: { low: number; high: number; label: string } | null; upfrontNote: string;
  ube: boolean; ubeShort: string;
  firstYearCle: { required: boolean; hours: number | null; short: string }; cleTax: number;
  feeRelief: boolean; feeReliefShort: string;
  costs?: { label: string; amount: number; note: string }[];
  timeline?: { big: string; label: string }[];
  cle?: { headline: string; sub: string; deadline: string; breakdown: { label: string; hours: number }[]; notes: string[] };
  portability?: { headline: string; points: string[] };
  faq?: { q: string; a: string }[];
  oath?: { who: string[]; steps: { t: string; d: string }[]; faqUrl: string; oathUrl: string };
  sources: Src[];
};
export const POST_BAR = data as unknown as { lastVerified: string; states: PostBarState[] };
export const ALL_STATES: PostBarState[] = POST_BAR.states;
export const POST_BAR_STATES: PostBarState[] = ALL_STATES.filter((s) => s.page);
export const TRACKER_PATH = '/resources/post-bar-licensing-tracker/';
export const EMBED_PATH = '/embed/post-bar-licensing-tracker/';
export const money = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`);
export const range = (s: PostBarState) => (!s.upfront ? 'Not verified' : s.upfront.low === s.upfront.high ? money(s.upfront.low) : `${money(s.upfront.low)} to ${money(s.upfront.high)}`);
export const prettyDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const stateBySlug = (slug: string) => POST_BAR_STATES.find((s) => s.slug === slug);
