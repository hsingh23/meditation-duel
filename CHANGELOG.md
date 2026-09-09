# Changelog

All notable changes to this project are documented here, newest first.

> **History rewrite note (2026-09-08):** commit messages only were improved via a
> messages-only `git filter-branch` rewrite (file trees unchanged). Hashes referenced
> below are the post-rewrite hashes. Two messages were reworded for accuracy; two were
> already adequate and kept verbatim. A local backup of the pre-rewrite history was kept
> on branch `backup/pre-docs-20260908` (not pushed).

## 2025-05-17

### 2f4867f — feat: add non-blocking ProgressBar to Leaderboard loading states

- Add an indeterminate `ProgressBar` component (thin animated indigo strip, fixed at top or bottom) shown while the Leaderboard is loading or saving.
- Reserve the full-screen spinner for the initial load only (when no users are fetched yet); refreshes no longer blank the page.
- Pass the hook's `saving` state to the simplified log form via `isSaving` instead of the page-wide `loading` flag.

### 3bd9884 — feat: Implement Calendar and MiniCalendar views for meditation tracking

- Add `CalendarView` (navigable month grid of the current user's entries) and `MiniCalendarView` (last 7 days with per-day head-to-head win highlighting against the opponent).
- Replace the per-entry `meditationEntries` collection with a single `meditationLogsByYear/{year}` document (`userId -> dayOfYear -> hours`), with optimistic UI updates and a dedicated `saving` state.
- Add a simplified inline "Log Today's Meditation" form on the Leaderboard page, plus `MeditationFormData` / `YearlyMeditationLog` types and new date helpers.

### 615f763 — fix: key meditation entries and stats by Firebase UID

- Fix an identity mismatch: entries were written with internal `harsh`/`arta` ids while stats were computed against Firebase UIDs, so per-user stats never matched saved data.
- Thread the auth UID through the `User` type, `getUserInfo`, and all `useMeditation` queries/filters.
- Simplify Firestore rules from two hardcoded UID checks to a generic `request.auth.uid == request.resource.data.userId` condition.

### 2a6fe41 — feat: Implement authentication and meditation tracking features

- Initial commit: scaffold the full app from a Vite + React + TypeScript template (34 files).
- Google popup authentication restricted to two allow-listed users; Firestore-backed meditation entries; `useAuth` and `useMeditation` hooks.
- Leaderboard and Log Meditation pages, shared Button/Card/Header/Layout/DateSelector components, date/stats helpers, Tailwind styling, ESLint, and Firestore security rules.
