-- Paste this once after supabase/migrations/20261022013000_private_messages.sql.
-- Spam stays in screen_status = 'quarantine' and is not forwarded.
-- Public inserts cannot choose a status. The relay function sets it with the service role.

alter table public.attorney_messages
  add column if not exists screen_status text not null default 'not_screened';

alter table public.attorney_messages
  add column if not exists screen_source text;

alter table public.attorney_messages drop constraint if exists attorney_messages_screen_status_check;
alter table public.attorney_messages add constraint attorney_messages_screen_status_check
  check (screen_status in ('quarantine', 'genuine', 'uncertain', 'not_screened'));

alter table public.attorney_messages drop constraint if exists attorney_messages_screen_source_check;
alter table public.attorney_messages add constraint attorney_messages_screen_source_check
  check (screen_source is null or screen_source in ('precheck', 'classifier', 'ai_error'));

create index if not exists attorney_messages_screen_idx
  on public.attorney_messages (screen_status, created_at desc);

drop policy if exists "public inserts attorney messages" on public.attorney_messages;
create policy "public inserts attorney messages"
on public.attorney_messages
for insert
to anon, authenticated
with check (
  honeypot = ''
  and consent_at is not null
  and char_length(body) between 10 and 2000
  and screen_status = 'not_screened'
  and screen_source is null
  and exists (
    select 1 from public.attorney_profiles p
    where p.id = profile_id and p.published = true
  )
);

notify pgrst, 'reload schema';
