import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { rateLimitResponse } from "@/lib/ratelimit";

const USERNAME_RE = /^[a-z0-9-]{3,20}$/;

const PORTFOLIO_SELECT = {
  username: true,
  bio: true,
  title: true,
  skills: true,
  portfolioUrl: true,
  githubUrl: true,
  linkedinUrl: true,
  isPublic: true,
};

export async function GET(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // ?check=<username> - availability probe used by the dashboard form on blur
  const check = request.nextUrl.searchParams.get("check");
  if (check) {
    const username = check.toLowerCase();
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json({ available: false, error: "Usernames are 3-20 characters: lowercase letters, numbers and hyphens." });
    }
    const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    return NextResponse.json({ available: !taken || taken.id === userId });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...PORTFOLIO_SELECT, name: true },
  });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(user);
}

export async function PATCH(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("write", userId);
  if (blocked) return blocked;

  const body = await request.json();
  const data = {};

  if (body.username !== undefined) {
    if (body.username === null || body.username === "") {
      data.username = null;
    } else {
      const username = String(body.username).toLowerCase();
      if (!USERNAME_RE.test(username)) {
        return NextResponse.json(
          { error: "Usernames are 3-20 characters: lowercase letters, numbers and hyphens." },
          { status: 400 }
        );
      }
      const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      if (taken && taken.id !== userId) {
        return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
      }
      data.username = username;
    }
  }

  if (body.bio !== undefined) data.bio = body.bio ? String(body.bio).slice(0, 2000) : null;
  if (body.title !== undefined) data.title = body.title ? String(body.title).slice(0, 100) : null;
  if (Array.isArray(body.skills)) {
    data.skills = body.skills
      .map((s) => String(s).trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 30);
  }
  for (const key of ["portfolioUrl", "githubUrl", "linkedinUrl"]) {
    if (body[key] === undefined) continue;
    if (!body[key]) { data[key] = null; continue; }
    const url = String(body[key]).trim();
    if (!/^https?:\/\//i.test(url) || url.length > 300) {
      return NextResponse.json({ error: `${key} must be an http(s) URL.` }, { status: 400 });
    }
    data[key] = url;
  }
  if (typeof body.isPublic === "boolean") {
    // A profile can't be public without a username to serve it at
    data.isPublic = body.isPublic;
  }

  // Resolve what the username will be after this update before allowing isPublic
  if (data.isPublic === true && data.username === undefined) {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    if (!current?.username) {
      return NextResponse.json({ error: "Pick a username before making your profile public." }, { status: 400 });
    }
  }
  if (data.isPublic === true && data.username === null) {
    return NextResponse.json({ error: "Pick a username before making your profile public." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: PORTFOLIO_SELECT,
  });
  return NextResponse.json(user);
}
