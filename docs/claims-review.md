# Reviewing profile claims and edits

All steps run in the Supabase SQL editor for project qlhwojjdsonjxfeoiqww.

## What needs review

    select * from claim_review;

- `review_kind = 'claim'`: the claim is pending (email matched no official record) or was reported. Check `bar_number`, `attested_at`, `attest_ip`, `open_reports`, and the proof photos.
- `review_kind = 'edit'`: an approved claimant changed free text. Read `pending_bio` and `pending_services`.

## Proof photos

Photos live in the private `claim-proofs` bucket. To see them, call the review endpoint with the service role key. It returns every `claim_review` row plus `proof_card_url` and `proof_selfie_url`, signed for 10 minutes:

    curl -s -X POST https://qlhwojjdsonjxfeoiqww.supabase.co/functions/v1/claim-notify \
      -H "content-type: application/json" -H "authorization: Bearer $SERVICE_ROLE_KEY" -H "apikey: $SERVICE_ROLE_KEY" \
      -d '{"action":"review"}'

You can also open them in Dashboard > Storage > claim-proofs. A screenshot of the State Bar lookup page is not proof.

## Decide a claim

    select public.approve_claim('/attorneys/ca/city/slug/');
    select public.reject_claim('/attorneys/ca/city/slug/');

- Approve publishes the claim, publishes any pending bio and services text, resolves reports, and deletes the proof photos.
- Reject deletes the claim so the real owner can claim again, and deletes the proof photos.

## Decide a free text edit

    select public.approve_edit('/attorneys/ca/city/slug/');
    select public.reject_edit('/attorneys/ca/city/slug/');

Approve copies the pending text live. Reject discards it and the old text stays. Phone, contact link, practice areas, and photo save directly, as before.
