'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit/i;

/**
 * First-party, cookieless view count. Nothing is stored in the browser (no cookie, no localStorage).
 * The server dedupes with a salted daily hash and stores no IPs. Independent of the analytics consent toggle.
 */
export function ProfileViews({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      if (!BOT_UA.test(navigator.userAgent) && !navigator.webdriver) {
        await supabase.rpc('record_profile_view', { p_slug: slug }).then(() => undefined, () => undefined);
      }
      const { data } = await supabase.rpc('profile_views_this_month', { p_slug: slug }).then((r) => r, () => ({ data: null }));
      if (!cancelled && typeof data === 'number' && data >= 5) setCount(data);
    })();
    return () => { cancelled = true; };
  }, [slug]);
  if (count === null) return null;
  return <p className="views" data-testid="profile-views">👀 {count.toLocaleString()} people viewed this profile this month</p>;
}
