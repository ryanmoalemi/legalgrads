// Client-side only. The visitor's location never leaves the browser: it is not stored
// (no cookie/localStorage) and is not sent to Supabase or analytics. Centroid files are static
// Census Gazetteer data (public/data), fetched whole, so the request reveals nothing about the visitor.
export type LatLng = [number, number];
type Table = Record<string, LatLng>;

let zips: Promise<Table> | null = null;
let places: Promise<Table> | null = null;
const get = (url: string) => fetch(url).then((r) => r.json() as Promise<Table>);
export const loadZips = () => (zips ??= get('/data/zip-centroids.json'));
export const loadPlaces = () => (places ??= get('/data/place-centroids.json'));

export function miles(a: LatLng, b: LatLng): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[0] - a[0]);
  const dLng = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

/** Nearest Census place's state for a point (used to pick the client's state first). */
export async function stateFor(point: LatLng): Promise<string> {
  const t = await loadPlaces();
  let best = '';
  let dist = Infinity;
  for (const [k, v] of Object.entries(t)) {
    const d = miles(point, v);
    if (d < dist) { dist = d; best = k.split('|')[1]; }
  }
  return best;
}

/** Resolve a typed ZIP or "City, ST" (or city within the chosen state) to a centroid. */
export async function resolveQuery(text: string, state: string): Promise<LatLng | null> {
  const q = text.trim();
  const zip = q.match(/^\d{5}/)?.[0];
  if (zip) return (await loadZips())[zip] ?? null;
  const m = q.match(/^(.+?),\s*([A-Za-z]{2})$/);
  const city = (m ? m[1] : q).toLowerCase().replace(/\s+/g, ' ');
  const st = (m ? m[2] : state).toUpperCase();
  if (!city || !st) return null;
  return (await loadPlaces())[`${city}|${st}`] ?? null;
}

export function browserLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      reject,
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 },
    );
  });
}
