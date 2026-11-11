-- Owner profile tools: richer claimed profiles, private stats, and profile inquiries.
-- Every new table has RLS on with no policies. Only the owner-tools edge function
-- (service role) and the security definer functions below touch them.

alter table public.profile_owner_edits
  add column if not exists service_list text[] not null default '{}',
  add column if not exists client_types text[] not null default '{}',
  add column if not exists consult_modes text[] not null default '{}',
  add column if not exists consult_fee text not null default '' check (consult_fee in ('', 'free', 'paid')),
  add column if not exists consult_price text not null default '',
  add column if not exists billing text[] not null default '{}',
  add column if not exists fixed_fees jsonb not null default '[]'::jsonb,
  add column if not exists availability text not null default '' check (availability in ('', 'accepting', 'limited', 'not')),
  add column if not exists availability_updated_at timestamptz,
  add column if not exists contact_pref text not null default '' check (contact_pref in ('', 'phone', 'website', 'inquiry')),
  add column if not exists inquiries_enabled boolean not null default true;

-- First-party, cookieless profile events. One row per visitor per profile per kind per day.
-- visitor_hash = sha256(ip | user-agent | path | kind | daily salt). Salts rotate daily (profile_view_salts),
-- so hashes cannot be linked across days. Raw IPs and user agents are never stored.
create table if not exists public.profile_events (
  profile_path text not null check (profile_path ~ '^/attorneys/[a-z]{2}/[a-z0-9-]+/[a-z0-9-]+/$'),
  day date not null default ((now() at time zone 'America/Los_Angeles')::date),
  kind text not null check (kind in ('view', 'website_click', 'phone_click')),
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  primary key (profile_path, day, kind, visitor_hash)
);
alter table public.profile_events enable row level security;
revoke all on public.profile_events from public, anon, authenticated;

create or replace function public.record_profile_event(p_path text, p_kind text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  h json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  ua text := coalesce(h->>'user-agent', '');
  ip text := trim(split_part(coalesce(h->>'cf-connecting-ip', h->>'x-real-ip', h->>'x-forwarded-for', ''), ',', 1));
  d date := (now() at time zone 'America/Los_Angeles')::date;
  s text;
begin
  if p_path is null or p_path !~ '^/attorneys/[a-z]{2}/[a-z0-9-]+/[a-z0-9-]+/$' then return; end if;
  if p_kind not in ('view', 'website_click', 'phone_click') then return; end if;
  if ua = '' or lower(ua) ~ '(bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|skype|curl|wget|python|httpclient|monitor|pingdom|uptime)' then return; end if;
  insert into public.profile_view_salts (day) values (d) on conflict do nothing;
  select salt into s from public.profile_view_salts where day = d;
  delete from public.profile_view_salts where day < d - 1;
  insert into public.profile_events (profile_path, day, kind, visitor_hash)
  values (p_path, d, p_kind, encode(digest(ip || '|' || ua || '|' || p_path || '|' || p_kind || '|' || s, 'sha256'), 'hex'))
  on conflict do nothing;
end;
$$;
revoke all on function public.record_profile_event(text, text) from public;
grant execute on function public.record_profile_event(text, text) to anon, authenticated;

-- Inquiries sent from a claimed profile. The message itself is emailed to the attorney and never stored.
create table if not exists public.profile_inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_path text not null,
  ip_hash text not null default '',
  sender_hash text not null default '',
  status text not null default 'received' check (status in ('received', 'delivered', 'failed', 'blocked', 'held')),
  reason text not null default '',
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists profile_inquiries_path on public.profile_inquiries (profile_path, created_at desc);
create index if not exists profile_inquiries_ip on public.profile_inquiries (ip_hash, created_at desc);
create index if not exists profile_inquiries_sender on public.profile_inquiries (sender_hash, created_at desc);
alter table public.profile_inquiries enable row level security;
revoke all on public.profile_inquiries from public, anon, authenticated;
