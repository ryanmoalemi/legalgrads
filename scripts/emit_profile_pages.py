#!/usr/bin/env python3
"""Write plain profile HTML into out/ after next build.

Next does not statically render these routes. Each file is minified HTML with
the same visible listing text, SEO tags, GA tag, and JSON-LD as the React
template. Shared CSS is one file. No per-page RSC payload is written.
"""
import html
import json
import os
import re
from pathlib import Path
from urllib.parse import quote

from places import present_profile
from suppression import is_suppressed

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
CSS_SRC = ROOT / "src/app/(site)/attorneys/profile-template.css"
CSS_OUT = OUT / "css/attorney-profile.css"
SITE = "https://legalgrads.com"
GA = "G-CHX0PZJH8W"


def esc(value):
    return html.escape(str(value), quote=True)


def claim_href(path):
    return "/claim/?profile=" + quote(path, safe="")


def join_href(profile):
    return f"/join/?state={quote(profile['stateCode'])}&bar={quote(profile['barNumber'])}"


def removal_href(path):
    return "/data-deletion/?profile=" + quote(path, safe="")


def assert_claim_links(html_text, path, profile):
    href = claim_href(path)
    joined = join_href(profile)
    removal = removal_href(path)
    if f'href="{href}"' not in html_text or f'href="{joined}"' not in html_text:
        raise SystemExit(f"Claim buttons missing on {path}")
    if f'href="{removal}"' not in html_text:
        raise SystemExit(f"Removal link missing on {path}")
    if "mailed to your State Bar" in html_text or "\u2014" in html_text or "\u2013" in html_text:
        raise SystemExit(f"Bad copy on {path}")
    if "/js/owner-edits.js" not in html_text:
        raise SystemExit(f"Owner script missing on {path}")
    for needed in ("is this your profile?", "Free for life. Never pay for your standard listing.", 'href="/free-listing-promise/"', "About this profile", "Ask about fees"):
        if needed not in html_text:
            raise SystemExit(f"Claim copy missing on {path}: {needed}")
    for banned in ("What we know", "Founding Member", "separate from claiming", "physical letter", "🎉", "🎓"):
        if banned in html_text:
            raise SystemExit(f"Old copy left on {path}: {banned}")


def calbar(bar):
    return f"https://apps.calbar.ca.gov/attorney/Licensee/Detail/{bar}"


def place_label(p):
    if p["city"] == "office-unlisted":
        return "Office unlisted"
    if p.get("locationLabel"):
        return p["locationLabel"]
    return f"{p['cityName']}, {p['stateCode']}"


def profile_path(p):
    return f"/attorneys/{p['state']}/{p['city']}/{p['slug']}/"


def individual(p):
    return p.get("recordLinkType") in ("individual_official_profile", "individual_official_data_record")


SEARCH_LABEL = "Search the state bar."


def official_href(p):
    if not p.get("recordLinkType"):
        return calbar(p["barNumber"])
    if p.get("registryRecordUrl"):
        return p["registryRecordUrl"]
    return p.get("officialLookupUrl") or ""


def link_label(p):
    kind = p.get("recordLinkType")
    if kind == "individual_official_data_record":
        return "official record"
    if kind == "shared_official_roster_page":
        return "official roster"
    return "official profile"


def seo_title(p):
    where = p["stateName"] if p["city"] == "office-unlisted" else place_label(p)
    return f"{p['name']}, Attorney in {where} | LegalGrads"


def seo_description(p):
    school = f" ({p['lawSchool']})" if p.get("lawSchool") and p["lawSchool"] != "Not listed" else ""
    ca_in = (
        p.get("stateCode") == "CA"
        and p.get("recordLinkType") == "individual_official_profile"
        and (not p.get("officeState") or p.get("officeState") == "CA")
    )
    if (not p.get("recordLinkType") or ca_in) and p.get("officeState") and p.get("officeState") != p.get("stateCode"):
        return f"{p['name']} is licensed in {p['stateName']} and was admitted in {p['admitted']}{school}. Office: {place_label(p)}. License #{p['barNumber']} from State Bar records."
    if not p.get("recordLinkType") or ca_in:
        return f"{p['name']} is a {p['cityName']}, {p['stateCode']} attorney admitted in {p['admitted']}{school}. License #{p['barNumber']} from State Bar records."
    authority = p.get("sourceAuthority") or f"{p['stateName']} licensing authority"
    if p["city"] == "office-unlisted":
        return f"{p['name']} is licensed in {p['stateName']} and was admitted in {p['admitted']}{school}. No office city was published. License #{p['barNumber']} from {authority} records."
    return f"{p['name']} is licensed in {p['stateName']} and was admitted in {p['admitted']}{school}. Office: {place_label(p)}. License #{p['barNumber']} from {authority} records."


def json_ld(p):
    url = SITE + profile_path(p)
    if not p.get("recordLinkType"):
        address = {"@type": "PostalAddress", "addressLocality": p["cityName"], "addressRegion": p.get("officeState") or p["stateCode"], "addressCountry": "US"}
        if p.get("officeZip"):
            address["postalCode"] = p["officeZip"]
        person = {
            "@type": "Person", "@id": f"{url}#p", "name": p["name"], "jobTitle": "Attorney", "url": url,
            "address": address,
            "alumniOf": {"@type": "CollegeOrUniversity", "name": p["lawSchool"]},
            "hasCredential": {
                "@type": "EducationalOccupationalCredential", "credentialCategory": "license",
                "name": f"State Bar of {p['stateName']} license #{p['barNumber']}",
                "recognizedBy": {"@type": "Organization", "name": f"The State Bar of {p['stateName']}"},
                "url": calbar(p["barNumber"]),
            },
        }
    else:
        address = {"@type": "PostalAddress", "addressCountry": "US"}
        if p["city"] != "office-unlisted":
            address["addressLocality"] = p["cityName"]
        if p.get("officeState"):
            address["addressRegion"] = p["officeState"]
        elif p["city"] != "office-unlisted":
            address["addressRegion"] = p["stateCode"]
        if p.get("officeZip"):
            address["postalCode"] = p["officeZip"]
        authority = p.get("sourceAuthority") or f"The State Bar of {p['stateName']}"
        cred_name = f"{p.get('sourceAuthority') or p['stateName']} license #{p['barNumber']}"
        credential = {
            "@type": "EducationalOccupationalCredential", "credentialCategory": "license",
            "name": cred_name,
            "recognizedBy": {"@type": "Organization", "name": authority},
        }
        href = official_href(p)
        if href:
            credential["url"] = href
        person = {
            "@type": "Person", "@id": f"{url}#p", "name": p["name"], "jobTitle": "Attorney", "url": url,
            "address": address,
        }
        if p.get("lawSchool") and p["lawSchool"] != "Not listed":
            person["alumniOf"] = {"@type": "CollegeOrUniversity", "name": p["lawSchool"]}
        person["hasCredential"] = credential
    graph = [
        person,
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": p["stateName"], "item": f"{SITE}/attorneys/{p['state']}/"},
                {"@type": "ListItem", "position": 3, "name": p["cityName"], "item": f"{SITE}/attorneys/{p['state']}/{p['city']}/"},
                {"@type": "ListItem", "position": 4, "name": p["name"], "item": url},
            ],
        },
    ]
    raw = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))
    return raw.replace("<", "\\u003c")


def ext(href, text):
    return f'<a href="{esc(href)}" target="_blank" rel="nofollow noopener">{esc(text)}</a>'


def legacy_copy(p):
    return (not p.get("recordLinkType")) or (p.get("stateCode") == "CA" and p.get("recordLinkType") == "individual_official_profile")


def license_html(p):
    href = official_href(p)
    status_cls = ' class="ok"' if p.get("status") == "Active" else ""
    bar = ext(href, f"#{p['barNumber']} ↗") if href else esc(f"#{p['barNumber']}")
    if not p.get("recordLinkType"):
        head = "License (from the State Bar)"
        who_label, who = "State bar", p["stateName"]
        verified_from = f"State Bar of {p['stateName']}"
        check = "Check the official profile"
    else:
        authority = p.get("sourceAuthority") or p["stateName"]
        ca = p.get("stateCode") == "CA" and p.get("recordLinkType") == "individual_official_profile"
        head = "License (from the regulator)"
        who_label, who = "Regulator", authority
        verified_from = f"State Bar of {p['stateName']}" if ca else authority
        if not p.get("registryRecordUrl"):
            check = SEARCH_LABEL
        else:
            label = link_label(p)
            check = "Check the official profile" if ca or label == "official profile" else "Check the official record"
    check_html = (" " + ext(href, check)) if href else ""
    return (
        f'<div class="card"><h2>{head}</h2><div class="lic">'
        f"<div><small>{who_label}</small><b>{esc(who)}</b></div>"
        f"<div><small>Bar number</small><b>{bar}</b></div>"
        f"<div><small>Admitted in {esc(p['stateName'])}</small><b>{esc(p['admitted'])}</b></div>"
        f"<div><small>License status</small><b{status_cls}>{esc(p['status'])}</b></div>"
        f"<div><small>Public discipline</small><b>{esc(p['discipline'])}</b></div>"
        f"<div><small>Law school</small><b>{esc(p['lawSchool'])}</b></div></div>"
        f'<p class="verified">License status checked {esc(p["lastVerified"])} from {esc(verified_from)} records.{check_html}</p></div>'
    )


def record_source(p):
    """Where the public record came from, and the link to it."""
    href = official_href(p)
    if legacy_copy(p):
        link_href = calbar(p["barNumber"]) if not p.get("recordLinkType") else href
        return f"public State Bar of {esc(p['stateName'])} records", ext(link_href, "View official State Bar record"), ""
    authority = esc(p.get("sourceAuthority") or p["stateName"])
    if not p.get("registryRecordUrl"):
        lookup = p.get("officialLookupUrl") or ""
        return f"public {authority} records", (ext(lookup, "Search the official lookup") if lookup else ""), ""
    if p.get("recordLinkType") == "shared_official_roster_page":
        return f"a public roster published by {authority}", (ext(href, "View the official roster") if href else ""), " It is a shared roster, not an individual record."
    return f"public {authority} records", (ext(href, "View official record") if href else ""), ""


def about_html(p, fn):
    source, link, note = record_source(p)
    link_line = f'<p class="small" style="margin-top:12px">{link}{note}</p>' if link or note else ""
    return (
        f'<div class="card"><h2>About this profile</h2><p>This profile was created from {source}. '
        f'<span id="about-claim">{esc(fn)} has not yet claimed it or confirmed services, fees, or availability on LegalGrads.</span></p>'
        f'<ul class="facts"><li><span>Profile claimed</span><span id="claim-state">Not yet</span></li>'
        f"<li><span>Fees</span><span id=\"fees-state\">Ask about fees</span></li></ul>{link_line}</div>"
    )


def correction_href(path):
    return "mailto:ryan@legalgrads.com?subject=" + quote("Correction for " + path, safe="")


LEGACY_DISC = (
    '<div class="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. '
    "We are not a law firm and not a lawyer referral service. We don&#39;t recommend, rank, match or endorse any attorney, "
    "and we don&#39;t receive any part of an attorney&#39;s fees. You contact attorneys directly. "
    "Information on unclaimed profiles comes from public State Bar records; always confirm license status on the official State Bar website. "
    "Listing is not a guarantee of quality. Attorney advertising.</div>"
)
NEUTRAL_DISC = (
    '<div class="disc"><b>About this listing.</b> LegalGrads is a free directory of licensed attorneys. '
    "We are not a law firm and not a lawyer referral service. We don&#39;t recommend, rank, match or endorse any attorney, "
    "and we don&#39;t receive any part of an attorney&#39;s fees. You contact attorneys directly. "
    "Information on unclaimed profiles comes from public licensing records. Always confirm license status with the regulator linked on this page. "
    "Listing is not a guarantee of quality. Attorney advertising.</div>"
)


def page_html(p):
    path = profile_path(p)
    url = SITE + path
    title = seo_title(p)
    desc = seo_description(p)
    fn = p["name"].split(" ")[0]
    initials = "".join(w[0] for w in p["name"].split(" ") if w)[:2].upper()
    place = place_label(p)
    crumb = p["locationLabel"] if p.get("officeState") and p.get("officeState") != p["stateCode"] and p.get("locationLabel") else p["cityName"]
    disc = LEGACY_DISC if legacy_copy(p) else NEUTRAL_DISC
    city_href = f"/attorneys/{p['state']}/{p['city']}/"
    state_href = f"/attorneys/{p['state']}/"
    where = esc(p["stateName"]) if p["city"] == "office-unlisted" else esc(crumb)
    body = (
        f'<div class="lgp"><main class="wrap">'
        f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="{state_href}">{esc(p["stateName"])}</a> › <a href="{city_href}">{esc(crumb)}</a> › {esc(p["name"])}</nav>'
        f'<section class="hero"><div class="avatar" aria-label="No photo">{esc(initials)}</div><div>'
        f"<h1>{esc(p['name'])}</h1><div class=\"head\">Attorney · {esc(place)}</div>"
        f'<div class="chips"><span class="chip solid">Unclaimed profile</span><span class="chip">{esc(place)}</span>'
        f"<span class=\"chip\">Admitted in {esc(p['stateName'])} {esc(p['admittedYear'])}</span><span class=\"chip\">{esc(p['status'])} license</span></div>"
        f"</div></section><div class=\"grid\"><div>{about_html(p, fn)}{license_html(p)}{disc}"
        f'<p class="small" style="margin-top:12px">Are you {esc(fn)} and want this listing taken down? <a href="{removal_href(path)}">Request removal</a></p></div>'
        f'<aside><div class="card claim"><h2>{esc(fn)}, is this your profile?</h2><p class="lead">Help local business owners find you.</p>'
        f"<p class=\"small\">Claim your free profile to show small business owners in {where} what legal services you offer, how you work, and how to contact you.</p><ul>"
        f"<li>Describe the services you offer.</li><li>Add your photo and background.</li><li>Share your phone number and website.</li></ul>"
        f'<a class="btn pink" href="{claim_href(path)}">Claim my free profile</a>'
        f'<p class="small promise">Free for life. Never pay for your standard listing.</p>'
        f'<p class="small">Optional sponsored placements may be offered in the future.</p>'
        f'<p class="small"><a href="/free-listing-promise/">Our free listing promise</a></p></div>'
        f'<div class="card"><h2>Need a lawyer for your business?</h2><p class="small">Browse attorney profiles, review the services they offer, and choose whom to contact.</p>'
        f'<a class="btn out" href="/find-lawyer/">Explore attorney profiles</a>'
        f'<p class="small" style="margin-top:10px"><a href="{city_href}">More attorneys in {esc(crumb)}</a></p>'
        f'<p class="small" style="margin-top:6px"><a href="{correction_href(path)}">Suggest a correction</a></p></div></aside></div>'
        f'<div class="sticky"><a class="btn pink" href="{join_href(p)}">Claim this free profile</a></div></main></div>'
    )
    return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        f"<title>{esc(title)}</title><meta name=\"description\" content=\"{esc(desc)}\">"
        f"<link rel=\"canonical\" href=\"{esc(url)}\">"
        f"<meta property=\"og:title\" content=\"{esc(title)}\">"
        f"<meta property=\"og:description\" content=\"{esc(desc)}\">"
        f"<meta property=\"og:url\" content=\"{esc(url)}\">"
        "<meta property=\"og:type\" content=\"profile\">"
        "<link rel=\"stylesheet\" href=\"/css/attorney-profile.css\">"
        f"<script async src=\"https://www.googletagmanager.com/gtag/js?id={GA}\"></script>"
        "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var lgc={};try{lgc=JSON.parse(localStorage.getItem('legalgrads-consent')||'{}')||{}}catch(e){}gtag('consent','default',{analytics_storage:lgc.analytics?'granted':'denied',ad_storage:lgc.marketing?'granted':'denied',ad_user_data:lgc.marketing?'granted':'denied',ad_personalization:lgc.marketing?'granted':'denied'});gtag('js',new Date());"
        f"gtag('config','{GA}');</script>"
        f'<script type="application/ld+json">{json_ld(p)}</script></head><body>{body}'
        '<script src="/js/owner-edits.js" defer></script></body></html>'
    )


def load_profiles():
    profiles = []
    redirects = {}
    hubs = {}
    for name in ("unclaimed-ca.json", "unclaimed-added.json"):
        for raw in json.loads((ROOT / "src/data" / name).read_text(encoding="utf-8")):
            if is_suppressed(raw):
                continue
            profile, redirect = present_profile(dict(raw))
            profiles.append(profile)
            if redirect:
                old, new, hub_old, hub_new = redirect
                redirects[old] = new
                hubs[hub_old] = hub_new
    return profiles, redirects, hubs


def redirect_html(target):
    url = SITE + target
    return (
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
        f'<link rel="canonical" href="{esc(url)}">'
        f'<meta http-equiv="refresh" content="0;url={esc(target)}">'
        f'<script>location.replace("{esc(target)}")</script>'
        f'<title>Moved</title></head><body><p><a href="{esc(target)}">This page has moved.</a></p></body></html>'
    )


def write_redirect(old, new):
    if old == new:
        return
    folder = OUT / old.strip("/")
    index = folder / "index.html"
    if index.exists():
        return
    folder.mkdir(parents=True, exist_ok=True)
    index.write_text(redirect_html(new), encoding="utf-8")


def main():
    if not OUT.is_dir():
        raise SystemExit("out/ is missing. Run next build first.")
    css = CSS_SRC.read_text(encoding="utf-8")
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css).strip()
    CSS_OUT.parent.mkdir(parents=True, exist_ok=True)
    CSS_OUT.write_text(css, encoding="utf-8")
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()
    if supabase_url.startswith("https://") and supabase_key and "sb_secret_" not in supabase_key:
        (OUT / "js").mkdir(parents=True, exist_ok=True)
        (OUT / "js" / "supabase-public.js").write_text(
            "window.LEGALGRADS_SUPABASE=" + json.dumps({"url": supabase_url, "key": supabase_key}) + ";\n",
            encoding="utf-8",
        )
    profiles, redirects, hubs = load_profiles()
    total = 0
    sample = None
    for p in profiles:
        html_text = page_html(p)
        assert_claim_links(html_text, profile_path(p), p)
        dest = OUT / "attorneys" / p["state"] / p["city"] / p["slug"] / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        data = html_text.encode("utf-8")
        dest.write_bytes(data)
        total += len(data)
        if p.get("barNumber") == "354200" and p.get("stateCode") == "CA":
            sample = html_text
    if sample is None or "Oct 27, 2026" not in sample or "License (from the State Bar)" not in sample:
        raise SystemExit("Existing California page text did not match")
    if "License (from the regulator)" in sample or "Search the state bar." in sample:
        raise SystemExit("Existing California page picked up new-state license wording")
    for old, new in {**redirects, **hubs}.items():
        write_redirect(old, new)
    parts = sorted(OUT.joinpath("sitemap").glob("*.xml"))
    if parts and not (OUT / "sitemap.xml").exists():
        body = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
                "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"]
        for part in parts:
            body.append(f"<sitemap><loc>{SITE}/sitemap/{part.name}</loc></sitemap>")
        body.append("</sitemapindex>")
        (OUT / "sitemap.xml").write_text("\n".join(body) + "\n", encoding="utf-8")
    print(f"profiles {len(profiles)} bytes {total} avg {total / len(profiles):.0f}")


if __name__ == "__main__":
    main()
