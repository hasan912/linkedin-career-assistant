import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { encrypt } from "@/lib/encryption";

// Step 2 of Google OAuth: Google redirects back here with a ?code=...
// We exchange it for tokens and attach them to the CURRENTLY LOGGED-IN user
// (this flow connects Calendar to an existing account; it does not sign anyone in).
export async function GET(request) {
  const userId = await getSessionUserId();
  // Must already be signed in to connect a calendar to an account.
  if (!userId) return NextResponse.redirect(new URL("/", request.url));

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const cookieStore = await cookies();
  const savedState = cookieStore.get("g_oauth_state")?.value;

  const settingsUrl = (params) =>
    new URL(`/dashboard/settings${params ? `?${params}` : ""}`, request.url);

  if (error) {
    return NextResponse.redirect(settingsUrl(`google_error=${encodeURIComponent(error)}`));
  }
  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(settingsUrl("google_error=invalid_state"));
  }

  // Exchange authorization code for access + refresh tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Google token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(settingsUrl("google_error=token_exchange_failed"));
  }

  const tokenData = await tokenRes.json();
  const { access_token, refresh_token, expires_in } = tokenData;

  const data = {
    googleAccessToken: encrypt(access_token),
    googleTokenExpires: new Date(Date.now() + expires_in * 1000),
  };
  // Google only returns a refresh_token on first consent; keep the existing one otherwise.
  if (refresh_token) data.googleRefreshToken = encrypt(refresh_token);

  await prisma.user.update({ where: { id: userId }, data });
  cookieStore.delete("g_oauth_state");

  return NextResponse.redirect(settingsUrl("google_connected=1"));
}
