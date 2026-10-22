-- Paste this once after supabase/migrations/20261022040000_require_application_phone.sql.
-- A brand-new database should paste the updated init file only.
-- Website is optional. Phone is already required, and clients message through the relay.
-- Existing rows may still store a phone-shaped contact_link. The check stays a superset so those
-- rows, and review updates of them, keep validating. New inserts must be blank or https.

alter table public.attorney_applications drop constraint if exists attorney_applications_contact_link_check;
alter table public.attorney_applications add constraint attorney_applications_contact_link_check check (
  contact_link is null
  or btrim(contact_link) = ''
  or (
    contact_link !~* '^(javascript|data|vbscript):'
    and (
      contact_link ~* '^https://[^[:space:]]+\.[^[:space:]]+'
      or contact_link ~ '^[0-9+().[:space:]-]{10,40}$'
    )
  )
);

create or replace function public.require_new_application_website()
returns trigger
language plpgsql
as $$
declare
  link text;
begin
  link := btrim(coalesce(new.contact_link, ''));
  if link = '' then
    new.contact_link := '';
    return new;
  end if;
  if link ~* '^(javascript|data|vbscript):' or link !~* '^https://[^[:space:]]+\.[^[:space:]]+' then
    raise exception 'website link must be https';
  end if;
  new.contact_link := link;
  return new;
end;
$$;

drop trigger if exists require_new_application_website on public.attorney_applications;
create trigger require_new_application_website
before insert on public.attorney_applications
for each row execute function public.require_new_application_website();
