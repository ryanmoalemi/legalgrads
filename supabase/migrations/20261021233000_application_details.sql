-- Run this only if 20261021120000_init.sql was already applied with the earlier
-- columns (malpractice_insurance, https-only contact link, 2000-character bio).
-- A brand-new project should paste the init file instead. This file is safe to
-- run once against that older schema.

alter table public.attorney_applications add column if not exists rate_for text;
alter table public.attorney_applications add column if not exists rate_starting_at boolean not null default false;
alter table public.attorney_applications add column if not exists free_consultation boolean not null default false;
alter table public.attorney_applications add column if not exists phone_public boolean not null default false;
alter table public.attorney_applications add column if not exists email_public boolean not null default false;
alter table public.attorney_applications add column if not exists reference text;
alter table public.attorney_applications add column if not exists insurance_choice text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'attorney_applications' and column_name = 'malpractice_insurance'
  ) then
    execute $u$
      update public.attorney_applications
      set insurance_choice = case when malpractice_insurance then 'insured' else 'will_disclose' end
      where insurance_choice is null
    $u$;
    alter table public.attorney_applications drop column malpractice_insurance;
  end if;
end $$;

alter table public.attorney_applications drop constraint if exists attorney_applications_bar_number_check;
alter table public.attorney_applications add constraint attorney_applications_bar_number_check check (bar_number ~ '^[0-9]{1,6}$');
alter table public.attorney_applications drop constraint if exists attorney_applications_bio_check;
alter table public.attorney_applications add constraint attorney_applications_bio_check check (char_length(bio) between 40 and 600);
alter table public.attorney_applications drop constraint if exists attorney_applications_rate_amount_check;
alter table public.attorney_applications add constraint attorney_applications_rate_amount_check check (rate_amount >= 25);
alter table public.attorney_applications drop constraint if exists attorney_applications_contact_link_check;
alter table public.attorney_applications add constraint attorney_applications_contact_link_check check (
  contact_link !~* '^(javascript|data|vbscript):'
  and (
    contact_link ~* '^https://[^[:space:]]+\.[^[:space:]]+'
    or contact_link ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or contact_link ~ '^[0-9+().[:space:]-]{10,40}$'
  )
);
alter table public.attorney_applications drop constraint if exists attorney_applications_insurance_choice_check;
alter table public.attorney_applications add constraint attorney_applications_insurance_choice_check check (insurance_choice in ('insured', 'will_disclose'));
alter table public.attorney_applications drop constraint if exists attorney_applications_admission_date_check;
alter table public.attorney_applications add constraint attorney_applications_admission_date_check check (admission_date <= current_date);

alter table public.attorney_profiles add column if not exists insured boolean not null default false;
alter table public.attorney_profiles add column if not exists phone text;
alter table public.attorney_profiles add column if not exists email text;
alter table public.attorney_profiles add column if not exists rate_for text;
alter table public.attorney_profiles add column if not exists rate_starting_at boolean not null default false;
alter table public.attorney_profiles add column if not exists free_consultation boolean not null default false;

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
      case when app.email_public then app.email else null end,
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
