-- Paste this once after supabase/migrations/20261022033000_reject_message_links.sql.
-- New applications must include a 10-digit US phone. Spaces, dashes, parentheses, and a leading 1 are allowed.
-- The trigger runs on insert only, so existing rows are not rewritten and review updates do not fail.

create or replace function public.require_new_application_phone()
returns trigger
language plpgsql
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g');
  if digits !~ '^1?[0-9]{10}$' then
    raise exception 'phone required';
  end if;
  return new;
end;
$$;

drop trigger if exists require_new_application_phone on public.attorney_applications;
create trigger require_new_application_phone
before insert on public.attorney_applications
for each row execute function public.require_new_application_phone();
