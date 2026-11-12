"""Shared LegalGrads header, footer, and icons for the static attorney pages.

The Next.js pages get the same header from src/components/Chrome.tsx. Static profile
pages are plain HTML, so this file mirrors that header with links that work without JS.
"""

import json
from pathlib import Path

HEADER_MARKER = 'data-lg-header="1"'
FOOTER_MARKER = 'data-lg-footer="1"'

def logo(small=False):
    size = 30 if small else 40
    mark = "" if small else f'<img src="/logos/legalgrads_mark.svg" width="{size}" height="{size}" alt="">'
    return f'<span class="lg-logo{" sm" if small else ""}">{mark}<span class="lg-word"><span>Legal</span><span class="lg-grad">Grads</span></span></span>'


NAV_DATA = json.loads((Path(__file__).resolve().parent.parent / "src/data/site-nav.json").read_text(encoding="utf-8"))
NAV = tuple(tuple(item) for item in NAV_DATA["primary"])
MENU_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'


def header_html(claim_href="/claim/"):
    """Same structure and classes as Header in src/components/Chrome.tsx. One nav element serves
    desktop and the phone menu, so links are not duplicated in 55k pages. No password sign in."""
    links = "".join(f'<a href="{h}">{t}</a>' for h, t in NAV)
    return (
        f'<header class="lg-header" {HEADER_MARKER}><div class="lg-container lg-header__inner">'
        f'<a href="/" class="lg-home" aria-label="LegalGrads home">{logo()}</a>'
        f'<button type="button" class="lg-menu-toggle" aria-expanded="false" aria-controls="lg-menu">{MENU_ICON}<span class="lg-sr">Open menu</span></button>'
        f'<div id="lg-menu" class="lg-menu"><nav class="lg-nav" aria-label="Primary">{links}</nav>'
        f'<a class="lg-btn lg-btn--secondary" href="{claim_href}">{NAV_DATA["claimLabel"]}</a></div>'
        "</div></header>"
    )


def footer_html():
    """Navy footer with every current destination (same data as SiteFooter in Chrome.tsx)."""
    groups = "".join(
        f"<div><h2>{title}</h2>" + "".join(f'<a href="{h}">{t}</a>' for h, t in links) + "</div>"
        for title, links in NAV_DATA["footer"]
    )
    return (
        f'<footer class="lg-footer" {FOOTER_MARKER}><div class="lg-container"><div class="lg-footer__grid">'
        f'<div class="lg-footer__about"><a href="/" aria-label="LegalGrads home">{logo(small=True)}</a>'
        '<p><a href="mailto:ryan@legalgrads.com">ryan@legalgrads.com</a></p></div>'
        f'<nav aria-label="Footer" class="lg-footer__links">{groups}</nav></div>'
        f'<p class="lg-footer__copy">{NAV_DATA["copyright"].replace(chr(169), "&copy;")}</p></div></footer>'
    )


ICON_NAMES = (
    "shield", "calendar", "card", "link", "scale", "cap", "building", "info", "person", "layers", "mail", "chart", "idcard", "check",
)
SPRITE = "/icons/profile-icons.svg"


def icon(name):
    """Line icon from the shared sprite (public/icons/profile-icons.svg), so each page stays small."""
    if name not in ICON_NAMES:
        raise ValueError(name)
    return f'<svg class="ic" aria-hidden="true"><use href="{SPRITE}#{name}"/></svg>'
