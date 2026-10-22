-- Paste this once after supabase/migrations/20261022023000_message_spam_screen.sql.
-- A client message that contains a link is stored as quarantine and is not a normal public insert.
-- The relay function refuses to forward it. Public inserts cannot override that status.

create or replace function public.message_has_link(value text)
returns boolean
language sql
immutable
as $$
  select coalesce(value, '') ~* 'h[[:space:]]*t[[:space:]]*t[[:space:]]*p[[:space:]]*s?[[:space:]]*:[[:space:]]*/[[:space:]]*/|h[[:space:]]*x[[:space:]]*x[[:space:]]*p[[:space:]]*s?[[:space:]]*:[[:space:]]*/[[:space:]]*/|[[:<:]]www[[:space:]]*\.|<[[:space:]]*/?[[:space:]]*a[[:space:]>]|href[[:space:]]*=|\[[^]]{0,200}\][[:space:]]*\([^)]{0,300}(\.|/|http|hxxp|www)|[[:<:]][a-z0-9][a-z0-9-]{0,62}[[:space:]]*(\[[[:space:]]*\.[[:space:]]*\]|\([[:space:]]*\.[[:space:]]*\)|\[[[:space:]]*dot[[:space:]]*\]|\([[:space:]]*dot[[:space:]]*\))[[:space:]]*(com|net|org|io|co|ly|gl|cc|gov|edu)|[[:<:]]dot[[:space:]]+(com|net|org|io|co|ly|info|biz|xyz)|[[:<:]]([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+(com|net|org|edu|gov|io|co|us|uk|info|biz|me|ly|gl|cc|to|gd|be|at|ai|app|dev|xyz|site|online|link|click|legal|law|gy|tv)[[:>:]]'
$$;

create or replace function public.quarantine_linked_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.message_has_link(coalesce(new.sender_name, '') || E'\n' || coalesce(new.sender_phone, '') || E'\n' || coalesce(new.body, '')) then
    new.screen_status := 'quarantine';
    new.screen_source := 'precheck';
  end if;
  return new;
end;
$$;

drop trigger if exists quarantine_linked_message on public.attorney_messages;
create trigger quarantine_linked_message
before insert on public.attorney_messages
for each row execute function public.quarantine_linked_message();

notify pgrst, 'reload schema';
