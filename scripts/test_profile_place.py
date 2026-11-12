#!/usr/bin/env python3
"""Unknown office cities read "Licensed in <State>", real cities stay, and the page checks fire."""
import unittest

from emit_profile_pages import assert_chrome, assert_place, page_html, where_line
from places import city_unknown, display_city

BASE = {
    "name": "Nadine Barbara Kramer", "stateCode": "CA", "barNumber": "354279", "city": "california",
    "cityName": "California", "state": "ca", "slug": "nadine-barbara-kramer-354279", "stateName": "California",
    "lawSchool": "Foreign Law School", "admitted": "Jan 2024", "admittedYear": "2024", "status": "Active",
    "discipline": "See State Bar profile", "lastVerified": "Oct 27, 2026",
}


class PlaceTest(unittest.TestCase):
    def test_state_named_city_is_unknown(self):
        self.assertTrue(city_unknown(BASE))
        self.assertEqual(where_line(BASE), "Licensed in California")
        html = page_html(BASE)
        self.assertNotIn("California, CA", html)
        self.assertNotIn("Foreign Law School<", html)
        assert_place(html, "/x/", BASE)
        assert_chrome(html, "/x/")

    def test_real_cities_stay(self):
        self.assertFalse(city_unknown({**BASE, "city": "escondido", "cityName": "Escondido"}))
        self.assertFalse(city_unknown({**BASE, "stateCode": "NY", "stateName": "New York", "city": "new-york", "cityName": "New York"}))
        self.assertFalse(city_unknown({**BASE, "stateCode": "VA", "stateName": "Virginia", "city": "washington-dc", "cityName": "Washington", "officeState": "DC"}))

    def test_office_state_name_is_unknown(self):
        self.assertTrue(city_unknown({**BASE, "city": "kansas", "cityName": "Kansas", "officeState": "KS", "locationLabel": "Kansas, KS"}))

    def test_display_city(self):
        self.assertEqual(display_city("Columbus, Ohio"), "Columbus")
        self.assertEqual(display_city("Escondido"), "Escondido")

    def test_check_fires(self):
        bad = page_html({**BASE, "city": "escondido", "cityName": "Escondido"}).replace("Escondido, CA", "California, CA")
        with self.assertRaises(SystemExit):
            assert_place(bad, "/x/", BASE)
        with self.assertRaises(SystemExit):
            assert_chrome("<html></html>", "/x/")


if __name__ == "__main__":
    unittest.main()
