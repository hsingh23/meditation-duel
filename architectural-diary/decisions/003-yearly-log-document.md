# 003 — One yearly document instead of per-entry documents

- **Date:** 2025-05-17 (commit 3bd9884)
- **Status:** accepted

## Context

The original storage model wrote one Firestore document per meditation entry
(`meditationEntries`). Two players logging daily produce ~730 tiny documents a
year, and rendering any calendar view required querying and re-filtering them
all. The new calendar and mini-calendar views needed cheap access to "every day
of the current year for both players".

## Decision

Collapse storage into a single document per year:

```
meditationLogsByYear/{year}  =  { [playerUid]: { [dayOfYear 1-366]: hoursFloat } }
```

- `fetchEntries` does one `getDoc` and expands the map into a flat
  `MeditationEntry[]` in memory (`totalMinutes = hours * 60`,
  `id = year-uid-dayOfYear`).
- `saveEntry(date, hours, minutes)` converts the date to day-of-year, applies an
  **optimistic update** to local `entries`/`users` state, then
  read-modify-write of the yearly doc via `setDoc(..., { merge: true })`,
  followed by a refetch for consistency (and again on error, as rollback).
- A new `YearlyMeditationLog` type models the shape; `MeditationFormData`
  (hours/minutes split) models the form.
- Firestore rules for the new collection are intentionally loose:
  `allow write: if request.auth != null` ("simplified for now") — no per-player
  field enforcement.

## Consequences

- One document read per app load regardless of how many days are logged; saving
  a day overwrites exactly that day's value (logging 0 0 clears it).
- Day-granularity only: no sessions, notes, or multiple entries per day — a
  deliberate product simplification ("how long did you meditate today").
- Hours stored as floats; minutes are derived (`h * 60 + m`).
- Read-modify-write of the whole doc can lose a concurrent opponent save
  (last-writer-wins on their disjoint subfields is actually preserved by merge
  at the top level only because each write merges `{ [uid]: {...} }` — nested
  days of the *other* player are preserved, but two rapid saves by the same
  player race). Accepted for two users.
- The legacy `meditationEntries` rules block remains in `firestore.rules`
  although nothing writes that collection anymore.
