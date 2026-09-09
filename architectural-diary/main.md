# Architectural Diary — meditation-duel

Chronological narrative of how this app was built, reconstructed from the git
history (post-rewrite hashes) and the code. All four commits landed on
2025-05-17; the app was built in one session, most likely with Bolt scaffolding
(`.bolt/` template files are present in the initial commit).

## Commit 1 — 2a6fe41: the foundation

The initial commit (34 files, ~6.6k lines) bootstraps everything from a
Vite + React + TypeScript template: Firebase Auth with a Google popup gated to a
two-player allow-list, Firestore persistence, the `useAuth` / `useMeditation`
hooks, Leaderboard and Log Meditation pages, shared UI components (Button, Card,
Header, Layout, DateSelector, LeaderboardCard, LogMeditationForm), date/stats
helpers, TypeScript types, Tailwind, ESLint, and Firestore security rules.

At this stage entries were stored as individual documents in a
`meditationEntries` collection, and player identity was handled with internal
`'harsh'` / `'arta'` ids.

- Decisions: [001-two-player-allowlist-auth](decisions/001-two-player-allowlist-auth.md)

## Commit 2 — 615f763: the identity fix

The first follow-up fixed a real bug rather than adding features: entries were
saved with `currentUser.id` (the slug), while stats were computed against
Firebase UIDs from `USER_IDS`, so per-user numbers never matched what was saved.
The fix threads the auth UID through the `User` type, `getUserInfo`, and every
query/filter in `useMeditation`, and replaces two hardcoded UID checks in
`firestore.rules` with a generic owner check. From here on, the Firebase UID is
the single key for player data.

- Decisions: [002-uid-keyed-player-identity](decisions/002-uid-keyed-player-identity.md)

## Commit 3 — 3bd9884: calendars and the storage migration

The biggest change. Two new views — `CalendarView` (navigable month grid of the
player's own entries) and `MiniCalendarView` (last 7 days with per-day
head-to-head results against the opponent) — plus a simplified inline
"log today" form on the Leaderboard. Under the hood, per-entry documents were
replaced by a single `meditationLogsByYear/{year}` document mapping
`uid -> dayOfYear -> hours`, with optimistic UI updates and a dedicated
`saving` state. This is the commit that turned a tracker into a duel: the mini
calendar's yellow "won the day" cells encode the competitive core.

- Decisions: [003-yearly-log-document](decisions/003-yearly-log-document.md)

## Commit 4 — 2f4867f: loading that doesn't get in the way

The finishing pass. A reusable indeterminate `ProgressBar` (thin animated
indigo strip, fixed top or bottom) shows during loads and saves; the blocking
full-screen spinner is kept only for the very first load. The inline log form
now receives `isSaving` (the save-specific flag) instead of the page-wide
`loading`. Most of the diff is re-indentation from wrapping the page in a
fragment to host the two progress bars.

- Decisions: [004-non-blocking-loading-ui](decisions/004-non-blocking-loading-ui.md)

## Where it stands

The app is feature-complete for its two players. Known loose ends (documented in
`AGENTS.md`): "Overall" stats only cover the current year, the yearly-doc
read-modify-write has a last-writer-wins race, Firestore rules permit any
authenticated user to write the yearly log, and `User.id` still has inconsistent
semantics in one lookup path on the Log page.
