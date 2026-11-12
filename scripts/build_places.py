#!/usr/bin/env python3
"""Normalize office places for directory grouping. Writes src/data/place-index.json.

The source fields on every record (cityName, officeZip, officeState, locationLabel) are never
changed and profile URLs never move. This file only decides which directory group (hub) a record
belongs to and how that place is labeled:

- Spelling variants merge into a canonical city only with address evidence: the record's ZIP must
  already be used by at least two records of the canonical city in the same state or region.
- A city field holding only a state code (and maybe a ZIP), such as "Ca 91505", takes the city that
  ZIP is published with in the rosters, when at least 3 records agree at 80% or more. Anything else
  that is not a place name goes to the unknown-location group.
- The office state comes from the record's own officeState or ZIP. It is never guessed from a city name.
- A rare city name whose ZIP clearly belongs to another city (Denver with a Los Angeles ZIP) cannot
  be confirmed and goes to the unknown-location group.
- Every state gets one unknown-location group.

Output only lists records whose group or label differs from the source, keyed "state|barNumber":
  [hub slug, place name, office region ("" when it is the licensing state), kind]
kind: L in state, O outside the licensing state, U unknown location.
"""
import collections
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from places import city_unknown, display_city, fix_mc, present_profile, slugify_place, zip_region  # noqa: E402
from suppression import is_suppressed  # noqa: E402

ROOT = HERE.parent
REAL_ZIPS = set(json.loads((ROOT / "public/data/zip-centroids.json").read_text(encoding="utf-8")))
OUT = ROOT / "src/data/place-index.json"
US_CODES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
    "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
    "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR", "VI", "GU",
}
# Borough names published with a New York City ZIP are consistent addresses, not conflicts.
NYC_BOROUGHS = {("NY", "manhattan"), ("NY", "brooklyn"), ("NY", "bronx"), ("NY", "queens"), ("NY", "staten island")}
STATE_ZIP_ONLY = re.compile(r"^([A-Za-z]{2})(?:\s+(\d{5})(?:-\d{4})?)?$")


def tidy_case(name):
    """ALL CAPS or all lowercase roster cities read as title case. Mixed case is left as published."""
    if name and (name.isupper() or name.islower()):
        return " ".join(fix_mc(part) for part in name.title().split(" "))
    return name


def place_name(p):
    return tidy_case(display_city(p["cityName"]))


def unknown_place(p):
    """city_unknown(), judging U.S. rows in the international group by their city name."""
    if us_international(p):
        return city_unknown({**p, "city": slugify_place(p.get("cityName") or "") or "office-unlisted"})
    return city_unknown(p)


def lev(a, b):
    if abs(len(a) - len(b)) > 2:
        return 3
    row = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, row[0] = row[0], i
        for j, cb in enumerate(b, 1):
            prev, row[j] = row[j], min(row[j] + 1, row[j - 1] + 1, prev + (ca != cb))
    return row[-1]


def load():
    rows = []
    for name in ("unclaimed-ca.json", "unclaimed-added.json"):
        for raw in json.loads((ROOT / "src/data" / name).read_text(encoding="utf-8")):
            if is_suppressed(raw):
                continue
            profile, _ = present_profile(dict(raw))
            rows.append(profile)
    return rows


def us_international(p):
    """International-group rows whose label names a U.S. office keep their U.S. place."""
    return p["city"] == "international-offices" and (p.get("officeState") or "") in US_CODES and "United States" in (p.get("locationLabel") or "")


def office_region(p):
    state = (p.get("officeState") or "").upper()
    if state in US_CODES:
        return state
    return zip_region(p.get("officeZip") or "") or p["stateCode"]


def build(rows):
    # Canonical unknown group per state: the existing unknown slug that holds the most records.
    unknown_counts = collections.defaultdict(collections.Counter)
    for p in rows:
        if p["city"] != "international-offices" and unknown_place(p):
            unknown_counts[p["state"]][p["city"]] += 1
    unknown_slug = {state: c.most_common(1)[0][0] for state, c in unknown_counts.items()}

    # Name statistics by office region, from records that publish a ZIP.
    name_count = collections.Counter()
    name_zips = collections.defaultdict(collections.Counter)
    zip_names = collections.defaultdict(collections.Counter)
    for p in rows:
        if p["city"] == "international-offices" and not us_international(p):
            continue
        if unknown_place(p):
            continue
        name = place_name(p)
        region = office_region(p)
        name_count[(region, name)] += 1
        z = (p.get("officeZip") or "")[:5]
        if re.fullmatch(r"\d{5}", z):
            name_zips[(region, name)][z] += 1
            zip_names[z][name] += 1
    names_by_region = collections.defaultdict(list)
    for (region, name), n in name_count.items():
        names_by_region[region].append((n, name))

    def canonical(region, name, z):
        """A bigger same-region name within two edits that already uses this ZIP."""
        if len(name) < 5 or not z:
            return None
        mine = name_count[(region, name)]
        best = None
        for n, other in names_by_region[region]:
            if other == name or n < 5 or n < 3 * mine:
                continue
            if lev(name.lower(), other.lower()) > 2:
                continue
            if name_zips[(region, other)][z] >= 2 and (best is None or n > best[0]):
                best = (n, other)
        return best[1] if best else None

    def conflicting(region, name, z):
        """The record's ZIP does not support its city name, so the office cannot be confirmed:
        - a name that is rare here but common in another state, at a ZIP that does not exist or that
          clearly belongs to a different city (Houston with a Palo Alto ZIP), or
        - a misspelling of a big city, at a ZIP that clearly belongs to a different city
          (Los Angles with a San Diego ZIP)."""
        if not z or (region, name.lower()) in NYC_BOROUGHS:
            return False
        here = name_count[(region, name)]
        dominant = from_zip(z)
        elsewhere = max([n for (r2, other), n in name_count.items() if other == name and r2 != region] or [0])
        if here <= 2 and elsewhere >= 5 and (z not in REAL_ZIPS or (dominant and dominant.lower() != name.lower())):
            return True
        if not dominant or dominant.lower() == name.lower() or here >= 5:
            return False
        return any(n >= 5 and 0 < lev(name.lower(), other.lower()) <= 2 for n, other in names_by_region[region])

    def from_zip(z):
        names = zip_names.get(z)
        if not names:
            return None
        name, n = names.most_common(1)[0]
        total = sum(names.values())
        return name if n >= 3 and n / total >= 0.8 else None

    index = {}
    stats = collections.Counter()
    for p in rows:
        key = f"{p['state']}|{p['barNumber']}"
        z = (p.get("officeZip") or "")[:5]
        z = z if re.fullmatch(r"\d{5}", z) else ""
        if p["city"] == "international-offices" and not us_international(p):
            continue
        unknown_hub = unknown_slug.get(p["state"], "office-unlisted")
        if unknown_place(p):
            if p["city"] != unknown_hub:
                index[key] = [unknown_hub, "Office location not listed", "", "U"]
                stats["unknown merged"] += 1
            continue
        raw = display_city(p["cityName"])
        name = place_name(p)
        junk = STATE_ZIP_ONLY.match(raw.strip())
        if junk and junk.group(1).upper() in US_CODES:
            name = from_zip(z) if z else None
            stats["state-code city fixed" if name else "state-code city to unknown"] += 1
        elif re.search(r"\d", raw):
            name = None
            stats["malformed city to unknown"] += 1
        if not name:
            index[key] = [unknown_hub, "Office location not listed", "", "U"]
            continue
        region = office_region(p)
        alias = canonical(region, name, z)
        if alias:
            stats["spelling merged"] += 1
            name = alias
        elif conflicting(region, name, z):
            stats["address conflict to unknown"] += 1
            index[key] = [unknown_hub, "Office location not listed", "", "U"]
            continue
        if region == p["stateCode"]:
            hub = slugify_place(name)
            if name == raw and p["city"] != "international-offices":
                continue  # unchanged
            index[key] = [hub, name, "", "L"]
            stats["moved in state"] += 0 if alias or junk else 1
            continue
        hub = f"{slugify_place(name)}-{region.lower()}"
        if hub == p["city"] and name == raw:
            continue
        index[key] = [hub, name, region, "O"]
        stats["outside state regrouped"] += 1
    return index, stats


def main():
    rows = load()
    index, stats = build(rows)
    OUT.write_text(json.dumps(index, separators=(",", ":"), sort_keys=True) + "\n", encoding="utf-8")
    print("place index", len(index), "records;", ", ".join(f"{k} {v}" for k, v in sorted(stats.items())))


if __name__ == "__main__":
    main()
