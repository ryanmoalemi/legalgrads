#!/usr/bin/env python3
"""Upsert one Florida Bar JSON batch through import_directory_profiles.

Keyed on (stateCode, barNumber) as text, including leading zeros. Existing
URLs, claimed profiles, and owner edits stay. California files are not
rewritten. Louisiana bar numbers are refused. Admission dates before 2024
are held: live state pages say those attorneys were admitted in 2024 or later.

The page template is filled from these fields only. Work email, phone, and
firm name are not written into the public profile files. A trailing law-school
year is removed so a graduation year is not stored beside the admission date.
The admission value is the Florida Bar date, labeled Admitted on the page.

Usage:
  python3 scripts/import_fl_batch.py path/to/batch.json
  python3 scripts/import_fl_batch.py path/to/batch.json --apply
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

import import_directory_profiles as imp

ROOT = Path(__file__).resolve().parent.parent
CA_PATH = ROOT / "src/data/unclaimed-ca.json"
ADDED_PATH = ROOT / "src/data/unclaimed-added.json"
DIRECTORY_PATH = ROOT / "public/data/unclaimed-directory.json"
LOOKUP = "https://www.floridabar.org/directories/find-mbr/"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
SCOPE_START = datetime(2024, 1, 1)
SCHOOL_YEAR = re.compile(r",\s*\d{4}$")


def school_name(value):
    text = (value or "").strip() or "Not listed"
    return SCHOOL_YEAR.sub("", text).strip() or "Not listed"


def classify(batch):
    """Split a batch into pipeline rows and held records. Does not write."""
    rows = []
    held = []
    seen = set()
    for record in batch:
        bar = record.get("barNumber")
        state = record.get("stateCode")
        reasons = []
        if state == "LA":
            reasons.append("Louisiana bar numbers stay held")
        elif state != "FL":
            reasons.append(f"state {state} is outside this Florida batch")
        if not isinstance(bar, str) or not bar:
            reasons.append("barNumber must stay a non-empty string")
        elif state == "FL" and (state, bar) in seen:
            reasons.append("duplicate stateCode+barNumber in batch")
        admitted_raw = record.get("admitted") or ""
        try:
            admitted_on = datetime.strptime(admitted_raw, "%m/%d/%Y")
        except ValueError:
            admitted_on = None
            reasons.append("admission date must be MM/DD/YYYY")
        if admitted_on and admitted_on < SCOPE_START:
            reasons.append("admission before 2024; live hubs say admitted in 2024 or later")
        if record.get("status") != "Member in Good Standing":
            reasons.append("status is not Member in Good Standing")
        if record.get("eligibility") != "Eligible to Practice Law in Florida":
            reasons.append("eligibility is not Eligible to Practice Law in Florida")
        profile_url = record.get("officialLookupUrl") or ""
        if not isinstance(bar, str) or not bar or f"num={bar}" not in profile_url:
            reasons.append("official profile URL does not match this bar number")
        if reasons:
            held.append({
                "stateCode": state,
                "barNumber": bar if isinstance(bar, str) else None,
                "name": record.get("name") or "",
                "admitted": admitted_raw,
                "reasons": reasons,
            })
            continue
        seen.add((state, bar))
        slug = record["slug"]
        city = record["city"]
        state_slug = record["state"]
        rows.append({
            "state": state_slug,
            "stateCode": state,
            "stateName": record["stateName"],
            "barNumber": bar,
            "name": record["name"],
            "slug": slug,
            "city": city,
            "cityName": record["cityName"],
            "admitted": f"{MONTHS[admitted_on.month - 1]} {admitted_on.year}",
            "admittedYear": str(admitted_on.year),
            "admissionDate": admitted_on.strftime("%Y-%m-%d"),
            "status": record["status"],
            "discipline": "Check official licensing authority",
            "lawSchool": school_name(record.get("lawSchool")),
            "lastVerified": "Nov 6, 2026",
            "officeState": record.get("officeState") or "",
            "locationLabel": record.get("locationLabel") or "",
            "sourceAuthority": record.get("sourceAuthority") or "The Florida Bar",
            "sourceAsOf": "2026-11-06",
            "registryRecordUrl": profile_url,
            "officialLookupUrl": LOOKUP,
            "sourceUrl": profile_url,
            "recordLinkType": "individual_official_profile",
            "profilePath": f"/attorneys/{state_slug}/{city}/{slug}/",
            "claimStatus": "unclaimed",
            "directoryInclude": 1,
        })
    return rows, held


def summarize(rows, held, existing_ca, existing_added, ca_profiles, added_profiles, stats):
    keys = [(p["stateCode"], p["barNumber"]) for p in ca_profiles + added_profiles]
    if len(keys) != len(set(keys)):
        raise SystemExit("Import produced duplicate stateCode+barNumber keys")
    touched = {state: item for state, item in stats.items() if item["new"] or item["updated"]}
    if set(touched) - {"FL"}:
        raise SystemExit(f"Import touched a state other than Florida: {sorted(touched)}")
    existing_keys = {(p["stateCode"], p["barNumber"]) for p in existing_ca + existing_added}
    created = [p for p in added_profiles if (p["stateCode"], p["barNumber"]) not in existing_keys]
    if any(p["stateCode"] in ("CA", "LA") or p["state"] in ("ca", "la") for p in created):
        raise SystemExit("Import created a California or Louisiana profile")
    sample = next((p for p in created if p["barNumber"] == "1081210"), None)
    if created and sample is None:
        sample = created[0]
    fl = stats.get("FL", {"new": 0, "updated": 0, "unchanged": 0, "held": 0})
    return {
        "new": fl["new"],
        "updated": fl["updated"],
        "unchanged": fl["unchanged"],
        "held": len(held),
        "batchRows": len(rows) + len(held),
        "publishing": len(rows),
        "otherStatesNewOrUpdated": {state: item for state, item in touched.items() if state != "FL"},
        "heldRecords": held,
        "sample": sample,
    }


def main():
    apply = "--apply" in sys.argv
    args = [arg for arg in sys.argv[1:] if arg != "--apply"]
    if len(args) != 1:
        raise SystemExit("Usage: import_fl_batch.py batch.json [--apply]")
    batch = json.loads(Path(args[0]).read_text(encoding="utf-8"))
    if not isinstance(batch, list):
        raise SystemExit("Batch must be a JSON array")
    rows, held = classify(batch)
    ca_text = CA_PATH.read_text(encoding="utf-8")
    existing_ca = json.loads(ca_text)
    existing_added = json.loads(ADDED_PATH.read_text(encoding="utf-8"))
    ca_profiles, added_profiles, stats = imp.import_profiles(existing_ca, existing_added, rows)
    report = summarize(rows, held, existing_ca, existing_added, ca_profiles, added_profiles, stats)
    if apply:
        imp.write_outputs(ca_profiles, added_profiles, CA_PATH, ADDED_PATH, DIRECTORY_PATH)
        if CA_PATH.read_text(encoding="utf-8") != ca_text:
            CA_PATH.write_text(ca_text, encoding="utf-8")
            raise SystemExit("California source file changed during import")
        written_added = ADDED_PATH.read_bytes()
        written_directory = DIRECTORY_PATH.read_bytes()
        again_added = json.loads(written_added)
        ca_again, added_again, stats_again = imp.import_profiles(existing_ca, again_added, rows)
        if sum(item["new"] for item in stats_again.values()) != 0 or added_again != again_added:
            raise SystemExit("Second import was not a no-op")
        imp.write_outputs(ca_again, added_again, CA_PATH, ADDED_PATH, DIRECTORY_PATH)
        if ADDED_PATH.read_bytes() != written_added or DIRECTORY_PATH.read_bytes() != written_directory:
            raise SystemExit("Re-writing the import changed output")
        if CA_PATH.read_text(encoding="utf-8") != ca_text:
            raise SystemExit("California source file changed during import")
        report["applied"] = True
    else:
        report["applied"] = False
    print(json.dumps(report, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
