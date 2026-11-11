#!/usr/bin/env python3
"""Fail if generated attorney HTML is missing the site favicon tags."""
import tempfile
import unittest
from pathlib import Path

from emit_profile_pages import (
    FAVICON_HEAD,
    FAVICON_MARKERS,
    assert_attorney_favicons,
    assert_favicon,
    page_html,
    redirect_html,
)

SAMPLE = {
    "name": "Nadine Barbara Kramer",
    "stateCode": "CA",
    "barNumber": "354279",
    "city": "california",
    "cityName": "California",
    "state": "ca",
    "slug": "nadine-barbara-kramer-354279",
    "stateName": "California",
    "lawSchool": "Foreign Law School",
    "admitted": "Jan 2024",
    "admittedYear": "2024",
    "status": "Active",
    "discipline": "None",
    "lastVerified": "Oct 27, 2026",
    "recordLinkType": "individual_official_profile",
    "officeState": "CA",
    "locationLabel": "",
    "officeZip": "",
    "registryRecordUrl": "https://apps.calbar.ca.gov/attorney/Licensee/Detail/354279",
    "officialLookupUrl": "",
}


class FaviconTests(unittest.TestCase):
    def test_profile_and_redirect_include_site_favicon_tags(self):
        profile = page_html(SAMPLE)
        redirect = redirect_html("/attorneys/ca/california/nadine-barbara-kramer-354279/")
        for html_text, label in ((profile, "/attorneys/ca/california/nadine-barbara-kramer-354279/"), (redirect, "redirect")):
            assert_favicon(html_text, label)
            self.assertIn(FAVICON_HEAD, html_text)
            self.assertTrue(html_text.startswith("<!DOCTYPE html>"))
            for marker in FAVICON_MARKERS:
                self.assertIn(marker, html_text)

    def test_assert_favicon_fails_when_tags_are_missing(self):
        with self.assertRaises(SystemExit):
            assert_favicon("<!DOCTYPE html><html><head></head></html>", "/missing/")

    def test_build_scan_fails_when_a_generated_page_is_missing_favicon(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "attorneys"
            good = root / "ca" / "california" / "ok" / "index.html"
            bad = root / "ny" / "new-york" / "missing" / "index.html"
            good.parent.mkdir(parents=True)
            bad.parent.mkdir(parents=True)
            good.write_text("<head>" + FAVICON_HEAD + "</head>", encoding="utf-8")
            bad.write_text("<head><title>No icon</title></head>", encoding="utf-8")
            with self.assertRaises(SystemExit) as raised:
                assert_attorney_favicons(root)
            self.assertIn("missing favicon tags", str(raised.exception))

    def test_build_scan_passes_when_every_page_has_favicon(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "attorneys"
            page = root / "ca" / "index.html"
            page.parent.mkdir(parents=True)
            # Next.js hub pages close void tags with />. The scan must accept that.
            page.write_text(
                '<link rel="manifest" href="/site.webmanifest"/>'
                '<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>'
                '<link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png"/>'
                '<link rel="icon" href="/icons/icon-512.png" sizes="512x512" type="image/png"/>'
                '<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>',
                encoding="utf-8",
            )
            assert_attorney_favicons(root)


if __name__ == "__main__":
    unittest.main()
