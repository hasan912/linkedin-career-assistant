import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { rateLimitResponse } from "@/lib/ratelimit";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { scheduledFor: "asc" },
    // Latest performance log per post, so the posts page can show engagement
    // numbers without a request per post.
    include: {
      performances: { orderBy: { loggedAt: "desc" }, take: 1 },
    },
  });
  return NextResponse.json(posts);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("write", userId);
  if (blocked) return blocked;

  const { content, scheduledFor, imageUrns, repeat, timeZone } = await request.json();
  if (!content || !scheduledFor) {
    return NextResponse.json({ error: "content and scheduledFor are required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId,
      content,
      imageUrns: Array.isArray(imageUrns) ? imageUrns.filter(Boolean) : [],
      scheduledFor: new Date(scheduledFor),
      repeat: repeat || "none",
      timeZone: timeZone || "UTC",
    },
  });
  return NextResponse.json(post);
}
