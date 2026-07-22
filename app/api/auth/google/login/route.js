import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Step 1 of Google OAuth (Calendar connect): send the user to Google to approve access.
// This is separate from LinkedIn login — the user is already signed in; this only
// grants us permission to add interview events to their calendar.
//
// Scopes:
//  - openid                                          -> basic identity
//  - https://www.googleapis.com/auth/calendar.events -> create/manage calendar events
export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  // Store state briefly so the callback can verify this request wasn't forged (CSRF protection)
  const cookieStore = await cookies();
  cookieStore.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    scope: "openid https://www.googleapis.com/auth/calendar.events",
    // access_type=offline + prompt=consent are what make Google return a refresh
    // token (needed because access tokens expire after ~1 hour).
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
