# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Next.js dev server at http://localhost:3000
npm run build        # prisma generate + prisma db push + next build (this is what Vercel runs)
npm run db:push      # push prisma/schema.prisma changes to the Postgres database
```

There are no tests or linters configured. The project is plain JavaScript (no TypeScript); `@/*` resolves to the repo root via `jsconfig.json`.

A `.env` file (copied from `.env.example`) is required to run anything meaningful — `DATABASE_URL` (Postgres, e.g. Neon), LinkedIn OAuth credentials, `SESSION_SECRET`, `CRON_SECRET`, and `ENCRYPTION_KEY` are the core ones. See `.env.example` for the full annotated list.

## What this app is

"Career Console" — a Next.js 15 (App Router) + Prisma/Postgres app that (1) schedules LinkedIn posts via LinkedIn's **official** Posts API, (2) aggregates job listings from Jooble/Adzuna/RemoteOK, and (3) tracks job applications. There's also a companion Chrome extension in `browser-extension/` for capturing jobs into the tracker.

**Hard constraint:** the app deliberately does NOT scrape LinkedIn, automate browsing, or auto-apply. Only LinkedIn's sanctioned APIs (OAuth, Posts, Images) are used. Do not add features that violate this.

## Architecture

### Auth & sessions
- Login is LinkedIn OAuth only (`app/api/auth/linkedin/`). The callback upserts a `User` and stores the LinkedIn access token **encrypted** (AES-256-GCM, `lib/encryption.js`) — call `decrypt()` before using it against LinkedIn's API.
- Sessions are JWT httpOnly cookies (`lib/session.js`). Every API route starts with `const userId = await getSessionUserId()` and returns 401 if null; every dashboard page redirects to `/` if null.
- LinkedIn tokens last 60 days with no refresh; expired tokens surface as "log in again" errors (checked in the publish cron).
- The browser extension authenticates differently: a per-user API token, stored only as a SHA-256 hash (`User.apiTokenHash`), checked in `app/api/applications/capture/route.js` (which is CORS-open because auth is bearer-token, not cookies).

### Page structure
Every dashboard page follows the same pattern: a server component `page.js` (auth check + `<Nav />`) rendering a `*Client.js` client component that does all fetching/interactivity against the `/api/*` routes. Styling is a single global stylesheet, `app/globals.css` (class names like `shell`, `hero`, `card`) — no CSS modules or Tailwind. Theme (dark/light) is a `User.theme` field.

### Cron endpoints (`app/api/cron/*`)
Three GET endpoints protected by `Authorization: Bearer CRON_SECRET`, listed in `vercel.json` (daily, because Vercel Hobby limits crons; production uses cron-job.org for real intervals):
- `publish` — publishes due `Post`s; on success of a `daily`/`weekly` repeat post, creates the next occurrence using `lib/timezone.js` (`Post.timeZone` stores the user's original zone so recurrence math survives DST).
- `interview-reminders` — emails ~24h before `Application.interviewAt` via Resend (`lib/email.js`), guarded by `reminderSent`.
- `weekly-digest` — weekly summary email.

### LinkedIn specifics (`lib/linkedin.js`)
- Post text MUST go through `escapeLinkedInText()` — LinkedIn's "Little Text Format" silently drops everything after an unescaped reserved char (`()<>|*_~` etc.). `#` is intentionally left unescaped so hashtags stay clickable.
- API version is pinned via `LINKEDIN_VERSION` (env-overridable with `LINKEDIN_API_VERSION`) — LinkedIn retires versions ~yearly; "NONEXISTENT_VERSION" errors mean bump the env var.
- Images: two-step upload (initializeUpload → PUT bytes) returning URNs stored on `Post.imageUrns`; 2–9 URNs makes a carousel.

### AI provider abstraction (`lib/ai.js`)
All AI features (post generator, resume matcher, cover letter) call `generateText(prompt, {system, maxTokens})`, which auto-selects a provider by env key in priority order: Anthropic → Groq → Gemini. Feature code never talks to a provider directly. Use `parseJsonResponse()` when expecting JSON (strips code fences).

### Rate limiting (`lib/ratelimit.js`)
Optional Upstash Redis. In write/AI/upload API routes: `const blocked = await rateLimitResponse("write", userId); if (blocked) return blocked;`. Silently no-ops if Upstash env vars are unset — preserve that behavior.

### Data model notes (`prisma/schema.prisma`)
Status fields are plain strings, not enums: `Post.status` = pending|posted|failed, `Post.repeat` = none|daily|weekly, `Application.status` = saved|applied|interview|offer|rejected. Schema changes deploy via `prisma db push` (no migration files) — the build script runs it with `--accept-data-loss`.
