# LaunchPoint

A platform that helps high school students discover internships, summer programs, scholarships, competitions, research opportunities, and volunteering — built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **Supabase** (Postgres, Auth, Row Level Security)
- **Lucide** icons, **Framer Motion** for subtle animation, **Recharts** for charts

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` and is fully browsable **without any setup** — public pages (homepage, Discover, opportunity details, About, Categories, Submit) run on a bootstrapped demo catalog in [`src/lib/data/seed-data.ts`](src/lib/data/seed-data.ts).

Accounts, saving, onboarding, the dashboard, and the admin section require a Supabase project (see below) — until then those routes show a clear "not connected" state instead of failing.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in your project URL and anon key:
   ```bash
   cp .env.example .env.local
   ```
3. Run the schema migration in the Supabase SQL editor (or via the CLI):
   ```
   supabase/migrations/0001_init.sql
   ```
   This creates every table (catalog, accounts, submissions/reports, and the discovery pipeline), indexes, RLS policies, and a trigger that creates a `profiles` row on signup.
4. Seed the `interests` table (used by onboarding and matching) with the values in [`src/lib/constants.ts`](src/lib/constants.ts) `FIELDS`, or insert your own.
5. To enable Google sign-in, add the Google provider under Supabase **Authentication → Providers** and set the redirect URL to `<your-site-url>/auth/callback`.

## Deadline reminder emails

Students get an email 30, 14, 7, and 1 day before the deadline of anything they've saved (skipped automatically once its status is Applied, Accepted, or Not Pursuing). This needs three more env vars beyond the Supabase ones:

```bash
SUPABASE_SERVICE_ROLE_KEY=   # Project Settings -> API -> service_role
RESEND_API_KEY=              # resend.com -> API Keys
CRON_SECRET=                 # any random string, e.g. `openssl rand -hex 32`
```

- **`SUPABASE_SERVICE_ROLE_KEY`** lets the reminder worker (`src/lib/reminders-worker.ts`) read across every user's reminders and look up their email via the Supabase Admin API - there's no logged-in session to rely on RLS for. It's the one place in the codebase that uses `src/lib/supabase/admin.ts`; nothing user-facing ever touches it.
- **`RESEND_API_KEY`** sends the email itself, via [Resend](https://resend.com). Without a verified sending domain, mail goes out from Resend's shared test address (`onboarding@resend.dev`) - fine for development, but set `EMAIL_FROM` to a verified address before sending to real students.
- **`CRON_SECRET`** authenticates `GET /api/cron/send-deadline-reminders`. The route refuses to run at all without it, so no one can trigger a send-blast by finding the URL. Vercel Cron (configured in `vercel.json`, once a day) sends this automatically as `Authorization: Bearer <CRON_SECRET>` when the env var is set on the project - nothing else to wire up after deploying.

**Reminders are scheduled, not computed on the fly.** Saving an opportunity (or an admin editing its deadline, or reactivating a status) writes rows into `deadline_reminders` for whichever of the four thresholds are still in the future; unsaving it, marking it Applied/Accepted/Not Pursuing, or the admin marking it expired/rejected deletes the not-yet-sent ones. All of that lives in `src/lib/reminders.ts` (pure scheduling math + the sync/cancel helpers) and is called from `src/lib/actions/saved.ts` and `src/lib/actions/admin-opportunities.ts`.

**Testing locally** without waiting for cron: sign in as an admin and use **Send Due Reminders Now** on `/admin`, or hit the route directly:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/send-deadline-reminders
```

Both call the same `processDueReminders()` function, so there's one code path to trust. A saved reminder only becomes "due" at its scheduled `remind_at` time, so to test end-to-end without waiting days, save an opportunity with a deadline a few days out, then temporarily edit its `remind_at` in the `deadline_reminders` table to the past.

### Demo data vs. live data

`src/lib/data/index.ts` is the repository layer every public page reads through, and it's Supabase-aware: every function checks `isSupabaseConfigured` and

- **queries the live tables** (joining `organizations`, `opportunity_grades`, and `opportunity_interests`/`interests` to assemble each `Opportunity`) when a project is connected, or
- **falls back to the bootstrapped catalog** in `seed-data.ts` — clearly marked `isSampleData: true` / `verificationStatus: "needs_review"` so nothing is presented as verified fact — when it isn't.

That means the moment you add real `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` values and run the migration, the homepage, Discover, opportunity pages, and organization pages start serving your live catalog automatically — nothing else to wire up. Data-fetching functions that can be called more than once per request (e.g. `getOpportunityBySlug`, used by both `generateMetadata` and the page itself) are wrapped in React's `cache()` so that only issues one query.

Repository reads (`lib/data/index.ts`) and admin CRUD (`lib/data/admin.ts`) both hit the same live tables once connected — admin just uses the raw snake_case `Row` types from `database.types.ts` for its forms, while the public site gets the camelCase `Opportunity`/`Organization` shapes from `lib/types.ts`.

`lib/data/query.ts` holds the pure filter/sort logic (`applyFilters`, `sortOpportunities`) used by both the server-rendered Discover page and `DiscoverView`'s client-side re-filtering — it has no Supabase or `server-only` imports, which is what lets a Client Component use it directly. `lib/data/index.ts` itself is marked `server-only`, so it's the one module allowed to import `lib/supabase/server`; Client Components must go through `query.ts` instead.

## Project structure

```
src/
  app/                  # Routes (App Router)
    admin/              # Admin dashboard, protected by requireAdmin()
    api/cron/send-deadline-reminders   # Vercel Cron target
    opportunities/[slug]
    organizations/[slug]
    discover/ dashboard/ saved/ deadlines/ onboarding/ ...
  components/
    ui/                 # shadcn/ui primitives
    admin/ auth/ discover/ opportunity/ onboarding/ saved/ deadlines/
  lib/
    data/               # Repository layer (reads) — Supabase when configured, seed-data.ts otherwise
    actions/            # Server Actions (mutations) — auth, saved, submissions, reports, admin-*
    supabase/           # Browser/server/admin Supabase clients, env check, proxy session refresh
    email/              # Resend client + the deadline-reminder HTML template
    reminders.ts        # Pure reminder-scheduling math (thresholds, sync/cancel helpers)
    reminders-worker.ts # processDueReminders() — the one place that actually sends
    types.ts            # Domain types mirroring the DB schema
    match.ts            # Deterministic, explainable match-score algorithm
    deadline.ts         # Deadline urgency badge logic (computed from the current date, never stored)
supabase/
  migrations/0001_init.sql   # Full schema + RLS
vercel.json              # Daily cron schedule for reminder sending
```

## Notable architecture decisions

- **Match scores are deterministic**, not AI-generated: `src/lib/match.ts` computes a score from grade eligibility, interest overlap, category preference, location preference, and cost preference, and every point is paired with a human-readable reason shown in "Why this matches you".
- **Deadline badges are computed on every render** from the stored date, not written to the database — see `src/lib/deadline.ts`.
- **The discovery pipeline (admin → Discovery) never fabricates or auto-publishes.** "Run Scan" fetches an approved source's page and, if `GEMINI_API_KEY` is set, asks Gemini (`src/lib/discovery/extract.ts`) to extract only opportunities explicitly stated in that page's text — the prompt frames the fetched page as untrusted data (not instructions), forbids inventing unstated fields, and returns an empty result for pages with no concrete listings. Without a Gemini key, "Run Scan" still checks the source is reachable but extracts nothing. Every extracted candidate lands in `discovered_opportunities` for admin review (`/admin/discovery`) with a confidence score and a possible-duplicate flag if it title-matches an existing opportunity; "Approve & Edit" (`promoteDiscoveredOpportunity` in `src/lib/actions/admin-discovery.ts`) is the *only* path from there to the catalog, and it always creates the opportunity with `status: "pending"` — an admin still has to finish and publish it, mirroring how public submissions are reviewed.
- **Auth-gated routes never hard-fail when Supabase isn't configured** — `src/lib/supabase/env.ts` exports `isSupabaseConfigured`, checked before any Supabase call on the server, so the app builds and the public site works even with empty env vars.
- **Reminder sending and reminder scheduling are decoupled.** Scheduling (writing/deleting `deadline_reminders` rows) happens inline in ordinary Server Actions using the user's own session. Sending only happens in `processDueReminders()`, called by either the cron route or an admin's manual trigger, both gated separately (`CRON_SECRET` / `requireAdmin()`) - a bug in one can't silently spam or block the other.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # ESLint
```
