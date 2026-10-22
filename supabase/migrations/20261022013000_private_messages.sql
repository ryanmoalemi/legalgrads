-- Paste this file once if supabase/migrations/20261021120000_init.sql was already applied.
-- A brand-new database should paste the updated init file only.
-- Attorney emails are never public. Clients insert messages; they cannot read them.
-- An Edge Function relays each message without putting either address in the other person's view.

update public.attorney_applications
set email_public = false
where email_public = true;

update public.attorney_applications
set contact_link = case
  when phone ~ '^[0-9+().[:space:]-]{10,40}$' then phone
  else 'https://legalgrads.com/find-lawyer/'
end
where contact_link ~* '^[^@[:space:]]+@';

update public.attorney_profiles
set email = null
where email is not null;

update public.attorney_profiles
set contact_link = case
  when phone ~ '^[0-9+().[:space:]-]{10,40}$' then phone
  else 'https://legalgrads.com/find-lawyer/'
end
where contact_link ~* '@';

alter table public.attorney_applications drop constraint if exists attorney_applications_contact_link_check;
alter table public.attorney_applications add constraint attorney_applications_contact_link_check check (
  contact_link !~* '^(javascript|data|vbscript):'
  and (
    contact_link ~* '^https://[^[:space:]]+\.[^[:space:]]+'
    or contact_link ~ '^[0-9+().[:space:]-]{10,40}$'
  )
);

drop policy if exists "public inserts pending applications" on public.attorney_applications;
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
      email = null,
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

create table if not exists public.attorney_messages (
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
  relay_error text
);

create table if not exists public.attorney_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.attorney_messages (id) on delete cascade,
  direction text not null check (direction in ('to_attorney', 'to_sender')),
  created_at timestamptz not null default now()
);

create table if not exists public.message_rate_limits (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists attorney_messages_sender_idx on public.attorney_messages (sender_email, created_at desc);
create index if not exists attorney_messages_profile_idx on public.attorney_messages (profile_id, created_at desc);
create index if not exists message_rate_limits_bucket_idx on public.message_rate_limits (bucket, created_at desc);

alter table public.attorney_messages enable row level security;
alter table public.attorney_message_replies enable row level security;
alter table public.message_rate_limits enable row level security;

revoke all on public.attorney_messages from anon, authenticated;
revoke all on public.attorney_message_replies from anon, authenticated;
revoke all on public.message_rate_limits from anon, authenticated;
grant insert on public.attorney_messages to anon, authenticated;
grant select on public.attorney_messages to authenticated;

drop policy if exists "public inserts attorney messages" on public.attorney_messages;
create policy "public inserts attorney messages"
on public.attorney_messages
for insert
to anon, authenticated
with check (
  honeypot = ''
  and consent_at is not null
  and char_length(body) between 10 and 2000
  and exists (
    select 1 from public.attorney_profiles p
    where p.id = profile_id and p.published = true
  )
);

drop policy if exists "admins read attorney messages" on public.attorney_messages;
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

notify pgrst, 'reload schema';
