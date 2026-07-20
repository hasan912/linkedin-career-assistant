import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { rateLimitResponse } from "@/lib/ratelimit";

// Loads the post and verifies it belongs to the session user. Returns the post
// or null (caller responds 404 either way, so ownership isn't leaked).
async function getOwnedPost(id, userId) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.userId !== userId) return null;
  return post;
}

export async function GET(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getOwnedPost(id, userId);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  const logs = await prisma.postPerformance.findMany({
    where: { postId: id },
    orderBy: { loggedAt: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const blocked = await rateLimitResponse("write", userId);
  if (blocked) return blocked;

  const { id } = await params;
  const post = await getOwnedPost(id, userId);
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (post.status !== "posted") {
    return NextResponse.json(
      { error: "Performance can only be logged for published posts." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const metrics = {};
  for (const field of ["impressions", "likes", "comments", "shares"]) {
    const value = Number(body[field]);
    if (!Number.isInteger(value) || value < 0) {
      return NextResponse.json(
        { error: `${field} must be a non-negative whole number` },
        { status: 400 }
      );
    }
    metrics[field] = value;
  }

  const log = await prisma.postPerformance.create({
    data: { postId: id, ...metrics },
  });
  return NextResponse.json(log);
}
