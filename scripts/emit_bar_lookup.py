#!/usr/bin/env python3
"""Write per-state bar lookups for /join/. Year-only admissions stay years."""
import json
import re
from pathlib import Path

from suppression import is_suppressed

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "bar-lookup"


def norm_bar(value):
    text = re.sub(r"[^a-z0-9]", "", str(value).lower()).lstrip("0")
    return text or "0"


def row(profile):
    admitted = str(profile.get("admitted") or "")
    year_only = len(admitted) == 4 and admitted.isdigit()
    raw_date = profile.get("admissionDate") or ""
    admission = "" if year_only else raw_date if re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw_date) else ""
    city = profile.get("cityName") or ""
    if profile.get("city") == "office-unlisted":
        city = ""
    return [
        profile.get("name") or "",
        admitted,
        admission,
        profile.get("lawSchool") or "",
        city,
        f"/attorneys/{profile['state']}/{profile['city']}/{profile['slug']}/",
    ]


def main():
    profiles = json.loads((ROOT / "src/data/unclaimed-ca.json").read_text(encoding="utf-8"))
    profiles += json.loads((ROOT / "src/data/unclaimed-added.json").read_text(encoding="utf-8"))
    by_state = {}
    for profile in profiles:
        if profile.get("demo") or is_suppressed(profile):
            continue
        state = profile["stateCode"].lower()
        key = norm_bar(profile["barNumber"])
        bucket = by_state.setdefault(state, {})
        if key in bucket:
            raise SystemExit(f"Duplicate normalized bar {state} {key}")
        bucket[key] = row(profile)
    OUT.mkdir(parents=True, exist_ok=True)
    for state, bucket in by_state.items():
        (OUT / f"{state}.json").write_text(json.dumps(bucket, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"states": len(by_state), "rows": sum(len(v) for v in by_state.values())}))


if __name__ == "__main__":
    main()
