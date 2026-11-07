# Opt out a public attorney profile

The site builds attorney pages from roster files. To keep a person off the public site, add them to `src/data/suppressed-profiles.json`. Importers, page builds, sitemaps, the find-lawyer file, bar lookup, claim loading, and IndexNow URL lists all skip that file.

```json
{
  "keys": ["ny-6118061"],
  "names": ["joy anna fuller"],
  "emails": ["joyannaaa@gmail.com"]
}
```

Add one string:

- `keys`: lowercase state, a hyphen, and the bar number, such as `md-1234567`. The bar is the text after the first hyphen.
- `names`: lowercase name words, such as `joy anna fuller`. Punctuation, Jr, Sr, and Esq are ignored. Word order does not matter, so `Fuller, Joy Anna` matches. A shorter or longer name does not, so `Joy Fuller` stays published.
- `emails`: a lowercase address. Any roster row, claim, or application that carries that address is skipped.

CI fails if a suppressed key, name, or email shows up in the roster data files or in the built HTML, XML, and JSON.

Claim requests for a suppressed path, name, or email are rejected in `supabase/functions/claim-notify`. Redeploy that function after a list change. The database block is the migration below. Paste the new function into the Supabase SQL editor when you add someone, because the website cannot edit private tables by itself.

There is no RSS or Atom feed. Near-me sorting and the post-bar tracker do not have their own attorney roster. They only show people who remain in the profile data.

## Database

The public site cannot read unpublished applications or claim rows. Paste `supabase/migrations/20261107193000_suppressed_attorneys.sql` into the Supabase SQL editor once. That file deletes matching rows if they exist, then rejects later inserts for this name, this email, and NY bar 6118061.

To see rows before that, run:

```sql
select 'attorney_profiles' as source, id::text, full_name, bar_number, coalesce(licensed_state, '')
from public.attorney_profiles
where bar_number = '6118061'
   or lower(full_name) like '%joy%fuller%'
   or lower(coalesce(email, '')) = 'joyannaaa@gmail.com'
union all
select 'attorney_applications', id::text, full_name, bar_number, coalesce(licensed_state, '')
from public.attorney_applications
where bar_number = '6118061'
   or lower(full_name) like '%joy%fuller%'
   or lower(email) = 'joyannaaa@gmail.com';
```
