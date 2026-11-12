# Directory geography (live review priority 2)

`scripts/build_places.py` runs first in `npm run build` and writes `src/data/place-index.json`.
Both the Next pages (`placeOf()` in `src/lib/profiles.ts`) and the static profile emitter
(`place_of()` in `scripts/places.py`) read it, so hubs, breadcrumbs, profile office lines,
JSON-LD, the search data and the bar lookup all agree.

## What never changes
- Source fields on each record (`cityName`, `officeZip`, `officeState`, `locationLabel`) stay as published.
- Profile URLs do not move. A profile at `/attorneys/ca/denver/amy-r-lopez-362554/` stays there; only its
  breadcrumb and "More attorneys in" link point to the normalized group (`/attorneys/ca/denver-co/`).
- Identity is the licensing state plus bar number (`state|barNumber`).

## Rules
1. **Office state** comes from the record's `officeState`, else its ZIP. It is never guessed from a city name.
2. **Spelling variants** merge into a bigger city within two letters only when the record's ZIP is already
   used by at least two records of that city (Los Angles 90012 becomes Los Angeles; Los Angles 92108 does not).
3. **State code in the city field** ("Ca 91505") takes the city that ZIP is published with, when at least
   3 records agree at 80% or more. Other free text with digits ("Calgary Ab T2t3j") is unknown.
4. **Address conflicts** go to unknown: a misspelled big city at a ZIP that clearly belongs elsewhere, or a
   name that is rare here but common in another state at a ZIP that does not exist or belongs to another city
   (Houston with a Palo Alto ZIP, Denver with the nonexistent ZIP 90203).
5. **ALL CAPS or lowercase** city names read in title case.
6. **One unknown-location group per state** ("Office location not listed"), using the state's existing
   largest unknown slug (CA keeps `/attorneys/ca/california/`).
7. Offices outside the licensing state are grouped as `city-st` (`/attorneys/ca/denver-co/`, "Denver, CO").

## Redirects
Hubs whose records all moved get a static redirect to where most of them went (`hub_redirects()` in
`scripts/emit_profile_pages.py`), including old `/page/{n}/` URLs. Examples: `/attorneys/ca/los-angelews/` to
`/attorneys/ca/los-angeles/`, `/attorneys/ca/ca-91505/` to `/attorneys/ca/burbank/`, `/attorneys/ca/kansas/`
to `/attorneys/ca/california/`, `/attorneys/ca/houston/` to `/attorneys/ca/houston-tx/`.
The sitemap lists only current hubs.
