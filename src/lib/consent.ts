export interface ConsentRecord {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const CONSENT_KEY = 'legalgrads-consent';
const LOG_KEY = 'legalgrads-analytics-log';

export function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CONSENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentRecord;
    return { necessary: true, analytics: !!parsed.analytics, marketing: !!parsed.marketing, updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
}

export function writeConsent(next: Omit<ConsentRecord, 'necessary' | 'updatedAt'> & { updatedAt?: string }): ConsentRecord {
  const record: ConsentRecord = {
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
    updatedAt: next.updatedAt ?? new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  if (!record.analytics && !record.marketing) {
    window.localStorage.removeItem(LOG_KEY);
  }
  return record;
}

export function track(channel: 'analytics' | 'marketing', name: string): { permitted: boolean; reason: string } {
  const consent = readConsent();
  const permitted = !!consent && consent[channel];
  if (!permitted) {
    return { permitted: false, reason: `${channel} is off, so “${name}” was blocked. No tracker was loaded.` };
  }
  const log = JSON.parse(window.localStorage.getItem(LOG_KEY) || '[]') as { channel: string; name: string; at: string }[];
  log.push({ channel, name, at: new Date().toISOString() });
  window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
  return { permitted: true, reason: `Recorded a local ${channel} event “${name}”. Nothing left this browser.` };
}

export function analyticsLog(): { channel: string; name: string; at: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
}
