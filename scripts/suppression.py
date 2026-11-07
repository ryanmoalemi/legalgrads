#!/usr/bin/env python3
"""Permanent public-profile suppressions.

Keys are a lowercase state code, a hyphen, and the bar number as stored,
for example ny-6118061. Import scripts and page builds skip these keys so a
later roster file cannot publish the profile again.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "src" / "data" / "suppressed-profiles.json"
KEY_RE = re.compile(r"^[a-z]{2}-[0-9a-z]+$")
_CACHE = None


def suppression_key(state_code, bar_number):
    return f"{str(state_code).strip().lower()}-{str(bar_number).strip().lower()}"


def load_suppressed(path=None):
    global _CACHE
    if path is None and _CACHE is not None:
        return _CACHE
    file = Path(path) if path else PATH
    data = json.loads(file.read_text(encoding="utf-8"))
    if not isinstance(data, list) or any(not isinstance(item, str) or KEY_RE.fullmatch(item) is None for item in data):
        raise SystemExit(f"{file} must be a JSON array of keys like ny-6118061")
    if len(data) != len(set(data)):
        raise SystemExit(f"{file} contains a duplicate key")
    keys = set(data)
    if path is None:
        _CACHE = keys
    return keys


def is_suppressed(record, suppressed=None):
    keys = suppressed if suppressed is not None else load_suppressed()
    state = record.get("stateCode") or record.get("s") or ""
    bar = record.get("barNumber")
    if bar is None:
        bar = record.get("id")
    if bar is None:
        return False
    state = str(state).strip()
    bar = str(bar).strip()
    if not state or not bar:
        return False
    return suppression_key(state, bar) in keys
