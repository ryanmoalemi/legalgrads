#!/usr/bin/env python3
"""Checks for scripts/build_places.py: merges need ZIP evidence, profile identity is kept."""
import collections
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_places import build, load  # noqa: E402
from places import display_city  # noqa: E402

rows = load()
index, _ = build(rows)
by_key = {f"{p['state']}|{p['barNumber']}": p for p in rows}
assert len(by_key) == len(rows), "state|barNumber must identify one record"


def placed(state, raw, zip_code):
    for p in rows:
        if p["state"] == state and display_city(p["cityName"]) == raw and (p.get("officeZip") or "")[:5] == zip_code:
            return index.get(f"{p['state']}|{p['barNumber']}")
    raise AssertionError(f"fixture missing: {state} {raw} {zip_code}")


# A misspelling merges only when its ZIP is already used by the canonical city.
assert placed("ca", "Los Angles", "90012")[:2] == ["los-angeles", "Los Angeles"]
# The same misspelling at a San Diego ZIP is not Los Angeles: unknown, not a guess.
assert placed("ca", "Los Angles", "92108")[3] == "U"
# A state code plus ZIP takes the city that ZIP is published with; free text with a foreign postcode does not.
assert placed("ca", "Ca 91505", "91505")[:2] == ["burbank", "Burbank"]
assert placed("ca", "Calgary Ab T2t3j", "90029")[3] == "U"
# Out-of-state offices are grouped by the record's own ZIP or office state.
assert placed("ca", "Albany", "31701")[:4] == ["albany-ga", "Albany", "GA", "O"]

# Similar real cities are never merged: no record changes between Chico and Chino.
for key, (hub, name, _region, _kind) in index.items():
    raw = display_city(by_key[key]["cityName"]).lower()
    assert not ({raw, name.lower()} == {"chico", "chino"}), key

# One unknown-location group per state.
unknown = collections.defaultdict(set)
for p in rows:
    hit = index.get(f"{p['state']}|{p['barNumber']}")
    if hit and hit[3] == "U":
        unknown[p["state"]].add(hit[0])
assert all(len(v) == 1 for v in unknown.values()), unknown
print(f"place rules ok ({len(index)} placed records)")
