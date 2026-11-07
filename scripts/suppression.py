#!/usr/bin/env python3
"""Permanent public-profile suppressions.

src/data/suppressed-profiles.json is the list. A record is suppressed when
its state and bar number match a key (ny-6118061), its name normalizes to a
listed name, or any email on the record matches. See docs/opt-out.md.
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "src" / "data" / "suppressed-profiles.json"
KEY_RE = re.compile(r"^[a-z]{2}-[0-9a-z]+(?:-[0-9a-z]+)*$")
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
STATE_RE = re.compile(r"^[A-Za-z]{2}$")
SUFFIXES = {"esq", "esquire", "jr", "sr", "ii", "iii", "iv", "v", "phd", "llm"}
_CACHE = None


def normalize_name(value):
    text = unicodedata.normalize("NFKD", str(value or "")).encode("ascii", "ignore").decode().lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = [token for token in text.split() if token and token not in SUFFIXES and not token.isdigit()]
    return " ".join(sorted(tokens))


def normalize_email(value):
    return str(value or "").strip().lower()


def suppression_key(state_code, bar_number):
    return f"{str(state_code).strip().lower()}-{str(bar_number).strip().lower()}"


def load_suppressed(path=None):
    global _CACHE
    if path is None and _CACHE is not None:
        return _CACHE
    file = Path(path) if path else PATH
    data = json.loads(file.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"{file} must be an object with keys, names, and emails")
    keys = data.get("keys")
    names = data.get("names")
    emails = data.get("emails")
    if not isinstance(keys, list) or any(not isinstance(item, str) or KEY_RE.fullmatch(item) is None for item in keys):
        raise SystemExit(f"{file} keys must look like ny-6118061")
    if not isinstance(names, list) or any(not isinstance(item, str) or not normalize_name(item) for item in names):
        raise SystemExit(f"{file} names must be lowercase words, for example joy anna fuller")
    if not isinstance(emails, list) or any(not isinstance(item, str) or item != item.lower() or "@" not in item for item in emails):
        raise SystemExit(f"{file} emails must be lowercase addresses")
    if len(keys) != len(set(keys)) or len(emails) != len(set(emails)):
        raise SystemExit(f"{file} contains a duplicate")
    loaded = {
        "keys": set(keys),
        "names": {normalize_name(item) for item in names},
        "emails": {normalize_email(item) for item in emails},
        "display_names": list(names),
    }
    if path is None:
        _CACHE = loaded
    return loaded


def _state_of(record):
    for field in ("stateCode", "s", "licensed_state", "state_code"):
        value = str(record.get(field) or "").strip()
        if STATE_RE.fullmatch(value):
            return value
    value = str(record.get("state") or "").strip()
    if STATE_RE.fullmatch(value):
        return value
    return ""


def _bar_of(record):
    for field in ("barNumber", "bar_number", "registration_number"):
        if record.get(field) not in (None, ""):
            return str(record.get(field)).strip()
    maybe = record.get("id")
    if maybe not in (None, "") and re.fullmatch(r"[0-9A-Za-z-]{1,20}", str(maybe)):
        return str(maybe).strip()
    return ""


def _paths_of(record):
    for field in ("u", "profilePath", "profile_path", "path", "slug"):
        value = str(record.get(field) or "").strip()
        if value:
            yield value


def _names_of(record):
    for field in ("name", "n", "full_name", "fullName"):
        if record.get(field):
            yield str(record.get(field))
    parts = [record.get(field) for field in ("first_name", "middle_name", "last_name", "suffix")]
    if any(parts):
        yield " ".join(str(part) for part in parts if part)
    for value in _paths_of(record):
        segment = value.rstrip("/").split("/")[-1]
        if segment:
            yield segment.replace("-", " ")


def _emails_of(record):
    found = []

    def walk(value):
        if isinstance(value, dict):
            for item in value.values():
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)
        elif isinstance(value, str):
            found.extend(EMAIL_RE.findall(value))

    walk(record)
    return found


def is_suppressed(record, suppressed=None):
    if not isinstance(record, dict):
        return False
    rules = suppressed if suppressed is not None else load_suppressed()
    state = _state_of(record)
    bar = _bar_of(record)
    if state and bar and suppression_key(state, bar) in rules["keys"]:
        return True
    for value in _paths_of(record):
        parts = [part for part in value.split("/") if part]
        if len(parts) >= 4 and parts[0] == "attorneys" and STATE_RE.fullmatch(parts[1] or ""):
            slug = parts[-1]
            slug_bar = slug.rsplit("-", 1)[-1]
            if suppression_key(parts[1], slug_bar) in rules["keys"]:
                return True
    for name in _names_of(record):
        if normalize_name(name) in rules["names"]:
            return True
    for email in _emails_of(record):
        if normalize_email(email) in rules["emails"]:
            return True
    return False
