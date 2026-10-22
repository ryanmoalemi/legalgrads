-- Legalgrads accepts attorneys from all 50 states and DC.
alter table public.attorney_applications add column if not exists licensed_state text;
alter table public.attorney_profiles add column if not exists licensed_state text;

-- Everyone who applied before this change applied as a California attorney.
update public.attorney_applications set licensed_state = 'CA' where licensed_state is null;
update public.attorney_profiles set licensed_state = 'CA' where licensed_state is null;

alter table public.attorney_applications drop constraint if exists attorney_applications_licensed_state_check;
alter table public.attorney_applications add constraint attorney_applications_licensed_state_check check (
  licensed_state in ('AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY')
) not valid;
alter table public.attorney_profiles drop constraint if exists attorney_profiles_licensed_state_check;
alter table public.attorney_profiles add constraint attorney_profiles_licensed_state_check check (
  licensed_state is null or licensed_state in ('AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY')
);

-- Bar numbers outside California can be longer or contain letters (e.g. NY 7 digits).
alter table public.attorney_applications drop constraint if exists attorney_applications_bar_number_check;
alter table public.attorney_applications add constraint attorney_applications_bar_number_check check (bar_number ~ '^[A-Za-z0-9]{1,12}$');

-- Copy the state onto a profile when it is published from an application.
create or replace function public.profile_licensed_state()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.licensed_state is null then
    select a.licensed_state into new.licensed_state from public.attorney_applications a where a.id = new.application_id;
  end if;
  return new;
end;
$$;
drop trigger if exists profile_licensed_state on public.attorney_profiles;
create trigger profile_licensed_state before insert or update on public.attorney_profiles
for each row execute function public.profile_licensed_state();
