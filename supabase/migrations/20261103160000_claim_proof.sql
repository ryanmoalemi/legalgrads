-- Claim hardening: bar number check, attestation, proof uploads, and pending free text edits.

create extension if not exists pg_net with schema extensions;

alter table public.profile_owner_edits
  add column if not exists attested_at timestamptz,
  add column if not exists attest_ip text,
  add column if not exists proof_card_path text,
  add column if not exists proof_selfie_path text,
  add column if not exists proof_uploaded_at timestamptz,
  add column if not exists pending_bio text,
  add column if not exists pending_services text,
  add column if not exists edits_submitted_at timestamptz;

-- Private bucket. No storage policies, so only the service role can read or write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('claim-proofs', 'claim-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Files waiting to be removed from storage after a decision. The claim-notify purge action empties it.
create table if not exists public.claim_proof_deletions (
  object_path text primary key,
  queued_at timestamptz not null default now()
);
alter table public.claim_proof_deletions enable row level security;
revoke all on public.claim_proof_deletions from public, anon, authenticated;

drop view if exists public.claim_review;
create view public.claim_review
with (security_invoker = true) as
select
  e.profile_path,
  'https://legalgrads.com' || e.profile_path as profile_url,
  e.full_name,
  e.state_code,
  e.bar_number,
  e.email as claimed_email,
  e.method,
  e.approved,
  e.disputed,
  e.attested_at,
  e.attest_ip,
  e.proof_card_path,
  e.proof_selfie_path,
  e.proof_uploaded_at,
  e.pending_bio,
  e.pending_services,
  e.edits_submitted_at,
  case
    when e.approved = false or e.disputed then 'claim'
    else 'edit'
  end as review_kind,
  e.claimed_at,
  e.updated_at,
  (select count(*) from public.profile_claim_reports r where r.profile_path = e.profile_path and not r.resolved) as open_reports,
  (e.bio <> '' or e.services <> '' or e.phone <> '' or e.contact_link <> '' or e.photo_data_url <> '' or cardinality(e.practice_areas) > 0) as has_edits
from public.profile_owner_edits e
where e.approved = false or e.disputed = true or e.pending_bio is not null or e.pending_services is not null
order by e.updated_at desc;
revoke all on public.claim_review from public, anon, authenticated;
grant select on public.claim_review to service_role;

-- Asks claim-notify to delete queued proof files right away. Safe without a key: purge only deletes queued paths.
create or replace function public.claim_purge_proofs()
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url := 'https://qlhwojjdsonjxfeoiqww.supabase.co/functions/v1/claim-notify',
    body := '{"action":"purge"}'::jsonb,
    headers := '{"content-type":"application/json"}'::jsonb
  );
exception when others then
  null;
end;
$$;

create or replace function public.queue_claim_proofs(path text)
returns void language sql security definer set search_path = public as $$
  insert into public.claim_proof_deletions (object_path)
  select p from public.profile_owner_edits e,
    lateral unnest(array[e.proof_card_path, e.proof_selfie_path]) p
  where e.profile_path = path and p is not null
  on conflict do nothing;
  update public.profile_owner_edits set proof_card_path = null, proof_selfie_path = null where profile_path = path;
$$;

-- Approve a claim. Also publishes any pending bio or services text and deletes proof files.
create or replace function public.approve_claim(path text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.queue_claim_proofs(path);
  update public.profile_owner_edits
     set approved = true, approved_at = now(), disputed = false,
         bio = coalesce(pending_bio, bio), services = coalesce(pending_services, services),
         pending_bio = null, pending_services = null
   where profile_path = path;
  update public.profile_claim_reports set resolved = true where profile_path = path;
  perform public.claim_purge_proofs();
end;
$$;

-- Reject a claim. Removes it so the real owner can claim again, and deletes proof files.
create or replace function public.reject_claim(path text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.queue_claim_proofs(path);
  delete from public.profile_owner_edits where profile_path = path;
  update public.profile_claim_reports set resolved = true where profile_path = path;
  perform public.claim_purge_proofs();
end;
$$;

-- Publish pending bio and services text on an approved claim.
create or replace function public.approve_edit(path text)
returns void language sql security definer set search_path = public as $$
  update public.profile_owner_edits
     set bio = coalesce(pending_bio, bio), services = coalesce(pending_services, services),
         pending_bio = null, pending_services = null, updated_at = now()
   where profile_path = path;
$$;

-- Discard pending bio and services text. The live text stays as it was.
create or replace function public.reject_edit(path text)
returns void language sql security definer set search_path = public as $$
  update public.profile_owner_edits
     set pending_bio = null, pending_services = null, updated_at = now()
   where profile_path = path;
$$;

revoke all on function public.approve_claim(text), public.reject_claim(text), public.approve_edit(text), public.reject_edit(text),
  public.queue_claim_proofs(text), public.claim_purge_proofs() from public, anon, authenticated;
