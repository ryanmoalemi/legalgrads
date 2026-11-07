#!/usr/bin/env python3
"""Prove directory import creates no duplicate profiles when run twice."""
import importlib.util
import json
import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "import_directory_profiles", ROOT / "scripts" / "import_directory_profiles.py"
)
IMP = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMP)


def fail(message):
    raise SystemExit(message)


def test_second_run_matches_and_adds_nothing():
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        ca = work / "unclaimed-ca.json"
        added = work / "unclaimed-added.json"
        directory = work / "directory.json"
        shutil.copy(ROOT / "src/data/unclaimed-ca.json", ca)
        shutil.copy(ROOT / "src/data/unclaimed-added.json", added)
        before = ca.read_text(encoding="utf-8")
        IMP.run(ca_path=ca, added_path=added, directory_path=directory, report_path=None)
        if ca.read_text(encoding="utf-8") != before:
            fail("First import rewrote the California profile file")
        first_added = added.read_bytes()
        first_directory = directory.read_bytes()
        profiles = json.loads(first_added)
        keys = [(p["stateCode"], p["barNumber"]) for p in profiles]
        if len(keys) != len(set(keys)):
            fail("First import wrote duplicate keys")
        if any(not isinstance(p["barNumber"], str) for p in profiles):
            fail("barNumber was not kept as text")
        stats = IMP.run(ca_path=ca, added_path=added, directory_path=directory, report_path=None)
        if added.read_bytes() != first_added or directory.read_bytes() != first_directory:
            fail("Second import changed output")
        if ca.read_text(encoding="utf-8") != before:
            fail("Second import rewrote the California profile file")
        new = sum(item["new"] for item in stats.values())
        if new != 0:
            fail(f"Second import created {new} profiles")
        again = json.loads(added.read_text(encoding="utf-8"))
        if len(again) != len(profiles):
            fail("Second import changed the profile count")


def test_claimed_profile_is_kept_and_not_duplicated():
    claimed = {
        "slug": "owner-0001111",
        "state": "ny",
        "stateCode": "NY",
        "stateName": "New York",
        "city": "albany",
        "cityName": "Albany",
        "name": "Owner Edited",
        "barNumber": "0001111",
        "admitted": "2024",
        "admittedYear": "2024",
        "status": "Currently registered",
        "discipline": "Check NY Courts attorney search",
        "lawSchool": "Old School",
        "lastVerified": "Nov 1, 2026",
        "recordLinkType": "individual_official_data_record",
        "sourceAuthority": "New York State Unified Court System",
        "sourceUrl": "https://example.test/old",
        "officialLookupUrl": "https://example.test/lookup",
        "registryRecordUrl": "https://example.test/old",
        "claimed": {"bio": "Owner bio", "services": "Contract review"},
        "ownerEdited": True,
    }
    row = {
        "state": "ny", "stateCode": "NY", "stateName": "New York", "barNumber": "0001111",
        "name": "Changed Name", "slug": "changed-name-0001111", "city": "buffalo", "cityName": "Buffalo",
        "admitted": "2024", "admittedYear": "2024", "status": "Currently registered",
        "discipline": "Check NY Courts attorney search", "lawSchool": "New School",
        "lastVerified": "Nov 3, 2026", "sourceAuthority": "New York State Unified Court System",
        "officialLookupUrl": "https://example.test/lookup", "sourceUrl": "https://example.test/new",
        "recordLinkType": "individual_official_data_record",
        "profilePath": "/attorneys/ny/buffalo/changed-name-0001111/",
        "registryRecordUrl": "https://example.test/new", "directoryInclude": 1,
        "siteRelation": "test", "cohortSource": "test", "sourceAsOf": "2026-11-03", "claimStatus": "unclaimed",
    }
    _, added, stats = IMP.import_profiles([], [claimed], [row])
    if len(added) != 1:
        fail(f"Claimed import returned {len(added)} profiles")
    if added[0]["name"] != "Owner Edited" or added[0]["slug"] != "owner-0001111":
        fail("Claimed profile URL or name was replaced")
    if added[0]["claimed"]["bio"] != "Owner bio" or added[0]["claimed"].get("services") != "Contract review":
        fail("Owner edit was overwritten")
    if stats["NY"]["new"] != 0:
        fail("Claimed profile was inserted again")
    _, second, stats2 = IMP.import_profiles([], added, [row])
    if second != added or stats2["NY"]["new"] != 0:
        fail("Second claimed import was not idempotent")


def test_suppressed_profile_is_not_recreated():
    from suppression import is_suppressed, load_suppressed
    keys = load_suppressed()
    if "ny-6118061" not in keys:
        fail("ny-6118061 is missing from the suppression list")
    for rel in ("src/data/unclaimed-ca.json", "src/data/unclaimed-added.json", "public/data/unclaimed-directory.json"):
        rows = json.loads((ROOT / rel).read_text(encoding="utf-8"))
        bad = [row for row in rows if is_suppressed(row, keys)]
        if bad:
            fail(f"{rel} still publishes {len(bad)} suppressed profiles")
    added_rows = json.loads((ROOT / "src/data/unclaimed-added.json").read_text(encoding="utf-8"))
    dudley = [row for row in added_rows if row.get("stateCode") == "NY" and row.get("barNumber") == "6079453"]
    if len(dudley) != 1 or dudley[0].get("name") != "Dudley Maseko" or dudley[0].get("city") != "north-bethesda-md":
        fail("North Bethesda neighbor profile changed")
    row = {
        "state": "ny", "stateCode": "NY", "stateName": "New York", "barNumber": "6118061",
        "name": "Suppressed Roster Row", "slug": "suppressed-roster-row-6118061",
        "city": "north-bethesda-md", "cityName": "North Bethesda",
        "admitted": "2024", "admittedYear": "2024", "status": "Currently registered",
        "discipline": "Check NY Courts attorney search", "lawSchool": "Example School of Law",
        "lastVerified": "Nov 1, 2026", "sourceAuthority": "New York State Unified Court System",
        "officialLookupUrl": "https://example.test/lookup", "sourceUrl": "https://example.test/new",
        "recordLinkType": "individual_official_data_record",
        "profilePath": "/attorneys/ny/north-bethesda-md/suppressed-roster-row-6118061/",
        "registryRecordUrl": "https://example.test/new", "directoryInclude": 1,
    }
    existing = {
        "slug": "suppressed-roster-row-6118061", "state": "ny", "stateCode": "NY", "stateName": "New York",
        "city": "north-bethesda-md", "cityName": "North Bethesda", "name": "Suppressed Roster Row",
        "barNumber": "6118061", "admitted": "2024", "admittedYear": "2024", "status": "Currently registered",
        "discipline": "Check NY Courts attorney search", "lawSchool": "Example School of Law",
        "lastVerified": "Nov 1, 2026",
    }
    _, added, stats = IMP.import_profiles([], [existing], [row])
    if any(profile.get("barNumber") == "6118061" for profile in added):
        fail("suppressed profile stayed in the import output")
    if stats.get("NY", {}).get("new"):
        fail("suppressed profile was counted as new")
    _, again, stats2 = IMP.import_profiles([], [], [row])
    if again or stats2.get("NY", {}).get("new"):
        fail("suppressed profile was created from a roster row")
    ca_kept, _, _ = IMP.import_profiles([{"stateCode": "CA", "barNumber": "354200", "state": "ca", "city": "san-diego", "slug": "kept"}], [], [])
    if len(ca_kept) != 1 or ca_kept[0]["barNumber"] != "354200":
        fail("suppression filter dropped a California profile that is not on the list")


if __name__ == "__main__":
    test_suppressed_profile_is_not_recreated()
    test_claimed_profile_is_kept_and_not_duplicated()
    test_second_run_matches_and_adds_nothing()
    print("idempotency ok")
