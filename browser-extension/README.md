# Career Console - Save Job (Browser Extension)

A minimal Chrome extension (Manifest V3) that saves the job posting you're
currently viewing to your Career Console application tracker, with one click.

This is **user-triggered only** - it never reads or collects anything in the
background. It only acts when you click the extension icon, so it stays
within the terms of service of whatever job site you're on.

## Install (unpacked, for personal use)

1. In your Career Console app, go to **Dashboard → Settings** and click
   **"Generate Token"**. Copy the token shown (it's only shown once).
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (toggle, top right).
4. Click **"Load unpacked"** and select this `browser-extension` folder.
5. Click the extension's icon in your toolbar → **"Set up API token"** (or
   right-click the icon → Options).
6. Paste your app's URL (e.g. `https://your-app.vercel.app`) and the token
   from step 1. Click Save.

## Use it

On any job posting page, click the extension icon. It pre-fills the job
title and URL from the current tab; add the company name if you'd like, then
click **"Save to Career Console"**. It appears in your Applications tracker
with status "saved".

## Notes

- The token authenticates via a `Authorization: Bearer <token>` header, not
  cookies - so it works regardless of which browser profile you're logged
  into the main app with.
- If you ever want to revoke access, generate a new token from Settings;
  the old one stops working immediately.
