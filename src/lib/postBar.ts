import data from '@/data/post-bar-licensing.json';
export type PostBarState = (typeof data.states)[number];
export const POST_BAR = data;
export const POST_BAR_STATES: PostBarState[] = data.states;
export const TRACKER_PATH = '/resources/post-bar-licensing-tracker/';
export const money = (n: number) => (n === 0 ? '$0' : `$${n.toLocaleString('en-US')}`);
export const range = (s: PostBarState) => (s.upfront.low === s.upfront.high ? money(s.upfront.low) : `${money(s.upfront.low)} to ${money(s.upfront.high)}`);
export const prettyDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const stateBySlug = (slug: string) => POST_BAR_STATES.find((s) => s.slug === slug);
