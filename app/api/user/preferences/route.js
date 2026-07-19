import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, theme: true, dailyGoal: true, digestEmail: true, tokenExpires: true },
  });
  // Stale session cookie pointing at a deleted user (e.g. after a DB reset)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(user);
}

export async function PATCH(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = {};
  if (body.theme === "dark" || body.theme === "light") data.theme = body.theme;
  if (typeof body.dailyGoal === "number" && body.dailyGoal > 0) data.dailyGoal = Math.min(body.dailyGoal, 50);
  if (typeof body.digestEmail === "boolean") data.digestEmail = body.digestEmail;
  const user = await prisma.user.update({ where: { id: userId }, data,
    select: { theme: true, dailyGoal: true, digestEmail: true } });
  return NextResponse.json(user);
}
