/** ISO 3166-1 alpha-2 codes where analytics stays off until the visitor chooses. */
export const CONSENT_REGION_CODES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "GB",
  "CH",
] as const;

const CONSENT_REGION_SET = new Set<string>(CONSENT_REGION_CODES);

/** Time zones used as a client-side signal when no host country header is available. */
const CONSENT_TIME_ZONES = new Set([
  "Atlantic/Reykjavik",
  "Atlantic/Canary",
  "Atlantic/Madeira",
  "Atlantic/Faroe",
  "Atlantic/Azores",
  "Atlantic/Jan_Mayen",
  "Arctic/Longyearbyen",
  "Africa/Ceuta",
]);

export function countryNeedsAnalyticsConsent(country: string | null | undefined): boolean {
  if (!country) return false;
  return CONSENT_REGION_SET.has(country.trim().toUpperCase());
}

export function timezoneNeedsAnalyticsConsent(timeZone?: string): boolean {
  const zone = timeZone ?? intlTimeZone();
  if (!zone) return false;
  return zone.startsWith("Europe/") || CONSENT_TIME_ZONES.has(zone);
}

function intlTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/**
 * Best-effort country code if a free host or edge layer exposed one to the page.
 * GitHub Pages and Fastly do not expose a visitor country to client JavaScript,
 * so this usually returns null and timezone detection is used instead.
 */
export function readVisitorCountry(): string | null {
  if (typeof document === "undefined") return null;
  const meta = document.querySelector('meta[name="geo-country"]')?.getAttribute("content");
  if (meta && /^[A-Za-z]{2}$/.test(meta.trim())) return meta.trim().toUpperCase();
  const data = document.documentElement.getAttribute("data-geo-country");
  if (data && /^[A-Za-z]{2}$/.test(data.trim())) return data.trim().toUpperCase();
  return null;
}

/** True when analytics must stay off until the visitor accepts (EU, EEA, UK, Switzerland). */
export function needsAnalyticsConsent(country?: string | null, timeZone?: string): boolean {
  const resolvedCountry = country === undefined ? readVisitorCountry() : country;
  if (resolvedCountry) return countryNeedsAnalyticsConsent(resolvedCountry);
  return timezoneNeedsAnalyticsConsent(timeZone);
}

/** Inline head script: Consent Mode defaults, with a saved legalgrads-consent choice winning. */
export function consentDefaultScript(): string {
  const regions = JSON.stringify(CONSENT_REGION_CODES);
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var lgc={};try{lgc=JSON.parse(localStorage.getItem('legalgrads-consent')||'{}')||{}}catch(e){}
var hasChoice=typeof lgc.analytics==='boolean';
var ads=lgc.marketing?'granted':'denied';
if(hasChoice){
  gtag('consent','default',{analytics_storage:lgc.analytics?'granted':'denied',ad_storage:ads,ad_user_data:ads,ad_personalization:ads});
}else{
  gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',region:${regions},wait_for_update:500});
}
gtag('js', new Date());
gtag('config', 'G-CHX0PZJH8W');`;
}
