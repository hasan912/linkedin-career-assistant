import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { scheduledFor: "asc" },
  });
  return NextResponse.json(posts);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { content, scheduledFor } = await request.json();
  if (!content || !scheduledFor) {
    return NextResponse.json({ error: "content and scheduledFor are required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId,
      content,
      scheduledFor: new Date(scheduledFor),
    },
  });
  return NextResponse.json(post);
}
