# 001 — Two-player allow-list authentication

- **Date:** 2025-05-17 (commit 2a6fe41)
- **Status:** accepted

## Context

The app exists for exactly two people. There is no signup flow, no roles, no
multi-tenancy — and the duel UI (leaderboard, head-to-head calendar) assumes the
complete set of players is known up front so both can always be displayed.

## Decision

Use Firebase Auth with a Google popup (`signInWithPopup` + `GoogleAuthProvider`),
and enforce a hardcoded allow-list after authentication rather than using custom
claims or a users collection:

- `src/utils/helpers.ts` — `getUserInfo(email, uid)` maps the two allow-listed
  Gmail addresses to `User` objects (name, color, uid); unknown emails get `null`.
- `src/hooks/useAuth.ts` — `onAuthStateChanged` resolves the user through
  `getUserInfo`; an unrecognized email is force-signed-out with an
  "Unauthorized user" error rendered on the Login screen.
- `src/firebase/config.ts` — exports `USER_IDS` with both players' auth UIDs so
  stats and rules can reference them without another lookup.

The two players are rendered statically in `useMeditation.fetchEntries` (names,
colors, emails, UIDs) rather than fetched from a users collection.

## Consequences

- Zero user-management surface: no invites, profiles, or password flows to build.
- Both players always appear on the leaderboard, even with zero logged time.
- Adding a third player requires code changes in three files (`config.ts`,
  `helpers.ts`, `useMeditation.ts`) — acceptable for a household app.
- Player identity (emails, UIDs) lives in source, so the repo is effectively
  private-by-convention; anyone with the repo knows who the players are.
