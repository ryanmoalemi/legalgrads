-- Add JL Stiggins (Idaho 13152, Utah 19349, office@kilidivorcelaw.com)
-- to the private-table suppression list. Joy Anna Fuller stays blocked.
-- Paste this file in the Supabase SQL editor after the original
-- 20261107193000_suppressed_attorneys.sql has already been applied.
-- Safe when no matching row exists. See docs/opt-out.md.

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
    lower(coalesce(licensed_state, '')) || '-' || lower(coalesce(bar_number, '')) in (
      'ny-6118061',
      'id-13152',
      'ut-19349'
    )
    or lower(coalesce(email, '')) in (
      'joyannaaa@gmail.com',
      'office@kilidivorcelaw.com'
    )
    or public.normalized_attorney_name(full_name) in (
      'anna fuller joy',
      'jl stiggins'
    )
    or coalesce(profile_path, '') ~* '/attorneys/ny/[^/]+/[^/]*6118061/?$'
    or coalesce(profile_path, '') ~* 'joy-anna-fuller'
    or coalesce(profile_path, '') = 'joy-anna-fuller-6118061'
    or coalesce(profile_path, '') ~* '/attorneys/id/[^/]+/[^/]*13152/?$'
    or coalesce(profile_path, '') ~* '/attorneys/ut/[^/]+/[^/]*19349/?$'
    or coalesce(profile_path, '') ~* 'jl-stiggins'
    or coalesce(profile_path, '') in ('jl-stiggins-13152', 'jl-stiggins-19349')
$$;

delete from public.consumer_waitlist where lower(email) = 'office@kilidivorcelaw.com';
delete from public.profile_views_daily
where slug in ('jl-stiggins-13152', 'jl-stiggins-19349');
delete from public.profile_claim_codes
where lower(email) = 'office@kilidivorcelaw.com'
   or profile_path in (
     '/attorneys/id/washington-ut/jl-stiggins-13152/',
     '/attorneys/ut/office-unlisted/jl-stiggins-19349/'
   );
delete from public.profile_claim_mail where lower(email) = 'office@kilidivorcelaw.com';
delete from public.profile_claim_reports
where profile_path in (
    '/attorneys/id/washington-ut/jl-stiggins-13152/',
    '/attorneys/ut/office-unlisted/jl-stiggins-19349/'
  )
   or lower(reporter_email) = 'office@kilidivorcelaw.com'
   or lower(claimed_email) = 'office@kilidivorcelaw.com';
delete from public.profile_owner_edits
where profile_path in (
    '/attorneys/id/washington-ut/jl-stiggins-13152/',
    '/attorneys/ut/office-unlisted/jl-stiggins-19349/'
  )
   or lower(email) = 'office@kilidivorcelaw.com'
   or public.normalized_attorney_name(full_name) = 'jl stiggins'
   or (lower(coalesce(state_code, '')) = 'id' and bar_number = '13152')
   or (lower(coalesce(state_code, '')) = 'ut' and bar_number = '19349');
delete from public.claim_contacts
where profile_path in (
  '/attorneys/id/washington-ut/jl-stiggins-13152/',
  '/attorneys/ut/office-unlisted/jl-stiggins-19349/'
);
delete from public.attorney_profiles
where (lower(coalesce(licensed_state, '')) = 'id' and bar_number = '13152')
   or (lower(coalesce(licensed_state, '')) = 'ut' and bar_number = '19349')
   or lower(coalesce(email, '')) = 'office@kilidivorcelaw.com'
   or public.normalized_attorney_name(full_name) = 'jl stiggins';
delete from public.attorney_applications
where (lower(coalesce(licensed_state, '')) = 'id' and bar_number = '13152')
   or (lower(coalesce(licensed_state, '')) = 'ut' and bar_number = '19349')
   or lower(email) = 'office@kilidivorcelaw.com'
   or public.normalized_attorney_name(full_name) = 'jl stiggins';
