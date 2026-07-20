# Chrome Web Store Listing — Career Console: Save Job

Everything you need to submit the extension to the Chrome Web Store.

## Short description (132 chars max)

> Save job postings to your Career Console tracker with one click. Never lose a lead.

(84 characters — same string as `description` in `manifest.json`.)

## Full description

**Stop losing track of jobs you meant to apply for.**

Career Console — Save Job is the companion extension for your self-hosted Career Console app. When you find an interesting job posting anywhere on the web — LinkedIn, company career pages, job boards — click the extension icon and the current page's title and URL are pre-filled into a small form. Add the company name, hit Save (or just press Enter), and the job lands in your Career Console application tracker as a new lead.

**Features**

- One-click capture: job title and URL are pre-filled from the page you're viewing
- Works on any job site — LinkedIn, Indeed, company career pages, anywhere
- Saves directly to *your own* Career Console instance (self-hosted, your data stays yours)
- Secure: authenticates with a personal API token you generate in your Career Console settings; the token is stored only in your browser's local extension storage
- No tracking, no analytics, no third-party servers — the only network requests go to the Career Console URL you configure

**How it works**

1. Deploy or run your own Career Console app (free, open source)
2. In Career Console → Settings, generate an extension API token
3. Open the extension's Options page, paste your site URL and token
4. Browse jobs; when you see one worth tracking, click the icon and save it

From there, Career Console's tracker takes over: move the lead through saved → applied → interview → offer, get interview reminder emails, and see your pipeline analytics.

**Who is this for?**

Anyone running an active job search who is tired of losing links in a sea of open tabs, bookmarks, and half-remembered postings. If you already use Career Console to schedule LinkedIn posts and track applications, this extension closes the loop: capture leads the moment you find them.

**Note:** This extension requires a running Career Console instance. It does not scrape or automate any website — it only reads the title and URL of the tab you explicitly save.

## Category

**Productivity** (primary). Alternative: Workflow & Planning.

## Privacy policy (template)

Chrome Web Store requires a public privacy policy URL for extensions that handle user data. Host this (e.g. as a page on your Career Console deployment or a GitHub page) and link it in the listing:

---

### Privacy Policy — Career Console: Save Job

_Last updated: [DATE]_

**What data the extension handles**

- **Page title and URL** of the active tab, only when you open the popup, shown to you for editing before anything is sent.
- **Job details you submit** (title, company, URL): sent over HTTPS directly to the Career Console server URL *you* configured. No other destination receives any data.
- **API token and site URL**: stored in Chrome's local extension storage (`chrome.storage.local`) on your device only. Never transmitted anywhere except as the Authorization header of requests to your own configured server.

**What the extension does NOT do**

- No analytics, telemetry, or tracking of any kind
- No data sold or shared with third parties
- No browsing history collection — the extension only reads the active tab when you click its icon
- No remote code execution

**Data retention**: Job data you save is stored in your own Career Console database, under your control. Uninstalling the extension removes the locally stored token and site URL.

**Contact**: [YOUR EMAIL]

---

## Screenshots (required by the store)

The store requires at least 1 screenshot, 1280×800 or 640×400 PNG/JPEG. Suggested shots:

1. The popup open on a job posting page with fields pre-filled
2. The options page showing the token/URL setup
3. The Career Console tracker showing a captured lead

## Submission steps

1. **Generate icons** (once): `node create-icons.js` inside `browser-extension/` — creates `icons/icon16.png`, `icon48.png`, `icon128.png`.
2. **Create the ZIP**: zip the *contents* of `browser-extension/` (manifest.json at the ZIP root — not the folder itself). Exclude `create-icons.js`, `STORE_LISTING.md`, and `README.md` if you want a minimal package (optional; extra files are allowed).
3. **Developer account**: register at https://chrome.google.com/webstore/devconsole ($5 one-time fee).
4. **New item**: click "New Item", upload the ZIP.
5. **Store listing tab**: paste the short + full descriptions above, upload screenshots, select the Productivity category, add a support email.
6. **Privacy tab**:
   - Single purpose description: "Save the job posting the user is viewing to their own Career Console tracker."
   - Permission justifications:
     - `activeTab` — read the title/URL of the tab the user explicitly saves
     - `storage` — store the user's own API token and server URL locally
     - Host permissions — the user self-hosts Career Console at an arbitrary domain, so the extension must be able to POST to the URL the user configures
   - Link your hosted privacy policy
   - Declare that you do not sell/transfer user data
7. **Distribution tab**: choose visibility (Public or Unlisted — Unlisted is sensible for a personal tool).
8. **Submit for review**. First review typically takes a few business days; broad host permissions can trigger a longer manual review, which the justification in step 6 addresses.

## Post-approval updates

Bump `version` in `manifest.json` (e.g. `1.0.1`), re-zip, upload via the developer console, resubmit.
