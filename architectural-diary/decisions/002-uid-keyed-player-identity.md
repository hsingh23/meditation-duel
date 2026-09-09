# 002 — Firebase UID as the single player key

- **Date:** 2025-05-17 (commit 615f763)
- **Status:** accepted

## Context

The initial commit used two identifiers for players: friendly slugs
(`'harsh'` / `'arta'`) on `User.id`, and Firebase auth UIDs in `USER_IDS`.
Entries were saved with `userId: currentUser.id` (the slug) while stat lookups
filtered by UID — so saved data and computed stats never matched, and the
leaderboard showed zeros no matter what was logged. The first version of the
Firestore rules also hardcoded both UIDs in the write condition.

## Decision

Make the Firebase auth UID the only key that touches data:

- Add `uid` to the `User` type; `getUserInfo` now returns it.
- `useMeditation` writes `userId: currentUser.uid` and filters queries, saves,
  and `getEntryForDate` lookups by UID.
- Simplify `firestore.rules` from two hardcoded UID equality checks to a single
  generic condition: `request.auth.uid == request.resource.data.userId` (plus
  field/type validation on the legacy `meditationEntries` collection).

## Consequences

- Stats immediately reflect saved entries; the bug class "two names for the same
  player" is gone from the data path.
- Security rules no longer need updating when players change.
- `User.id` survives as a display/slug field — but with inconsistent values
  (UID in `getUserInfo`, slug in `useMeditation`), which later bites the
  "Your Progress" lookup on the Log page (see `AGENTS.md` gotchas).
