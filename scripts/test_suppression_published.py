#!/usr/bin/env python3
"""Fail if a suppressed attorney appears in published data or the built site.

Usage:
  python3 scripts/test_suppression_published.py --data
  python3 scripts/test_suppression_published.py --output out
"""
import gzip
import json
import re
import sys
from pathlib import Path

from suppression import is_suppressed, load_suppressed

ROOT = Path(__file__).resolve().parent.parent
DATA_ROOTS = ("src/data", "public/data", "data-import")
SKIP_NAMES = {"suppressed-profiles.json"}
TEXT_SUFFIXES = {".html", ".xml", ".json", ".txt", ".csv", ".js", ".mjs", ".ndjson"}


def fail(message):
    raise SystemExit(message)


def needles(rules):
    compiled = []
    for email in rules["emails"]:
        compiled.append((email, re.compile(re.escape(email), re.I)))
    for key in sorted(rules["keys"]):
        compiled.append((key, re.compile(re.escape(key), re.I)))
        bar = key.split("-", 1)[1]
        compiled.append((bar, re.compile(rf"(?<![0-9A-Za-z]){re.escape(bar)}(?![0-9A-Za-z])")))
    for name in rules["display_names"]:
        parts = [re.escape(part) for part in name.split()]
        compiled.append((name, re.compile(r"\b" + r"\W+".join(parts) + r"\b", re.I)))
        compiled.append(("-".join(name.split()), re.compile(re.escape("-".join(name.split())), re.I)))
    return compiled


def structured_hit(value):
    if isinstance(value, list):
        for item in value:
            hit = structured_hit(item)
            if hit:
                return hit
    elif isinstance(value, dict):
        if any(field in value for field in ("name", "n", "full_name", "fullName", "barNumber", "bar_number", "email", "slug", "u")):
            if is_suppressed(value):
                return value.get("name") or value.get("n") or value.get("full_name") or value.get("email") or value.get("barNumber") or value.get("slug")
        for item in value.values():
            hit = structured_hit(item)
            if hit:
                return hit
    return None


def text_hit(text, patterns):
    for label, pattern in patterns:
        if pattern.search(text):
            return label
    return None


def read_text(path):
    if path.suffix == ".gz":
        with gzip.open(path, "rt", encoding="utf-8") as handle:
            return handle.read()
    return path.read_text(encoding="utf-8", errors="replace")


def check_file(path, patterns):
    if path.name in SKIP_NAMES:
        return
    if path.suffix not in TEXT_SUFFIXES and path.suffix != ".gz":
        return
    text = read_text(path)
    hit = text_hit(text, patterns)
    if hit:
        fail(f"{path.relative_to(ROOT)} contains suppressed marker {hit}")
    if path.suffix == ".json" or path.name.endswith(".json.gz") or path.suffix == ".gz":
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            data = None
            if path.suffix == ".gz":
                for line in text.splitlines():
                    if not line.strip():
                        continue
                    try:
                        row = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if isinstance(row, dict) and is_suppressed(row):
                        fail(f"{path.relative_to(ROOT)} still has suppressed roster row {row.get('name') or row.get('barNumber')}")
        if data is not None:
            found = structured_hit(data)
            if found:
                fail(f"{path.relative_to(ROOT)} still has suppressed record {found}")


def files_under(root):
    if not root.exists():
        return
    for path in root.rglob("*"):
        if path.is_file():
            yield path


def main():
    rules = load_suppressed()
    patterns = needles(rules)
    mode = sys.argv[1] if len(sys.argv) > 1 else "--data"
    if mode == "--data":
        roots = [ROOT / name for name in DATA_ROOTS]
    elif mode == "--output":
        if len(sys.argv) != 3:
            fail("Usage: test_suppression_published.py --output out")
        roots = [Path(sys.argv[2]).resolve()]
    else:
        fail("Usage: test_suppression_published.py --data | --output out")
    checked = 0
    for root in roots:
        for path in files_under(root):
            check_file(path, patterns)
            checked += 1
    if checked == 0:
        fail(f"No files checked for {mode}")
    print(f"suppression scan {mode} ok ({checked} files)")


if __name__ == "__main__":
    main()
