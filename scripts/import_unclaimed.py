#!/usr/bin/env python3
"""Re-runnable import of scraped State Bar of California rows into unclaimed profiles.

Usage: python3 scripts/import_unclaimed.py [path/to/ca-admits-2024.csv]
Writes src/data/unclaimed-ca.json. Keyed (deduped) on bar_number, so re-running
upserts: existing attorneys keep the same slug/URL, new rows are added, nothing duplicates.
Only Active licenses with admit dates in 2024 or later are kept; non-Active entries are dropped. Languages, photos and ratings are never imported.
"""
import csv, json, re, sys, unicodedata
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else '/workspace/legalgrads/data/ca-admits-2024.csv')
OUT = ROOT / 'src/data/unclaimed-ca.json'
NA = {'', 'no information available', 'n/a', 'none'}

def clean(v):
    v = (v or '').strip()
    return '' if v.lower() in NA else v

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def titlecase(s):
    return ' '.join(w.capitalize() if w.isupper() or w.islower() else w for w in s.split())

existing = {p['barNumber']: p for p in json.loads(OUT.read_text())} if OUT.exists() else {}
rows = {}
inactive = set()  # bars seen non-Active (or otherwise excluded) in the current CSV
for r in csv.DictReader(SRC.open(newline='', encoding='utf-8')):
    bar = clean(r.get('bar_number'))
    name = clean(r.get('name'))
    try:
        d = datetime.strptime(clean(r.get('admit_date')), '%m/%d/%Y')
    except ValueError:
        continue
    if not bar.isdigit() or not name or d.year < 2024 or clean(r.get('status')) != 'Active':
        rows.pop(bar, None)
        inactive.add(bar)
        continue
    city = titlecase(clean(r.get('city')))
    school = clean(r.get('law_school')).split(';')[0].strip()
    try:
        verified = datetime.fromisoformat(clean(r.get('fetched_at'))).strftime('%b %-d, %Y')
    except ValueError:
        verified = ''
    zip5 = (re.match(r'\d{5}', clean(r.get('zip'))) or [''])[0]
    prev = existing.get(bar)
    rows[bar] = {
        'slug': prev['slug'] if prev else f"{slugify(name)}-{bar}",
        'state': 'ca', 'stateCode': 'CA', 'stateName': 'California',
        'city': prev['city'] if prev else (slugify(city) or 'california'),
        'cityName': city or 'California',
        'name': name, 'barNumber': bar,
        'admitted': d.strftime('%b %Y'), 'admittedYear': str(d.year),
        'status': clean(r.get('status')) or 'See State Bar',
        'discipline': 'See State Bar profile',
        'lawSchool': school or 'Not listed',
        'lastVerified': verified,
        'officeZip': zip5,
    }
# Keep previously imported attorneys even if a later CSV is partial.
for bar, p in existing.items():
    if p.get('status') == 'Active' and bar not in inactive:
        rows.setdefault(bar, p)
out = sorted(rows.values(), key=lambda p: int(p['barNumber']))
OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n')
print(f'{len(out)} unclaimed profiles ({len(out) - len(existing)} new) -> {OUT.relative_to(ROOT)}')
