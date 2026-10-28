-- Directory "Near me" sort + in-person option.
-- office_zip: the attorney's office ZIP from State Bar records (set during bar verification). Used only
--   for ZIP-level distance sorting in the browser. in_person: "Offers in-person meetings / will visit your business".
alter table public.attorney_applications add column if not exists in_person boolean not null default false;
alter table public.attorney_profiles add column if not exists in_person boolean not null default false;
alter table public.attorney_profiles add column if not exists office_zip text;
alter table public.attorney_profiles drop constraint if exists attorney_profiles_office_zip_check;
alter table public.attorney_profiles add constraint attorney_profiles_office_zip_check check (office_zip is null or office_zip ~ '^\d{5}$');

-- Carry the attorney's in-person choice from the application onto the published profile
-- (the existing review function inserts/updates profiles without this column).
create or replace function public.profile_in_person_from_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.application_id is not null and (tg_op = 'INSERT' or new.application_id is distinct from old.application_id) then
    select coalesce(a.in_person, false) into new.in_person from public.attorney_applications a where a.id = new.application_id;
    new.in_person := coalesce(new.in_person, false);
  end if;
  return new;
end;
$$;
drop trigger if exists attorney_profiles_in_person on public.attorney_profiles;
create trigger attorney_profiles_in_person before insert on public.attorney_profiles
for each row execute function public.profile_in_person_from_application();
