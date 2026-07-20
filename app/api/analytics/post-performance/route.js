import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

// Batch endpoint for the analytics page: every posted post with its latest
// performance log, in one query (avoids a request per post from the client).
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { userId, status: "posted" },
    orderBy: { postedAt: "asc" },
    include: {
      performances: { orderBy: { loggedAt: "desc" }, take: 1 },
    },
  });

  const items = posts.map((p) => ({
    id: p.id,
    content: p.content,
    postedAt: p.postedAt || p.scheduledFor,
    performance: p.performances[0] || null,
  }));

  return NextResponse.json(items);
}
