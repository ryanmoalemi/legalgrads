#!/usr/bin/env python3
"""Same city, ZIP, and law-school normalization as src/lib/places.ts."""
import json
import re
import unicodedata
from pathlib import Path

RULES = json.loads((Path(__file__).resolve().parent.parent / "src/data/place-rules.json").read_text(encoding="utf-8"))
TOKEN = RULES["token"]
ZIP3 = RULES["zip3"]
STATE_SUFFIXES = {
    "al", "ak", "az", "ar", "ca", "co", "ct", "de", "dc", "fl", "ga", "hi", "id", "il", "in", "ia",
    "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm",
    "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "va", "wa",
    "wv", "wi", "wy",
}


def slugify_place(value):
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def fix_mc(token):
    if len(token) > 3 and token.lower().startswith("mc") and token[2].islower():
        rest = token[2:]
        return "Mc" + rest[0].upper() + rest[1:]
    return token


def expand_city_name(raw):
    cleaned = re.sub(r"\s+", " ", raw.replace(".", "")).strip()
    if not cleaned:
        return raw
    parts = cleaned.split(" ")
    out = []
    index = 0
    while index < len(parts):
        token = parts[index]
        if token.lower() == "mc" and index + 1 < len(parts):
            nxt = parts[index + 1]
            out.append("Mc" + nxt[0].upper() + nxt[1:].lower())
            index += 2
            continue
        fixed = fix_mc(token)
        out.append(TOKEN.get(fixed.lower(), fixed))
        index += 1
    return " ".join(out)


def zip_region(zip_code):
    if not isinstance(zip_code, str) or not re.match(r"^\d{5}", zip_code):
        return None
    number = int(zip_code[:3])
    for start, end, region in ZIP3:
        if start <= number <= end:
            return region
    return None


def expand_school(name):
    if not name or name == "Not listed":
        return name
    text = re.sub(r"\bUniv\.?\b", "University", name)
    text = re.sub(r"^U of ", "University of ", text)
    text = re.sub(r"\bSOL\b", "School of Law", text)
    text = re.sub(r"\bCOL\b", "College of Law", text)
    text = re.sub(r"\bCtr\b", "Center", text)
    return re.sub(r"\s+", " ", text).strip()


def present_profile(profile):
    if profile.get("claimed") or profile.get("ownerEdited"):
        profile["lawSchool"] = expand_school(profile.get("lawSchool") or "")
        return profile, None
    original_city = profile.get("city") or ""
    original_name = profile.get("cityName") or ""
    city_name = expand_city_name(original_name)
    profile["cityName"] = city_name
    profile["lawSchool"] = expand_school(profile.get("lawSchool") or "")
    region = zip_region(profile.get("officeZip") or "")
    if region and region != profile.get("stateCode"):
        profile["officeState"] = profile.get("officeState") or region
        profile["locationLabel"] = profile.get("locationLabel") or f"{city_name}, {region}"
    frozen = original_city in ("office-unlisted", "location-not-listed", "international-offices")
    new_city = slugify_place(city_name) if city_name else original_city
    suffix = re.search(r"-([a-z]{2})$", original_city)
    if suffix and suffix.group(1) in STATE_SUFFIXES and not new_city.endswith("-" + suffix.group(1)):
        new_city = new_city + "-" + suffix.group(1)
    if not frozen and city_name != original_name and new_city and new_city != original_city:
        old = f"/attorneys/{profile['state']}/{original_city}/{profile['slug']}/"
        profile["city"] = new_city
        new = f"/attorneys/{profile['state']}/{new_city}/{profile['slug']}/"
        hub_old = f"/attorneys/{profile['state']}/{original_city}/"
        hub_new = f"/attorneys/{profile['state']}/{new_city}/"
        return profile, (old, new, hub_old, hub_new)
    return profile, None
