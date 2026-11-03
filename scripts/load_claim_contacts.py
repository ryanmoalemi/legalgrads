"""Build private claim_contacts rows and load them into Supabase.
Reads public profile data plus the local (uncommitted) CA roster scrape data/ca-admits-2024.csv.
Usage: SUPABASE_ACCESS_TOKEN=... python3 scripts/load_claim_contacts.py [--dry]
"""
import csv, json, os, sys, urllib.request, urllib.parse, collections
sys.path.insert(0, os.path.dirname(__file__))
from law_school_domains import law_school_domain

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT = "qlhwojjdsonjxfeoiqww"

def site_domain(url):
    url = (url or "").strip()
    if not url:
        return ""
    if "://" not in url:
        url = "http://" + url
    host = (urllib.parse.urlparse(url).hostname or "").lower()
    return host[4:] if host.startswith("www.") else host

def rows():
    paths = {(r["s"], r["id"]): r["u"] for r in json.load(open(f"{ROOT}/public/data/unclaimed-directory.json"))}
    ca = {}
    p = f"{ROOT}/data/ca-admits-2024.csv"
    if os.path.exists(p):
        ca = {r["bar_number"]: r for r in csv.DictReader(open(p))}
    out = []
    for fn in ("unclaimed-added.json", "unclaimed-ca.json"):
        for r in json.load(open(f"{ROOT}/src/data/{fn}")):
            path = paths.get((r["stateCode"], r["barNumber"]))
            if not path:
                continue
            src = ca.get(r["barNumber"]) if r["stateCode"] == "CA" else None
            email = (src or {}).get("email", "").strip().lower()
            out.append({
                "profile_path": path,
                "bar_email": email if "@" in email else None,
                "firm_domain": site_domain((src or {}).get("website")) or None,
                "law_school_domain": law_school_domain(r.get("lawSchool")) or None,
                "has_bar_phone": bool((src or {}).get("phone", "").strip()),
                "state": r["stateCode"],
            })
    seen = {}
    for r in out:
        seen[r["profile_path"]] = r
    return list(seen.values())

def q(v):
    if v is None: return "null"
    if isinstance(v, bool): return "true" if v else "false"
    return "'" + str(v).replace("'", "''") + "'"

def run_sql(sql):
    req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{PROJECT}/database/query",
        data=json.dumps({"query": sql}).encode(), method="POST",
        headers={"Authorization": "Bearer " + os.environ["SUPABASE_ACCESS_TOKEN"], "Content-Type": "application/json", "User-Agent": "legalgrads-loader"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()

if __name__ == "__main__":
    R = rows()
    stats = collections.defaultdict(lambda: collections.Counter())
    for r in R:
        s = stats[r["state"]]; s["profiles"] += 1
        s["bar_email"] += bool(r["bar_email"]); s["website"] += bool(r["firm_domain"])
        s["law_school_domain"] += bool(r["law_school_domain"]); s["bar_phone"] += r["has_bar_phone"]
    tot = collections.Counter()
    for k in sorted(stats): tot.update(stats[k]); print(k, dict(stats[k]))
    print("TOTAL", dict(tot))
    if "--dry" in sys.argv: sys.exit()
    cols = ["profile_path", "bar_email", "firm_domain", "law_school_domain", "has_bar_phone"]
    for i in range(0, len(R), 2000):
        vals = ",".join("(" + ",".join(q(r[c]) for c in cols) + ")" for r in R[i:i+2000])
        run_sql(f"insert into public.claim_contacts ({','.join(cols)}) values {vals} on conflict (profile_path) do update set bar_email=excluded.bar_email, firm_domain=excluded.firm_domain, law_school_domain=excluded.law_school_domain, has_bar_phone=excluded.has_bar_phone, updated_at=now();")
    print("loaded", len(R))
