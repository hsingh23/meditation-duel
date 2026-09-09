# AGENTS.md

Guidance for coding agents working in this repository.

## What this is

A private two-player meditation duel (React + Vite + TS + Firebase). Two allow-listed
players log daily meditation minutes; the app computes Today / This Week / Overall
stats and head-to-head daily winners. See `README.md` for the product summary and
`architectural-diary/` for how it got that way.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # type-check-free production build (vite build)
npm run preview  # serve the built app
npm run lint     # ESLint (eslint .)
```

There are **no tests** in this repo. `npm run build` does not run `tsc` — use
`npx tsc -p tsconfig.app.json --noEmit` for a type check if you want one.

## Architecture map

```
main.tsx -> Routes.tsx (BrowserRouter)
  └─ Layout (auth gate: spinner while loading, <Login/> when signed out)
       ├─ "/"   Leaderboard   (leaderboard cards, champions + mini calendars,
       │                        inline "log today" form)
       └─ "/log" LogMeditation (date selector for last 4 days, full form,
                                 month CalendarView, tips)

State lives in two hooks (no global store):
  useAuth()    -> { user, loading, error, signIn, signOut }
                 - onAuthStateChanged + Google popup
                 - getUserInfo(email, uid) enforces the 2-player allow-list
  useMeditation(currentUser) -> { entries, users, loading, saving, error,
                                  saveEntry, getEntryForDate, refreshEntries }
                 - reads  Firestore doc meditationLogsByYear/{currentYear}
                 - writes  same doc via setDoc(..., { merge: true })
                 - saveEntry(dateStr, hours, minutes) does optimistic update,
                   then read-modify-write of the whole yearly doc, then refetch
```

Data flow: `meditationLogsByYear/{year}` is `{ [uid]: { [dayOfYear]: hoursFloat }}`.
`fetchEntries` expands that into a flat `MeditationEntry[]` (minutes),
`calculateMeditationStats` derives today/thisWeek/overall per player.

## Conventions

- Conventional Commits (`feat:`, `fix:`, ...), imperative subject <= 72 chars,
  body explaining why.
- Tailwind utility classes inline; indigo is the primary accent; Inter font.
- Icons from `lucide-react` (Google logo via `react-icons/fa`).
- Components grouped by domain: `auth/`, `common/`, `layout/`, `meditation/`,
  plus `pages/`.
- All date math goes through `src/utils/helpers.ts` (date-fns wrappers) — do not
  hand-roll date logic in components.

## Gotchas

- **Firebase config and the player allow-list are hardcoded.**
  `src/firebase/config.ts` holds the web config and `USER_IDS` (auth UIDs);
  `src/utils/helpers.ts` maps the two allow-listed Gmail addresses to players.
  Changing players means editing both files.
- **`User.id` has two meanings.** `getUserInfo` sets `id` to the Firebase UID,
  while `useMeditation.fetchEntries` builds users with `id: 'harsh' | 'arta'`.
  As a result `users.find(u => u.id === user?.id)` in `LogMeditation.tsx` never
  matches and the "Your Progress" box silently does not render. Match on `uid`,
  not `id`, when touching this code.
- **Dynamic Tailwind classes don't compile.** `bg-${u.color}` in
  `Leaderboard.tsx` is invisible to Tailwind's JIT; the working code paths use
  explicit ternaries (`u.color === 'red-500' ? 'bg-red-100' : ...`). Never rely
  on interpolated class names.
- **Only the current year is read.** `fetchEntries` loads just
  `meditationLogsByYear/{currentYear}`, so "Overall" resets every Jan 1 and no
  historical year is ever shown.
- **Read-modify-write race.** `saveEntry` fetches the whole yearly doc, mutates
  the player's day, and `setDoc(..., {merge: true})`s it back. Two simultaneous
  saves from different players can drop one another's updates. Accepted risk
  for a 2-player app; use a transaction if this ever matters.
- **`firestore.rules` still contains the legacy `meditationEntries` collection**
  (per-entry docs) that the code no longer writes; the active collection
  `meditationLogsByYear` allows writes from *any* authenticated user, not just
  the owner of the data (fields are not per-player enforced).
- **`src/App.tsx` is dead template scaffolding** — `main.tsx` renders
  `Routes.tsx` directly. Don't add code to `App.tsx`.
- Several Firestore functions are imported in `useMeditation.ts` but unused
  (`collection`, `query`, `orderBy`, `getDocs`, `addDoc`, `updateDoc`) — leftovers
  from the pre-migration storage model.

## Verifying changes

1. `npm run lint` passes.
2. `npx tsc -p tsconfig.app.json --noEmit` passes (build alone won't type-check).
3. `npm run dev`, then manually: sign in with an allow-listed account, log a
   session for today on the Leaderboard, confirm the entry appears in the mini
   calendar and leaderboard cards, then set it back. Check the `/log` page
   date selector and month calendar still render.

## Pointers

- `README.md` — product overview, stack, quickstart, data model.
- `CHANGELOG.md` — every commit, newest first.
- `architectural-diary/main.md` — chronological build narrative.
- `architectural-diary/decisions/` — the four significant decisions.
- `prompt.md` — one-shot prompt that recreates this app from scratch.
