-- Block Joy Anna Fuller (NY 6118061, joyannaaa@gmail.com) from private tables.
-- Paste this file once in the Supabase SQL editor. The website build cannot run it.
-- Safe when no matching row exists. See docs/opt-out.md before adding another person.

create or replace function public.normalized_attorney_name(value text)
returns text
language sql
immutable
as $$
  select coalesce(string_agg(token, ' ' order by token), '')
  from (
    select token
    from regexp_split_to_table(regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', ' ', 'g'), '\s+') as token
    where token <> ''
      and token !~ '^[0-9]+$'
      and token not in ('esq', 'esquire', 'jr', 'sr', 'ii', 'iii', 'iv', 'v', 'phd', 'llm')
  ) tokens
$$;

create or replace function public.attorney_is_suppressed(
  full_name text,
  email text,
  licensed_state text,
  bar_number text,
  profile_path text
)
returns boolean
language sql
immutable
as $$
  select
    lower(coalesce(licensed_state, '')) || '-' || lower(coalesce(bar_number, '')) = 'ny-6118061'
    or lower(coalesce(email, '')) = 'joyannaaa@gmail.com'
    or public.normalized_attorney_name(full_name) = 'anna fuller joy'
    or coalesce(profile_path, '') ~* '/attorneys/ny/[^/]+/[^/]*6118061/?$'
    or coalesce(profile_path, '') ~* 'joy-anna-fuller'
    or coalesce(profile_path, '') = 'joy-anna-fuller-6118061'
$$;

create or replace function public.reject_suppressed_attorney()
returns trigger
language plpgsql
as $$
declare
  body jsonb := to_jsonb(new);
  person_name text := coalesce(body->>'full_name', body->>'name', '');
  person_email text := coalesce(body->>'email', body->>'bar_email', body->>'reporter_email', body->>'claimed_email', '');
  person_state text := coalesce(body->>'licensed_state', body->>'state_code', '');
  person_bar text := coalesce(body->>'bar_number', '');
  person_path text := coalesce(body->>'profile_path', body->>'slug', '');
begin
  if public.attorney_is_suppressed(person_name, person_email, person_state, person_bar, person_path) then
    raise exception 'This attorney is on the Legalgrads suppression list and cannot be stored';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_suppressed_attorney on public.attorney_applications;
create trigger reject_suppressed_attorney
before insert or update on public.attorney_applications
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.attorney_profiles;
create trigger reject_suppressed_attorney
before insert or update on public.attorney_profiles
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.profile_owner_edits;
create trigger reject_suppressed_attorney
before insert or update on public.profile_owner_edits
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.claim_contacts;
create trigger reject_suppressed_attorney
before insert or update on public.claim_contacts
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.profile_claim_codes;
create trigger reject_suppressed_attorney
before insert or update on public.profile_claim_codes
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.profile_claim_reports;
create trigger reject_suppressed_attorney
before insert or update on public.profile_claim_reports
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.profile_views_daily;
create trigger reject_suppressed_attorney
before insert or update on public.profile_views_daily
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.profile_claim_mail;
create trigger reject_suppressed_attorney
before insert or update on public.profile_claim_mail
for each row execute function public.reject_suppressed_attorney();

drop trigger if exists reject_suppressed_attorney on public.consumer_waitlist;
create trigger reject_suppressed_attorney
before insert or update on public.consumer_waitlist
for each row execute function public.reject_suppressed_attorney();

delete from public.consumer_waitlist where lower(email) = 'joyannaaa@gmail.com';
delete from public.profile_views_daily where slug = 'joy-anna-fuller-6118061';
delete from public.profile_claim_codes
where lower(email) = 'joyannaaa@gmail.com'
   or profile_path = '/attorneys/ny/north-bethesda-md/joy-anna-fuller-6118061/';
delete from public.profile_claim_mail where lower(email) = 'joyannaaa@gmail.com';
delete from public.profile_claim_reports
where profile_path = '/attorneys/ny/north-bethesda-md/joy-anna-fuller-6118061/'
   or lower(reporter_email) = 'joyannaaa@gmail.com'
   or lower(claimed_email) = 'joyannaaa@gmail.com';
delete from public.profile_owner_edits
where profile_path = '/attorneys/ny/north-bethesda-md/joy-anna-fuller-6118061/'
   or lower(email) = 'joyannaaa@gmail.com'
   or public.normalized_attorney_name(full_name) = 'anna fuller joy'
   or (lower(coalesce(state_code, '')) = 'ny' and bar_number = '6118061');
delete from public.claim_contacts
where profile_path = '/attorneys/ny/north-bethesda-md/joy-anna-fuller-6118061/';
delete from public.attorney_profiles
where bar_number = '6118061'
   or lower(coalesce(email, '')) = 'joyannaaa@gmail.com'
   or public.normalized_attorney_name(full_name) = 'anna fuller joy';
delete from public.attorney_applications
where bar_number = '6118061'
   or lower(email) = 'joyannaaa@gmail.com'
   or public.normalized_attorney_name(full_name) = 'anna fuller joy';
