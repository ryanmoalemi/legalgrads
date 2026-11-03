#!/usr/bin/env python3
"""Add directory profiles from the national NDJSON export.

Reads data-import/directory-profiles-2026-11-02.ndjson.gz and upserts on
(stateCode, barNumber). Existing California profiles in src/data/unclaimed-ca.json
are left byte-for-byte alone (URL, fields, lastVerified). New rows are written to
src/data/unclaimed-added.json. public/data/unclaimed-directory.json is rebuilt
from the existing pages plus the additions.

barNumber stays text, including leading zeros. A year-only admission never gets
a manufactured day. A ZIP is stored only when it is 5 digits or ZIP+4.
"""
import gzip
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NDJSON = ROOT / "data-import" / "directory-profiles-2026-11-02.ndjson.gz"
EXISTING = ROOT / "src" / "data" / "unclaimed-ca.json"
ADDED = ROOT / "src" / "data" / "unclaimed-added.json"
DIRECTORY = ROOT / "public" / "data" / "unclaimed-directory.json"
FULL_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ZIP5 = re.compile(r"^(\d{5})(?:-\d{4})?$")


def plain(value):
    if not isinstance(value, str):
        return value
    return value.replace("\u2014", " - ").replace("\u2013", " - ")


def zip5(value):
    if not isinstance(value, str):
        return ""
    match = ZIP5.match(value.strip())
    return match.group(1) if match else ""


def profile_from_row(row):
    parts = row["profilePath"].strip("/").split("/")
    if len(parts) != 4 or parts[0] != "attorneys":
        raise SystemExit(f"Bad profilePath for {row.get('stateCode')} {row.get('barNumber')}")
    state, city, slug = parts[1], parts[2], parts[3]
    if state != row["state"] or city != row["city"] or slug != row["slug"]:
        raise SystemExit(f"profilePath does not match fields for {row['stateCode']} {row['barNumber']}")
    bar = row["barNumber"]
    if not isinstance(bar, str) or not bar:
        raise SystemExit(f"barNumber must stay text: {row['stateCode']} {bar!r}")
    admitted = plain(row.get("admitted") or "")
    year = str(row.get("admittedYear") or "")
    raw_date = row.get("admissionDate") or ""
    if isinstance(raw_date, str) and FULL_DATE.match(raw_date) and not (len(admitted) == 4 and admitted.isdigit()):
        admission_date = raw_date
    else:
        admission_date = ""
        if raw_date and len(admitted) == 4 and admitted.isdigit():
            raise SystemExit(f"Year-only row also had a day: {row['stateCode']} {bar}")
    city_name = plain(row.get("cityName") or "")
    if city == "office-unlisted":
        city_name = city_name or "Office unlisted"
    law = plain(row.get("lawSchool") or "").strip()
    profile = {
        "slug": slug,
        "state": state,
        "stateCode": row["stateCode"],
        "stateName": row["stateName"],
        "city": city,
        "cityName": city_name,
        "name": plain(row["name"]),
        "barNumber": bar,
        "admitted": admitted,
        "admittedYear": year,
        "status": plain(row.get("status") or ""),
        "discipline": plain(row.get("discipline") or ""),
        "lawSchool": law or "Not listed",
        "lastVerified": plain(row.get("lastVerified") or ""),
        "recordLinkType": row["recordLinkType"],
        "sourceAuthority": plain(row.get("sourceAuthority") or ""),
        "sourceUrl": row.get("sourceUrl") or "",
        "officialLookupUrl": row.get("officialLookupUrl") or "",
    }
    if admission_date:
        profile["admissionDate"] = admission_date
    z = zip5(row.get("officeZip") or "")
    if z:
        profile["officeZip"] = z
    registry = row.get("registryRecordUrl") or ""
    if registry:
        profile["registryRecordUrl"] = registry
    label = plain(row.get("locationLabel") or "")
    if city == "office-unlisted":
        profile["locationLabel"] = label or "Office unlisted"
    elif label:
        profile["locationLabel"] = label
    office_state = row.get("officeState") or ""
    if office_state:
        profile["officeState"] = office_state
    link = profile["recordLinkType"]
    if link in ("individual_official_profile", "individual_official_data_record") and not registry:
        raise SystemExit(f"Individual record missing registryRecordUrl: {row['stateCode']} {bar}")
    if link == "shared_official_roster_page" and not (profile["sourceUrl"] or profile["officialLookupUrl"]):
        raise SystemExit(f"Shared roster missing source link: {row['stateCode']} {bar}")
    if "\u2014" in json.dumps(profile, ensure_ascii=False) or "\u2013" in json.dumps(profile, ensure_ascii=False):
        raise SystemExit(f"Dash left in profile {row['stateCode']} {bar}")
    return profile


def directory_row(profile):
    return {
        "id": profile["barNumber"],
        "n": profile["name"],
        "c": profile["cityName"],
        "z": profile.get("officeZip") or "",
        "a": profile.get("admissionDate") or profile.get("admittedYear") or "",
        "u": f"/attorneys/{profile['state']}/{profile['city']}/{profile['slug']}/",
        "s": profile["stateCode"],
    }


def main():
    existing = json.loads(EXISTING.read_text(encoding="utf-8"))
    existing_keys = {(p["stateCode"], p["barNumber"]) for p in existing}
    if len(existing_keys) != len(existing):
        raise SystemExit("Existing California file has duplicate bar numbers")
    added = []
    seen = set(existing_keys)
    per_state_new = {}
    skipped_existing = 0
    with gzip.open(NDJSON, "rt", encoding="utf-8") as handle:
        for line in handle:
            row = json.loads(line)
            if row.get("directoryInclude") != 1:
                continue
            key = (row["stateCode"], row["barNumber"])
            if key in existing_keys:
                skipped_existing += 1
                continue
            if key in seen:
                raise SystemExit(f"Duplicate new key {key}")
            seen.add(key)
            profile = profile_from_row(row)
            added.append(profile)
            per_state_new[profile["stateCode"]] = per_state_new.get(profile["stateCode"], 0) + 1
    added.sort(key=lambda p: (p["stateCode"], p["barNumber"]))
    paths = {f"/attorneys/{p['state']}/{p['city']}/{p['slug']}/" for p in existing}
    for profile in added:
        path = f"/attorneys/{profile['state']}/{profile['city']}/{profile['slug']}/"
        if path in paths:
            raise SystemExit(f"URL collision {path}")
        paths.add(path)
    ADDED.write_text(json.dumps(added, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    directory = [directory_row(p) for p in existing]
    directory.extend(directory_row(p) for p in added)
    directory.sort(key=lambda row: (row["s"], row["id"]))
    DIRECTORY.write_text(json.dumps(directory, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
    totals = {}
    for profile in existing:
        totals[profile["stateCode"]] = totals.get(profile["stateCode"], 0) + 1
    for profile in added:
        totals[profile["stateCode"]] = totals.get(profile["stateCode"], 0) + 1
    print(f"existing kept {len(existing)}")
    print(f"skipped already published {skipped_existing}")
    print(f"added {len(added)}")
    print("new by state " + json.dumps(per_state_new, sort_keys=True))
    print("total by state " + json.dumps(totals, sort_keys=True))
    print(f"directory rows {len(directory)}")
    print(f"profile urls {len(paths)}")


if __name__ == "__main__":
    main()
