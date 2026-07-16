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

npx prisma db push   # creates the local SQLite database file
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
   - For `DATABASE_URL`, switch to a hosted Postgres database (SQLite files don't persist
     on serverless hosting). Free options: **Vercel Postgres**, **Neon**, or **Supabase**.
     Once you have the connection string, also change `provider = "sqlite"` to
     `provider = "postgresql"` in `prisma/schema.prisma` before deploying.
   - Update `LINKEDIN_REDIRECT_URI` to `https://YOUR-DOMAIN.vercel.app/api/auth/linkedin/callback`.
4. Back in your LinkedIn Developer App's **Auth** tab, add that same production URL to
   **Authorized redirect URLs**.
5. Deploy. Vercel will automatically run the cron job defined in `vercel.json`
   (`/api/cron/publish`, every 15 minutes) — this is what actually publishes your
   scheduled posts on time. Vercel automatically sends your `CRON_SECRET` as a
   bearer token when it calls this route, so no extra setup is needed there.

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
