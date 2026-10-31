#!/usr/bin/env python3
"""Polite, resumable scraper of State Bar of California public licensee profiles.
Usage: scrape_calbar.py START END        (crawl, resumes from checkpoint)
       scrape_calbar.py --probe N        (print one parsed record)"""
import sys, re, csv, html, json, time, os, datetime, urllib.request, urllib.error, urllib.robotparser
BASE = "https://apps.calbar.ca.gov/attorney/Licensee/Detail/{}"
UA = "LegalgradsDirectoryBot/1.0 (+https://legalgrads.com; contact ryan@legalgrads.com)"
DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, "ca-admits-2024.csv"); CKPT = os.path.join(DIR, "scrape_checkpoint.json")
DELAY = 1.5; MAX_MISS_RUN = 200
FIELDS = ["bar_number","name","status","admit_date","firm_address","city","state","zip","phone","email",
          "website","law_school","practice_areas","languages","profile_url","fetched_at","flag"]

def clean(s):
    s = re.sub(r'(?s)<[^>]+>', '', s); return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def fetch(n):
    req = urllib.request.Request(BASE.format(n), headers={"User-Agent": UA})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.status, r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e: return e.code, ""
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            wait = 5 * (attempt + 1)
            print(f"{n}: network error {e}; retry {attempt+1}/5 in {wait}s", flush=True)
            time.sleep(wait)
    return 0, ""

def parse(n, t):
    rec = {k: "" for k in FIELDS}; rec["bar_number"] = n; rec["profile_url"] = BASE.format(n)
    rec["fetched_at"] = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
    m = re.search(r'<h3>\s*<b>(.*?)#(\d+)\s*</b>', t, re.S)
    if not m or m.group(2) != str(n): rec["flag"] = "not_found"; return rec
    rec["name"] = clean(m.group(1))
    m = re.search(r'License Status:(.*?)</b>', t, re.S); rec["status"] = clean(m.group(1)) if m else ""
    m = re.search(r'Address:(.*?)</p>', t, re.S)
    if m:
        a = clean(m.group(1)); rec["firm_address"] = a
        z = re.search(r'([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*$', a)
        if z: rec["city"], rec["state"], rec["zip"] = z.group(1).strip(), z.group(2), z.group(3)
    m = re.search(r'Phone:(.*?)(?:&nbsp;|</p>)', t, re.S); p = clean(m.group(1)) if m else ""
    rec["phone"] = "" if "Not Available" in p else p
    vis = re.findall(r'#(e\d+)\{display:inline;?\}', t)
    for eid in vis:
        m = re.search(r'<span id="%s"[^>]*>(.*?)</span>(?=<span id="e|\s*</p>|\s*$)' % eid, t, re.S)
        if m: e = clean(m.group(1)).replace(" ", "")
        if m and "@" in e: rec["email"] = e; break
    m = re.search(r'Website:(.*?)</p>', t, re.S)
    if m:
        w = re.search(r'href="([^"]+)"', m.group(1)); ws = clean(m.group(1)).split("You are leaving")[0].strip()
        rec["website"] = "" if "Not Available" in ws else (ws or (w.group(1) if w else ""))
    def sect(label):
        m = re.search(label + r'\s*:?(.*?)</p>', t, re.S); v = clean(m.group(1)) if m else ""
        return "" if v.lower().startswith(("none", "not available")) else v
    rec["law_school"] = sect(r'Law School:')
    rec["practice_areas"] = sect(r'Self-Reported Practice Areas:')
    m = re.search(r'By the attorney:(.*?)</p>', t, re.S); v = clean(m.group(1)).split(" By staff")[0].strip() if m else ""
    rec["languages"] = "" if v.lower().startswith("none") else v
    m = re.findall(r'(\d{1,2}/\d{1,2}/\d{4})\s*</td>\s*<td[^>]*>\s*Admitted', t, re.S) or \
        re.findall(r'(\d{1,2}/\d{1,2}/\d{4})(?:(?!\d{1,2}/\d{1,2}/\d{4}).){0,400}?Admitted to the State Bar', t, re.S)
    rec["admit_date"] = m[-1] if m else ""
    return rec

def robots_ok():
    rp = urllib.robotparser.RobotFileParser("https://apps.calbar.ca.gov/robots.txt"); rp.read()
    return rp.can_fetch(UA, BASE.format(365001))

def main():
    if sys.argv[1] == "--probe":
        s, t = fetch(int(sys.argv[2])); r = parse(int(sys.argv[2]), t) if s == 200 else {"http": s}
        print(json.dumps(r)); return
    start, end = int(sys.argv[1]), int(sys.argv[2])
    if not robots_ok(): print("robots.txt disallows; stopping", flush=True); sys.exit(2)
    nxt = json.load(open(CKPT))["next"] if os.path.exists(CKPT) else start
    new = not os.path.exists(OUT)
    f = open(OUT, "a", newline=""); w = csv.DictWriter(f, FIELDS)
    if new: w.writeheader(); f.flush()
    miss = 0; backoff = 60
    n = nxt
    while n <= end:
        t0 = time.time(); s, t = fetch(n)
        if s in (429, 503) or (s == 200 and re.search(r'captcha|are you a robot|access denied', t[:20000], re.I)):
            print(f"{n}: throttled/captcha (HTTP {s}); backing off {backoff}s", flush=True)
            if backoff > 960: print("too many throttles; stopping", flush=True); break
            time.sleep(backoff); backoff *= 2; continue
        if s == 403: print(f"{n}: HTTP 403, stopping", flush=True); break
        backoff = 60
        rec = parse(n, t) if s == 200 else dict({k: "" for k in FIELDS}, bar_number=n, profile_url=BASE.format(n), flag=f"http_{s}")
        w.writerow(rec); f.flush()
        miss = miss + 1 if rec["flag"] else 0
        json.dump({"next": n + 1, "updated": rec["fetched_at"]}, open(CKPT, "w"))
        if n % 100 == 0: print(f"{n} done ({rec['name'] or rec['flag']})", flush=True)
        if miss >= MAX_MISS_RUN: print(f"{miss} misses in a row at {n}; assuming end of assigned range", flush=True); break
        n += 1; time.sleep(max(0, DELAY - (time.time() - t0)))
    print("finished at", n, flush=True)

if __name__ == "__main__": main()
