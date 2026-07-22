import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true, email: true, theme: true, dailyGoal: true, digestEmail: true,
      tokenExpires: true, googleAccessToken: true,
    },
  });
  // Stale session cookie pointing at a deleted user (e.g. after a DB reset)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Don't leak the encrypted token to the client - just whether Calendar is connected.
  const { googleAccessToken, ...rest } = user;
  return NextResponse.json({ ...rest, googleConnected: !!googleAccessToken });
}

export async function PATCH(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = {};
  if (body.theme === "dark" || body.theme === "light") data.theme = body.theme;
  if (typeof body.dailyGoal === "number" && body.dailyGoal > 0) data.dailyGoal = Math.min(body.dailyGoal, 50);
  if (typeof body.digestEmail === "boolean") data.digestEmail = body.digestEmail;
  // Disconnect Google Calendar: clear all stored token fields.
  if (body.googleDisconnect === true) {
    data.googleAccessToken = null;
    data.googleRefreshToken = null;
    data.googleTokenExpires = null;
  }
  const user = await prisma.user.update({ where: { id: userId }, data,
    select: { theme: true, dailyGoal: true, digestEmail: true, googleAccessToken: true } });
  return NextResponse.json({
    theme: user.theme, dailyGoal: user.dailyGoal, digestEmail: user.digestEmail,
    googleConnected: !!user.googleAccessToken,
  });
}
