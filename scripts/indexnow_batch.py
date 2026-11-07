import json, sys, urllib.parse, urllib.request
from suppression import is_suppressed

K = open("/workspace/legalgrads/indexnow-key.txt").read().strip()
urls = []
skipped = 0
for line in open(sys.argv[1]):
    url = line.strip()
    if not url:
        continue
    path = urllib.parse.urlparse(url).path
    record = {"u": path if path.endswith("/") else path + "/"}
    if is_suppressed(record):
        skipped += 1
        continue
    urls.append(url)
print("skipped suppressed", skipped)
tot = 0
for i in range(0, len(urls), 9000):
    b = urls[i:i + 9000]
    d = json.dumps({"host": "legalgrads.com", "key": K, "keyLocation": f"https://legalgrads.com/{K}.txt", "urlList": b}).encode()
    r = urllib.request.Request("https://www.bing.com/indexnow", d, {"Content-Type": "application/json; charset=utf-8"})
    try:
        c = urllib.request.urlopen(r, timeout=60).status
    except urllib.error.HTTPError as e:
        c = e.code
    print(f"batch {i // 9000 + 1}: {len(b)} urls HTTP {c}")
    tot += len(b) if c in (200, 202) else 0
print("accepted total", tot)
