-- Claim identity checks: official bar email, firm domain, or manual review.

-- Private contact data from official rosters. Never exposed to the site.
create table if not exists public.claim_contacts (
  profile_path text primary key,
  bar_email text,
  firm_domain text,
  law_school_domain text,
  has_bar_phone boolean not null default false, -- for a future SMS code step
  source text not null default 'state-bar-roster',
  updated_at timestamptz not null default now()
);
alter table public.claim_contacts enable row level security;
revoke all on public.claim_contacts from public, anon, authenticated;

alter table public.profile_owner_edits
  add column if not exists method text not null default 'manual',
  add column if not exists approved boolean not null default false,
  add column if not exists approved_at timestamptz,
  add column if not exists disputed boolean not null default false,
  add column if not exists review_note text not null default '';

-- Claims made before this change were test claims only. Keep them hidden until approved.

create table if not exists public.profile_claim_reports (
  id uuid primary key default gen_random_uuid(),
  profile_path text not null,
  kind text not null, -- 'wrong-claim' or 'competing-claim'
  reporter_email text not null default '',
  note text not null default '',
  claimed_email text not null default '',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists profile_claim_reports_path on public.profile_claim_reports (profile_path, created_at desc);
alter table public.profile_claim_reports enable row level security;
revoke all on public.profile_claim_reports from public, anon, authenticated;

-- Admin review list. Open it in Supabase Table Editor or SQL Editor.
create or replace view public.claim_review
with (security_invoker = true) as
select
  e.profile_path,
  'https://legalgrads.com' || e.profile_path as profile_url,
  e.full_name,
  e.state_code,
  e.bar_number,
  e.email as claimed_email,
  e.method,
  e.approved,
  e.disputed,
  e.claimed_at,
  e.updated_at,
  (select count(*) from public.profile_claim_reports r where r.profile_path = e.profile_path and not r.resolved) as open_reports,
  (e.bio <> '' or e.services <> '' or e.phone <> '' or e.contact_link <> '' or e.photo_data_url <> '' or cardinality(e.practice_areas) > 0) as has_edits
from public.profile_owner_edits e
where e.approved = false or e.disputed = true
order by e.updated_at desc;
revoke all on public.claim_review from public, anon, authenticated;

-- One-line approve: select public.approve_claim('/attorneys/ca/city/slug/');
create or replace function public.approve_claim(path text)
returns void language sql security definer set search_path = public as $$
  update public.profile_owner_edits
     set approved = true, approved_at = now(), disputed = false
   where profile_path = path;
  update public.profile_claim_reports set resolved = true where profile_path = path;
$$;
-- Reject: removes the claim so the real owner can claim again.
create or replace function public.reject_claim(path text)
returns void language sql security definer set search_path = public as $$
  delete from public.profile_owner_edits where profile_path = path;
  update public.profile_claim_reports set resolved = true where profile_path = path;
$$;
revoke all on function public.approve_claim(text) from public, anon, authenticated;
revoke all on function public.reject_claim(text) from public, anon, authenticated;
