import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apps = await prisma.application.findMany({
    where: { userId },
    select: { status: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // By status
  const byStatus = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
  for (const a of apps) byStatus[a.status] = (byStatus[a.status] || 0) + 1;

  // By week (last 12 weeks)
  const now = new Date();
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    weeks.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      count: apps.filter((a) => new Date(a.createdAt) >= start && new Date(a.createdAt) < end).length,
    });
  }

  // Response rate: (interview + offer) / applied * 100
  const responded = (byStatus.interview || 0) + (byStatus.offer || 0);
  const responseRate = byStatus.applied > 0 ? Math.round((responded / byStatus.applied) * 100) : 0;

  // Today's count (for daily goal widget)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = apps.filter((a) => new Date(a.createdAt) >= todayStart).length;

  const posts = await prisma.post.count({ where: { userId, status: "posted" } });
  const pendingPosts = await prisma.post.count({ where: { userId, status: "pending" } });

  return NextResponse.json({ byStatus, byWeek: weeks, responseRate, todayCount, posts, pendingPosts, total: apps.length });
}
