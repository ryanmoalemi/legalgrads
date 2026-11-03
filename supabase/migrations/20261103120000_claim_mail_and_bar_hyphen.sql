-- Official bar numbers can include a hyphen (Wyoming 8-6661) and can be longer than 12 characters.
alter table public.attorney_applications drop constraint if exists attorney_applications_bar_number_check;
alter table public.attorney_applications add constraint attorney_applications_bar_number_check
  check (bar_number ~ '^[A-Za-z0-9]([A-Za-z0-9-]{0,14}[A-Za-z0-9])?$') not valid;
alter table public.attorney_applications validate constraint attorney_applications_bar_number_check;

create table if not exists public.profile_claim_codes (
  id uuid primary key default gen_random_uuid(),
  profile_path text not null,
  email text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists profile_claim_codes_lookup on public.profile_claim_codes (email, profile_path, created_at desc);

create table if not exists public.profile_claim_mail (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  kind text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_owner_edits (
  profile_path text primary key,
  email text not null,
  claim_token_hash text not null,
  bar_number text,
  state_code text,
  full_name text,
  city text,
  bio text not null default '',
  services text not null default '',
  phone text not null default '',
  contact_link text not null default '',
  practice_areas text[] not null default '{}',
  photo_data_url text not null default '',
  claimed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_claim_codes enable row level security;
alter table public.profile_claim_mail enable row level security;
alter table public.profile_owner_edits enable row level security;
revoke all on public.profile_claim_codes from public, anon, authenticated;
revoke all on public.profile_claim_mail from public, anon, authenticated;
revoke all on public.profile_owner_edits from public, anon, authenticated;
