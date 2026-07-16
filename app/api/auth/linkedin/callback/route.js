import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

// Step 2 of OAuth: LinkedIn redirects back here with a ?code=...
// We exchange that code for an access token, fetch the user's profile,
// save/update them in the database, and log them into our app.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get("li_oauth_state")?.value;
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  // Exchange authorization code for an access token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("LinkedIn token exchange failed:", text);
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url));
  }

  const tokenData = await tokenRes.json();
  const { access_token, expires_in } = tokenData; // expires_in is in seconds (usually 60 days)

  // Fetch basic profile info via the OpenID Connect userinfo endpoint
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profile = await profileRes.json();
  // profile.sub is LinkedIn's unique, permanent id for this member

  const tokenExpires = new Date(Date.now() + expires_in * 1000);

  const user = await prisma.user.upsert({
    where: { linkedinSub: profile.sub },
    update: {
      accessToken: access_token,
      tokenExpires,
      name: profile.name,
      email: profile.email,
    },
    create: {
      linkedinSub: profile.sub,
      accessToken: access_token,
      tokenExpires,
      name: profile.name,
      email: profile.email,
    },
  });

  await createSession(user.id);
  cookieStore.delete("li_oauth_state");

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
