export const CONTACT_EMAIL = 'ryan@legalgrads.com';
export const ENTITY = 'Legalgrads';
export const SITE_URL = 'https://legalgrads.com';

/** Phase 2 tools stay off the public navigation until this is "1" at build time. */
export const PHASE2 = process.env.NEXT_PUBLIC_PHASE2 === '1';

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
