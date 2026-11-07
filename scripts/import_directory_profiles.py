#!/usr/bin/env python3
"""Upsert directory profiles from the 2026-11-03 NDJSON export.

Keyed on (stateCode, barNumber) as text, including leading zeros. Existing
California pages and any claimed or owner-edited profile keep their URL and
fields. Other existing pages keep their URL. Running the import again writes
the same files and adds no duplicate keys.
"""
import gzip
import json
import re
import unicodedata
from pathlib import Path

from suppression import is_suppressed, load_suppressed

ROOT = Path(__file__).resolve().parent.parent
NDJSON = ROOT / "data-import" / "directory-profiles-2026-11-03.ndjson.gz"
COVERAGE = ROOT / "data-import" / "coverage.json"
REPORT = ROOT / "data-import" / "import-report-2026-11-03.json"
EXISTING = ROOT / "src" / "data" / "unclaimed-ca.json"
ADDED = ROOT / "src" / "data" / "unclaimed-added.json"
DIRECTORY = ROOT / "public" / "data" / "unclaimed-directory.json"
FULL_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ZIP5 = re.compile(r"^(\d{5})(?:-\d{4})?$")


def plain(value):
    if not isinstance(value, str):
        return value
    return value.replace("\u2014", " - ").replace("\u2013", " - ")


# Pages already on legalgrads.com. Their URLs are never rebuilt.
LIVE_STATES = {"CA", "NY", "AR", "ND", "VT", "CO", "TX", "AK", "FL", "PA", "WA"}
GENERATIONAL = {"jr", "sr", "ii", "iii", "iv"}
TITLES = {"esq", "esquire", "llm"}
FIRST_NAMES = set()
BUILTIN_FIRST = {
    "aaron","abigail","adam","adrian","aiden","alan","albert","alex","alexander","alexandra","alexis","alice","alyssa",
    "amanda","amber","amy","andrea","andrew","angelina","anna","anthony","ashley","austin","barbara","benjamin","beth",
    "brandon","brenda","brian","brianne","brittany","brooke","bryan","caleb","cameron","carl","carlos","carmen","carol",
    "caroline","casey","catherine","charles","charlotte","cheryl","chris","christian","christina","christopher","claire",
    "clara","cody","colin","connor","corey","courtney","craig","crystal","cynthia","daniel","danielle","david","dawn",
    "deborah","debra","delisa","denise","dennis","destiney","diana","diane","donald","donna","douglas","dylan","edward",
    "elena","elizabeth","emily","emma","eric","erin","ethan","evan","eve","evelyn","frances","frank","gabriel","gabrielle",
    "george","grace","gregory","hannah","harold","heather","henry","holly","hunter","ian","isaac","jack","jacob","jaelyn",
    "james","jane","janet","janice","jared","jason","jean","jeffrey","jennifer","jeremy","jessica","john","jonathan","jordan",
    "jose","joseph","joshua","joyce","juan","judith","julia","julian","julie","justin","karen","katherine","kathleen","kathryn",
    "kayla","keith","kelly","kenneth","kevin","kimberly","kyle","laura","lauren","lawrence","leah","liam","linda","lisa",
    "logan","louis","lucas","luke","lynn","madison","marla","margaret","maria","marie","mark","martha","martin","mary",
    "matthew","megan","melissa","michael","michelle","nancy","nathan","nicholas","nicole","noah","olivia","paige","pamela",
    "patricia","patrick","paul","peter","philip","phillip","rachel","ralph","raymond","rebecca","richard","robert","roger",
    "ronald","rose","russell","ruth","ryan","samantha","samuel","sandra","sara","sarah","scott","sean","shannon","sharon",
    "shawn","stephanie","stephen","steven","susan","teresa","terry","thomas","timothy","todd","tyler","victoria","vincent",
    "virginia","walter","wayne","wendy","william","zachary",
}


def learn_first_names(rows):
    global FIRST_NAMES
    FIRST_NAMES = set(BUILTIN_FIRST)
    for row in rows:
        tokens = row.get("name", "").replace(",", " ").split()
        if row.get("stateCode") == "CT" and tokens:
            FIRST_NAMES.add(tokens[0].lower().strip("."))
        if row.get("stateCode") == "DE" and len(tokens) == 3 and len(tokens[2].strip(".")) == 1:
            FIRST_NAMES.add(tokens[1].lower())


def slugify(value):
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def format_suffix(token):
    key = token.lower().strip(".")
    if key in {"jr", "sr"}:
        return key.title() + ("." if token.rstrip().endswith(".") else "")
    return key.upper()


def smart_token(token):
    key = token.lower().strip(".")
    if key in GENERATIONAL or key == "v":
        return format_suffix(key) if key in GENERATIONAL else token
    parts = re.split(r"([-'’])", token)
    out = []
    for part in parts:
        if part in "-'’":
            out.append("'" if part == "’" else part)
            continue
        lower = part.lower()
        if lower.startswith("mc") and len(lower) > 2:
            out.append("Mc" + lower[2:].capitalize())
        else:
            out.append(lower.capitalize())
    return "".join(out)


def normalize_name(state, raw):
    name = " ".join(str(raw).replace("***", " ").split())
    name = re.sub(r",?\s*(Esq\.?|L\.?L\.?M\.?)\b\.?", "", name, flags=re.I)
    name = " ".join(name.strip(" ,").split())
    if name.endswith(".") and not re.search(r"\b(Jr|Sr|II|III|IV|V)\.$", name):
        name = name[:-1].rstrip(" ,")
    if state == "DE" and name.isupper():
        return normalize_de(name)
    match = re.match(r"^(Jr\.?|Sr\.?|II|III|IV|V),\s*(.+)$", name, flags=re.I)
    if match:
        name = f"{match.group(2)} {match.group(1)}"
    name = re.sub(r"\s*,\s*(Jr\.?|Sr\.?|II|III|IV|V)\s*$", r" \1", name, flags=re.I)
    upper = name.isupper()
    tokens = name.split()
    body = []
    suffixes = []
    for index, token in enumerate(tokens):
        key = token.lower().strip(".")
        if key in GENERATIONAL and index != len(tokens) - 1:
            suffixes.append(format_suffix(token))
        elif key in TITLES:
            continue
        else:
            body.append(smart_token(token) if upper else token)
    if body:
        last = body[-1].lower().strip(".")
        if last in GENERATIONAL:
            suffixes.append(format_suffix(body[-1]))
            body = body[:-1]
        elif last == "v" and len(body[-1].strip(".")) == 1 and len(body) > 1:
            suffixes.append("V")
            body = body[:-1]
    return " ".join(body + suffixes)


def normalize_de(raw):
    tokens = [token.strip(".,") for token in raw.split() if token.strip(".,")]
    suffixes = []
    while tokens and tokens[-1].lower().strip(".") in GENERATIONAL | TITLES | {"esq"}:
        key = tokens.pop().lower().strip(".")
        if key in TITLES:
            continue
        suffixes.insert(0, format_suffix(key))
    initials = []
    while tokens and len(tokens[-1].strip(".")) == 1:
        initials.insert(0, tokens.pop().strip("."))
    if len(tokens) < 2:
        ordered = tokens + initials
    else:
        start = 1
        for index in range(1, len(tokens)):
            if tokens[index].lower() in FIRST_NAMES:
                start = index
                break
        ordered = tokens[start:] + initials + tokens[:start]
    return " ".join([smart_token(token) for token in ordered] + suffixes)


def public_slug(name, bar):
    return f"{slugify(name)}-{slugify(bar.replace('-', ''))}"


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
    if row["stateCode"] not in LIVE_STATES:
        profile["name"] = normalize_name(row["stateCode"], profile["name"])
        profile["slug"] = public_slug(profile["name"], profile["barNumber"])
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


COMPARE_FIELDS = (
    "name", "admitted", "admittedYear", "admissionDate", "status", "discipline", "lawSchool",
    "lastVerified", "officeZip", "cityName", "locationLabel", "officeState", "recordLinkType",
    "sourceAuthority", "sourceUrl", "officialLookupUrl", "registryRecordUrl",
)


def canon(profile):
    out = {}
    for field in COMPARE_FIELDS:
        value = profile.get(field)
        if value not in (None, ""):
            out[field] = value
    return out


def preserved(profile):
    return profile.get("stateCode") == "CA" or bool(profile.get("claimed") or profile.get("ownerEdited"))


def load_ndjson(path):
    rows = []
    seen = set()
    opener = gzip.open if str(path).endswith(".gz") else open
    with opener(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            if row.get("directoryInclude") not in (1, None):
                continue
            bar = row.get("barNumber")
            if not isinstance(bar, str) or not bar:
                raise SystemExit(f"barNumber must stay text: {row.get('stateCode')} {bar!r}")
            key = (row["stateCode"], bar)
            if key in seen:
                raise SystemExit(f"Duplicate source key {key}")
            seen.add(key)
            rows.append(row)
    return rows


def import_profiles(existing_ca, existing_added, rows):
    """Return (ca_profiles, added_profiles, stats). Does not write files."""
    suppressed = load_suppressed()
    existing_ca = [profile for profile in existing_ca if not is_suppressed(profile, suppressed)]
    existing_added = [profile for profile in existing_added if not is_suppressed(profile, suppressed)]
    index = {}
    for profile in existing_ca + existing_added:
        key = (profile["stateCode"], profile["barNumber"])
        if key in index:
            raise SystemExit(f"Duplicate existing profile {key}")
        index[key] = profile
    stats = {}

    def bucket(state):
        return stats.setdefault(state, {"new": 0, "updated": 0, "unchanged": 0, "held": 0})

    ca_kept = list(existing_ca)
    non_ca = {}
    for profile in existing_added:
        key = (profile["stateCode"], profile["barNumber"])
        if profile["stateCode"] == "CA" or profile.get("claimed") or profile.get("ownerEdited"):
            continue
        non_ca[key] = profile
    ca_added = [p for p in existing_added if p["stateCode"] == "CA" or p.get("claimed") or p.get("ownerEdited")]
    for profile in ca_kept + ca_added:
        bucket(profile["stateCode"])["unchanged"] += 1

    paths = {f"/attorneys/{p['state']}/{p['city']}/{p['slug']}/" for p in index.values()}
    fresh = []
    seen_existing = set()
    for row in rows:
        if is_suppressed(row, suppressed):
            continue
        key = (row["stateCode"], row["barNumber"])
        current = index.get(key)
        if current is not None and preserved(current):
            seen_existing.add(key)
            continue
        built = profile_from_row(row)
        if current is None:
            path = f"/attorneys/{built['state']}/{built['city']}/{built['slug']}/"
            if path in paths:
                raise SystemExit(f"URL collision {path}")
            paths.add(path)
            fresh.append(built)
            index[key] = built
            bucket(built["stateCode"])["new"] += 1
            continue
        seen_existing.add(key)
        built["slug"] = current["slug"]
        built["state"] = current["state"]
        built["city"] = current["city"]
        data_changed = canon(built) != canon(current)
        # No individual registry link: the page label becomes "Search the state bar."
        link_changed = not current.get("registryRecordUrl")
        if data_changed:
            non_ca[key] = built
        if data_changed or link_changed:
            bucket(current["stateCode"])["updated"] += 1
        else:
            bucket(current["stateCode"])["unchanged"] += 1
    for key, profile in non_ca.items():
        if key not in seen_existing:
            bucket(profile["stateCode"])["unchanged"] += 1
    added = ca_added + sorted(list(non_ca.values()) + fresh, key=lambda p: (p["stateCode"], p["barNumber"]))
    keys = [(p["stateCode"], p["barNumber"]) for p in ca_kept + added]
    if len(keys) != len(set(keys)):
        raise SystemExit("Import produced duplicate stateCode+barNumber keys")
    return ca_kept, added, stats


def held_by_state(coverage_path):
    if not Path(coverage_path).exists():
        return {}
    coverage = json.loads(Path(coverage_path).read_text(encoding="utf-8"))
    held = {}
    for row in coverage.get("byState", []):
        unnumbered = row.get("officialRecordsWithoutBarNumber") or 0
        notices = row.get("officialEventEntries") or 0
        research = row.get("allResearchEvidence") or 0
        # Court notices are already inside the research total when both are set.
        held[row["stateCode"]] = unnumbered + max(notices, research)
    return held


def write_outputs(ca_profiles, added_profiles, ca_path, added_path, directory_path):
    # The original California file is preserved byte-for-byte when the objects
    # are the same list loaded from disk. Callers that need that guarantee
    # should skip rewriting when the text is unchanged.
    suppressed = load_suppressed()
    ca_profiles = [profile for profile in ca_profiles if not is_suppressed(profile, suppressed)]
    added_profiles = [profile for profile in added_profiles if not is_suppressed(profile, suppressed)]
    added_path.write_text(json.dumps(added_profiles, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    directory = [directory_row(p) for p in ca_profiles]
    directory.extend(directory_row(p) for p in added_profiles)
    directory.sort(key=lambda row: (row["s"], row["id"]))
    directory_path.write_text(json.dumps(directory, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8")


def run(ndjson=NDJSON, ca_path=EXISTING, added_path=ADDED, directory_path=DIRECTORY, coverage_path=COVERAGE, report_path=None):
    existing_ca = json.loads(Path(ca_path).read_text(encoding="utf-8"))
    existing_added = json.loads(Path(added_path).read_text(encoding="utf-8")) if Path(added_path).exists() else []
    ca_text = Path(ca_path).read_text(encoding="utf-8")
    rows = load_ndjson(ndjson)
    learn_first_names(rows)
    ca_profiles, added_profiles, stats = import_profiles(existing_ca, existing_added, rows)
    for state, count in held_by_state(coverage_path).items():
        stats.setdefault(state, {"new": 0, "updated": 0, "unchanged": 0, "held": 0})["held"] = count
    write_outputs(ca_profiles, added_profiles, Path(ca_path), Path(added_path), Path(directory_path))
    if Path(ca_path).read_text(encoding="utf-8") != ca_text:
        Path(ca_path).write_text(ca_text, encoding="utf-8")
        raise SystemExit("California source file changed during import")
    if report_path:
        Path(report_path).write_text(json.dumps(stats, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return stats


def main():
    stats = run(report_path=REPORT)
    new = sum(item["new"] for item in stats.values())
    updated = sum(item["updated"] for item in stats.values())
    unchanged = sum(item["unchanged"] for item in stats.values())
    print(json.dumps({"new": new, "updated": updated, "unchanged": unchanged}, sort_keys=True))


if __name__ == "__main__":
    main()
