#!/usr/bin/env python3
"""Dry run or apply NY changes from the data.ny.gov eqw2-r5nb CSV export.

Keyed on (stateCode, barNumber) as text. Status is always taken from the
source CSV row exactly. Only active registrations (Currently registered, Due to
reregister) become new profiles; inactive rows are reported as skipped.
Claimed or owner-edited profiles and all existing URLs are left untouched.
Re-running after apply finds zero changes.
Usage: ny_roster_sync.py CSV [--apply] [--verified "Nov 4, 2026"]
"""
import csv, json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ADDED = ROOT / "src/data/unclaimed-added.json"
DIRECTORY = ROOT / "public/data/unclaimed-directory.json"
ACTIVE = {"Currently registered", "Due to reregister within 30 days of birthday"}
API = "https://data.ny.gov/resource/eqw2-r5nb.json?registration_number="


def slugify(v):
    t = unicodedata.normalize("NFKD", v).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


def title(v):
    return " ".join(w.capitalize() for w in v.split())


def build(r, verified):
    bar = r["registration_number"]
    name = " ".join(title(x) for x in (r["first_name"], r["middle_name"], r["last_name"], r["suffix"]) if x)
    p = {"slug": f"{slugify(name)}-{bar}", "state": "ny", "stateCode": "NY", "stateName": "New York"}
    if r["city"] and r["state"]:
        city = title(r["city"])
        p.update(city=slugify(city) if r["state"] == "NY" else f"{slugify(city)}-{r['state'].lower()}", cityName=city)
    else:
        p.update(city="location-not-listed", cityName="Office city not listed")
    p.update(name=name, barNumber=bar, admitted=r["year_admitted"], admittedYear=r["year_admitted"],
             status=r["status"], discipline="Check NY Courts attorney search",
             lawSchool=r["law_school"] or "Not listed", lastVerified=verified,
             recordLinkType="individual_official_data_record",
             sourceAuthority="New York State Unified Court System", sourceUrl=API + bar,
             officialLookupUrl="https://iapps.courts.state.ny.us/attorneyservices/search")
    if re.fullmatch(r"\d{5}", r["zip"] or ""):
        p["officeZip"] = r["zip"]
    p["registryRecordUrl"] = API + bar
    if r["city"] and r["state"]:
        p["locationLabel"] = f"{p['cityName']}, {r['state']}"
        p["officeState"] = r["state"]
    else:
        p["locationLabel"] = "Office location not listed"
    return p


def main():
    src = sys.argv[1]
    apply = "--apply" in sys.argv
    verified = sys.argv[sys.argv.index("--verified") + 1] if "--verified" in sys.argv else ""
    added = json.loads(ADDED.read_text(encoding="utf-8"))
    idx = {(p["stateCode"], p["barNumber"]): i for i, p in enumerate(added)}
    if len(idx) != len(added):
        raise SystemExit("Duplicate existing keys")
    urls = {f"/attorneys/{p['state']}/{p['city']}/{p['slug']}/" for p in added}
    stats = {"new": 0, "updated": 0, "unchanged": 0, "skippedInactive": 0, "preserved": 0}
    new_urls, fresh = [], []
    for r in csv.DictReader(open(src, encoding="utf-8")):
        key = ("NY", r["registration_number"])
        i = idx.get(key)
        if i is None:
            if r["status"] not in ACTIVE:
                stats["skippedInactive"] += 1
                continue
            p = build(r, verified)
            u = f"/attorneys/ny/{p['city']}/{p['slug']}/"
            if u in urls:
                raise SystemExit(f"URL collision {u}")
            urls.add(u); new_urls.append(u); fresh.append(p); stats["new"] += 1
            continue
        cur = added[i]
        if cur.get("claimed") or cur.get("ownerEdited"):
            stats["preserved"] += 1
        elif cur["status"] != r["status"]:
            stats["updated"] += 1
            if apply:
                cur["status"] = r["status"]
                if verified:
                    cur["lastVerified"] = verified
        else:
            stats["unchanged"] += 1
    if apply and (fresh or stats["updated"]):
        for p in fresh:
            pos = next((j for j, q in enumerate(added) if q["stateCode"] == "NY" and q["barNumber"] > p["barNumber"]), None)
            if pos is None:
                pos = max(j for j, q in enumerate(added) if q["stateCode"] == "NY") + 1
            added.insert(pos, p)
        ADDED.write_text(json.dumps(added, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        if fresh:
            d = json.loads(DIRECTORY.read_text(encoding="utf-8"))
            d.extend({"id": p["barNumber"], "n": p["name"], "c": p["cityName"], "z": p.get("officeZip") or "",
                      "a": p["admittedYear"], "u": f"/attorneys/ny/{p['city']}/{p['slug']}/", "s": "NY"} for p in fresh)
            d.sort(key=lambda r: (r["s"], r["id"]))
            DIRECTORY.write_text(json.dumps(d, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({**stats, "newUrls": new_urls}, indent=1))


if __name__ == "__main__":
    main()
