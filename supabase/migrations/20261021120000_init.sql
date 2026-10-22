-- Legalgrads directory. Paste this entire file once into the Supabase SQL editor
-- (project qlhwojjdsonjxfeoiqww). It creates the tables, row level security,
-- the review function, and the private attorney-photos bucket policies.
-- The publishable key may insert applications, waitlist rows, and attorney messages.
-- It may read attorney_profiles only when published is true.
-- It cannot read attorney emails or stored messages.
-- Do not put a secret or service-role key in the website.

create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated;

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.attorney_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  bar_verified_at timestamptz,
  verified_by uuid references auth.users (id),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text not null check (
    char_length(phone) between 10 and 40
    and regexp_replace(phone, '[^0-9]', '', 'g') ~ '^1?[0-9]{10}$'
  ),
  bar_number text not null check (bar_number ~ '^[0-9]{1,6}$'),
  admission_date date not null check (admission_date <= current_date),
  practice_areas text[] not null check (cardinality(practice_areas) > 0),
  cities_served text not null,
  bio text not null check (char_length(bio) between 40 and 600),
  rate_type text not null check (rate_type in ('flat', 'hourly')),
  rate_amount numeric not null check (rate_amount >= 25),
  rate_for text not null check (char_length(rate_for) between 2 and 160),
  rate_starting_at boolean not null default false,
  free_consultation boolean not null default false,
  languages text not null,
  contact_link text not null check (
    contact_link !~* '^(javascript|data|vbscript):'
    and (
      contact_link ~* '^https://[^[:space:]]+\.[^[:space:]]+'
      or contact_link ~ '^[0-9+().[:space:]-]{10,40}$'
    )
  ),
  photo_path text,
  insurance_choice text not null check (insurance_choice in ('insured', 'will_disclose')),
  phone_public boolean not null default false,
  email_public boolean not null default false,
  reference text,
  attorney_terms_accepted_at timestamptz not null,
  user_id uuid references auth.users (id)
);

create table public.attorney_profiles (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.attorney_applications (id) on delete cascade,
  published boolean not null default false,
  full_name text not null,
  bar_number text not null,
  admission_date date not null,
  practice_areas text[] not null,
  cities_served text not null,
  bio text not null,
  rate_type text not null check (rate_type in ('flat', 'hourly')),
  rate_amount numeric not null,
  languages text not null,
  contact_link text not null,
  photo_path text,
  insured boolean not null default false,
  phone text,
  email text,
  rate_for text,
  rate_starting_at boolean not null default false,
  free_consultation boolean not null default false,
  founding_member boolean not null default true,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.consumer_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  source text,
  created_at timestamptz not null default now()
);

create index attorney_profiles_published_idx on public.attorney_profiles (published);

alter table public.admin_users enable row level security;
alter table public.attorney_applications enable row level security;
alter table public.attorney_profiles enable row level security;
alter table public.consumer_waitlist enable row level security;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.attorney_applications from anon, authenticated;
revoke all on public.attorney_profiles from anon, authenticated;
revoke all on public.consumer_waitlist from anon, authenticated;

grant select on public.admin_users to authenticated;
grant insert on public.attorney_applications to anon, authenticated;
grant select, update on public.attorney_applications to authenticated;
grant select on public.attorney_profiles to anon, authenticated;
grant select, insert, update, delete on public.attorney_profiles to authenticated;
grant insert on public.consumer_waitlist to anon, authenticated;
grant select on public.consumer_waitlist to authenticated;

create policy "public inserts pending applications"
on public.attorney_applications
for insert
to anon, authenticated
with check (
  status = 'pending'
  and bar_verified_at is null
  and verified_by is null
  and insurance_choice in ('insured', 'will_disclose')
  and attorney_terms_accepted_at is not null
  and email_public = false
);

create policy "applicant or admin reads applications"
on public.attorney_applications
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "applicant or admin updates applications"
on public.attorney_applications
for update
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "admins read their admin row"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "public reads published profiles"
on public.attorney_profiles
for select
to anon, authenticated
using (published = true);

create policy "owner or admin reads unpublished profiles"
on public.attorney_profiles
for select
to authenticated
using (
  exists (
    select 1 from public.attorney_applications app
    where app.id = application_id
      and (
        lower(app.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or app.user_id = auth.uid()
      )
  )
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "owner or admin updates profiles"
on public.attorney_profiles
for update
to authenticated
using (
  exists (
    select 1 from public.attorney_applications app
    where app.id = application_id
      and lower(app.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
)
with check (
  exists (
    select 1 from public.attorney_applications app
    where app.id = application_id
      and lower(app.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  or exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

create policy "admins insert profiles"
on public.attorney_profiles
for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admins delete profiles"
on public.attorney_profiles
for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "public inserts waitlist"
on public.consumer_waitlist
for insert
to anon, authenticated
with check (char_length(email) < 200);

create policy "admins read waitlist"
on public.consumer_waitlist
for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create or replace function public.protect_application_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return new;
  end if;
  new.status := old.status;
  new.bar_verified_at := old.bar_verified_at;
  new.verified_by := old.verified_by;
  new.bar_number := old.bar_number;
  new.admission_date := old.admission_date;
  new.email := old.email;
  return new;
end;
$$;

create trigger protect_application_review
before update on public.attorney_applications
for each row execute function public.protect_application_review();

create or replace function public.protect_profile_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.admin_users where user_id = auth.uid()) then
    return new;
  end if;
  new.published := old.published;
  new.published_at := old.published_at;
  new.founding_member := old.founding_member;
  new.bar_number := old.bar_number;
  new.admission_date := old.admission_date;
  return new;
end;
$$;

create trigger protect_profile_publish
before update on public.attorney_profiles
for each row execute function public.protect_profile_publish();

create or replace function public.review_application(app_id uuid, decision text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  app public.attorney_applications;
  profile_id uuid;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'Only an admin can review applications';
  end if;
  if decision not in ('verified', 'rejected') then
    raise exception 'Decision must be verified or rejected';
  end if;

  update public.attorney_applications
    set status = decision,
        bar_verified_at = case when decision = 'verified' then now() else null end,
        verified_by = auth.uid()
    where id = app_id
    returning * into app;

  if app.id is null then
    raise exception 'Application not found';
  end if;

  if decision = 'verified' then
    insert into public.attorney_profiles (
      application_id, published, full_name, bar_number, admission_date, practice_areas,
      cities_served, bio, rate_type, rate_amount, rate_for, rate_starting_at, free_consultation,
      languages, contact_link, photo_path, insured, phone, email, founding_member, published_at
    ) values (
      app.id, true, app.full_name, app.bar_number, app.admission_date, app.practice_areas,
      app.cities_served, app.bio, app.rate_type, app.rate_amount, app.rate_for, app.rate_starting_at, app.free_consultation,
      app.languages, app.contact_link, app.photo_path, app.insurance_choice = 'insured',
      case when app.phone_public then app.phone else null end,
      null,
      true, now()
    )
    on conflict (application_id) do update set
      published = true,
      full_name = excluded.full_name,
      bar_number = excluded.bar_number,
      admission_date = excluded.admission_date,
      practice_areas = excluded.practice_areas,
      cities_served = excluded.cities_served,
      bio = excluded.bio,
      rate_type = excluded.rate_type,
      rate_amount = excluded.rate_amount,
      rate_for = excluded.rate_for,
      rate_starting_at = excluded.rate_starting_at,
      free_consultation = excluded.free_consultation,
      languages = excluded.languages,
      contact_link = excluded.contact_link,
      photo_path = excluded.photo_path,
      insured = excluded.insured,
      phone = excluded.phone,
      email = excluded.email,
      founding_member = true,
      published_at = now()
    returning id into profile_id;
  else
    update public.attorney_profiles
      set published = false
      where application_id = app.id
      returning id into profile_id;
  end if;

  return profile_id;
end;
$$;

revoke all on function public.review_application(uuid, text) from public, anon;
grant execute on function public.review_application(uuid, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('attorney-photos', 'attorney-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880;

drop policy if exists "upload pending attorney photos" on storage.objects;
create policy "upload pending attorney photos"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'attorney-photos'
  and name like 'pending/%'
);

drop policy if exists "admins read attorney photos" on storage.objects;
create policy "admins read attorney photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'attorney-photos'
  and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
);

drop policy if exists "public reads published attorney photos" on storage.objects;
create policy "public reads published attorney photos"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'attorney-photos'
  and name like 'published/%'
);

create or replace function public.strip_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email := null;
  return new;
end;
$$;

drop trigger if exists strip_profile_email on public.attorney_profiles;
create trigger strip_profile_email
before insert or update on public.attorney_profiles
for each row execute function public.strip_profile_email();

revoke select (email) on public.attorney_profiles from anon, authenticated;

create table public.attorney_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid not null references public.attorney_profiles (id) on delete cascade,
  sender_name text not null check (char_length(sender_name) between 2 and 120),
  sender_email text not null check (sender_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  sender_phone text check (sender_phone is null or char_length(sender_phone) between 7 and 40),
  body text not null check (char_length(body) between 10 and 2000),
  consent_at timestamptz not null,
  honeypot text not null default '',
  relayed_at timestamptz,
  relay_error text,
  screen_status text not null default 'not_screened',
  screen_source text,
  constraint attorney_messages_screen_status_check check (screen_status in ('quarantine', 'genuine', 'uncertain', 'not_screened')),
  constraint attorney_messages_screen_source_check check (screen_source is null or screen_source in ('precheck', 'classifier', 'ai_error'))
);

create table public.attorney_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.attorney_messages (id) on delete cascade,
  direction text not null check (direction in ('to_attorney', 'to_sender')),
  created_at timestamptz not null default now()
);

create index attorney_messages_sender_idx on public.attorney_messages (sender_email, created_at desc);
create index attorney_messages_profile_idx on public.attorney_messages (profile_id, created_at desc);
create index attorney_messages_screen_idx on public.attorney_messages (screen_status, created_at desc);

alter table public.attorney_messages enable row level security;
alter table public.attorney_message_replies enable row level security;

revoke all on public.attorney_messages from anon, authenticated;
revoke all on public.attorney_message_replies from anon, authenticated;
grant insert on public.attorney_messages to anon, authenticated;
grant select on public.attorney_messages to authenticated;

create policy "public inserts attorney messages"
on public.attorney_messages
for insert
to anon, authenticated
with check (
  honeypot = ''
  and consent_at is not null
  and char_length(body) between 10 and 2000
  and screen_status = 'not_screened'
  and screen_source is null
  and exists (
    select 1 from public.attorney_profiles p
    where p.id = profile_id and p.published = true
  )
);

create policy "admins read attorney messages"
on public.attorney_messages
for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create or replace function public.enforce_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.honeypot <> '' then
    raise exception 'message rejected';
  end if;
  if (
    select count(*) from public.attorney_messages
    where lower(sender_email) = lower(new.sender_email)
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'rate limit';
  end if;
  if (
    select count(*) from public.attorney_messages
    where profile_id = new.profile_id
      and created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'rate limit';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_message_rate_limit on public.attorney_messages;
create trigger enforce_message_rate_limit
before insert on public.attorney_messages
for each row execute function public.enforce_message_rate_limit();

create or replace function public.message_has_link(value text)
returns boolean
language sql
immutable
as $$
  select coalesce(value, '') ~* 'h[[:space:]]*t[[:space:]]*t[[:space:]]*p[[:space:]]*s?[[:space:]]*:[[:space:]]*/[[:space:]]*/|h[[:space:]]*x[[:space:]]*x[[:space:]]*p[[:space:]]*s?[[:space:]]*:[[:space:]]*/[[:space:]]*/|[[:<:]]www[[:space:]]*\.|<[[:space:]]*/?[[:space:]]*a[[:space:]>]|href[[:space:]]*=|\[[^]]{0,200}\][[:space:]]*\([^)]{0,300}(\.|/|http|hxxp|www)|[[:<:]][a-z0-9][a-z0-9-]{0,62}[[:space:]]*(\[[[:space:]]*\.[[:space:]]*\]|\([[:space:]]*\.[[:space:]]*\)|\[[[:space:]]*dot[[:space:]]*\]|\([[:space:]]*dot[[:space:]]*\))[[:space:]]*(com|net|org|io|co|ly|gl|cc|gov|edu)|[[:<:]]dot[[:space:]]+(com|net|org|io|co|ly|info|biz|xyz)|[[:<:]]([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+(com|net|org|edu|gov|io|co|us|uk|info|biz|me|ly|gl|cc|to|gd|be|at|ai|app|dev|xyz|site|online|link|click|legal|law|gy|tv)[[:>:]]'
$$;

create or replace function public.quarantine_linked_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.message_has_link(coalesce(new.sender_name, '') || E'\n' || coalesce(new.sender_phone, '') || E'\n' || coalesce(new.body, '')) then
    new.screen_status := 'quarantine';
    new.screen_source := 'precheck';
  end if;
  return new;
end;
$$;

drop trigger if exists quarantine_linked_message on public.attorney_messages;
create trigger quarantine_linked_message
before insert on public.attorney_messages
for each row execute function public.quarantine_linked_message();

create table public.message_rate_limits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

alter table public.message_rate_limits enable row level security;
revoke all on public.message_rate_limits from anon, authenticated;
create index message_rate_limits_bucket_idx on public.message_rate_limits (bucket, created_at desc);

notify pgrst, 'reload schema';
