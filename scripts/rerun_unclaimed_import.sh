#!/bin/bash
# Re-run after the scraper appends rows: fresh clone, import (Active licenses only, upsert on bar_number, non-Active dropped), PR, merge -> Pages deploy.
set -e
D=$(mktemp -d); /usr/local/bin/gh repo clone ryanmoalemi/legalgrads "$D" -- -b main -q; cd "$D"
python3 scripts/import_unclaimed.py /workspace/legalgrads/data/ca-admits-2024.csv
git diff --quiet && { echo "No new profiles."; exit 0; }
B=unclaimed-refresh-$(date +%Y%m%d%H%M); git checkout -q -b $B; git add src/data/unclaimed-ca.json public/data/unclaimed-directory.json
git -c user.name=ryanmoalemi -c user.email=aftermarketproducts71@gmail.com commit -qm "Refresh unclaimed CA profiles"
git push -q -u origin $B; /usr/local/bin/gh pr create --base main --title "Refresh unclaimed CA profiles" --body "Re-run of scripts/import_unclaimed.py"
/usr/local/bin/gh pr merge --squash --delete-branch
# After the Pages deploy finishes, ping IndexNow (Bing/Yandex) with the sitemap URLs.
RUN=$(sleep 15; /usr/local/bin/gh run list -R ryanmoalemi/legalgrads -w "Deploy to GitHub Pages" -L1 --json databaseId -q '.[0].databaseId'); /usr/local/bin/gh run watch -R ryanmoalemi/legalgrads $RUN --exit-status >/dev/null
K=$(cat /workspace/legalgrads/indexnow-key.txt)
curl -s https://legalgrads.com/sitemap.xml | grep -o "<loc>[^<]*" | cut -c6- > /tmp/lg-urls.txt && python3 /workspace/legalgrads/indexnow_batch.py /tmp/lg-urls.txt
