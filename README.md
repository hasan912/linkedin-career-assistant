# Career Console

A web app that:
1. **Schedules LinkedIn posts** — write now, publish automatically later, via LinkedIn's official Posts API.
2. **Surfaces web-dev job leads** — pulled live from Adzuna and RemoteOK's public APIs.
3. **Tracks applications** — a simple pipeline (saved → applied → interview → offer/rejected).

### What this app deliberately does NOT do
It does not scrape LinkedIn, auto-message recruiters, or auto-click "Easy Apply."
LinkedIn's Terms of Service prohibit browser automation and scraping, and doing so
risks a permanent account ban. Everything here only uses LinkedIn's official,
sanctioned API (for posting) — job discovery and applying stay manual/human,
using legitimate public job board APIs.

---

## 1. Local setup

```bash
npm install
cp .env.example .env
# now edit .env and fill in the values (see sections below)
# for DATABASE_URL, get a free Postgres database at https://neon.tech (~2 min setup)

npx prisma db push   # creates the tables in your Postgres database
npm run dev
```

Visit `http://localhost:3000`.

---

## 2. LinkedIn Developer App

1. Go to https://developer.linkedin.com → **Create app**.
2. Fill in app name, link a LinkedIn Page (create a simple one if you don't have one), upload a logo.
3. In the **Products** tab, request/add:
   - **Sign In with LinkedIn using OpenID Connect**
   - **Share on LinkedIn**
4. In the **Auth** tab, copy the **Client ID** and **Client Secret** into your `.env`:
   ```
   LINKEDIN_CLIENT_ID=...
   LINKEDIN_CLIENT_SECRET=...
   ```
5. In the same **Auth** tab, add this to **Authorized redirect URLs for your app**:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   ```
   (You'll add your production URL here too once deployed — see step 5 below.)

**Note on token lifetime:** LinkedIn access tokens last 60 days. This app does not
currently implement silent refresh (LinkedIn only issues refresh tokens to apps
with special approval). After 60 days, just log in again from the homepage —
scheduled/posted post history is preserved either way.

---

## 3. Job board APIs

- **Adzuna** (aggregates many job boards): sign up free at https://developer.adzuna.com/,
  copy your `app_id` and `app_key` into `.env` as `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`.
- **RemoteOK**: no key needed, works out of the box.

If you don't set Adzuna keys, the Jobs page will still work using RemoteOK alone.

---

## 4. Session & cron secrets

Generate two random strings for `.env`:

```bash
openssl rand -base64 32   # use for SESSION_SECRET
openssl rand -base64 32   # use for CRON_SECRET
```

---

## 5. Deploying (Vercel — free tier works)

1. Push this project to a GitHub repo.
2. Go to https://vercel.com → **New Project** → import your repo.
3. Add all the same environment variables from `.env` in Vercel's **Settings → Environment Variables**.
   - For `DATABASE_URL`, use a hosted Postgres database — this project is already configured
     for Postgres. Free options: **[Neon](https://neon.tech)** (recommended, 2-minute setup),
     Vercel Postgres, or Supabase. Copy the connection string they give you into `DATABASE_URL`.
   - Update `LINKEDIN_REDIRECT_URI` to `https://YOUR-DOMAIN.vercel.app/api/auth/linkedin/callback`.
4. Back in your LinkedIn Developer App's **Auth** tab, add that same production URL to
   **Authorized redirect URLs**.
5. Deploy. The build step automatically runs `prisma db push`, which creates the
   necessary tables in your Postgres database on first deploy — no manual step needed.
6. **Scheduling on a real interval:** Vercel's free (Hobby) plan only allows cron jobs to run
   once a day, so `vercel.json` is set to a daily fallback. For actual timely posting, use a
   free external pinger like **[cron-job.org](https://cron-job.org)**:
   - URL: `https://YOUR-DOMAIN.vercel.app/api/cron/publish`
   - Schedule: every 1-5 minutes
   - Add a request header: `Authorization: Bearer YOUR_CRON_SECRET`

---

## Project structure

```
app/
  page.js                        Landing/login page
  dashboard/                     Logged-in pages (overview, posts, jobs, applications)
  api/
    auth/linkedin/login          Redirects to LinkedIn OAuth
    auth/linkedin/callback       Handles the OAuth response, creates session
    auth/logout                  Clears session
    posts/                       CRUD for scheduled posts
    applications/                CRUD for the application tracker
    jobs/                        Fetches live listings from Adzuna + RemoteOK
    cron/publish/                Publishes any due posts (called on a schedule)
lib/
  prisma.js                      Prisma client
  session.js                     JWT cookie session helpers
  linkedin.js                    Calls LinkedIn's Posts API
prisma/schema.prisma             Database schema
```

## Additional Features (batch 2)

### AI features (post generator, resume matcher, cover letter)
Set one of `GROQ_API_KEY` (recommended, free & stable - https://console.groq.com/keys),
`GEMINI_API_KEY` (free but quotas change often), or `ANTHROPIC_API_KEY`.

### Recurring posts
Set "Repeat" to Daily/Weekly when scheduling a post. After each publish, the
cron job automatically schedules the next occurrence.

### Multi-image carousel posts
Attach 2-9 photos to a single post to publish it as a LinkedIn carousel.

### Access token encryption
Requires `ENCRYPTION_KEY` (generate with `openssl rand -base64 32`). LinkedIn
access tokens are encrypted before being stored and decrypted only when
calling LinkedIn's API.

### Rate limiting
Optional but recommended. Create a free Redis database at
https://console.upstash.com, then set `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN`. Without these, rate limiting is silently skipped.

### Interview calendar + email reminders
Set an application's status to "interview" to reveal a date/time picker.
A reminder email goes out ~24h before, via Resend (`RESEND_API_KEY` from
https://resend.com, free tier). This is checked by `/api/cron/interview-reminders` -
add a **second** cron-job.org job pointing to
`https://YOUR-DOMAIN.vercel.app/api/cron/interview-reminders` (same
`Authorization: Bearer YOUR_CRON_SECRET` header), running hourly is plenty.

### Browser extension (manual job capture)
See `browser-extension/README.md`. Generate your personal API token from
**Dashboard → Settings** first, then load the extension in Chrome
(`chrome://extensions` → Developer mode → Load unpacked →
select the `browser-extension` folder).
