import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Step 1 of OAuth: send the user to LinkedIn to approve access.
// Scopes requested:
//  - openid, profile, email -> to identify who the user is
//  - w_member_social        -> required to publish posts on their behalf
export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  // Store state briefly so the callback can verify this request wasn't forged (CSRF protection)
  const cookieStore = await cookies();
  cookieStore.set("li_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
    scope: "openid profile email w_member_social",
    state,
  });

  return NextResponse.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  );
}
