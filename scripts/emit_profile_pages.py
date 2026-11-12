#!/usr/bin/env python3
"""Write plain profile HTML into out/ after next build.

Next does not statically render these routes. Each file is minified HTML with
the same visible listing text, SEO tags, GA tag, and JSON-LD as the React
template. Shared CSS is one file. No per-page RSC payload is written.
"""
import html
import collections
import json
import os
import re
from pathlib import Path
from urllib.parse import quote

from places import display_city, place_of, place_unknown, present_profile
city_unknown = place_unknown  # every page check below uses the normalized directory place
from profile_chrome import FOOTER_MARKER, HEADER_MARKER, footer_html, header_html, icon
from suppression import is_suppressed

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
CSS_SRC = ROOT / "src/app/(site)/attorneys/profile-template.css"
SYSTEM_CSS_SRC = ROOT / "src/styles/lg-system.css"
CHROME_CSS_SRC = ROOT / "src/app/(site)/attorneys/static-chrome.css"
FONT_DIR = ROOT / "node_modules/@fontsource"
FONTS = (
    ("plus-jakarta-sans", "Plus Jakarta Sans", (700, 800)),
    ("inter", "Inter", (400, 600)),
)
CSS_OUT = OUT / "css/attorney-profile.css"
SITE = "https://legalgrads.com"
GA = "G-CHX0PZJH8W"

# Same favicon tags the Next.js root layout emits for the rest of the site.
FAVICON_HEAD = (
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">'
    '<link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png">'
    '<link rel="icon" href="/icons/icon-512.png" sizes="512x512" type="image/png">'
    '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'
    '<link rel="manifest" href="/site.webmanifest">'
)
FAVICON_MARKERS = (
    'href="/favicon.svg"',
    'href="/icons/icon-192.png"',
    'href="/icons/icon-512.png"',
    'rel="apple-touch-icon"',
    'href="/icons/apple-touch-icon.png"',
    'rel="manifest"',
    'href="/site.webmanifest"',
)


def esc(value):
    return html.escape(str(value), quote=True)


def claim_href(path):
    return "/claim/?profile=" + quote(path, safe="")


def join_href(profile):
    return f"/join/?state={quote(profile['stateCode'])}&bar={quote(profile['barNumber'])}"


def removal_href(path):
    return "/data-deletion/?profile=" + quote(path, safe="")


def promise_href(path):
    return "/free-listing-promise/?profile=" + quote(path, safe="")


def assert_favicon(html_text, path):
    for marker in FAVICON_MARKERS:
        if marker not in html_text:
            raise SystemExit(f"Favicon tag missing on {path}: {marker}")


def assert_chrome(html_text, path):
    if HEADER_MARKER not in html_text or 'aria-label="LegalGrads home"' not in html_text:
        raise SystemExit(f"Site header missing on {path}")
    if FOOTER_MARKER not in html_text:
        raise SystemExit(f"Site footer missing on {path}")


def assert_place(html_text, path, profile):
    """Fail when a city that equals the state name ("California, CA") reaches the page."""
    state = profile["stateName"]
    code = profile["stateCode"]
    if city_unknown(profile):
        for bad in (f"{state}, {code}", f"in {state}, {code}", f"&gt; {state} &gt;"):
            if bad in html_text:
                raise SystemExit(f"Unknown city shown as a place on {path}: {bad}")
        if f"Licensed in {esc(state)}" not in html_text:
            raise SystemExit(f"Licensed in {state} missing on {path}")
    if "Foreign Law School</" in html_text:
        raise SystemExit(f"Raw Foreign Law School field on {path}")


def assert_claim_links(html_text, path, profile):
    href = claim_href(path)
    assert_favicon(html_text, path)
    assert_chrome(html_text, path)
    assert_place(html_text, path, profile)
    removal = removal_href(path)
    if f'href="{href}"' not in html_text:
        raise SystemExit(f"Claim buttons missing on {path}")
    if f'href="{removal}"' not in html_text:
        raise SystemExit(f"Removal link missing on {path}")
    if "mailed to your State Bar" in html_text or "\u2014" in html_text or "\u2013" in html_text:
        raise SystemExit(f"Bad copy on {path}")
    if "/js/owner-edits.js" not in html_text:
        raise SystemExit(f"Owner script missing on {path}")
    for needed in (
        "s this your profile?", "Make this profile", "Free for life. Your standard listing stays free.",
        f'href="{promise_href(path)}"', "About this profile", "License details", 'id="example-slot"',
        "See your profile views and contact activity.",
    ):
        if needed not in html_text:
            raise SystemExit(f"Claim copy missing on {path}: {needed}")
    for banned in ("/attorney/login/", ">Sign in<", "Identity verification", 'class="sticky"', "What we know", "Founding Member", "separate from claiming", "physical letter", "Ask about fees", ">Profile claimed<", "\U0001f389", "\U0001f393"):
        if banned in html_text:
            raise SystemExit(f"Old copy left on {path}: {banned}")


def calbar(bar):
    return f"https://apps.calbar.ca.gov/attorney/Licensee/Detail/{bar}"


def place_label(p):
    """Visible office place. Unknown cities never print as "California, CA"."""
    place = place_of(p)
    if place["kind"] in ("U", "I"):
        return ""
    return f"{place['name']}, {place['region'] or p['stateCode']}"


def where_line(p):
    place = place_label(p)
    licensed = f"Licensed in {p['stateName']}"
    return f"{licensed} · {place}" if place else licensed


def crumb_label(p):
    place = place_of(p)
    if place["kind"] == "O":
        return f"{place['name']}, {place['region']}"
    return place["name"]


def hub_path(p):
    return f"/attorneys/{p['state']}/{place_of(p)['hub']}/"


def profile_path(p):
    return f"/attorneys/{p['state']}/{p['city']}/{p['slug']}/"


def individual(p):
    return p.get("recordLinkType") in ("individual_official_profile", "individual_official_data_record")


SEARCH_LABEL = "Search official records"


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
    where = place_label(p) or p["stateName"]
    return f"{p['name']}, Attorney in {where} | LegalGrads"


def seo_description(p):
    school = f" ({p['lawSchool']})" if p.get("lawSchool") and p["lawSchool"] != "Not listed" else ""
    ca_in = (
        p.get("stateCode") == "CA"
        and p.get("recordLinkType") == "individual_official_profile"
        and (not p.get("officeState") or p.get("officeState") == "CA")
    )
    if (not p.get("recordLinkType") or ca_in) and p.get("officeState") and p.get("officeState") != p.get("stateCode") and not city_unknown(p):
        return f"{p['name']} is licensed in {p['stateName']} and was admitted in {p['admitted']}{school}. Office: {place_label(p)}. License #{p['barNumber']} from State Bar records."
    if (not p.get("recordLinkType") or ca_in) and city_unknown(p):
        return f"{p['name']} is an attorney licensed in {p['stateName']}, admitted in {p['admitted']}{school}. License #{p['barNumber']} from State Bar records."
    if not p.get("recordLinkType") or ca_in:
        return f"{p['name']} is a {place_of(p)['name']}, {p['stateCode']} attorney admitted in {p['admitted']}{school}. License #{p['barNumber']} from State Bar records."
    authority = p.get("sourceAuthority") or f"{p['stateName']} licensing authority"
    if city_unknown(p):
        return f"{p['name']} is licensed in {p['stateName']} and was admitted in {p['admitted']}{school}. No office city was published. License #{p['barNumber']} from {authority} records."
    return f"{p['name']} is licensed in {p['stateName']} and was admitted in {p['admitted']}{school}. Office: {place_label(p)}. License #{p['barNumber']} from {authority} records."


def real_school(p):
    return bool(p.get("lawSchool")) and p["lawSchool"] not in ("Not listed", "Foreign Law School")


def school_label(p):
    school = p.get("lawSchool") or ""
    if school == "Foreign Law School":
        return "Outside the U.S. (per State Bar record)"
    if not school or school == "Not listed":
        return "Not listed on the record"
    return school


def json_ld(p):
    url = SITE + profile_path(p)
    if not p.get("recordLinkType"):
        address = {"@type": "PostalAddress", "addressRegion": place_of(p)["region"] or p.get("officeState") or p["stateCode"], "addressCountry": "US"}
        if not city_unknown(p):
            address["addressLocality"] = place_of(p)["name"]
        if p.get("officeZip"):
            address["postalCode"] = p["officeZip"]
        person = {
            "@type": "Person", "@id": f"{url}#p", "name": p["name"], "jobTitle": "Attorney", "url": url,
            "address": address,
            "hasCredential": {
                "@type": "EducationalOccupationalCredential", "credentialCategory": "license",
                "name": f"State Bar of {p['stateName']} license #{p['barNumber']}",
                "recognizedBy": {"@type": "Organization", "name": f"The State Bar of {p['stateName']}"},
                "url": calbar(p["barNumber"]),
            },
        }
        if real_school(p):
            person["alumniOf"] = {"@type": "CollegeOrUniversity", "name": p["lawSchool"]}
    else:
        address = {"@type": "PostalAddress", "addressCountry": "US"}
        if not city_unknown(p):
            address["addressLocality"] = place_of(p)["name"]
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
        if real_school(p):
            person["alumniOf"] = {"@type": "CollegeOrUniversity", "name": p["lawSchool"]}
        person["hasCredential"] = credential
    graph = [
        person,
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": p["stateName"], "item": f"{SITE}/attorneys/{p['state']}/"},
                {"@type": "ListItem", "position": 3, "name": crumb_label(p), "item": f"{SITE}{hub_path(p)}"},
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


def license_parts(p):
    """Heading-free license facts: who issued it, the check line, and the official link."""
    href = official_href(p)
    if not p.get("recordLinkType"):
        verified_from = f"State Bar of {p['stateName']}"
        check = "View official State Bar record"
        who_label, who = "State bar", f"State Bar of {p['stateName']}"
        bar_label = f"{p['stateName']} Bar Number"
        bar_value = f"{p['stateCode']} Bar #{p['barNumber']}"
    else:
        authority = p.get("sourceAuthority") or p["stateName"]
        ca = p.get("stateCode") == "CA" and p.get("recordLinkType") == "individual_official_profile"
        who_label, who = "Regulator", authority
        verified_from = f"State Bar of {p['stateName']}" if ca else authority
        bar_label = f"{p['stateName']} Bar Number" if ca else "License number"
        bar_value = f"{p['stateCode']} Bar #{p['barNumber']}" if ca else f"#{p['barNumber']}"
        if not p.get("registryRecordUrl"):
            check = SEARCH_LABEL
        elif ca:
            check = "View official State Bar record"
        else:
            label = link_label(p)
            check = {"official profile": "View official record", "official record": "View official record"}.get(label, SEARCH_LABEL)
    return href, verified_from, check, who_label, who, bar_label, bar_value


def row(name, label, value, value_attrs=""):
    return f'<li>{icon(name)}<span class="k">{label}</span><span class="v"{value_attrs}>{value}</span></li>'


def license_html(p):
    href, verified_from, check, who_label, who, bar_label, bar_value = license_parts(p)
    status_cls = "v ok" if p.get("status") == "Active" else "v"
    status_value = f"{esc(p['status'])} <small>Status checked {esc(p['lastVerified'])}</small>"
    rows = [
        f'<li>{icon("shield")}<span class="k">License status</span><span class="{status_cls}">{status_value}</span></li>',
        row("calendar", f"Admitted in {esc(p['stateName'])}", esc(p["admitted"])),
        row("card", esc(bar_label), esc(bar_value)),
    ]
    if p.get("recordLinkType"):
        rows.append(row("building", who_label, esc(who)))
    rows.append(row("scale", "Public discipline", esc(p["discipline"])))
    school = school_label(p)
    note = ' <small>The attorney can add the school name after claiming.</small>' if p.get("lawSchool") == "Foreign Law School" else ""
    rows.append(row("cap", "Law school", esc(school) + note))
    source, link, shared = record_source(p)
    if href:
        rows.append(row("link", "Official record", ext(href, check + " \u2197") + (f"<small>{esc(shared.strip(' ()'))}</small>" if shared else "")))
    return (
        f'<h3 class="lic-h">License details</h3><ul class="lic">{"".join(rows)}</ul>'
        f'<p class="verified">License status checked {esc(p["lastVerified"])} from {esc(verified_from)} records.</p>'
    )


def record_source(p):
    """Where the public record came from (plain text), the link, and a shared-roster note."""
    href = official_href(p)
    if legacy_copy(p):
        link_href = calbar(p["barNumber"]) if not p.get("recordLinkType") else href
        return "public State Bar records", link_href, ""
    authority = p.get("sourceAuthority") or p["stateName"]
    if not p.get("registryRecordUrl"):
        return f"public {authority} records", p.get("officialLookupUrl") or "", ""
    if p.get("recordLinkType") == "shared_official_roster_page":
        return f"a public roster published by {authority}", href, " (shared roster, not an individual record)"
    return f"public {authority} records", href, ""


def about_html(p, fn):
    source, _link, _note = record_source(p)
    return (
        f'<div class="card about"><h2>About this profile</h2>'
        f'<p class="info">{icon("info")}<span id="about-claim">This profile was created from {esc(source)}. {esc(p["name"])} has not yet confirmed services, fees or availability on LegalGrads.</span></p>'
        f'<ul class="facts"></ul>{license_html(p)}</div>'
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


def steps_html():
    """How claiming works. Adds what the claim card does not say: how control is confirmed and that
    the license status is a separate, dated check (handoff correction 2: no generic "Identity verification")."""
    items = (
        ("Confirm it is you", "We email a one-time code, normally to the address on your official licensing record. Another address goes to manual review first."),
        ("Add your details", "Photo, services, fees and contact options appear only after you add them."),
        ("License status stays separate", "It comes from the official record, with the date we last checked it. Claiming does not change it."),
    )
    lis = "".join(f"<li><b>{t}</b><span>{d}</span></li>" for t, d in items)
    return (
        '<section class="steps" id="claim-benefits" aria-labelledby="steps-h">'
        f'<h2 id="steps-h">How claiming works</h2><ol>{lis}</ol></section>'
    )


# The example profile is the same on every page, so public/js/owner-edits.js draws it into
# this slot. That keeps 55k pages small and keeps the sample out of each page's indexed text.
EXAMPLE_SLOT = '<div id="example-slot" data-example="1"></div>'


def greeting(p):
    """"Nadine, is this your profile?" Falls back when the first word is an initial or not a given name."""
    first = p["name"].split(" ")[0]
    if len(first.rstrip(".")) < 2 or first.endswith(".") or not first[:1].isalpha():
        return "Is this your profile?"
    return f"{first}, is this your profile?"


def office_line(p):
    if city_unknown(p):
        return "Office location not listed."
    return f"Office: {place_label(p)}"


def page_html(p):
    path = profile_path(p)
    url = SITE + path
    title = seo_title(p)
    desc = seo_description(p)
    fn = p["name"].split(" ")[0]
    initials = "".join(w[0] for w in p["name"].split(" ") if w)[:2].upper()
    crumb = crumb_label(p)
    disc = LEGACY_DISC if legacy_copy(p) else NEUTRAL_DISC
    city_href = hub_path(p)
    state_href = f"/attorneys/{p['state']}/"
    bar_value = license_parts(p)[-1]
    more_label = f"More attorneys licensed in {esc(p['stateName'])}" if city_unknown(p) else f"More attorneys in {esc(crumb)}"
    claim_items = (
        ("person", "Add your photo and background"),
        ("layers", "Describe your services and fees"),
        ("mail", "Choose how clients contact you"),
        ("chart", "See your profile views and contact activity."),
    )
    ticks = "".join(f"<li>{icon(i)}<span>{t}</span></li>" for i, t in claim_items)
    body = (
        f'{header_html(claim_href(path))}<div class="lgp">'
        f'<section class="band" aria-label="Attorney identity"><div class="band-in">'
        f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="{state_href}">{esc(p["stateName"])}</a> › <a href="{city_href}">{esc(crumb)}</a> › <span>{esc(p["name"])}</span></nav>'
        f'<div class="band-row"><div class="avatar" aria-hidden="true">{esc(initials)}</div>'
        f'<div class="who"><h1>{esc(p["name"])}</h1><p class="where"><span>Licensed in {esc(p["stateName"])}</span></p>'
        f'<p class="office">{esc(office_line(p))}</p></div>'
        f'<div class="meta"><span class="chip solid">Profile not yet claimed</span>'
        f'<p class="barline">{esc(bar_value)} <span aria-hidden="true">|</span> Admitted {esc(p["admitted"])}</p></div></div>'
        f"</div></section>"
        f'<main class="wrap" id="main"><div class="grid">'
        f'<aside aria-label="Claim this profile"><div class="card claim" id="claim"><span class="pill">{esc(greeting(p))}</span>'
        f'<h2>Make this profile <span class="u">yours.</span></h2>'
        f'<p class="lead">Show small business owners what you do and how to contact you.</p>'
        f'<ul class="ticks">{ticks}</ul>'
        f'<a class="btn pink" href="{claim_href(path)}">Claim my free profile</a>'
        f'<p class="promise">Free for life. Your standard listing stays free.</p>'
        f'<p class="small"><a href="{promise_href(path)}">Our free listing promise</a></p>'
        f'<p class="small muted">Optional paid promotion may be offered later.</p></div></aside>'
        f'<div class="about-col">{about_html(p, fn)}</div></div>'
        f"{steps_html()}{EXAMPLE_SLOT}"
        f'<p class="browse">Looking for legal help? <a href="/find-lawyer/">Browse attorneys</a> <span aria-hidden="true">·</span> <a href="{city_href}">{more_label}</a></p>'
        f"{disc}"
        f'<p class="small fixes">Something wrong? <a href="{correction_href(path)}">Suggest a correction</a>. Want this listing taken down? <a href="{removal_href(path)}">Request removal</a></p>'
        f"</main></div>{footer_html()}"
    )
    return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        f"{FAVICON_HEAD}"
        f"<title>{esc(title)}</title><meta name=\"description\" content=\"{esc(desc)}\">"
        f"<link rel=\"canonical\" href=\"{esc(url)}\">"
        f"<meta property=\"og:title\" content=\"{esc(title)}\">"
        f"<meta property=\"og:description\" content=\"{esc(desc)}\">"
        f"<meta property=\"og:url\" content=\"{esc(url)}\">"
        "<meta property=\"og:type\" content=\"profile\">"
        "<link rel=\"stylesheet\" href=\"/css/attorney-profile.css\">"
        "<script>document.documentElement.classList.add('lg-js')</script>"
        f"<script async src=\"https://www.googletagmanager.com/gtag/js?id={GA}\"></script>"
        "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var lgc={};try{lgc=JSON.parse(localStorage.getItem('legalgrads-consent')||'{}')||{}}catch(e){}gtag('consent','default',{analytics_storage:lgc.analytics?'granted':'denied',ad_storage:lgc.marketing?'granted':'denied',ad_user_data:lgc.marketing?'granted':'denied',ad_personalization:lgc.marketing?'granted':'denied'});gtag('js',new Date());"
        f"gtag('config','{GA}');</script>"
        f'<script type="application/ld+json">{json_ld(p)}</script></head><body><a class="lg-skip" href="#main">Skip to content</a>{body}'
        '<script src="/js/site-nav.js" defer></script><script src="/js/owner-edits.js" defer></script></body></html>'
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


CITY_PAGE_SIZE = 100  # same as CITY_PAGE_SIZE in src/components/CityDirectory.tsx


def hub_redirects(profiles):
    """City hubs whose records all moved to another directory group (a merged spelling, an
    out-of-state office, or the single unknown-location group) redirect to where most of them went.
    Profile URLs never change, so only hub and hub-page URLs need this."""
    new_hubs = {(p["state"], place_of(p)["hub"]) for p in profiles}
    moved = collections.defaultdict(collections.Counter)
    for p in profiles:
        moved[(p["state"], p["city"])][place_of(p)["hub"]] += 1
    out = {}
    for (state, old), targets in moved.items():
        if (state, old) in new_hubs:
            continue
        target = targets.most_common(1)[0][0]
        out[f"/attorneys/{state}/{old}/"] = f"/attorneys/{state}/{target}/"
        pages = -(-sum(targets.values()) // CITY_PAGE_SIZE)
        for n in range(2, pages + 1):
            out[f"/attorneys/{state}/{old}/page/{n}/"] = f"/attorneys/{state}/{target}/"
    return out


def write_directory_places(profiles):
    """The search page reads /data/unclaimed-directory.json. Give each row the normalized
    office place ("c") and, for offices outside the licensing state, the office state ("r")."""
    path = OUT / "data" / "unclaimed-directory.json"
    if not path.exists():
        return
    by_path = {profile_path(p): place_of(p) for p in profiles}
    rows = json.loads(path.read_text(encoding="utf-8"))
    for row in rows:
        place = by_path.get(row.get("u"))
        if not place:
            continue
        if place["kind"] == "U":
            row["c"] = "Office unlisted"
        elif place["kind"] in ("L", "O"):
            row["c"] = place["name"]
        if place["kind"] == "O":
            row["r"] = place["region"]
        elif place["kind"] == "I":
            row["r"] = "INTL"
    path.write_text(json.dumps(rows, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")


def redirect_html(target):
    url = SITE + target
    return (
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
        f"{FAVICON_HEAD}"
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


def assert_attorney_favicons(root):
    """Fail the build if any page under /attorneys/ is missing favicon tags."""
    if not root.is_dir():
        raise SystemExit(f"{root} is missing")
    missing = []
    checked = 0
    for path in root.rglob("*.html"):
        text = path.read_text(encoding="utf-8", errors="replace")
        checked += 1
        for marker in FAVICON_MARKERS:
            if marker not in text:
                missing.append(f"{path}: {marker}")
                break
    if checked == 0:
        raise SystemExit(f"No HTML pages found under {root}")
    if missing:
        preview = "\n".join(missing[:10])
        raise SystemExit(f"{len(missing)} generated pages missing favicon tags.\n{preview}")
    print(f"favicon scan ok ({checked} pages)")


def font_css():
    """Self-host the site fonts for the static pages (copied from @fontsource at build time)."""
    rules = []
    for package, family, weights in FONTS:
        for weight in weights:
            name = f"{package}-latin-{weight}-normal.woff2"
            src = FONT_DIR / package / "files" / name
            if not src.is_file():
                continue
            dest = OUT / "fonts" / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(src.read_bytes())
            rules.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;src:url(/fonts/{name}) format('woff2')}}")
    return "".join(rules)


def state_city_strings():
    """"California, CA" style strings. New York, NY is a real city, so it is allowed."""
    names = {}
    for path in (ROOT / "src/data/unclaimed-ca.json", ROOT / "src/data/unclaimed-added.json"):
        for raw in json.loads(path.read_text(encoding="utf-8")):
            if raw.get("stateName") and raw.get("stateCode"):
                names[raw["stateCode"]] = raw["stateName"]
    return [f"{name}, {code}" for code, name in names.items() if code != "NY"]


def scan_attorney_pages(root):
    """Every page under /attorneys/ (profiles and the Next city and state hubs) needs the
    favicon tags and the site header, and never shows a state name as the city."""
    if not root.is_dir():
        raise SystemExit(f"{root} is missing")
    banned = state_city_strings()
    problems = []
    checked = 0
    for page in root.rglob("index.html"):
        text = page.read_text(encoding="utf-8", errors="replace")
        if 'http-equiv="refresh"' in text:
            continue
        checked += 1
        for marker in FAVICON_MARKERS:
            if marker not in text:
                problems.append(f"{page}: favicon {marker}")
                break
        if 'aria-label="LegalGrads home"' not in text:
            problems.append(f"{page}: site header missing")
        for bad in banned:
            if bad in text:
                problems.append(f"{page}: shows {bad}")
                break
    if checked == 0:
        raise SystemExit(f"No HTML pages found under {root}")
    if problems:
        preview = "\n".join(problems[:10])
        raise SystemExit(f"{len(problems)} attorney page problems.\n{preview}")
    print(f"attorney page scan ok ({checked} pages: favicon, header, no state-as-city)")


def main():
    if not OUT.is_dir():
        raise SystemExit("out/ is missing. Run next build first.")
    css = font_css() + SYSTEM_CSS_SRC.read_text(encoding="utf-8") + CHROME_CSS_SRC.read_text(encoding="utf-8") + CSS_SRC.read_text(encoding="utf-8")
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
    if sample is None or "Oct 27, 2026" not in sample or "License details" not in sample or "State Bar of California records" not in sample:
        raise SystemExit("Existing California page text did not match")
    if '<span class="k">Regulator</span>' in sample or SEARCH_LABEL in sample:
        raise SystemExit("Existing California page picked up new-state license wording")
    for old, new in {**redirects, **hubs}.items():
        write_redirect(old, new)
    for old, new in hub_redirects(profiles).items():
        write_redirect(old, new)
    write_directory_places(profiles)
    assert_attorney_favicons(OUT / "attorneys")
    scan_attorney_pages(OUT / "attorneys")
    parts = sorted(OUT.joinpath("sitemap").glob("*.xml"))
    if parts and not (OUT / "sitemap.xml").exists():
        body = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
                "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"]
        for part in parts:
            body.append(f"<sitemap><loc>{SITE}/sitemap/{part.name}</loc></sitemap>")
        body.append("</sitemapindex>")
        (OUT / "sitemap.xml").write_text("\n".join(body) + "\n", encoding="utf-8")
    print(f"profiles {len(profiles)} bytes {total} avg {total / len(profiles):.0f}")
    check_site_size()


# GitHub Pages publishes at most 1 GB. Fail early with headroom so a template change cannot push it over.
SITE_LIMIT_BYTES = int(os.environ.get("LG_SITE_LIMIT_BYTES", "970000000"))


def check_site_size():
    size = 0
    for folder, _dirs, files in os.walk(OUT):
        for name in files:
            size += os.path.getsize(os.path.join(folder, name))
    print(f"site size {size} bytes ({size / 1e9:.3f} GB, limit {SITE_LIMIT_BYTES / 1e9:.2f} GB)")
    if size > SITE_LIMIT_BYTES:
        raise SystemExit(f"out/ is {size / 1e9:.3f} GB, over the {SITE_LIMIT_BYTES / 1e9:.2f} GB budget for GitHub Pages")


if __name__ == "__main__":
    main()
