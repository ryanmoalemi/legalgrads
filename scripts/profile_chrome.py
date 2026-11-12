"""Shared LegalGrads header, footer, and icons for the static attorney pages.

The Next.js pages get the same header from src/components/Chrome.tsx. Static profile
pages are plain HTML, so this file mirrors that header with links that work without JS.
"""

HEADER_MARKER = 'data-lg-header="1"'
FOOTER_MARKER = 'data-lg-footer="1"'

def logo(small=False):
    size = 30 if small else 40
    mark = f'<img src="/logos/legalgrads_mark.svg" width="{size}" height="{size}" alt="">'
    return f'<span class="lg-logo{" sm" if small else ""}">{mark}<span class="lg-word"><span>Legal</span><span class="lg-grad">Grads</span></span></span>'


NAV = (("/find-lawyer/", "Find an attorney"), ("/how-it-works/", "How it works"), ("/for-attorneys/", "For attorneys"))


def header_html():
    links = "".join(f'<a href="{h}">{t}</a>' for h, t in NAV)
    return (
        f'<header class="lg-head" {HEADER_MARKER}><div class="lg-head-in">'
        f'<a href="/" class="lg-home" aria-label="LegalGrads home">{logo()}</a>'
        f'<nav class="lg-nav" aria-label="Primary">{links}</nav>'
        '<div class="lg-right"><a class="lg-signin" href="/attorney/login/">Sign in</a>'
        '<a class="lg-cta" href="/find-lawyer/">Find an attorney</a></div>'
        '<details class="lg-menu"><summary aria-label="Menu"><svg width="24" height="18" viewBox="0 0 26 20" aria-hidden="true">'
        '<path d="M1 2h24M1 10h24M1 18h24" stroke="#0B0B3B" stroke-width="2.4" stroke-linecap="round"/></svg></summary>'
        f'<nav aria-label="Mobile">{links}<a href="/attorney/login/">Sign in</a><a class="lg-cta" href="/find-lawyer/">Find an attorney</a></nav></details>'
        "</div></header>"
    )


def footer_html(removal, correction):
    return (
        f'<footer class="lg-foot" {FOOTER_MARKER}><div class="lg-foot-in">'
        f'<a href="/" aria-label="LegalGrads home">{logo(small=True)}</a>'
        '<nav aria-label="Footer"><a href="/directory-disclosure/">Public records</a>'
        f'<a href="{correction}">Suggest a correction</a><a href="{removal}">Request removal</a>'
        '<a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></div>'
        '<p class="lg-copy">&copy; 2026 LegalGrads. Not a law firm and not a lawyer referral service.</p></footer>'
    )


ICON_NAMES = (
    "shield", "calendar", "card", "link", "scale", "cap", "building", "info", "person", "layers", "mail", "chart", "idcard", "check",
)
SPRITE = "/icons/profile-icons.svg"


def icon(name):
    """Line icon from the shared sprite (public/icons/profile-icons.svg), so each page stays small."""
    if name not in ICON_NAMES:
        raise ValueError(name)
    return f'<svg class="ic ic-{name}" width="22" height="22" aria-hidden="true"><use href="{SPRITE}#{name}"/></svg>'
