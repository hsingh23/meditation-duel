# 004 — Non-blocking loading UI on the Leaderboard

- **Date:** 2025-05-17 (commit 2f4867f)
- **Status:** accepted

## Context

Every refresh or save on the Leaderboard used to swap the entire page for a
centered spinner. Because the page re-fetches after every save, saving a session
made the leaderboard the user was looking at vanish and reappear — jarring for a
sub-second operation.

## Decision

Distinguish initial load from subsequent activity:

- New `ProgressBar` component (`src/components/common/ProgressBar.tsx` +
  `ProgressBar.css`): a 4px fixed indeterminate indigo strip animated with a CSS
  keyframe loop, rendered at both top and bottom of the Leaderboard whenever
  `loading || saving`, `pointer-events: none` so it never blocks input.
- The full-screen spinner remains only for the true initial load
  (`loading && !users.length`).
- The inline "log today" form receives `isSaving` (the save-specific flag from
  `useMeditation`) instead of the page-wide `loading`, so its Save button and
  spinner state reflect the actual operation.

## Consequences

- Content stays visible during saves and refreshes; feedback is ambient rather
  than modal.
- The component is generic (`visible`, `position`) and reusable from any page.
- A dedicated `saving` state now exists in `useMeditation`, separate from
  `loading` — later code should keep that distinction.
