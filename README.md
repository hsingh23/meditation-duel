# Meditation Duel

A private, two-player meditation competition app. Harsh and Arta log their daily
meditation time and go head-to-head on a leaderboard: who meditated more today,
this week, and all-time — with a 7-day calendar showing who "won" each day.

## Why

Friendly accountability beats solo streak tracking. Instead of a generic habit
tracker, this app frames meditation as a duel between exactly two people: every
logged session moves your bar past your rival's, and each of the last 7 days is
color-coded to show who came out ahead that day.

## Features

- **Google sign-in, two-player allow-list.** Only the two configured players can
  sign in; anyone else is signed out automatically with an "Unauthorized user" message.
- **Quick logging.** Log today's session inline from the Leaderboard (hours + minutes),
  or backfill the last 4 days from the Log Meditation page.
- **Three leaderboard cards** — Today, This Week, Overall — with animated progress
  bars and a trophy for the current leader of each.
- **Meditation Champions cards** with a mini calendar of the last 7 days: yellow
  cells mark days you beat (or tied) your opponent, and today gets a highlight ring.
- **Full month calendar** of your own logged sessions with month navigation.
- **Optimistic UI.** Saving shows a slim indeterminate progress bar at the top/bottom
  of the page instead of blocking the UI; the screen-level spinner appears only on
  initial load.

## Stack

- React 18 + TypeScript, Vite 5, React Router 6
- Tailwind CSS 3 + Inter font, framer-motion animations, lucide-react / react-icons
- Firebase 10: Auth (Google popup) + Cloud Firestore
- date-fns 2 for all date math (day-of-year, week boundaries, formatting)
- ESLint 9

## Quickstart

```bash
npm install
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # ESLint
```

Signing in requires being one of the two allow-listed Google accounts on the
configured Firebase project.

## Environment / configuration

There are **no environment variables** today. The Firebase web config
(`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`,
`appId`) and the two players' auth UIDs are hardcoded in
`src/firebase/config.ts`, and the sign-in allow-list (email -> player mapping)
lives in `src/utils/helpers.ts`. If you fork this, replace those values with
your own Firebase project config (or extract them to `VITE_FIREBASE_*` env vars).

## Structure

```
src/
  firebase/config.ts        Firebase init + USER_IDS (player UIDs)
  hooks/useAuth.ts          Google auth, allow-list enforcement, session state
  hooks/useMeditation.ts    Fetch/save yearly meditation log, stats, optimistic UI
  utils/helpers.ts          Date helpers, duration formatting, stats, user lookup
  types/index.ts            User, MeditationEntry, YearlyMeditationLog, stats types
  Routes.tsx                "/" Leaderboard, "/log" Log Meditation
  pages/                    Leaderboard, LogMeditation
  components/
    auth/Login.tsx          Sign-in screen
    layout/                 Header (nav + sign out), Layout (auth gate)
    meditation/             CalendarView, MiniCalendarView, LogMeditationForm,
                            LeaderboardCard, DateSelector
    common/                 Button, Card, ProgressBar
firestore.rules             Firestore security rules
```

## Data model

One Firestore document per year in the `meditationLogsByYear` collection:

```
meditationLogsByYear/{year}  ->  { [playerUid]: { [dayOfYear 1-366]: hours (float) } }
```

Reading is a single document get; writing merges the current player's day into
the yearly doc. See `architectural-diary/decisions/` for why it is shaped this way.
