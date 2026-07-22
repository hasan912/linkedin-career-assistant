// Thin wrapper around the Google Calendar API for adding interview events.
// Tokens are stored ENCRYPTED (same scheme as the LinkedIn access token), so the
// functions here receive the encrypted values and decrypt them before use.
//
// Google access tokens are short-lived (~1 hour), so createCalendarEvent()
// transparently refreshes on a 401 and reports the new token back to the caller
// so it can be re-encrypted and persisted.
import { decrypt } from "@/lib/encryption";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const EVENTS_ENDPOINT =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Exchanges a (decrypted) refresh token for a fresh access token.
// Returns { accessToken, expiresIn } where expiresIn is in seconds.
export async function refreshGoogleToken(refreshToken) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

// Sends one create-event request with the given (plaintext) access token.
async function postEvent(accessToken, event) {
  return fetch(EVENTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(event),
  });
}

// Creates a calendar event on the user's primary calendar.
// `accessToken` / `refreshToken` are the ENCRYPTED values stored on the User row.
// `startTime` / `endTime` are Date objects (or ISO strings).
//
// Returns { eventId, refreshedAccessToken, refreshedExpires } — the last two are
// non-null only when a refresh happened, so the caller can persist the new token.
export async function createCalendarEvent({
  accessToken,
  refreshToken,
  title,
  description,
  startTime,
  endTime,
  location,
}) {
  const event = {
    summary: title,
    description,
    location: location || undefined,
    // ISO strings carry the UTC offset (Z), so Google interprets them as absolute instants.
    start: { dateTime: new Date(startTime).toISOString() },
    end: { dateTime: new Date(endTime).toISOString() },
  };

  let plainAccessToken = decrypt(accessToken);
  let res = await postEvent(plainAccessToken, event);

  let refreshedAccessToken = null;
  let refreshedExpires = null;

  // Access token expired/invalid → refresh once and retry.
  if (res.status === 401 && refreshToken) {
    const { accessToken: fresh, expiresIn } = await refreshGoogleToken(decrypt(refreshToken));
    plainAccessToken = fresh;
    refreshedAccessToken = fresh;
    refreshedExpires = new Date(Date.now() + expiresIn * 1000);
    res = await postEvent(plainAccessToken, event);
  }

  if (!res.ok) {
    throw new Error(`Google Calendar event creation failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return { eventId: data.id, refreshedAccessToken, refreshedExpires };
}
