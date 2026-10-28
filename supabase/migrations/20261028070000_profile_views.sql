-- Profile view counts (views only; no message or contact-click counts).
-- One row per (profile slug, day, hashed visitor). No raw IPs or raw visitor ids are stored.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profile_views_daily (
  slug text not null check (char_length(slug) between 1 and 200),
  day date not null default ((now() at time zone 'America/Los_Angeles')::date),
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (slug, day, visitor_hash)
);

alter table public.profile_views_daily enable row level security;
-- No policies: anon/authenticated cannot select/insert/update/delete directly.
revoke all on public.profile_views_daily from anon, authenticated;

-- Insert-only path for anonymous visitors. Dedupes per visitor per profile per day.
create or replace function public.record_profile_view(p_slug text, p_visitor text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  ua text := lower(coalesce(current_setting('request.headers', true)::json->>'user-agent', ''));
  d date := (now() at time zone 'America/Los_Angeles')::date;
begin
  if p_slug is null or p_slug !~ '^[a-z0-9-]{1,200}$' then return; end if;
  if p_visitor is null or char_length(p_visitor) < 8 or char_length(p_visitor) > 100 then return; end if;
  if ua = '' or ua ~ '(bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python|httpclient|monitor)' then return; end if;
  insert into public.profile_views_daily (slug, day, visitor_hash)
  values (p_slug, d, encode(digest(p_visitor || ':' || p_slug || ':' || d::text, 'sha256'), 'hex'))
  on conflict do nothing;
end;
$$;

-- Monthly unique-per-day views for the current month (PT). Returns null below 5 so small counts are never exposed.
create or replace function public.profile_views_this_month(p_slug text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case when c >= 5 then c::int else null end
  from (
    select count(*) as c from public.profile_views_daily
    where slug = p_slug
      and day >= date_trunc('month', (now() at time zone 'America/Los_Angeles'))::date
  ) t;
$$;

revoke all on function public.record_profile_view(text, text) from public;
revoke all on function public.profile_views_this_month(text) from public;
grant execute on function public.record_profile_view(text, text) to anon, authenticated;
grant execute on function public.profile_views_this_month(text) to anon, authenticated;

-- Internal reporting view (service role / SQL editor only) for quoting numbers in claim invites.
create or replace view public.profile_views_monthly
with (security_invoker = true) as
select slug, date_trunc('month', day)::date as month, count(*)::int as views
from public.profile_views_daily
group by slug, date_trunc('month', day);
revoke all on public.profile_views_monthly from anon, authenticated;
