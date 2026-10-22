-- Legalgrads no longer collects or shows attorney rates. Keep the columns (no data loss), make them optional.
alter table public.attorney_applications alter column rate_type drop not null;
alter table public.attorney_applications alter column rate_amount drop not null;
alter table public.attorney_applications alter column rate_for drop not null;
alter table public.attorney_applications drop constraint if exists attorney_applications_rate_type_check;
alter table public.attorney_applications drop constraint if exists attorney_applications_rate_amount_check;
alter table public.attorney_applications drop constraint if exists attorney_applications_rate_for_check;

alter table public.attorney_profiles alter column rate_type drop not null;
alter table public.attorney_profiles alter column rate_amount drop not null;
alter table public.attorney_profiles alter column rate_for drop not null;
alter table public.attorney_profiles drop constraint if exists attorney_profiles_rate_type_check;
alter table public.attorney_profiles drop constraint if exists attorney_profiles_rate_amount_check;
alter table public.attorney_profiles drop constraint if exists attorney_profiles_rate_for_check;

-- Clear the private placeholder the site stored while the columns were still required.
update public.attorney_applications set rate_type = null, rate_amount = null, rate_for = null where rate_for = 'not collected';
update public.attorney_profiles set rate_type = null, rate_amount = null, rate_for = null where rate_for = 'not collected';
