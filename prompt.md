# One-shot recreation prompt — Meditation Duel

Give this prompt to a capable coding agent to recreate this app from scratch.
(All player-specific values — Firebase project config, allow-listed emails,
auth UIDs — must be supplied by whoever runs it; they are intentionally not
included here.)

---

## Goal

Build "Meditation Duel": a private web app for exactly two players (call them
Player H with color red-500 and Player A with color blue-500) who log daily
meditation time and compete. Every day each player logs hours + minutes; the app
shows who is ahead today, this week, and overall, and color-codes each of the
last 7 days by who won that day. Design should feel polished and
production-worthy, not like a template demo.

## Stack

- React 18 + TypeScript, built with Vite 5 (`npm run dev | build | preview`,
  ESLint via `npm run lint`)
- React Router 6 (`BrowserRouter`, two routes)
- Tailwind CSS 3 with the Inter font (loaded in `index.html` from Google Fonts);
  indigo as the primary accent
- framer-motion for entrance/width animations; lucide-react for icons
  (Google logo from react-icons/fa)
- Firebase 10: Auth (Google sign-in via `signInWithPopup` +
  `GoogleAuthProvider`) and Cloud Firestore
- date-fns 2 for all date math

## Data model

One Firestore document per year:

```
collection meditationLogsByYear, doc id = "2025" (year as string)
shape: { [playerUid]: { [dayOfYear 1-366]: hours (float) } }
```

Client-side types:

- `User { id, uid, email, name, color }` — `uid` is the Firebase auth UID and
  the ONLY key used for data
- `MeditationEntry { id: "year-uid-dayOfYear", userId, date: "YYYY-MM-DD", totalMinutes }`
- `MeditationFormData extends MeditationEntry { hours, minutes }`
- `YearlyMeditationLog { [uid]: { [dayOfYear]: hoursFloat } }`
- `MeditationStats { today, thisWeek, overall }` (minutes)
- `UserWithStats extends User { stats }`

## APIs by name

Firebase: `initializeApp`, `getAuth`, `GoogleAuthProvider`, `signInWithPopup`,
`onAuthStateChanged`, `signOut`, `getFirestore`, `getDoc`, `setDoc` (with
`{ merge: true }`).

Internal (recreate with these exact signatures):

- `useAuth()` -> `{ user, loading, error, signIn, signOut }` — wraps
  `onAuthStateChanged`; maps the authed email through `getUserInfo`; unknown
  emails are auto-signed-out with error "Unauthorized user. Only specific users
  can access this app."
- `useMeditation(currentUser)` -> `{ entries, users, loading, saving, error, saveEntry, getEntryForDate, refreshEntries }`
  - `saveEntry(dateString, hours, minutes)`: validates non-negative numbers,
    optimistic-updates local entries + stats, read-modify-writes the yearly doc
    with `setDoc(..., {merge: true})`, refetches; refetches again on error as
    rollback
  - `getEntryForDate(dateString)` -> `MeditationFormData | null` for the
    current user on that date
  - exposes a separate `saving` flag distinct from `loading`
- Helpers (`src/utils/helpers.ts`): `formatDate`, `formatDisplayDate`,
  `getPreviousDays(count)`, `getTodayDate`, `getDayOfYear`, `getYear`,
  `calculateTotalMinutes`, `formatDuration(minutes) -> "2 hr 15 min"`,
  `calculateMeditationStats(entries, uid)`, `getUserInfo(email, uid)`

## Game design decisions

- **Two players, fixed forever.** Both always render on the leaderboard even
  with zero minutes. Auth allow-list is hardcoded: email -> `User` mapping in
  `getUserInfo`; anyone else is signed out.
- **Stats windows:** today = entry with today's date; thisWeek = entries within
  `startOfWeek`..`endOfWeek` (date-fns default, Sunday-start); overall = sum of
  all loaded entries (current year's document only).
- **Daily winner:** in the 7-day mini calendar, a day is "won" when the
  displayed player's minutes are `>=` the opponent's (ties count as wins for
  both). Won days render with yellow background/border and yellow text; days
  with any time but not won render indigo-tinted; empty days are white; today
  gets a 2px indigo ring.
- **Day granularity:** one value per player per day; logging 0h 0m clears the
  day. No sessions, streaks, or notes.
- **Backfill window:** the Log page's date selector offers exactly today and
  the previous 3 days (4 total); no future or older dates.

## UI decisions

- **Routes:** `/` Leaderboard, `/log` Log Meditation, `*` redirects to `/`.
  Layout gates on auth: full-screen spinner while loading auth; Login screen
  when signed out; else sticky Header (avatar with player color, nav with
  lucide icons, sign-out button) above a `max-w-5xl` main.
- **Login screen:** gradient indigo->purple background, animated card showing
  both players' avatars (H on red, A on blue) and the line "This is a private
  app for [the two players] to track and compare their meditation practice",
  full-width "Sign in with Google" button.
- **Leaderboard page:** title + combined total; inline simplified
  "Log Today's Meditation" card (two number inputs hours 0-24 / minutes 0-59 +
  small Save button in one row); three `LeaderboardCard`s (Today / This Week /
  Overall) each sorting both players with animated progress bars scaled to the
  max value and a yellow trophy for a strict leader; "Meditation Champions"
  section with one card per player sorted by overall (rank-1 badge), showing
  avatar, total, Today/This Week stats, and the 7-day `MiniCalendarView`.
- **Mini calendar:** 7 columns (last 7 days ending today), each cell shows
  weekday abbrev, day-of-month, and formatted duration when > 0; skeleton
  pulse state when user data missing.
- **Log page:** "Your Progress" stats strip; `DateSelector` (chevrons, weekday
  month day label, "Today" tag); full `LogMeditationForm` in a Card (labeled
  hours/minutes inputs, live "X hours and Y minutes" summary, Save with
  spinner); full-month `CalendarView` (Sun-Sat headers, prev/next month
  chevrons, green cells for logged days with duration text, indigo ring on
  today, muted cells for adjacent-month days, hover scale effect); a static
  "Tips for Meditation" list.
- **Loading UX:** thin (4px) indeterminate indigo `ProgressBar` fixed at top
  AND bottom of the Leaderboard whenever `loading || saving`; full-screen
  spinner only for the initial load (no users yet). Forms disable their save
  button and show a spinning Loader icon while `isSaving`.
- **Motion:** framer-motion fade/slide entrances on cards and headers
  (staggered by index), animated width on leaderboard bars.

## Security rules

`firestore.rules`: `meditationLogsByYear/{year}` readable by any authenticated
user, writable by any authenticated user (documented as simplified-for-now).
(The legacy design also had a `meditationEntries/{id}` collection with
owner-checked writes `request.auth.uid == request.resource.data.userId` plus
field/type validation — you may include it or drop it.)

## Build order (phases)

1. Scaffold Vite + React + TS + Tailwind + Inter + ESLint; add firebase,
   date-fns, framer-motion, lucide-react, react-icons, react-router-dom.
2. Firebase init module (config + `USER_IDS`), `useAuth` with the allow-list
   gate, Login screen, Layout/Header auth shell, routing.
3. Types + helpers (dates, duration formatting, stats), then `useMeditation`
   against the yearly-doc model with optimistic saves.
4. Leaderboard page: leaderboard cards, champions cards, inline log form.
5. Log page: date selector, full form, month calendar.
6. Mini calendar with win/loss coloring; ProgressBar non-blocking loading pass.

## Acceptance criteria

1. An allow-listed Google account can sign in; any other account is refused
   with the unauthorized message and signed out.
2. Logging "1 h 30 m" for today persists across reloads and appears in the
   Today/This Week/Overall cards, the inline form (pre-filled on edit), the
   7-day mini calendar, and the month calendar.
3. Re-saving a day replaces (not accumulates) its value; logging 0/0 clears it.
4. The mini calendar marks days where the player's minutes >= opponent's in
   yellow, and rings today.
5. Saves and refreshes show the top/bottom progress bars without unmounting
   the page; only the first load shows the full-screen spinner.
6. The Log page date selector offers exactly the last 4 days; the month
   calendar navigates months and highlights logged days green with durations.
7. `npm run lint` and `npm run build` pass.
