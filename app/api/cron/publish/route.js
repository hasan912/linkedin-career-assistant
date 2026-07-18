import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishLinkedInPost } from "@/lib/linkedin";
import { nextOccurrence } from "@/lib/timezone";
import { decrypt } from "@/lib/encryption";

// This endpoint is meant to be triggered by a scheduled job (see vercel.json),
// e.g. every 15 minutes. It finds posts that are due and publishes them.
// Protect it with CRON_SECRET so random visitors can't trigger posts.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const duePosts = await prisma.post.findMany({
    where: {
      status: "pending",
      scheduledFor: { lte: new Date() },
    },
    include: { user: true },
  });

  const results = [];

  for (const post of duePosts) {
    try {
      if (new Date(post.user.tokenExpires) < new Date()) {
        throw new Error("LinkedIn access token expired - user must log in again");
      }
      await publishLinkedInPost({
        accessToken: decrypt(post.user.accessToken),
        authorSub: post.user.linkedinSub,
        text: post.content,
        imageUrns: post.imageUrns,
      });
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "posted", postedAt: new Date() },
      });

      // Recurring posts: schedule the next occurrence as a fresh pending post.
      if (post.repeat === "daily" || post.repeat === "weekly") {
        const nextTime = nextOccurrence(post.scheduledFor, post.timeZone, post.repeat);
        await prisma.post.create({
          data: {
            userId: post.userId,
            content: post.content,
            imageUrns: post.imageUrns,
            scheduledFor: nextTime,
            timeZone: post.timeZone,
            repeat: post.repeat,
          },
        });
      }

      results.push({ id: post.id, status: "posted" });
    } catch (err) {
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "failed", errorMessage: String(err.message || err) },
      });
      results.push({ id: post.id, status: "failed", error: String(err.message || err) });
    }
  }

  return NextResponse.json({ checked: duePosts.length, results });
}
