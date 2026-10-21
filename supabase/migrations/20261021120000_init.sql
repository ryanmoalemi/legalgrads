-- Legalgrads directory. Paste this entire file once into the Supabase SQL editor
-- (project qlhwojjdsonjxfeoiqww). It creates the tables, row level security,
-- the review function, and the private attorney-photos bucket policies.
-- The publishable key may insert applications and waitlist rows only.
-- It may read attorney_profiles only when published is true.
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
  phone text not null check (char_length(phone) between 7 and 40),
  bar_number text not null check (bar_number ~ '^[0-9]{4,8}$'),
  admission_date date not null,
  practice_areas text[] not null check (cardinality(practice_areas) > 0),
  cities_served text not null,
  bio text not null check (char_length(bio) between 40 and 2000),
  rate_type text not null check (rate_type in ('flat', 'hourly')),
  rate_amount numeric not null check (rate_amount > 0),
  languages text not null,
  contact_link text not null check (contact_link ~* '^https://'),
  photo_path text,
  malpractice_insurance boolean not null,
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
  and malpractice_insurance = true
  and attorney_terms_accepted_at is not null
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
      cities_served, bio, rate_type, rate_amount, languages, contact_link, photo_path,
      founding_member, published_at
    ) values (
      app.id, true, app.full_name, app.bar_number, app.admission_date, app.practice_areas,
      app.cities_served, app.bio, app.rate_type, app.rate_amount, app.languages, app.contact_link,
      app.photo_path, true, now()
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
      languages = excluded.languages,
      contact_link = excluded.contact_link,
      photo_path = excluded.photo_path,
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

notify pgrst, 'reload schema';
