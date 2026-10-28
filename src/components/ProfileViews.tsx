'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit/i;
const KEY = 'lg_vid';

function visitorId(): string | null {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(KEY, id); }
    return id;
  } catch { return null; }
}

/** Records one view per visitor per profile per day and shows the monthly count when it is 5 or more. */
export function ProfileViews({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const vid = visitorId();
      if (vid && !BOT_UA.test(navigator.userAgent) && !navigator.webdriver) {
        await supabase.rpc('record_profile_view', { p_slug: slug, p_visitor: vid }).then(() => undefined, () => undefined);
      }
      const { data } = await supabase.rpc('profile_views_this_month', { p_slug: slug }).then((r) => r, () => ({ data: null }));
      if (!cancelled && typeof data === 'number' && data >= 5) setCount(data);
    })();
    return () => { cancelled = true; };
  }, [slug]);
  if (count === null) return null;
  return <p className="views" data-testid="profile-views">👀 {count.toLocaleString()} people viewed this profile this month</p>;
}
