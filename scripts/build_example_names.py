"""Build public/data/example-names.json: which first names on the site read as clearly female or male.

Used only to pick the photo in the labeled example profile (public/js/owner-edits.js).
Rule: a first name is female (f) or male (m) when 90% or more of U.S. babies given that name
in 1960-2008 were that sex (SSA top-1000 names via github.com/hadley/data-baby-names). Names
not in that list fall back to gender-guesser's strict "female"/"male" answers (not "mostly_" or
"andy"). Everything else, including names missing from both, gets the neutral photo.

Run by hand when the roster changes:  pip install gender-guesser && python3 scripts/build_example_names.py
"""
import collections, csv, io, json, re, unicodedata, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SSA_URL = "https://raw.githubusercontent.com/hadley/data-baby-names/master/baby-names.csv"
THRESHOLD = 0.9


def first_name(full):
    for token in full.strip().split():
        t = unicodedata.normalize("NFKD", token).encode("ascii", "ignore").decode().lower()
        t = re.sub(r"[^a-z'-]", "", t)
        if len(t) > 1 and not token.endswith("."):
            return t.split("-")[0]
    return ""


def main():
    share = collections.defaultdict(lambda: [0.0, 0.0])
    text = urllib.request.urlopen(SSA_URL, timeout=60).read().decode()
    for row in csv.DictReader(io.StringIO(text)):
        if 1960 <= int(row["year"]) <= 2008:
            share[row["name"].lower()][0 if row["sex"] == "girl" else 1] += float(row["percent"])
    try:
        import gender_guesser.detector as gd
        guess = gd.Detector(case_sensitive=False).get_gender
    except ImportError:
        guess = lambda name: "unknown"

    def kind(name):
        if not name:
            return "n"
        if name in share:
            girl, boy = share[name]
            return "f" if girl / (girl + boy) >= THRESHOLD else "m" if boy / (girl + boy) >= THRESHOLD else "n"
        return {"female": "f", "male": "m"}.get(guess(name.capitalize()), "n")

    rows = json.loads((ROOT / "public/data/unclaimed-directory.json").read_text())
    names = {first_name(r["n"]) for r in rows}
    kinds = {n: kind(n) for n in names}
    out = {k: ",".join(sorted(n for n, v in kinds.items() if v == k)) for k in ("f", "m")}
    (ROOT / "public/data/example-names.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
    people = collections.Counter(kinds[first_name(r["n"])] for r in rows)
    print("profiles", dict(people), "names", dict(collections.Counter(kinds.values())))


if __name__ == "__main__":
    main()
