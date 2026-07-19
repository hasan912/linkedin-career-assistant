import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [user, posts, applications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.post.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.application.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    posts: posts.map(({ userId: _, ...p }) => p),
    applications: applications.map(({ userId: _, ...a }) => a),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="career-console-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
